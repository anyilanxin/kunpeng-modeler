'use strict';

var assign = require('min-dash').assign,
    isFunction = require('min-dash').isFunction;

var Helper = require('../../helper');


describe('write', function() {

  var moddle = Helper.createModdle();


  async function write(element, options, callback) {
    if (isFunction(options)) {
      callback = options;
      options = {};
    }

    // skip preamble for tests
    options = assign({ preamble: false }, options);

    const { xml } = await moddle.toXML(element, options);

    return xml;
  }


  describe('should export properties', function() {

    it('ServiceTask#retryCounter', async function() {

      // given
      var fieldElem = moddle.create('bpmn:ServiceTask', {
        retryCounter: 'text'
      });

      var expectedXML = '<bpmn:serviceTask ' +
        'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
        'kunpeng:retryCounter="text" />';

      // when
      const xml = await write(fieldElem);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('SendTask#retryCounter', async function() {

      // given
      var fieldElem = moddle.create('bpmn:SendTask', {
        retryCounter: 'text'
      });

      var expectedXML = '<bpmn:sendTask ' +
        'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
        'kunpeng:retryCounter="text" />';

      // when
      const xml = await write(fieldElem);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('BusinessRuleTask#retryCounter', async function() {

      // given
      var fieldElem = moddle.create('bpmn:BusinessRuleTask', {
        retryCounter: 'text'
      });

      var expectedXML = '<bpmn:businessRuleTask ' +
        'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
        'kunpeng:retryCounter="text" />';

      // when
      const xml = await write(fieldElem);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('ScriptTask#retryCounter', async function() {

      // given
      var fieldElem = moddle.create('bpmn:ScriptTask', {
        retryCounter: 'text'
      });

      var expectedXML = '<bpmn:scriptTask ' +
        'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
        'kunpeng:retryCounter="text" />';

      // when
      const xml = await write(fieldElem);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('CalledElement#propagateAllChildVariables - true', async function() {

      // given
      var fieldElem = moddle.create('kunpeng:CalledElement', {
        propagateAllChildVariables: true
      });

      var expectedXML = '<kunpeng:calledElement ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
        'propagateAllChildVariables="true" />';

      // when
      const xml = await write(fieldElem);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('CalledElement#propagateAllChildVariables - false', async function() {

      // given
      var fieldElem = moddle.create('kunpeng:CalledElement', {
        propagateAllChildVariables: false
      });

      var expectedXML = '<kunpeng:calledElement ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
        'propagateAllChildVariables="false" />';

      // when
      const xml = await write(fieldElem);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('CalledElement#propagateAllParentVariables - true', async function() {

      // given
      var fieldElem = moddle.create('kunpeng:CalledElement', {
        propagateAllParentVariables: true
      });

      var expectedXML = '<kunpeng:calledElement ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" />';

      // when
      const xml = await write(fieldElem);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('CalledElement#propagateAllParentVariables - false', async function() {

      // given
      var fieldElem = moddle.create('kunpeng:CalledElement', {
        propagateAllParentVariables: false
      });

      var expectedXML = '<kunpeng:calledElement ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
        'propagateAllParentVariables="false" />';

      // when
      const xml = await write(fieldElem);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('kunpeng:userTaskForm', async function() {

      // given
      var proc = moddle.create('bpmn:Process', {
        extensionElements: moddle.create('bpmn:ExtensionElements', {
          values: [
            moddle.create('kunpeng:UserTaskForm', {
              id: 'userTaskForm-1',
              body: '{ components: [ { label: "field", key: "field" } ] }'
            }),
            moddle.create('kunpeng:UserTaskForm', {
              id: 'userTaskForm-2',
              body: '{ components: [ { label: "<field>", key: "field" } ] }'
            })
          ]
        })
      });

      var expectedXML =
        '<bpmn:process xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
                      'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">' +
          '<bpmn:extensionElements>' +
            '<kunpeng:userTaskForm id="userTaskForm-1">' +
              '{ components: [ { label: "field", key: "field" } ] }' +
            '</kunpeng:userTaskForm>' +
            '<kunpeng:userTaskForm id="userTaskForm-2">' +
              '{ components: [ { label: "&lt;field&gt;", key: "field" } ] }' +
            '</kunpeng:userTaskForm>' +
          '</bpmn:extensionElements>' +
        '</bpmn:process>';

      // when
      const xml = await write(proc);

      // then
      expect(xml).to.eql(expectedXML);
    });


    describe('kunpeng:formDefinition', function() {

      it('kunpeng:formKey', async function() {

        // given
        var proc = moddle.create('bpmn:UserTask', {
          extensionElements: moddle.create('bpmn:ExtensionElements', {
            values: [
              moddle.create('kunpeng:FormDefinition', {
                formKey: 'form-1'
              })
            ]
          })
        });

        var expectedXML =
          '<bpmn:userTask xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
                         'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">' +
            '<bpmn:extensionElements>' +
              '<kunpeng:formDefinition formKey="form-1" />' +
            '</bpmn:extensionElements>' +
          '</bpmn:userTask>';

        // when
        const xml = await write(proc);

        // then
        expect(xml).to.eql(expectedXML);
      });


      it('kunpeng:formId', async function() {

        // given
        var proc = moddle.create('bpmn:UserTask', {
          extensionElements: moddle.create('bpmn:ExtensionElements', {
            values: [
              moddle.create('kunpeng:FormDefinition', {
                formId: 'form-1'
              })
            ]
          })
        });

        var expectedXML =
          '<bpmn:userTask xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
                         'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">' +
            '<bpmn:extensionElements>' +
              '<kunpeng:formDefinition formId="form-1" />' +
            '</bpmn:extensionElements>' +
          '</bpmn:userTask>';

        // when
        const xml = await write(proc);

        // then
        expect(xml).to.eql(expectedXML);
      });


      it('kunpeng:externalReference', async function() {

        // given
        var proc = moddle.create('bpmn:UserTask', {
          extensionElements: moddle.create('bpmn:ExtensionElements', {
            values: [
              moddle.create('kunpeng:FormDefinition', {
                externalReference: 'form-1'
              })
            ]
          })
        });

        var expectedXML =
          '<bpmn:userTask xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
                         'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">' +
            '<bpmn:extensionElements>' +
              '<kunpeng:formDefinition externalReference="form-1" />' +
            '</bpmn:extensionElements>' +
          '</bpmn:userTask>';

        // when
        const xml = await write(proc);

        // then
        expect(xml).to.eql(expectedXML);
      });
    });


    it('kunpeng:userTask', async function() {

      // given
      var userTask = moddle.create('kunpeng:UserTask', {});

      var expectedXML = '<kunpeng:userTask ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" />';

      // when
      const xml = await write(userTask);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('kunpeng:calledDecision', async function() {

      // given
      var calledDecision = moddle.create('kunpeng:CalledDecision', {
        decisionId: 'dishDecision',
        resultVariable: 'dishVariable'
      });

      var expectedXML = '<kunpeng:calledDecision ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
        'decisionId="dishDecision" ' +
        'resultVariable="dishVariable" />';

      // when
      const xml = await write(calledDecision);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('kunpeng:AssignmentDefinition', async function() {

      // given
      var assignmentDefinition = moddle.create('kunpeng:AssignmentDefinition', {
        assignee: 'myAssignee',
        candidateGroups: 'myCandidateGroup',
        candidateUsers: 'myCandidateUser'
      });

      var expectedXML = '<kunpeng:assignmentDefinition ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
        'assignee="myAssignee" ' +
        'candidateGroups="myCandidateGroup" ' +
        'candidateUsers="myCandidateUser" />';

      // when
      const xml = await write(assignmentDefinition);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('kunpeng:PriorityDefinition', async function() {

      // given
      var priority = moddle.create('kunpeng:PriorityDefinition', {
        priority: '100'
      });

      var expectedXML = '<kunpeng:priorityDefinition ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
        'priority="100" />';

      // when
      const xml = await write(priority);

      // then
      expect(xml).to.eql(expectedXML);

    });


    it('kunpeng:TaskSchedule', async function() {

      // given
      var taskSchedule = moddle.create('kunpeng:TaskSchedule', {
        dueDate: '2023-04-20T04:20:00Z',
        followUpDate: '=followUpDate'
      });

      var expectedXML = '<kunpeng:taskSchedule ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
        'dueDate="2023-04-20T04:20:00Z" ' +
        'followUpDate="=followUpDate" />';

      // when
      const xml = await write(taskSchedule);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('kunpeng:modelerTemplate', async function() {

      // given
      const moddleElement = moddle.create('kunpeng:ZeebeServiceTask', {
        modelerTemplate: 'foo'
      });

      const expectedXML = '<kunpeng:zeebeServiceTask ' +
      'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
      'modelerTemplate="foo" />';

      // when
      const xml = await write(moddleElement);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('kunpeng:modelerTemplate on root element', async function() {

      // given
      const moddleElement = moddle.create('bpmn:Message', {
        modelerTemplate: 'foo'
      });

      const expectedXML = '<bpmn:message ' +
      'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
      'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
      'kunpeng:modelerTemplate="foo" />';

      // when
      const xml = await write(moddleElement);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('kunpeng:modelerTemplateVersion', async function() {

      // given
      const moddleElement = moddle.create('kunpeng:ZeebeServiceTask', {
        modelerTemplateVersion: '12'
      });

      const expectedXML = '<kunpeng:zeebeServiceTask ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
        'modelerTemplateVersion="12" />';

      // when
      const xml = await write(moddleElement);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('kunpeng:modelerTemplateIcon', async function() {

      // given
      const moddleElement = moddle.create('kunpeng:ZeebeServiceTask', {
        modelerTemplateIcon: "data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width='16' height='16'%3E%3C/svg%3E",
      });

      const expectedXML = '<kunpeng:zeebeServiceTask ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
        'modelerTemplateIcon="data:image/svg+xml,%3Csvg xmlns=&#34;http://www.w3.org/2000/svg&#34; width=&#39;16&#39; height=&#39;16&#39;%3E%3C/svg%3E" />';

      // when
      const xml = await write(moddleElement);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('kunpeng:script', async function() {

      // given
      const moddleElement = moddle.create('kunpeng:Script', {
        expression: '=today()',
        resultVariable: 'result'
      });

      const expectedXML = '<kunpeng:script ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
        'expression="=today()" resultVariable="result" />';

      // when
      const xml = await write(moddleElement);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('kunpeng:ExecutionListeners', async function() {

      // given
      const moddleElement = moddle.create('kunpeng:ExecutionListeners', {
        listeners: [
          moddle.create('kunpeng:ExecutionListener', {
            eventType: 'start',
            retries: '3',
            type: 'sysout'
          })
        ]
      });

      const expectedXML = '<kunpeng:executionListeners ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">' +
        '<kunpeng:executionListener eventType="start" retries="3" type="sysout" />' +
        '</kunpeng:executionListeners>';

      // when
      const xml = await write(moddleElement);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('kunpeng:VersionTag', async function() {

      // given
      const moddleElement = moddle.create('kunpeng:VersionTag', {
        value: 'v1.0.0'
      });

      const expectedXML = '<kunpeng:versionTag ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
        'value="v1.0.0" />';

      // when
      const xml = await write(moddleElement);

      // then
      expect(xml).to.eql(expectedXML);
    });


    describe('kunpeng:BindingTypeSupported', function() {

      describe('kunpeng:bindingType', function() {

        it('on kunpeng:CalledDecision', async function() {

          // given
          const moddleElement = moddle.create('kunpeng:CalledDecision', {
            bindingType: 'deployment'
          });

          const expectedXML = '<kunpeng:calledDecision ' +
            'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
            'bindingType="deployment" />';

          // when
          const xml = await write(moddleElement);

          // then
          expect(xml).to.eql(expectedXML);
        });


        it('on kunpeng:CalledElement', async function() {

          // given
          const moddleElement = moddle.create('kunpeng:CalledElement', {
            bindingType: 'deployment'
          });

          const expectedXML = '<kunpeng:calledElement ' +
            'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
            'bindingType="deployment" />';

          // when
          const xml = await write(moddleElement);

          // then
          expect(xml).to.eql(expectedXML);
        });


        it('on kunpeng:FormDefinition', async function() {

          // given
          const moddleElement = moddle.create('kunpeng:FormDefinition', {
            bindingType: 'deployment'
          });

          const expectedXML = '<kunpeng:formDefinition ' +
            'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
            'bindingType="deployment" />';

          // when
          const xml = await write(moddleElement);

          // then
          expect(xml).to.eql(expectedXML);
        });

      });


      describe('kunpeng:versionTag', function() {

        it('on kunpeng:CalledDecision', async function() {

          // given
          const moddleElement = moddle.create('kunpeng:CalledDecision', {
            bindingType: 'versionTag',
            versionTag: 'v1.0.0'
          });

          const expectedXML = '<kunpeng:calledDecision ' +
            'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
            'bindingType="versionTag" ' +
            'versionTag="v1.0.0" />';

          // when
          const xml = await write(moddleElement);

          // then
          expect(xml).to.eql(expectedXML);
        });


        it('on kunpeng:CalledElement', async function() {

          // given
          const moddleElement = moddle.create('kunpeng:CalledElement', {
            bindingType: 'versionTag',
            versionTag: 'v1.0.0'
          });

          const expectedXML = '<kunpeng:calledElement ' +
            'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
            'bindingType="versionTag" ' +
            'versionTag="v1.0.0" />';

          // when
          const xml = await write(moddleElement);

          // then
          expect(xml).to.eql(expectedXML);
        });


        it('on kunpeng:FormDefinition', async function() {

          // given
          const moddleElement = moddle.create('kunpeng:FormDefinition', {
            bindingType: 'versionTag',
            versionTag: 'v1.0.0'
          });

          const expectedXML = '<kunpeng:formDefinition ' +
            'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
            'bindingType="versionTag" ' +
            'versionTag="v1.0.0" />';

          // when
          const xml = await write(moddleElement);

          // then
          expect(xml).to.eql(expectedXML);
        });


        it('on kunpeng:LinkedResource', async function() {

          // given
          const moddleElement = moddle.create('kunpeng:LinkedResource', {
            bindingType: 'versionTag',
            versionTag: 'v1.0.0'
          });

          const expectedXML = '<kunpeng:linkedResource ' +
            'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
            'bindingType="versionTag" ' +
            'versionTag="v1.0.0" />';

          // when
          const xml = await write(moddleElement);

          // then
          expect(xml).to.eql(expectedXML);
        });

      });

    });


    it('kunpeng:TaskListeners', async function() {

      // given
      const moddleElement = moddle.create('kunpeng:TaskListeners', {
        listeners: [
          moddle.create('kunpeng:TaskListener', {
            eventType: 'complete',
            retries: '1',
            type: 'complete_listener'
          })
        ]
      });

      const expectedXML = '<kunpeng:taskListeners ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">' +
        '<kunpeng:taskListener eventType="complete" retries="1" type="complete_listener" />' +
        '</kunpeng:taskListeners>';

      // when
      const xml = await write(moddleElement);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('kunpeng:LinkedResource', async function() {

      // given
      const moddleElement = moddle.create('kunpeng:LinkedResource', {
        resourceId:'=myScript',
        resourceType:'RPA',
        linkName:'myScript' });

      const expectedXML = '<kunpeng:linkedResource ' +
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" ' +
        'resourceId="=myScript" ' +
        'resourceType="RPA" ' +
        'linkName="myScript" />';

      // when
      const xml = await write(moddleElement);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('kunpeng:LinkedResources', async function() {

      // given
      const moddleElement = moddle.create('kunpeng:LinkedResources');

      const expectedXML = '<kunpeng:linkedResources xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" />';

      // when
      const xml = await write(moddleElement);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('kunpeng:AdHoc', async function() {

      // given
      const moddleElement = moddle.create('kunpeng:AdHoc', {
        activeElementsCollection: '= some collection',
        outputCollection: 'results',
        outputElement: '= result'
      });

      const expectedXML = '<kunpeng:adHoc xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" activeElementsCollection="= some collection" outputCollection="results" outputElement="= result" />';

      // when
      const xml = await write(moddleElement);

      // then
      expect(xml).to.eql(expectedXML);
    });


    it('kunpeng:ConditionalFilter', async function() {

      // given
      const moddleElement = moddle.create('kunpeng:ConditionalFilter', {
        variableNames: 'foo,bar',
        variableEvents: 'create,update'
      });

      const expectedXML = '<kunpeng:conditionalFilter xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" variableNames="foo,bar" variableEvents="create,update" />';

      // when
      const xml = await write(moddleElement);

      // then
      expect(xml).to.eql(expectedXML);
    });

  });

});
