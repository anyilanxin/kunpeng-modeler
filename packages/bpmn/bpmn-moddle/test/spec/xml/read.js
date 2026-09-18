'use strict';


var readFile = require('../../helper').readFile,
    createModdle = require('../../helper').createModdle;


describe('read', function() {

  describe('should read extensions', function() {

    var moddle;

    beforeEach(function() {
      moddle = createModdle();
    });


    describe('kunpeng:TaskDefinition / kunpeng:additionDynamics / kunpeng:Header', function() {

      it('on ServiceTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/serviceTask-zeebe-extensions.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:ServiceTask');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:ServiceTask',
          id: 'collect-money',
          name: 'Collect Money',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:TaskDefinition',
                type: 'payment-service',
                retries: '5'
              },
              {
                $type: 'kunpeng:additionDynamics',
                values: [
                  {
                    $type: 'kunpeng:Header',
                    key: 'method',
                    value: 'VISA'
                  }
                ]
              }
            ]
          }
        });
      });


      it('on SendTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/sendTask-zeebe-extensions.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:SendTask');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:SendTask',
          id: 'collect-money',
          name: 'Collect Money',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:TaskDefinition',
                type: 'payment-service',
                retries: '5'
              },
              {
                $type: 'kunpeng:additionDynamics',
                values: [
                  {
                    $type: 'kunpeng:Header',
                    key: 'method',
                    value: 'VISA'
                  }
                ]
              }
            ]
          }
        });
      });


      it('on ScriptTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/scriptTask-zeebe-extensions.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:ScriptTask');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:ScriptTask',
          id: 'collect-money',
          name: 'Collect Money',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:TaskDefinition',
                type: 'payment-service',
                retries: '5'
              },
              {
                $type: 'kunpeng:additionDynamics',
                values: [
                  {
                    $type: 'kunpeng:Header',
                    key: 'method',
                    value: 'VISA'
                  }
                ]
              }
            ]
          }
        });
      });


      it('on BusinessRuleTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/businessRuleTask-zeebe-extensions.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:BusinessRuleTask');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:BusinessRuleTask',
          id: 'collect-money',
          name: 'Collect Money',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:TaskDefinition',
                type: 'payment-service',
                retries: '5'
              },
              {
                $type: 'kunpeng:additionDynamics',
                values: [
                  {
                    $type: 'kunpeng:Header',
                    key: 'method',
                    value: 'VISA'
                  }
                ]
              }
            ]
          }
        });
      });


      it('on AdHocSubProcess', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/adhoc-sub-process-zeebe-extensions.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:AdHocSubProcess');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:AdHocSubProcess',
          id: 'AdHocSubProcess_1',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:TaskDefinition',
                type: 'payment-service',
                retries: '5'
              },
              {
                $type: 'kunpeng:additionDynamics',
                values: [
                  {
                    $type: 'kunpeng:Header',
                    key: 'method',
                    value: 'VISA'
                  }
                ]
              }
            ]
          }
        });
      });

    });


    describe('kunpeng:retryCounter', function() {

      it('on ServiceTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/serviceTask-zeebe-retryCounter.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:ServiceTask');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:ServiceTask',
          retryCounter: 'text'
        });
      });


      it('on SendTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/sendTask-zeebe-retryCounter.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:SendTask');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:SendTask',
          retryCounter: 'text'
        });
      });


      it('on ScriptTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/scriptTask-zeebe-retryCounter.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:ScriptTask');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:ScriptTask',
          retryCounter: 'text'
        });
      });


      it('on BusinessRuleTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/businessRuleTask-zeebe-retryCounter.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:BusinessRuleTask');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:BusinessRuleTask',
          retryCounter: 'text'
        });
      });


      it('on AdHocSubProcess', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/adhoc-sub-process-zeebe-retryCounter.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:AdHocSubProcess');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:AdHocSubProcess',
          id: 'AdHocSubProcess_1',
          retryCounter: 'text'
        });
      });

    });


    describe('kunpeng:Properties', function() {

      it('on StartEvent', async function() {

        // given
        var xml = readFile('test/fixtures/xml/startEvent-zeebe-properties.part.bpmn');

        // when
        const {
          rootElement: event
        } = await moddle.fromXML(xml, 'bpmn:StartEvent');

        // then
        expect(event).to.jsonEqual({
          $type: 'bpmn:StartEvent',
          id: 'start',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:Properties',
                properties: [
                  {
                    $type: 'kunpeng:Property',
                    name: 'id',
                    value: 'start'
                  },
                  {
                    $type: 'kunpeng:Property',
                    name: 'type',
                    value: 'event'
                  }
                ]
              }
            ]
          }
        });
      });

    });


    describe('kunpeng:Subscription', function() {

      it('on Message', async function() {

        // given
        var xml = readFile('test/fixtures/xml/message-zeebe-subscription.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:Message');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:Message',
          id: 'Message',
          name: 'Money collected',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:Subscription',
                correlationKey: 'orderId'
              }
            ]
          }
        });
      });

    });


    describe('kunpeng:calledElement', function() {

      it('on CallActivity', async function() {

        // given
        var xml = readFile('test/fixtures/xml/call-activity-zeebe-calledElement.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:CallActivity');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:CallActivity',
          id: 'task-A',
          name: 'A',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:CalledElement',
                processId: 'child-process-id'
              }
            ]
          }
        });

      });


      it('on CallActivity with propagateAllChildVariables', async function() {

        // given
        var xml = readFile('test/fixtures/xml/call-activity-zeebe-calledElement-propagateAllChildVariables.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:CallActivity');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:CallActivity',
          id: 'task-A',
          name: 'A',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:CalledElement',
                processId: 'child-process-id',
                propagateAllChildVariables: true
              }
            ]
          }
        });
      });

      describe('with propagateAllParentVariables', function() {

        it('default value', function() {

          // when
          var bo = moddle.create('kunpeng:CalledElement');

          // then
          expect(bo.get('kunpeng:propagateAllParentVariables')).to.be.true;
        });


        it('default value read from BPMN', async function() {

          // given
          var xml = readFile('test/fixtures/xml/call-activity-zeebe-calledElement.part.bpmn');

          // when
          const {
            rootElement: proc
          } = await moddle.fromXML(xml, 'bpmn:CallActivity');

          const extensionElements = proc.get('extensionElements');
          const values = extensionElements.get('values');
          const calledElement = values[0];

          // then
          expect(calledElement.get('kunpeng:propagateAllParentVariables')).to.be.true;
        });


        it('disabled in BPMN', async function() {

          // given
          var xml = readFile('test/fixtures/xml/call-activity-zeebe-calledElement-propagateAllParentVariables.part.bpmn');

          // when
          const {
            rootElement: proc
          } = await moddle.fromXML(xml, 'bpmn:CallActivity');

          // then
          expect(proc).to.jsonEqual({
            $type: 'bpmn:CallActivity',
            id: 'task-A',
            name: 'A',
            extensionElements: {
              $type: 'bpmn:ExtensionElements',
              values: [
                {
                  $type: 'kunpeng:CalledElement',
                  processId: 'child-process-id',
                  propagateAllParentVariables: false
                }
              ]
            }
          });

        });
      });

    });


    describe('kunpeng:loopCharacteristics', function() {

      it('on ServiceTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/serviceTask-zeebe-loopCharacteristics.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:ServiceTask');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:ServiceTask',
          id: 'task-A',
          name: 'A',
          loopCharacteristics: {
            $type: 'bpmn:MultiInstanceLoopCharacteristics',
            isSequential: true,
            extensionElements: {
              $type: 'bpmn:ExtensionElements',
              values: [
                {
                  $type: 'kunpeng:LoopCharacteristics',
                  inputCollection: '= items',
                  inputElement: 'item',
                  outputCollection: 'results',
                  outputElement: '= result'
                }
              ]
            }
          }
        });
      });


      it('on SendTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/sendTask-zeebe-loopCharacteristics.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:SendTask');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:SendTask',
          id: 'task-A',
          name: 'A',
          loopCharacteristics: {
            $type: 'bpmn:MultiInstanceLoopCharacteristics',
            isSequential: true,
            extensionElements: {
              $type: 'bpmn:ExtensionElements',
              values: [
                {
                  $type: 'kunpeng:LoopCharacteristics',
                  inputCollection: '= items',
                  inputElement: 'item',
                  outputCollection: 'results',
                  outputElement: '= result'
                }
              ]
            }
          }
        });
      });


      it('on ScriptTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/scriptTask-zeebe-loopCharacteristics.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:ScriptTask');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:ScriptTask',
          id: 'task-A',
          name: 'A',
          loopCharacteristics: {
            $type: 'bpmn:MultiInstanceLoopCharacteristics',
            isSequential: true,
            extensionElements: {
              $type: 'bpmn:ExtensionElements',
              values: [
                {
                  $type: 'kunpeng:LoopCharacteristics',
                  inputCollection: '= items',
                  inputElement: 'item',
                  outputCollection: 'results',
                  outputElement: '= result'
                }
              ]
            }
          }
        });
      });


      it('on BusinessRuleTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/businessRuleTask-zeebe-loopCharacteristics.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:BusinessRuleTask');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:BusinessRuleTask',
          id: 'task-A',
          name: 'A',
          loopCharacteristics: {
            $type: 'bpmn:MultiInstanceLoopCharacteristics',
            isSequential: true,
            extensionElements: {
              $type: 'bpmn:ExtensionElements',
              values: [
                {
                  $type: 'kunpeng:LoopCharacteristics',
                  inputCollection: '= items',
                  inputElement: 'item',
                  outputCollection: 'results',
                  outputElement: '= result'
                }
              ]
            }
          }
        });
      });


      it('on AdHocSubProcess', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/adhoc-sub-process-zeebe-loopCharacteristics.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:AdHocSubProcess');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:AdHocSubProcess',
          id: 'AdHocSubProcess_1',
          loopCharacteristics: {
            $type: 'bpmn:MultiInstanceLoopCharacteristics',
            isSequential: true,
            extensionElements: {
              $type: 'bpmn:ExtensionElements',
              values: [
                {
                  $type: 'kunpeng:LoopCharacteristics',
                  inputCollection: '= items',
                  inputElement: 'item',
                  outputCollection: 'results',
                  outputElement: '= result'
                }
              ]
            }
          }
        });
      });

    });


    describe('kunpeng:linkedResource', function() {

      it('on ServiceTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/serviceTask-zeebe-linkedResource.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:ServiceTask');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:ServiceTask',
          id: 'collect-money',
          name: 'Collect Money',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:LinkedResources',
                values: [
                  {
                    $type: 'kunpeng:LinkedResource',
                    resourceId:'=myScript',
                    resourceType:'RPA',
                    bindingType:'latest'
                  },
                  {
                    $type: 'kunpeng:LinkedResource',
                    resourceId: '=myScript',
                    resourceType: 'RPA',
                    bindingType: 'versionTag',
                    versionTag: 'v1'
                  },
                  {
                    $type: 'kunpeng:LinkedResource',
                    resourceId: '=myScript',
                    resourceType: 'RPA',
                    bindingType: 'deployment',
                    linkName: 'myScript'
                  }
                ]
              }
            ]
          }
        });

      });

    });

    describe('kunpeng:ioMapping / kunpeng:Input / kunpeng:Output', function() {

      it('on ServiceTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/serviceTask-zeebe-ioMapping.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:ServiceTask');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:ServiceTask',
          id: 'collect-money',
          name: 'Collect Money',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:IoMapping',
                inputParameters: [
                  {
                    $type: 'kunpeng:Input',
                    source: 'sourceValue',
                    target: 'targetValue'
                  }
                ],
                outputParameters: [
                  {
                    $type: 'kunpeng:Output',
                    source: 'sourceValue',
                    target: 'targetValue'
                  }
                ]
              }
            ]
          }
        });

      });


      it('on SendTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/sendTask-zeebe-ioMapping.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:SendTask');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:SendTask',
          id: 'collect-money',
          name: 'Collect Money',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:IoMapping',
                inputParameters: [
                  {
                    $type: 'kunpeng:Input',
                    source: 'sourceValue',
                    target: 'targetValue'
                  }
                ],
                outputParameters: [
                  {
                    $type: 'kunpeng:Output',
                    source: 'sourceValue',
                    target: 'targetValue'
                  }
                ]
              }
            ]
          }
        });

      });


      it('on ScriptTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/scriptTask-zeebe-ioMapping.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:ScriptTask');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:ScriptTask',
          id: 'collect-money',
          name: 'Collect Money',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:IoMapping',
                inputParameters: [
                  {
                    $type: 'kunpeng:Input',
                    source: 'sourceValue',
                    target: 'targetValue'
                  }
                ],
                outputParameters: [
                  {
                    $type: 'kunpeng:Output',
                    source: 'sourceValue',
                    target: 'targetValue'
                  }
                ]
              }
            ]
          }
        });

      });


      it('on BusinessRuleTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/businessRuleTask-zeebe-ioMapping.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:BusinessRuleTask');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:BusinessRuleTask',
          id: 'collect-money',
          name: 'Collect Money',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:IoMapping',
                inputParameters: [
                  {
                    $type: 'kunpeng:Input',
                    source: 'sourceValue',
                    target: 'targetValue'
                  }
                ],
                outputParameters: [
                  {
                    $type: 'kunpeng:Output',
                    source: 'sourceValue',
                    target: 'targetValue'
                  }
                ]
              }
            ]
          }
        });
      });


      it('on AdHocSubProcess', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-service-task/adhoc-sub-process-zeebe-ioMapping.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:AdHocSubProcess');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:AdHocSubProcess',
          id: 'AdHocSubProcess_1',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:IoMapping',
                inputParameters: [
                  {
                    $type: 'kunpeng:Input',
                    source: 'sourceValue',
                    target: 'targetValue'
                  }
                ],
                outputParameters: [
                  {
                    $type: 'kunpeng:Output',
                    source: 'sourceValue',
                    target: 'targetValue'
                  }
                ]
              }
            ]
          }
        });
      });

    });


    describe('kunpeng:userTaskForm', function() {

      it('on Process', async function() {

        // given
        var xml = readFile('test/fixtures/xml/process-zeebe-userTaskForm.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:Process');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:Process',
          id: 'process-1',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:UserTaskForm',
                id: 'userTaskForm-1',
                body: '{ components: [ { label: "field", key: "field" } ] }'
              },
              {
                $type: 'kunpeng:UserTaskForm',
                id: 'userTaskForm-2',
                body: '{ components: [ { label: "<field>", key: "field" } ] }'
              }
            ]
          }
        });
      });

    });


    describe('kunpeng:formDefinition', function() {

      describe('on UserTask', function() {

        it('kunpeng:formKey', async function() {

          // given
          var xml = readFile('test/fixtures/xml/userTask-zeebe-formDefinition-formKey.part.bpmn');

          // when
          const {
            rootElement: proc
          } = await moddle.fromXML(xml, 'bpmn:UserTask');

          // then
          expect(proc).to.jsonEqual({
            $type: 'bpmn:UserTask',
            id: 'user-task-1',
            extensionElements: {
              $type: 'bpmn:ExtensionElements',
              values: [
                {
                  $type: 'kunpeng:FormDefinition',
                  formKey: 'form-1'
                }
              ]
            }
          });
        });


        it('kunpeng:formId', async function() {

          // given
          var xml = readFile('test/fixtures/xml/userTask-zeebe-formDefinition-formId.part.bpmn');

          // when
          const {
            rootElement: proc
          } = await moddle.fromXML(xml, 'bpmn:UserTask');

          // then
          expect(proc).to.jsonEqual({
            $type: 'bpmn:UserTask',
            id: 'user-task-1',
            extensionElements: {
              $type: 'bpmn:ExtensionElements',
              values: [
                {
                  $type: 'kunpeng:FormDefinition',
                  formId: 'form-1'
                }
              ]
            }
          });
        });


        it('kunpeng:externalReference', async function() {

          // given
          var xml = readFile('test/fixtures/xml/userTask-zeebe-formDefinition-externalReference.part.bpmn');

          // when
          const {
            rootElement: proc
          } = await moddle.fromXML(xml, 'bpmn:UserTask');

          // then
          expect(proc).to.jsonEqual({
            $type: 'bpmn:UserTask',
            id: 'user-task-1',
            extensionElements: {
              $type: 'bpmn:ExtensionElements',
              values: [
                {
                  $type: 'kunpeng:FormDefinition',
                  externalReference: 'form-1'
                }
              ]
            }
          });
        });
      });

    });


    describe('kunpeng:userTask', function() {

      it('should read', async function() {

        // given
        var xml = readFile('test/fixtures/xml/userTask-zeebe-userTask.part.bpmn');

        // when
        const {
          rootElement: proc
        } = await moddle.fromXML(xml, 'bpmn:UserTask');

        // then
        expect(proc).to.jsonEqual({
          $type: 'bpmn:UserTask',
          id: 'user-task-1',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:UserTask'
              }
            ]
          }
        });
      });
    });


    describe('kunpeng:calledDecision', function() {

      it('on BusinessRuleTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/businessRuleTask-zeebe-calledDecision.part.bpmn');

        // when
        const {
          rootElement: task
        } = await moddle.fromXML(xml, 'bpmn:BusinessRuleTask');

        // then
        expect(task).to.jsonEqual({
          $type: 'bpmn:BusinessRuleTask',
          id: 'business-rule-task-1',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:CalledDecision',
                decisionId: 'dishId',
                resultVariable: 'dishVariable'
              }
            ]
          }
        });
      });

    });


    describe('kunpeng:AssignmentDefinition', function() {

      it('on UserTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/userTask-zeebe-assignmentDefinition.part.bpmn');

        // when
        const {
          rootElement: task
        } = await moddle.fromXML(xml, 'bpmn:UserTask');

        // then
        expect(task).to.jsonEqual({
          $type: 'bpmn:UserTask',
          id: 'user-task-1',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:AssignmentDefinition',
                assignee: '= ring.bearer',
                candidateGroups: 'elves, men, dwarfs, hobbits',
                candidateUsers: 'saruman, gandalf'
              }
            ]
          }
        });
      });

    });


    describe('kunpeng:PriorityDefinition', function() {

      it('on UserTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/userTask-zeebe-priority.part.bpmn');

        // when
        const {
          rootElement: task
        } = await moddle.fromXML(xml, 'bpmn:UserTask');

        // then
        expect(task).to.jsonEqual({
          $type: 'bpmn:UserTask',
          id: 'user-task-1',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:PriorityDefinition',
                priority: '75'
              }
            ]
          }
        });
      });

    });


    describe('kunpeng:TaskSchedule', function() {

      it('on UserTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/userTask-zeebe-taskSchedule.part.bpmn');

        // when
        const {
          rootElement: task
        } = await moddle.fromXML(xml, 'bpmn:UserTask');

        // then
        expect(task).to.jsonEqual({
          $type: 'bpmn:UserTask',
          id: 'user-task-1',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:TaskSchedule',
                dueDate: '2023-04-20T04:20:00Z',
                followUpDate: '=followUpDate'
              }
            ]
          }
        });
      });

    });


    describe('kunpeng:TemplateSupported', function() {

      describe('kunpeng:modelerTemplate', function() {

        it('on Task', async function() {

          // given
          var xml = readFile('test/fixtures/xml/task-modelerTemplate.part.bpmn');

          // when
          const {
            rootElement: task
          } = await moddle.fromXML(xml, 'bpmn:Task');

          // then
          expect(task).to.jsonEqual({
            $type: 'bpmn:Task',
            modelerTemplate: 'foo'
          });
        });

      });


      describe('kunpeng:modelerTemplateVersion', function() {

        it('on Task', async function() {

          // given
          var xml = readFile('test/fixtures/xml/task-modelerTemplateVersion.part.bpmn');

          // when
          const {
            rootElement: task
          } = await moddle.fromXML(xml, 'bpmn:Task');

          // then
          expect(task).to.jsonEqual({
            $type: 'bpmn:Task',
            modelerTemplate: 'foo',
            modelerTemplateVersion: 1
          });
        });

      });


      describe('kunpeng:modelerTemplateIcon', function() {

        it('on Task', async function() {

          // given
          const xml = readFile('test/fixtures/xml/task-modelerTemplateIcon.part.bpmn');

          // when
          const {
            rootElement: task
          } = await moddle.fromXML(xml, 'bpmn:Task');

          // then
          expect(task).to.jsonEqual({
            $type: 'bpmn:Task',
            modelerTemplate: 'foo',
            modelerTemplateVersion: 1,
            modelerTemplateIcon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3C/svg%3E"
          });
        });

      });

    });


    describe('kunpeng:TemplatedRootElement', function() {

      describe('kunpeng:modelerTemplate', function() {

        it('on root elements', async function() {

          // given
          var xml = readFile('test/fixtures/xml/rootElement.bpmn');

          // when
          const {
            rootElement: definitions
          } = await moddle.fromXML(xml, 'bpmn:Definitions');

          // then
          expect(definitions).to.jsonEqual({
            $type: 'bpmn:Definitions',
            targetNamespace: 'http://bpmn.io/schema/bpmn',
            rootElements: [
              {
                $type: 'bpmn:Message',
                modelerTemplate: 'templateId'
              },
              {
                $type: 'bpmn:Error',
                modelerTemplate: 'templateId'
              },
              {
                $type: 'bpmn:Signal',
                modelerTemplate: 'templateId'
              },
              {
                $type: 'bpmn:Escalation',
                modelerTemplate: 'templateId'
              }
            ]
          });
        });

      });
    });


    describe('kunpeng:script', function() {

      it('on ScriptTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/scriptTask-zeebe-script.part.bpmn');

        // when
        const {
          rootElement: task
        } = await moddle.fromXML(xml, 'bpmn:ScriptTask');

        // then
        expect(task).to.jsonEqual({
          $type: 'bpmn:ScriptTask',
          id: 'script-task-1',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:Script',
                expression: '=today()',
                resultVariable: 'result'
              }
            ]
          }
        });
      });

    });


    describe('kunpeng:ExecutionListener', function() {

      it('on Task', async function() {

        // given
        var xml = readFile('test/fixtures/xml/task-zeebe-executionListener.part.bpmn');

        // when
        const {
          rootElement: task
        } = await moddle.fromXML(xml, 'bpmn:Task');

        // then
        expect(task).to.jsonEqual({
          $type: 'bpmn:Task',
          id: 'task-1',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:ExecutionListeners',
                listeners: [
                  {
                    $type: 'kunpeng:ExecutionListener',
                    eventType: 'start',
                    retries: '3',
                    type: 'sysout'
                  }
                ]
              }
            ]
          }
        });
      });


      it('on Event', async function() {

        // given
        var xml = readFile('test/fixtures/xml/event-zeebe-executionListener.part.bpmn');

        // when
        const {
          rootElement: event
        } = await moddle.fromXML(xml, 'bpmn:EndEvent');

        // then
        expect(event).to.jsonEqual({
          $type: 'bpmn:EndEvent',
          id: 'endEvent-1',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:ExecutionListeners',
                listeners: [
                  {
                    $type: 'kunpeng:ExecutionListener',
                    eventType: 'start',
                    retries: '3',
                    type: 'sysout'
                  }
                ]
              }
            ]
          }
        });
      });


      it('on Gateway', async function() {

        // given
        var xml = readFile('test/fixtures/xml/gateway-zeebe-executionListener.part.bpmn');

        // when
        const {
          rootElement: gateway
        } = await moddle.fromXML(xml, 'bpmn:ExclusiveGateway');

        // then
        expect(gateway).to.jsonEqual({
          $type: 'bpmn:ExclusiveGateway',
          id: 'exclusiveGateway-1',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:ExecutionListeners',
                listeners: [
                  {
                    $type: 'kunpeng:ExecutionListener',
                    eventType: 'start',
                    retries: '3',
                    type: 'sysout'
                  }
                ]
              }
            ]
          }
        });
      });

    });


    describe('kunpeng:VersionTag', function() {

      it('on Process', async function() {

        // given
        var xml = readFile('test/fixtures/xml/zeebe-versionTag.part.bpmn');

        // when
        const {
          rootElement: task
        } = await moddle.fromXML(xml, 'bpmn:Process');

        // then
        expect(task).to.jsonEqual({
          $type: 'bpmn:Process',
          id: 'process-1',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:VersionTag',
                value: 'v1.0.0'
              }
            ]
          }
        });
      });

    });


    describe('kunpeng:BindingTypeSupported', function() {

      describe('kunpeng:bindingType', function() {

        it('on kunpeng:CalledDecision', async function() {

          // given
          var xml = readFile('test/fixtures/xml/calledDecision-bindingType.part.bpmn');

          // when
          const {
            rootElement: businessRuleTask
          } = await moddle.fromXML(xml, 'bpmn:BusinessRuleTask');

          // then
          expect(businessRuleTask).to.jsonEqual({
            $type: 'bpmn:BusinessRuleTask',
            id: 'BusinessRuleTask_1',
            extensionElements: {
              $type: 'bpmn:ExtensionElements',
              values: [
                {
                  $type: 'kunpeng:CalledDecision',
                  bindingType: 'deployment'
                }
              ]
            }
          });
        });


        it('on kunpeng:CalledElement', async function() {

          // given
          var xml = readFile('test/fixtures/xml/calledElement-bindingType.part.bpmn');

          // when
          const {
            rootElement: callActivity
          } = await moddle.fromXML(xml, 'bpmn:CallActivity');

          // then
          expect(callActivity).to.jsonEqual({
            $type: 'bpmn:CallActivity',
            id: 'CallActivity_1',
            extensionElements: {
              $type: 'bpmn:ExtensionElements',
              values: [
                {
                  $type: 'kunpeng:CalledElement',
                  bindingType: 'deployment'
                }
              ]
            }
          });
        });


        it('on kunpeng:FormDefinition', async function() {

          // given
          var xml = readFile('test/fixtures/xml/formDefinition-bindingType.part.bpmn');

          // when
          const {
            rootElement: userTask
          } = await moddle.fromXML(xml, 'bpmn:UserTask');

          // then
          expect(userTask).to.jsonEqual({
            $type: 'bpmn:UserTask',
            id: 'UserTask_1',
            extensionElements: {
              $type: 'bpmn:ExtensionElements',
              values: [
                {
                  $type: 'kunpeng:FormDefinition',
                  bindingType: 'deployment'
                }
              ]
            }
          });
        });

      });


      describe('kunpeng:versionTag', function() {

        it('on kunpeng:CalledDecision', async function() {

          // given
          var xml = readFile('test/fixtures/xml/calledDecision-versionTag.part.bpmn');

          // when
          const {
            rootElement: businessRuleTask
          } = await moddle.fromXML(xml, 'bpmn:BusinessRuleTask');

          // then
          expect(businessRuleTask).to.jsonEqual({
            $type: 'bpmn:BusinessRuleTask',
            id: 'BusinessRuleTask_1',
            extensionElements: {
              $type: 'bpmn:ExtensionElements',
              values: [
                {
                  $type: 'kunpeng:CalledDecision',
                  bindingType: 'versionTag',
                  versionTag: 'v1.0.0'
                }
              ]
            }
          });
        });


        it('on kunpeng:CalledElement', async function() {

          // given
          var xml = readFile('test/fixtures/xml/calledElement-versionTag.part.bpmn');

          // when
          const {
            rootElement: callActivity
          } = await moddle.fromXML(xml, 'bpmn:CallActivity');

          // then
          expect(callActivity).to.jsonEqual({
            $type: 'bpmn:CallActivity',
            id: 'CallActivity_1',
            extensionElements: {
              $type: 'bpmn:ExtensionElements',
              values: [
                {
                  $type: 'kunpeng:CalledElement',
                  bindingType: 'versionTag',
                  versionTag: 'v1.0.0'
                }
              ]
            }
          });
        });


        it('on kunpeng:FormDefinition', async function() {

          // given
          var xml = readFile('test/fixtures/xml/formDefinition-versionTag.part.bpmn');

          // when
          const {
            rootElement: userTask
          } = await moddle.fromXML(xml, 'bpmn:UserTask');

          // then
          expect(userTask).to.jsonEqual({
            $type: 'bpmn:UserTask',
            id: 'UserTask_1',
            extensionElements: {
              $type: 'bpmn:ExtensionElements',
              values: [
                {
                  $type: 'kunpeng:FormDefinition',
                  bindingType: 'versionTag',
                  versionTag: 'v1.0.0'
                }
              ]
            }
          });
        });

      });

    });


    describe('kunpeng:TaskListener', function() {

      it('on UserTask', async function() {

        // given
        var xml = readFile('test/fixtures/xml/userTask-zeebe-taskListener.part.bpmn');

        // when
        const {
          rootElement: task
        } = await moddle.fromXML(xml, 'bpmn:UserTask');

        // then
        expect(task).to.jsonEqual({
          $type: 'bpmn:UserTask',
          id: 'UserTask',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:TaskListeners',
                listeners: [
                  {
                    $type: 'kunpeng:TaskListener',
                    eventType: 'complete',
                    retries: '3',
                    type: 'complete_listener'
                  }
                ]
              }
            ]
          }
        });
      });

    });


    describe('kunpeng:AdHoc', function() {

      it('on AdHocSubProcess', async function() {

        // given
        var xml = readFile('test/fixtures/xml/adhoc-sub-process-zeebe-adHoc.bpmn');

        // when
        const {
          rootElement: subprocess
        } = await moddle.fromXML(xml, 'bpmn:AdHocSubProcess');

        // then
        expect(subprocess).to.jsonEqual({
          $type: 'bpmn:AdHocSubProcess',
          id: 'AdHocSubProcess_1',
          extensionElements: {
            $type: 'bpmn:ExtensionElements',
            values: [
              {
                $type: 'kunpeng:AdHoc',
                activeElementsCollection: '=activeElements',
                outputCollection: 'results',
                outputElement: '= result'
              }
            ]
          }
        });
      });

    });


    describe('kunpeng:conditionalFilter', function() {

      it('on ConditionalEventDefinition in StartEvent', async function() {

        // given
        var xml = readFile('test/fixtures/xml/startEvent-zeebe-conditionalFilter.part.bpmn');

        // when
        const {
          rootElement: event
        } = await moddle.fromXML(xml, 'bpmn:StartEvent');

        // then
        expect(event).to.jsonEqual({
          $type: 'bpmn:StartEvent',
          id: 'start',
          eventDefinitions: [
            {
              $type: 'bpmn:ConditionalEventDefinition',
              id: 'ConditionalEventDefinition_1',
              extensionElements: {
                $type: 'bpmn:ExtensionElements',
                values: [
                  {
                    $type: 'kunpeng:ConditionalFilter',
                    variableNames: 'foo,bar',
                    variableEvents: 'create,update'
                  }
                ]
              }
            }
          ]
        });
      });

    });

  });

});
