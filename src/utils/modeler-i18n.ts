import { unref } from 'vue';

// BPMN/DMN 建模器通用国际化翻译
// 参照 packages/design/bpmn-design/src/i18n/index.ts 的 createI18nOptions 逻辑

const zhCN: Record<string, string> = {
  'Create StartEvent': '创建开始事件',
  'Create EndEvent': '创建结束事件',
  'Create IntermediateThrowEvent': '创建中间抛出事件',
  'Create IntermediateCatchEvent': '创建中间捕获事件',
  'Create BoundaryEvent': '创建边界事件',
  'Create Task': '创建任务',
  'Create UserTask': '创建用户任务',
  'Create ServiceTask': '创建服务任务',
  'Create SendTask': '创建发送任务',
  'Create ReceiveTask': '创建接收任务',
  'Create ScriptTask': '创建脚本任务',
  'Create BusinessRuleTask': '创建业务规则任务',
  'Create CallActivity': '创建调用活动',
  'Create SubProcess': '创建子流程',
  'Create ExclusiveGateway': '创建排他网关',
  'Create ParallelGateway': '创建并行网关',
  'Create InclusiveGateway': '创建包含网关',
  'Create EventBasedGateway': '创建事件网关',
  'Create SequenceFlow': '创建顺序流',
  'Create DataObject': '创建数据对象',
  'Create DataStoreReference': '创建数据存储引用',
  'Append StartEvent': '追加开始事件',
  'Append EndEvent': '追加结束事件',
  'Append Task': '追加任务',
  'Append Gateway': '追加网关',
  'Append Element': '追加元素',
  'Activate the create tool': '激活创建工具',
  'Activate the hand tool': '激活手型工具',
  'Activate the lasso tool': '激活套索工具',
  'Activate the space tool': '激活空间工具',
  'Activate the connect tool': '激活连线工具',
  'Append {type}': '追加 {type}',
  'Create {type}': '创建 {type}',
  'General': '常规',
  'ID': 'ID',
  'Name': '名称',
  'Documentation': '文档',
  'Process_': '流程_',
  'Element': '元素',
};

const en: Record<string, string> = {};

const langs: Record<string, Record<string, string>> = {
  'zh-CN': zhCN,
  en,
};

function customTranslate(locale: string) {
  return function (template: string, replacements?: Record<string, string>) {
    if (template == null) return '';
    const dict = langs[unref(locale as any)] || langs['zh-CN'];
    const translations = { ...dict };
    const replaced = replacements || {};
    const result = translations[template] || template;
    return result.replace(/{([^}]+)}/g, (_: string, key: string) => {
      return replaced[key] || `{${key}}`;
    });
  };
}

/**
 * 创建 bpmn-js / dmn-js 的 i18n 模块
 * 直接加入 additionalModules 即可
 */
export function createI18nOptions(locale: string) {
  return {
    translate: ['value', customTranslate(locale)],
  };
}
