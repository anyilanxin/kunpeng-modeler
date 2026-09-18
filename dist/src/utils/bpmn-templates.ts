import { nextId } from './id';

/**
 * 创建空的 BPMN 流程 XML（鲲鹏扩展命名空间）
 */
export function createEmptyBpmn(): string {
  const definitionsId = nextId('Definitions_');
  const processId = nextId('Process_');
  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  id="${definitionsId}"
                  targetNamespace="http://bpmn.io/schema/bpmn"
                  xmlns:kunpeng="http://anyilanxin.com/schema/kunpeng/1.0"
                  xmlns:modeler="http://anyilanxin.com/schema/modeler/1.0"
                  exporter="Kunpeng Modeler" exporterVersion="${__APP_VERSION__}"
                  modeler:executionPlatform="Kunpeng Cloud"
                  modeler:executionPlatformVersion="${__APP_VERSION__}">
  <bpmn:process id="${processId}" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${processId}">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="159" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
}
