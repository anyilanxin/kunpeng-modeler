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
    versionLabel: 'Version',
    description: 'An all-in-one BPMN / DMN modeling tool for process design, decision tables, and model validation.',
    copyright: '© 2026 Kunpeng. All rights reserved.',
  },
  home: {
    subtitle: 'All-in-one BPMN / DMN modeling tool',
    bpmnTitle: 'New BPMN Diagram',
    bpmnDesc: 'Design business processes with BPMN 2.0',
    dmnTitle: 'New DMN Decision Table',
    dmnDesc: 'Build decision models visually',
  },
  tabs: {
    newTab: 'New tab',
    newBpmn: 'BPMN Process',
    newDmn: 'DMN Decision',
    newDiagram: 'Select diagram type',
    closeTab: 'Close tab',
    unsaved: 'Unsaved',
    saved: 'Saved',
    more: 'More',
    saveAll: 'Save all files',
    closeAll: 'Close all tabs',
    openModels: 'Open models',
    currentTab: 'Current tab',
    saveCurrent: 'Save current',
    closeCurrent: 'Close current',
    closeOthers: 'Close others',
  },
  statusbar: {
    modelView: 'Model',
    xmlView: 'XML',
    drdView: 'DRD',
    decisionTableView: 'Decision Table',
    switchToXml: 'Switch to XML view',
    switchToModel: 'Switch to model view',
    switchToDrd: 'Switch to DRD view',
    switchToDecisionTable: 'Switch to decision table',
    elementCount: 'elements',
    ruleCount: 'rules',
    noErrors: 'No errors',
    viewErrors: 'Click to view validation details',
  },
  problems: {
    title: 'Problems',
    empty: 'No problems have been detected in the workspace.',
    errors: 'Errors',
    warnings: 'Warnings',
    clear: 'Clear',
    copy: 'Copy error messages',
    close: 'Close',
    dragToResize: 'Drag to resize (drag to minimum to collapse)',
    tabOutput: 'Output',
    tabProblems: 'Problems',
    outputEmpty: 'No output.',
    dismissedHint: '{count} problems dismissed (auto-refresh on next edit)',
  },
  file: {
    new: 'New',
    open: 'Open',
    save: 'Save',
    export: 'Export',
    openFile: 'Open file',
    saveFile: 'Save file',
    bpmnFilter: 'BPMN files',
    dmnFilter: 'DMN files',
    allFilter: 'All model files',
    saveSuccess: 'Saved successfully',
    openSuccess: 'File opened',
    saveFailed: 'Save failed',
    openFailed: 'Open failed',
    confirmClose: 'This file is unsaved. Close anyway?',
  },
  panel: {
    properties: 'Properties',
    propertiesToggle: 'Properties panel',
  },
  settings: {
    theme: 'Theme',
    switchTheme: 'Switch theme',
    language: 'Language',
    light: 'Light',
    dark: 'Dark',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    autoMode: 'Follow System',
  },
};
