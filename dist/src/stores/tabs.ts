import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

import { getLanguage } from '@/locales';
import { removeFromManifest } from '@/services/modelFile';
import { md5Of } from '@/utils/hash';

export type ModelType = 'bpmn' | 'dmn';

/** 视图模式：图形建模 / XML 源码，每个 tab 独立持有 */
export type ViewMode = 'model' | 'xml';

/** 根据当前语言环境返回模型文件名前缀 */
function modelNamePrefix(): string {
  const locale = typeof getLanguage() === 'object'
    ? (getLanguage() as any).value
    : getLanguage();
  return locale === 'zh-CN' ? '模型' : 'diagram';
}

export interface ModelTab {
  /** 唯一 ID */
  id: string;
  /** 模型类型 */
  type: ModelType;
  /** 显示标题（文件名） */
  title: string;
  /** 当前 XML 内容 */
  xml: string;
  /** 磁盘文件内容的 MD5（最后一次保存/加载时的快照）；null 表示尚未写入磁盘 */
  diskMd5: string | null;
  /** 已保存的绝对路径（首次保存后赋值，后续保存直接写入此路径） */
  filePath?: string;
  /** 视图模式（图形建模 / XML 源码），每个 tab 独立 */
  viewMode: ViewMode;
}

let tabSeq = 0;

function nextTabId() {
  tabSeq += 1;
  return `tab-${Date.now()}-${tabSeq}`;
}

/**
 * 各类型已创建文件计数器（只增不减）
 * 用于生成默认文件名序号，与标题改名/关闭 tab 完全解耦：
 * 用户把「模型_1.bpmn」改名为「模型_11.bpmn」不会影响下一个新文件的序号。
 * 计数器从 0 开始，首次生成名称时若已有同类型 tab（例如从 manifest 恢复），
 * 会以现有最大序号对齐，避免重启后序号冲突。
 */
const nameCounters: Record<ModelType, number> = { bpmn: 0, dmn: 0 };

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<ModelTab[]>([]);
  const activeId = ref<string>('');

  const activeTab = computed(
    () => tabs.value.find((t) => t.id === activeId.value) ?? null,
  );

  const hasTabs = computed(() => tabs.value.length > 0);

  /** 判断指定 tab 是否已保存（内存 XML 的 MD5 与磁盘快照一致） */
  function isTabSaved(id: string): boolean {
    const tab = tabs.value.find((t) => t.id === id);
    if (!tab) return true;
    return tab.diskMd5 !== null && md5Of(tab.xml) === tab.diskMd5;
  }

  /** 是否存在未保存的 tab（用于关闭/退出时确认提示） */
  const hasUnsavedTabs = computed(() =>
    tabs.value.some((t) => t.diskMd5 === null || md5Of(t.xml) !== t.diskMd5),
  );

  /**
   * 打开（或激活）一个模型标签
   */
  function openTab(tab: Omit<ModelTab, 'id' | 'diskMd5' | 'viewMode'> & { id?: string; diskMd5?: string | null; viewMode?: ViewMode }) {
    // 如果指定了 id 且已存在，直接激活
    if (tab.id) {
      const existing = tabs.value.find((t) => t.id === tab.id);
      if (existing) {
        activeId.value = existing.id;
        return existing;
      }
    }
    const newTab: ModelTab = {
      id: tab.id ?? nextTabId(),
      type: tab.type,
      title: tab.title,
      xml: tab.xml,
      diskMd5: tab.diskMd5 ?? null,
      filePath: tab.filePath,
      viewMode: tab.viewMode ?? 'model',
    };
    tabs.value.push(newTab);
    activeId.value = newTab.id;
    return newTab;
  }

  /**
   * 关闭标签（如果该 tab 已保存到磁盘，从清单移除）
   */
  function closeTab(id: string) {
    const idx = tabs.value.findIndex((t) => t.id === id);
    if (idx === -1) return;
    const tab = tabs.value[idx];
    tabs.value.splice(idx, 1);
    // 异步从清单移除（不阻塞 UI，不删物理文件）
    if (tab.filePath) {
      removeFromManifest(tab.filePath).catch(() => {});
    }
    // 如果关闭的是激活标签，激活相邻标签
    if (activeId.value === id) {
      if (tabs.value.length > 0) {
        const nextIdx = Math.min(idx, tabs.value.length - 1);
        activeId.value = tabs.value[nextIdx].id;
      } else {
        activeId.value = '';
      }
    }
  }

  /**
   * 设置激活标签
   */
  function setActive(id: string) {
    activeId.value = id;
  }

  /**
   * 更新标签的 XML 内容，并通过 MD5 比对自动判定 saved 状态。
   * 如果新内容与磁盘快照一致（例如撤销编辑回到原始内容），则视为已保存。
   */
  function updateXml(id: string, xml: string) {
    const tab = tabs.value.find((t) => t.id === id);
    if (tab) {
      tab.xml = xml;
      // saved 由 diskMd5 自动派生，无需显式标记
    }
  }

  /**
   * 标记标签已保存到磁盘（记录磁盘内容的 MD5 快照）
   */
  function markSaved(id: string) {
    const tab = tabs.value.find((t) => t.id === id);
    if (tab) {
      tab.diskMd5 = md5Of(tab.xml);
    }
  }

  /** 当前激活 tab 的视图模式（无激活 tab 时默认 'model'） */
  const activeViewMode = computed<ViewMode>(
    () => activeTab.value?.viewMode ?? 'model',
  );

  /** 设置指定 tab 的视图模式 */
  function setViewMode(id: string, mode: ViewMode) {
    const tab = tabs.value.find((t) => t.id === id);
    if (tab) tab.viewMode = mode;
  }

  /** 切换当前激活 tab 的视图模式 */
  function toggleActiveViewMode() {
    const tab = activeTab.value;
    if (tab) {
      tab.viewMode = tab.viewMode === 'model' ? 'xml' : 'model';
    }
  }

  /**
   * 标记所有标签为已保存（各自记录当前 XML 的 MD5）
   */
  function markAllSaved() {
    tabs.value.forEach((t) => {
      t.diskMd5 = md5Of(t.xml);
    });
  }

  /**
   * 关闭所有标签（同步从清单移除，下次启动不再恢复）
   */
  function closeAll() {
    // 先收集所有已保存路径，清空后再批量从清单移除
    const paths = tabs.value.map((t) => t.filePath).filter((p): p is string => !!p);
    tabs.value = [];
    activeId.value = '';
    paths.forEach((p) => removeFromManifest(p).catch(() => {}));
  }

  /**
   * 关闭除指定标签外的所有标签（被关闭的同步从清单移除）
   */
  function closeOthers(keepId: string) {
    const removed = tabs.value.filter((t) => t.id !== keepId);
    tabs.value = tabs.value.filter((t) => t.id === keepId);
    activeId.value = keepId;
    removed.forEach((t) => {
      if (t.filePath) removeFromManifest(t.filePath).catch(() => {});
    });
  }

  /**
   * 更新标签标题
   */
  function setTitle(id: string, title: string) {
    const tab = tabs.value.find((t) => t.id === id);
    if (tab) tab.title = title;
  }

  /**
   * 设置标签的已保存文件路径
   */
  function setFilePath(id: string, filePath: string) {
    const tab = tabs.value.find((t) => t.id === id);
    if (tab) tab.filePath = filePath;
  }

  /**
   * 生成指定类型下一个默认文件名
   * 前缀取决于当前语言环境（中文→"模型"，英文→"diagram"），
   * 序号由独立计数器递增，不受 tab 改名/关闭影响。
   * 首次调用时若已有同类型 tab（如从 manifest 恢复），计数器会与现有最大序号对齐，
   * 避免重启后产生重名；之后只按计数器递增，改名不再干扰。
   */
  function nextDefaultName(type: ModelType): string {
    const prefix = modelNamePrefix();
    const ext = type === 'bpmn' ? 'bpmn' : 'dmn';
    // 首次/恢复后对齐：扫描现有同类型 tab 的标题序号，取最大值兜底
    if (nameCounters[type] === 0) {
      const re = /(\d+)\.\w+$/;
      let max = 0;
      for (const tab of tabs.value) {
        if (tab.type !== type) continue;
        const m = tab.title.match(re);
        if (m) {
          const n = parseInt(m[1], 10);
          if (!Number.isNaN(n) && n > max) max = n;
        }
      }
      nameCounters[type] = max;
    }
    nameCounters[type] += 1;
    return `${prefix}_${nameCounters[type]}.${ext}`;
  }

  return {
    tabs,
    activeId,
    activeTab,
    activeViewMode,
    hasTabs,
    hasUnsavedTabs,
    isTabSaved,
    openTab,
    closeTab,
    closeAll,
    closeOthers,
    setActive,
    updateXml,
    markSaved,
    markAllSaved,
    setViewMode,
    toggleActiveViewMode,
    setTitle,
    setFilePath,
    nextDefaultName,
  };
});
