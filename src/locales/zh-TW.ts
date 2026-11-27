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
    description: '一站式 BPMN / DMN 建模工具，支援流程圖設計、決策表編輯與模型校驗。',
    copyright: '© 2026 Kunpeng. 保留所有權利。',
  },
  home: {
    subtitle: '一站式 BPMN / DMN 建模工具',
    bpmnTitle: '新建 BPMN 流程圖',
    bpmnDesc: '使用 BPMN 2.0 規範設計業務流程',
    dmnTitle: '新建 DMN 決策表',
    dmnDesc: '視覺化構建業務決策模型',
  },
  tabs: {
    newTab: '新建標籤頁',
    newBpmn: 'BPMN 流程',
    newDmn: 'DMN 決策表',
    newDiagram: '選擇建模型別',
    closeTab: '關閉標籤頁',
    unsaved: '未儲存',
    saved: '已儲存',
    more: '更多',
    saveAll: '儲存所有檔案',
    closeAll: '關閉所有標籤',
    openModels: '已開啟的模型',
    currentTab: '當前標籤',
    saveCurrent: '儲存當前',
    closeCurrent: '關閉當前',
    closeOthers: '關閉其他',
  },
  statusbar: {
    modelView: '模型',
    xmlView: 'XML',
    drdView: 'DRD 圖',
    decisionTableView: '決策表',
    switchToXml: '切換到 XML 檢視',
    switchToModel: '切換到模型檢視',
    switchToDrd: '切換到 DRD 圖檢視',
    switchToDecisionTable: '切換到決策表檢視',
    elementCount: '元素',
    ruleCount: '規則',
    noErrors: '無錯誤',
    viewErrors: '點選檢視校驗詳情',
  },
  problems: {
    title: '問題',
    empty: '未檢測到問題，一切正常。',
    errors: '錯誤',
    warnings: '警告',
    clear: '清空',
    copy: '複製錯誤資訊',
    close: '關閉',
    dragToResize: '拖拽調整高度（拖到最小將摺疊面板）',
    tabOutput: '輸出',
    tabProblems: '問題',
    outputEmpty: '暫無輸出。',
    dismissedHint: '{count} 個問題已忽略（下次編輯自動重新整理）',
  },
  file: {
    new: '新建',
    open: '開啟',
    save: '儲存',
    export: '匯出',
    openFile: '開啟檔案',
    saveFile: '儲存檔案',
    bpmnFilter: 'BPMN 檔案',
    dmnFilter: 'DMN 檔案',
    allFilter: '所有模型檔案',
    saveSuccess: '儲存成功',
    openSuccess: '檔案已開啟',
    saveFailed: '儲存失敗',
    openFailed: '開啟失敗',
    confirmClose: '該檔案未儲存，確定關閉嗎？',
  },
  panel: {
    properties: '屬性面板',
    propertiesToggle: '屬性面板',
  },
  settings: {
    theme: '主題',
    switchTheme: '切換主題',
    language: '語言',
    light: '淺色',
    dark: '深色',
    lightMode: '亮色模式',
    darkMode: '黑暗模式',
    autoMode: '跟隨系統',
  },
};
