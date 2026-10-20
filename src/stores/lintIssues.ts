import { computed, reactive, ref } from 'vue';

import { defineStore } from 'pinia';

/**
 * 单条校验问题
 */
export interface ProblemItem {
  severity: 'error' | 'warning';
  message: string;
  source?: string;
  line?: number;
  /** 关联的画布元素 id，用于点击跳转 */
  id?: string;
}

/**
 * 校验问题集中管理 store。
 *
 * 背景：ProblemsPanel / StatusBar 在 ModelerLayout 层渲染，
 * 而 modeler 实例与 @lint 事件由 DesignerView（RouterView 子组件）持有，
 * 两者为兄弟节点，provide/inject 无法跨层级传递。
 * 因此用全局 store 打通：DesignerView 写入，StatusBar / ProblemsPanel 读取。
 */
export const useLintIssuesStore = defineStore('lintIssues', () => {
  // tabId -> 问题列表
  const issuesByTab = reactive<Record<string, ProblemItem[]>>({});

  // tabId -> 是否已清空消息显示（用户手动清空 ProblemsPanel 列表）。
  // 清空只隐藏消息详情，不影响 StatusBar 错误数量统计；下次 lint 更新自动恢复。
  const dismissedByTab = reactive<Record<string, boolean>>({});

  // tabId -> modeler 组件引用（用于点击错误项跳转画布元素）
  const modelerRefs = reactive<Record<string, any>>({});

  // 当前激活 tab 的问题列表（调用方需先 setActiveTab 维护激活态）
  // 用 ref 保证 setActiveTab 修改后 activeIssues/activeModelerRef 计算属性能响应
  const _activeTabId = ref('');

  function setActiveTab(tabId: string) {
    _activeTabId.value = tabId;
  }

  /** 注册某个 tab 的 modeler 组件引用 */
  function setModelerRef(tabId: string, el: any) {
    if (el) {
      modelerRefs[tabId] = el;
    } else {
      delete modelerRefs[tabId];
    }
  }

  /** 当前激活 tab 的 modeler 组件引用（响应式） */
  const activeModelerRef = computed(() => modelerRefs[_activeTabId.value] ?? null);

  /** 写入指定 tab 的校验结果（替换）。lint 有新结果时自动恢复消息显示。 */
  function setIssues(tabId: string, items: ProblemItem[]) {
    issuesByTab[tabId] = items;
    dismissedByTab[tabId] = false;
  }

  /** 清空指定 tab 的消息显示（不删除实际校验结果，错误数量保留） */
  function clearIssues(tabId?: string) {
    const id = tabId ?? _activeTabId.value;
    if (id) {
      dismissedByTab[id] = true;
    }
  }

  /** 清空全部 tab 的消息显示（不删除实际校验结果） */
  function clearAll() {
    Object.keys(issuesByTab).forEach((id) => {
      dismissedByTab[id] = true;
    });
  }

  /** 当前激活 tab 的全部问题（含数量统计用，不受清空影响） */
  const activeAllIssues = computed<ProblemItem[]>(() => issuesByTab[_activeTabId.value] ?? []);

  /** 当前激活 tab 的问题列表（消息显示用，清空后返回空） */
  const activeIssues = computed<ProblemItem[]>(() => {
    if (dismissedByTab[_activeTabId.value]) return [];
    return issuesByTab[_activeTabId.value] ?? [];
  });

  /** 获取指定 tab 的问题列表 */
  function getIssues(tabId: string): ProblemItem[] {
    return issuesByTab[tabId] ?? [];
  }

  return {
    issuesByTab,
    dismissedByTab,
    modelerRefs,
    activeIssues,
    activeAllIssues,
    activeModelerRef,
    setActiveTab,
    setModelerRef,
    setIssues,
    clearIssues,
    clearAll,
    getIssues,
  };
});
