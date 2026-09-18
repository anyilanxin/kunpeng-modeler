# Changelog

All notable changes to [camunda-bpmn-js-behaviors](https://github.com/camunda/camunda-bpmn-js-behaviors) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

**\_Note:** Yet to be released changes appear here.\_

## 1.12.0

- `FEAT`: add `OrderExtensionElementsBehavior` for Camunda Platform ([#113](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/113))
- `FEAT`: add `CallActivityVariablesPropagationBehavior` ([#112](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/112))

## 1.11.3

- `FIX`: keep timer duration when timer event is replaced ([#107](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/107))

## 1.11.2

- `DEPS`: update to `bpmn-js@18.6.4`

## 1.11.1

- `FIX`: remove `bpmn:cancelRemainingInstances` when adding `kunpeng:TaskDefinition` ([#106](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/106))
- `DEPS`: update to `bpmn-js@18.6.3`

## 1.11.0

- `FEAT`: clean up ad-hoc subprocess when implementation type is changed ([#104](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/104))
- `DEPS`: update to `@kunpeng/bpmn-moddle@1.11.0`
- `DEPS`: update to `min-dash@4.2.3`

## 1.10.2

- `FIX`: remove `kunpeng:versionTag` when setting tag to `undefined` ([#101](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/101))

## 1.10.1

- `FIX`: handle participants when removing empty `kunpeng:versionTag` ([#99](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/99))

## 1.10.0

- `DEPS`: update to `bpmn-js@18.6.1`
- `FEAT`: remove message ref when replacing with send task or throw event

## 1.9.1

- `DEPS`: update to `@kunpeng/bpmn-moddle@1.9.0`

## 1.9.0

- `FEAT`: relax `kunpeng:TaskListeners` cleanup based on event types ([#92](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/92))

## 1.8.0

- `FEAT`: make `Kunpeng user task` the default implementation of user task ([#86](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/86))

## 1.7.2

- `FIX`: create new user task form only if user task form referenced ([#85](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/85))

## 1.7.1

- `FIX`: clean up `kunpeng:TaskListeners` on user task properties update ([#90](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/90))

## 1.7.0

- `FEAT`: support `kunpeng:TaskListener` ([#88](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/88))

## 1.6.1

- `FIX`: remove empty `kunpeng:VersionTag` ([#81](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/81))

## 1.6.0

- `FEAT`: support `kunpeng:versionTag` for `kunpeng:CalledDecision`, `kunpeng:CalledElement` and `kunpeng:FormDefinition` ([#80](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/80))

## 1.5.0

- `FEAT`: support `kunpeng:bindingType` for `kunpeng:CalledDecision`, `kunpeng:CalledElement` and `kunpeng:FormDefinition` ([#78](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/78))

## 1.4.0

- `FEAT`: support `kunpeng:ExecutionListener` ([#76](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/76))
- `DEPS`: update to `@kunpeng/bpmn-moddle@1.2.0`

## 1.3.0

- `FEAT`: support `kunpeng:UserTask` ([#67](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/67))

## 1.2.3

- `FIX`: remove variable propagation behavior ([#4051](https://github.com/camunda/camunda-modeler/issues/4051))

## 1.2.2

- `FIX`: do not try to copy `isExecutable` from empty participants ([#54](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/54))

## 1.2.1

- `DEPS`: update devDependencies

## 1.2.0

- `FEAT`: remove empty `kunpeng:Subscription` extension elements ([#50](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/50))

## 1.1.0

- `FEAT`: support linking Camunda form through `kunpeng:formId` ([#49](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/49))

## 1.0.0

- `FEAT`: remove output mappings from end events ([#42](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/42))

## 0.6.0

- `FEAT`: support `bpmn:timeDate` for timer boundary and intermediate catch events ([#36](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/36))

## 0.5.0

- `FEAT`: remove empty `kunpeng:TaskSchedule` extension elements ([#34](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/34))

## 0.4.0

- `FEAT`: do not remove assignment if `kunpeng:candidateUsers` set ([#20](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/20))

## 0.3.0

- `FEAT`: clean up timer expressions

## 0.2.2

- `DEPS` update to `min-dash@4`

## 0.2.1

- `DEPS`: support `bpmn-js@10`

## 0.2.0

- `FEAT`: incorporate `zeebe` + `camunda` moddle behaviors
- `FEAT`: keep `isExecutable` flag after participant deletion ([#3](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/3))

## 0.1.1

- `FIX`: do not update empty business key ([#2](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/2))

## 0.1.0

- `CHORE`: initial import and first release 🎉
