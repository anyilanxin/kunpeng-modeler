import { nextId } from './id';

/**
 * 创建空的 DMN 决策表 XML（鲲鹏扩展命名空间）
 */
export function createEmptyDmn(): string {
  const definitionsId = nextId('Definitions_');
  const decisionId = nextId('Decision_');
  return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
             xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/"
             xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/"
             id="${definitionsId}"
             namespace="https://anyilanxin.com/schema/1.0/dmn"
             xmlns:modeler="http://anyilanxin.com/schema/modeler/1.0"
             exporter="Kunpeng Modeler" exporterVersion="${__APP_VERSION__}"
             modeler:executionPlatform="Kunpeng Cloud"
             modeler:executionPlatformVersion="${__APP_VERSION__}">
  <decision id="${decisionId}" name="Decision 1">
    <decisionTable id="DecisionTable_1">
      <input id="Input_1">
        <inputExpression id="InputExpression_1" typeRef="string">
          <text></text>
        </inputExpression>
      </input>
      <output id="Output_1" typeRef="string" />
    </decisionTable>
  </decision>
  <dmndi:DMNDI>
    <dmndi:DMNDiagram>
      <dmndi:DMNShape dmnElementRef="${decisionId}">
        <dc:Bounds height="80" width="180" x="160" y="100" />
      </dmndi:DMNShape>
    </dmndi:DMNDiagram>
  </dmndi:DMNDI>
</definitions>`;
}
