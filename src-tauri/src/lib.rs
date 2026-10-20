// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::sync::Mutex;
use tauri::{Emitter, Manager, PhysicalSize, RunEvent, WindowEvent};

/// macOS：直接设置 NSWindow 的 appearance，让标题栏/交通灯跟随暗色模式。
/// Tauri 内置的 set_theme 设的是 NSApplication appearance，对标题栏不一定生效。
#[cfg(target_os = "macos")]
#[tauri::command]
fn set_titlebar_dark(window: tauri::WebviewWindow, dark: bool) {
    use cocoa::base::{id, nil, YES};
    use cocoa::foundation::{NSString};
    use objc::{class, msg_send, sel, sel_impl};

    let ns_window_ptr = match window.ns_window() {
        Ok(ptr) => ptr as id,
        Err(_) => return,
    };
    if ns_window_ptr == nil {
        return;
    }

    unsafe {
        // 构造 appearance 名称 NSString（用 cocoa 的 NSString trait）
        let name_str = if dark {
            NSString::alloc(nil).init_str("NSAppearanceNameDarkAqua")
        } else {
            NSString::alloc(nil).init_str("NSAppearanceNameAqua")
        };

        // appearanceNamed: 返回的是 autoreleased 对象，retain 一下防止过早释放
        let appearance: id = msg_send![class!(NSAppearance), appearanceNamed: name_str];
        let retained: id = msg_send![appearance, retain];

        // 设置窗口外观
        let _: () = msg_send![ns_window_ptr, setAppearance: retained];

        // 让窗口及其子视图（标题栏、交通灯）立即重新评估外观
        let views: id = msg_send![ns_window_ptr, contentView];
        if views != nil {
            let _: () = msg_send![views, setNeedsLayout: YES];
            let _: () = msg_send![views, layoutSubtreeIfNeeded];
        }
        let _: () = msg_send![ns_window_ptr, flushWindow];

        // release 掉 retain 的 appearance（window 已经 retain 了）
        let _: () = msg_send![retained, release];
    }
}

#[cfg(not(target_os = "macos"))]
#[tauri::command]
fn set_titlebar_dark(_window: tauri::WebviewWindow, _dark: bool) {}

/// 由操作系统打开（双击关联文件 / 拖到 Dock 等）传入的文件路径缓冲。
/// 应用启动时前端可能尚未就绪，路径先暂存于此，前端启动后通过
/// `take_opened_files` 命令拉取；运行期再次打开则用事件即时推送。
struct OpenedFiles(Mutex<Vec<String>>);

/// 将 `file://` URL 解析为本地文件路径；非 file URL 原样返回。
fn url_to_local_path(url: &str) -> String {
    if let Some(rest) = url.strip_prefix("file://") {
        // 简单处理 percent-encoding（路径里最常见的空格）
        let decoded = percent_decode(rest);
        // macOS / Linux: "/path"; Windows: "/C:/path" -> 去掉开头斜杠
        let path = decoded.trim_start_matches('/');
        // Windows 盘符形如 C:/...，原样返回；其它平台补回斜杠
        if path.len() >= 2 && path.as_bytes()[1] == b':' {
            path.to_string()
        } else {
            format!("/{}", path)
        }
    } else {
        url.to_string()
    }
}

/// 极简 percent-decoding，仅处理 %XX。
fn percent_decode(input: &str) -> String {
    let bytes = input.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%' && i + 2 < bytes.len() {
            if let Ok(b) = u8::from_str_radix(
                std::str::from_utf8(&bytes[i + 1..i + 3]).unwrap_or(""),
                16,
            ) {
                out.push(b);
                i += 3;
                continue;
            }
        }
        out.push(bytes[i]);
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

/// 从缓冲中取出所有待打开文件路径，清空缓冲。
#[tauri::command]
fn take_opened_files(state: tauri::State<OpenedFiles>) -> Vec<String> {
    let mut guard = state.0.lock().unwrap();
    guard.drain(..).collect()
}

/// 支持的模型扩展名（小写，不含点）。
const MODEL_EXTS: &[&str] = &["bpmn", "dmn"];

/// 判断一个字符串是否是模型文件路径（按扩展名）。
fn is_model_path(s: &str) -> bool {
    let lower = s.to_ascii_lowercase();
    MODEL_EXTS.iter().any(|ext| lower.ends_with(&format!(".{}", ext)))
}

/// 把任意来源（`file://` URL / 本地路径 / argv 参数）规整为本地文件路径。
/// 仅保留确认为模型文件的项，过滤掉程序自身路径、选项等 argv 噪声。
fn extract_model_paths<I, S>(items: I) -> Vec<String>
where
    I: IntoIterator<Item = S>,
    S: AsRef<str>,
{
    items
        .into_iter()
        .map(|s| s.as_ref().to_string())
        .map(|s| url_to_local_path(&s))
        .filter(|p| is_model_path(p))
        .collect()
}

/// 自定义窗口状态文件
const WINDOW_STATE_FILE: &str = "window-size.json";

/// 窗口状态：最后一次非全屏的尺寸 + 是否全屏
#[derive(serde::Serialize, serde::Deserialize, Clone)]
struct WindowSizeState {
    width: u32,
    height: u32,
    fullscreen: bool,
}

impl Default for WindowSizeState {
    fn default() -> Self {
        Self {
            width: 1440,
            height: 810,
            fullscreen: false,
        }
    }
}

/// 运行时缓存：全屏前的窗口尺寸（退出全屏时恢复）+ 全屏切换冷却期
struct PreFullscreenSize {
    size: Mutex<Option<PhysicalSize<u32>>>,
    // 全屏切换后的冷却时间戳（毫秒），在此期间忽略 Resized 事件防止动画中间尺寸覆盖
    cooldown_until: Mutex<std::time::Instant>,
}

fn load_window_state(app: &tauri::AppHandle) -> WindowSizeState {
    let path = match app.path().app_config_dir() {
        Ok(p) => p.join(WINDOW_STATE_FILE),
        Err(_) => return WindowSizeState::default(),
    };
    match std::fs::read_to_string(&path) {
        Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
        Err(_) => WindowSizeState::default(),
    }
}

fn save_window_state(app: &tauri::AppHandle, state: &WindowSizeState) {
    let path = match app.path().app_config_dir() {
        Ok(p) => p.join(WINDOW_STATE_FILE),
        Err(_) => return,
    };
    if let Ok(json) = serde_json::to_string_pretty(state) {
        if let Some(parent) = path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        let _ = std::fs::write(&path, json);
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    // 单例插件必须第一个注册。Windows/Linux 下双击关联文件会启动新进程，
    // 这里拦截第二个实例：从 argv 提取模型文件路径转发给主实例，并聚焦窗口。
    #[cfg(any(target_os = "macos", windows, target_os = "linux"))]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            // argv[0] 通常是程序自身路径，extract_model_paths 会按扩展名过滤掉
            let paths = extract_model_paths(&argv);
            if !paths.is_empty() {
                // 暂存进缓冲（虽然主实例前端一般已就绪，仍兜底）
                let state = app.state::<OpenedFiles>();
                state.0.lock().unwrap().extend(paths.clone());
                // 即时推送给主实例前端打开
                let _ = app.emit("opened-files", paths);
            }
            // 聚焦已存在的主窗口
            if let Some(win) = app.get_webview_window("main") {
                let _ = win.set_focus();
            }
        }));
    }

    let app = builder
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(PreFullscreenSize {
            size: Mutex::new(None),
            cooldown_until: Mutex::new(std::time::Instant::now()),
        })
        .manage(OpenedFiles(Mutex::new(Vec::new())))
        .setup(|app| {
            // 首次启动时从 argv 提取模型文件路径（Windows/Linux 双击关联文件启动场景）。
            // macOS 通过 RunEvent::Opened 传入，不走 argv；single-instance 仅处理已运行时的新实例。
            #[cfg(not(target_os = "macos"))]
            {
                let argv_paths = extract_model_paths(std::env::args());
                if !argv_paths.is_empty() {
                    let state = app.state::<OpenedFiles>();
                    state.0.lock().unwrap().extend(argv_paths);
                }
            }

            let main_window = app.get_webview_window("main").unwrap();

            // macOS: 标题栏/交通灯主题由前端 theme store 初始化时通过 setTheme() 设置

            // 读取上次保存的窗口状态
            let saved = load_window_state(&app.handle());

            if saved.fullscreen {
                // 上次是全屏：先设为保存的非全屏尺寸，再进入全屏
                let size = PhysicalSize::new(saved.width, saved.height);
                let _ = main_window.set_size(size);
                let _ = main_window.set_fullscreen(true);
                // 关键：把非全屏尺寸放入 guard，退出全屏时能正确恢复
                let pre_fs = app.state::<PreFullscreenSize>();
                *pre_fs.size.lock().unwrap() = Some(size);
                // 设置冷却期：全屏动画期间忽略 Resized，防止清空 guard
                *pre_fs.cooldown_until.lock().unwrap() =
                    std::time::Instant::now() + std::time::Duration::from_millis(2000);
            } else {
                // 上次不是全屏：恢复保存的尺寸
                let _ = main_window.set_size(PhysicalSize::new(saved.width, saved.height));
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            let app = window.app_handle();
            let pre_fs = app.state::<PreFullscreenSize>();

            match event {
                WindowEvent::Resized(_) => {
                    let is_fullscreen = window.is_fullscreen().unwrap_or(false);

                    // 全屏状态下什么都不做——不读尺寸、不写文件
                    if is_fullscreen {
                        return;
                    }

                    // 检查是否在冷却期内（退出全屏动画期间）
                    let now = std::time::Instant::now();
                    if now < *pre_fs.cooldown_until.lock().unwrap() {
                        return;
                    }

                    let mut guard = pre_fs.size.lock().unwrap();

                    if let Some(saved_size) = guard.take() {
                        // 刚从全屏退出：恢复缓存的尺寸
                        let _ = window.set_size(saved_size);
                        *pre_fs.cooldown_until.lock().unwrap() =
                            now + std::time::Duration::from_millis(2000);
                        save_window_state(
                            app,
                            &WindowSizeState {
                                width: saved_size.width,
                                height: saved_size.height,
                                fullscreen: false,
                            },
                        );
                    } else {
                        // 非全屏普通调整：读取实际尺寸
                        let size = window.inner_size().unwrap_or(PhysicalSize {
                            width: 1440,
                            height: 810,
                        });
                        if size.width > 0 && size.height > 0 && size.width < 4000 && size.height < 4000 {
                            // 保存到文件
                            save_window_state(
                                app,
                                &WindowSizeState {
                                    width: size.width,
                                    height: size.height,
                                    fullscreen: false,
                                },
                            );
                            // 同时更新 guard，这样进全屏前 guard 里有最新的非全屏尺寸
                            *guard = Some(size);
                        }
                    }
                }
                WindowEvent::CloseRequested { .. } => {
                    // 关闭前：全屏状态下只更新 fullscreen 标记，不碰尺寸
                    let is_fullscreen = window.is_fullscreen().unwrap_or(false);
                    if is_fullscreen {
                        // 从文件读取上次的非全屏尺寸，只改 fullscreen 标记
                        let saved = load_window_state(&app);
                        save_window_state(
                            app,
                            &WindowSizeState {
                                width: saved.width,
                                height: saved.height,
                                fullscreen: true,
                            },
                        );
                    }
                    // 非全屏关闭：Resized 已经保存了正确尺寸
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            take_opened_files,
            set_titlebar_dark
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    // 处理操作系统级别的文件打开事件（双击 .bpmn/.dmn、Dock 拖入等）。
    // macOS 主要通过此事件（Apple Event）传入文件；Windows/Linux 下双击启动
    // 会带 argv，已由 single-instance 插件处理，这里作为统一兜底入口。
    app.run(|app_handle, event| {
        #[cfg(target_os = "macos")]
        {
            if let RunEvent::Opened { urls } = event {
                let paths = extract_model_paths(urls.iter().map(|u| u.as_str()));
                if paths.is_empty() {
                    return;
                }
                // 1) 暂存到缓冲，供前端启动时拉取（首次启动场景）
                {
                    let state = app_handle.state::<OpenedFiles>();
                    state.0.lock().unwrap().extend(paths.clone());
                }
                // 2) 尝试即时推送给已运行的前端（运行期再次打开场景）
                let _ = app_handle.emit("opened-files", paths);
            }
        }
        #[cfg(not(target_os = "macos"))]
        {
            let _ = (app_handle, event);
        }
    });
}
