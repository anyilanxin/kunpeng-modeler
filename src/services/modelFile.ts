import type { ModelType } from '@/stores/tabs';

/** 判断是否在 Tauri 桌面环境中运行 */
function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/** store 文件名（存储在 app_data_dir） */
const STORE_FILE = 'models-manifest.json';

/** 已保存文件的元数据记录 */
export interface SavedFileMeta {
  type: ModelType;
  title: string;
  filePath: string;
}

/** 保存单个模型文件的结果 */
export interface SaveResult {
  /** 是否成功 */
  ok: boolean;
  /** 保存的文件绝对路径（首次保存时由对话框确定） */
  filePath?: string;
  /** 用户取消了保存对话框 */
  canceled?: boolean;
}

/** Store 实例的最小类型接口 */
interface StoreLike {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  save(): Promise<void>;
}

/** 懒加载 store 实例 */
let storeInstance: StoreLike | null = null;
async function getStore(): Promise<StoreLike | null> {
  if (!isTauri()) return null;
  if (!storeInstance) {
    const { load } = await import('@tauri-apps/plugin-store');
    storeInstance = (await load(STORE_FILE, { autoSave: 100 })) as unknown as StoreLike;
  }
  return storeInstance;
}

/** 从文件路径提取文件名 */
function basename(filePath: string): string {
  return filePath.split(/[\\/]/).pop() || filePath;
}

/**
 * 校验 XML 内容是否符合指定模型类型的根元素约定（纯字符串解析，不依赖 DOMParser）。
 *
 * 判定规则：
 * 1. 剥离 XML 声明 / DOCTYPE / 注释后，首字符为 `<`
 * 2. 根元素本地名为 `definitions`（兼容带前缀写法，如 `<bpmn:definitions>`）
 * 3. 根标签上声明的命名空间含 `/BPMN/`（bpmn）或 `/DMN/`（dmn）
 *
 * 不使用 DOMParser，避免不同 JS 引擎对命名空间解析行为差异导致的误判；
 * 仅做"够用的格式门禁"——后续 bpmn-js / dmn-js 仍会做严格解析。
 */
function isValidModelXml(type: ModelType, xml: string): boolean {
  let s = xml.trim();
  // 跳过前置的 <?xml ...?> 声明、<!-- 注释 -->、<!DOCTYPE ...>，定位真正的根元素标签
  for (;;) {
    if (s.startsWith('<?')) {
      const end = s.indexOf('?>');
      if (end === -1) return false;
      s = s.slice(end + 2).trim();
    } else if (s.startsWith('<!--')) {
      const end = s.indexOf('-->');
      if (end === -1) return false;
      s = s.slice(end + 3).trim();
    } else if (s.startsWith('<!')) {
      // DOCTYPE 或其它声明，跳到下一个 '>'
      const end = s.indexOf('>');
      if (end === -1) return false;
      s = s.slice(end + 1).trim();
    } else {
      break;
    }
  }
  if (!s.startsWith('<')) return false;

  // 提取首个标签（根元素），含其全部属性
  const tagMatch = s.match(/^<([a-zA-Z0-9:_-]+)([^>]*)>/);
  if (!tagMatch) return false;

  const rawName = tagMatch[1];
  const localName = rawName.includes(':') ? rawName.slice(rawName.indexOf(':') + 1) : rawName;
  if (localName !== 'definitions') return false;

  // 从根标签属性区收集所有命名空间声明（xmlns / xmlns:prefix）
  const nsDeclarations = tagMatch[2].match(/xmlns(?::[a-zA-Z0-9_-]+)?="[^"]*"/g) ?? [];
  const nsBlob = nsDeclarations.join(' ');
  // BPMN: http://www.omg.org/spec/BPMN/20100524/MODEL
  // DMN:  https://www.omg.org/spec/DMN/20191111/MODEL
  return type === 'bpmn' ? nsBlob.includes('/BPMN/') : nsBlob.includes('/DMN/');
}

/** 根据扩展名推断模型类型；无法识别返回 null */
function typeFromPath(filePath: string): ModelType | null {
  const ext = filePath.toLowerCase().split('.').pop();
  if (ext === 'bpmn') return 'bpmn';
  if (ext === 'dmn') return 'dmn';
  return null;
}

/**
 * 打开指定路径的模型文件，读取其内容返回可直接 openTab 的数据。
 * 同时会更新清单（与保存的文件统一管理）。
 *
 * 浏览器开发模式返回 null。
 */
export async function openModelFile(
  filePath: string,
): Promise<{ type: ModelType; title: string; xml: string; filePath: string } | null> {
  if (!isTauri()) return null;
  const type = typeFromPath(filePath);
  if (!type) {
    console.warn(`[openModelFile] 不支持的文件类型: ${filePath}`);
    return null;
  }
  try {
    const { readTextFile } = await import('@tauri-apps/plugin-fs');
    const xml = await readTextFile(filePath);
    const title = basename(filePath);
    // 同步进清单，保证启动恢复时也能重新打开
    await updateManifest({ type, title, filePath });
    return { type, title, xml, filePath };
  } catch (err) {
    console.error('[openModelFile] 打开失败:', err);
    return null;
  }
}

/**
 * 保存单个模型文件到磁盘
 *
 * - 如果 tab 已有 filePath（之前保存过），直接写入该路径
 * - 如果没有 filePath（首次保存），弹出系统保存对话框让用户选择位置
 *   - BPMN 文件扩展名 .bpmn，DMN 文件扩展名 .dmn
 * - 保存成功后自动更新清单（plugin-store）
 *
 * 浏览器开发模式下静默跳过
 */
export async function saveModelFile(
  tab: { type: ModelType; title: string; xml: string; filePath?: string },
): Promise<SaveResult> {
  if (!isTauri()) return { ok: false };

  try {
    const { writeTextFile } = await import('@tauri-apps/plugin-fs');
    const { save } = await import('@tauri-apps/plugin-dialog');

    let filePath = tab.filePath;

    // 首次保存：弹出文件对话框
    if (!filePath) {
      const selected = await save({
        title: '保存模型文件',
        defaultPath: tab.title,
        filters: [
          {
            name: tab.type === 'bpmn' ? 'BPMN 2.0' : 'DMN',
            extensions: [tab.type],
          },
        ],
      });

      // 用户取消
      if (!selected) return { ok: false, canceled: true };
      filePath = selected;
    }

    // 写文件
    await writeTextFile(filePath, tab.xml);

    // 更新清单
    const title = basename(filePath);
    await updateManifest({ type: tab.type, title, filePath });

    return { ok: true, filePath };
  } catch (err) {
    console.error('[saveModelFile] 保存失败:', err);
    return { ok: false };
  }
}

/** 添加或更新清单中的文件记录 */
async function updateManifest(meta: SavedFileMeta): Promise<void> {
  try {
    const store = await getStore();
    if (!store) return;
    const list = (await store.get<SavedFileMeta[]>('files')) ?? [];
    // 去重：同路径覆盖
    const filtered = list.filter((m) => m.filePath !== meta.filePath);
    filtered.push(meta);
    await store.set('files', filtered);
    await store.save();
  } catch (err) {
    console.error('[updateManifest] 更新清单失败:', err);
  }
}

/**
 * 从清单中移除指定文件路径
 */
export async function removeFromManifest(filePath: string): Promise<void> {
  if (!isTauri()) return;
  try {
    const store = await getStore();
    if (!store) return;
    const list = (await store.get<SavedFileMeta[]>('files')) ?? [];
    const filtered = list.filter((m) => m.filePath !== filePath);
    await store.set('files', filtered);
    await store.save();
  } catch (err) {
    console.error('[removeFromManifest] 移除失败:', err);
  }
}

/**
 * 加载所有已保存的模型文件
 *
 * 流程：读取清单 → 逐个检测文件存在性 → 读取内容 → 校验格式 → 返回可 openTab 的数据。
 * 文件已删除或格式不符的记录会从清单中清理掉，避免每次启动反复尝试失效文件。
 *
 * @returns 模型数据列表（type + title + xml + filePath），浏览器模式或无数据返回空
 */
export async function loadSavedFiles(): Promise<
  { type: ModelType; title: string; xml: string; filePath: string }[]
> {
  if (!isTauri()) return [];
  try {
    const store = await getStore();
    if (!store) return [];
    const list = (await store.get<SavedFileMeta[]>('files')) ?? [];
    if (list.length === 0) return [];

    const { readTextFile, exists } = await import('@tauri-apps/plugin-fs');
    const results: { type: ModelType; title: string; xml: string; filePath: string }[] = [];
    const invalidPaths: string[] = [];

    for (const meta of list) {
      try {
        // 1) 文件存在性检测：被移动/删除的文件不恢复
        const ok = await exists(meta.filePath);
        if (!ok) {
          console.warn(`[loadSavedFiles] 文件不存在，跳过: ${meta.filePath}`);
          invalidPaths.push(meta.filePath);
          continue;
        }
        // 2) 读取 + 格式校验：内容损坏/格式不符的文件不恢复
        const xml = await readTextFile(meta.filePath);
        if (!isValidModelXml(meta.type, xml)) {
          console.warn(`[loadSavedFiles] 文件格式不符（期望 ${meta.type}），跳过: ${meta.filePath}`);
          invalidPaths.push(meta.filePath);
          continue;
        }
        results.push({
          type: meta.type,
          title: meta.title,
          xml,
          filePath: meta.filePath,
        });
      } catch (err) {
        // 读取过程异常（权限、IO 错误等）：跳过，并视为失效记录清理
        console.warn(`[loadSavedFiles] 读取失败，跳过: ${meta.filePath}`, err);
        invalidPaths.push(meta.filePath);
      }
    }

    // 清理失效记录，防止下次启动重复尝试
    if (invalidPaths.length > 0) {
      const cleaned = list.filter((m) => !invalidPaths.includes(m.filePath));
      await store.set('files', cleaned);
      await store.save();
    }

    return results;
  } catch (err) {
    console.error('[loadSavedFiles] 加载失败:', err);
    return [];
  }
}
