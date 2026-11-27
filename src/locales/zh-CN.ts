/*
 * Copyright © 2026 anyilanxin zxh (anyilanxin@aliyun.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export default {
  app: {
    title: 'Process Modeler',
    version: __APP_VERSION__,
  },
  about: {
    productName: 'Kunpeng Modeler',
    versionLabel: '版本',
    description: '一站式 BPMN / DMN 建模工具，支持流程图设计、决策表编辑与模型校验。',
    copyright: '© 2026 Kunpeng. 保留所有权利。',
  },
  home: {
    subtitle: '一站式 BPMN / DMN 建模工具',
    bpmnTitle: '新建 BPMN 流程图',
    bpmnDesc: '使用 BPMN 2.0 规范设计业务流程',
    dmnTitle: '新建 DMN 决策表',
    dmnDesc: '可视化构建业务决策模型',
  },
  tabs: {
    newTab: '新建标签页',
    newBpmn: 'BPMN 流程',
    newDmn: 'DMN 决策表',
    newDiagram: '选择建模类型',
    closeTab: '关闭标签页',
    unsaved: '未保存',
    saved: '已保存',
    more: '更多',
    saveAll: '保存所有文件',
    closeAll: '关闭所有标签',
    openModels: '已打开的模型',
    currentTab: '当前标签',
    saveCurrent: '保存当前',
    closeCurrent: '关闭当前',
    closeOthers: '关闭其他',
  },
  statusbar: {
    modelView: '模型',
    xmlView: 'XML',
    drdView: 'DRD 图',
    decisionTableView: '决策表',
    switchToXml: '切换到 XML 视图',
    switchToModel: '切换到模型视图',
    switchToDrd: '切换到 DRD 图视图',
    switchToDecisionTable: '切换到决策表视图',
    elementCount: '元素',
    ruleCount: '规则',
    noErrors: '无错误',
    viewErrors: '点击查看校验详情',
  },
  problems: {
    title: '问题',
    empty: '未检测到问题，一切正常。',
    errors: '错误',
    warnings: '警告',
    clear: '清空',
    copy: '复制错误信息',
    close: '关闭',
    dragToResize: '拖拽调整高度（拖到最小将折叠面板）',
    tabOutput: '输出',
    tabProblems: '问题',
    outputEmpty: '暂无输出。',
    dismissedHint: '{count} 个问题已忽略（下次编辑自动刷新）',
  },
  file: {
    new: '新建',
    open: '打开',
    save: '保存',
    export: '导出',
    openFile: '打开文件',
    saveFile: '保存文件',
    bpmnFilter: 'BPMN 文件',
    dmnFilter: 'DMN 文件',
    allFilter: '所有模型文件',
    saveSuccess: '保存成功',
    openSuccess: '文件已打开',
    saveFailed: '保存失败',
    openFailed: '打开失败',
    confirmClose: '该文件未保存，确定关闭吗？',
  },
  panel: {
    properties: '属性面板',
    propertiesToggle: '属性面板',
  },
  settings: {
    theme: '主题',
    switchTheme: '切换主题',
    language: '语言',
    light: '浅色',
    dark: '深色',
    lightMode: '亮色模式',
    darkMode: '黑暗模式',
    autoMode: '跟随系统',
  },
};
