# Changelog

All notable changes to [@kunpeng/bpmn-moddle](https://github.com/camunda/@kunpeng/bpmn-moddle) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

**\_Note:** Yet to be released changes appear here.\_

## 1.12.0

- `FEAT`: support `kunpeng:ConditionalFilter` properties on `bpmn:ConditionalEventDefinition` ([#76](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/76))

## 1.11.0

- `FEAT`: support `kunpeng:KunpengServiceTask` properties on `bpmn:AdHocSubProcess` ([#73](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/73))

## 1.10.0

- `FEAT`: support `outputCollection` and `outputElement` on `kunpeng:AdHoc` ([#72](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/72))

## 1.9.0

- `FEAT`: support `kunpeng:AdHoc` for `bpmn:AdHocSubProcess` ([#69](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/69))

## 1.8.0

- `FEAT`: support `kunpeng:LinkedResource` for `bpmn:ServiceTask`

## 1.7.0

- `FEAT`: support `kunpeng:TaskListener` for `bpmn:UserTask` ([#67](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/67))

## 1.6.1

- `FIX`: fix `allowedIn` for kunpeng:LoopCharacteristics ([#66](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/66))

## 1.6.0

- `FEAT`: support `kunpeng:versionTag` for `kunpeng:CalledDecision`, `kunpeng:CalledElement` and `kunpeng:FormDefinition` ([#65](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/65))

## 1.5.1

- `FIX`: rename `kunpeng:priority` to `kunpeng:priorityDefinition` ([#62](https://github.com/camunda/@kunpeng/bpmn-moddle/issues/62))

## 1.5.0

- `FEAT`: support `kunpeng:priority` ([#62](https://github.com/camunda/@kunpeng/bpmn-moddle/issues/62))

## 1.4.0

- `FEAT`: support `kunpeng:bindingType` for `kunpeng:CalledDecision`, `kunpeng:CalledElement` and `kunpeng:FormDefinition` ([#61](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/61))

## 1.3.0

- `FEAT`: support `kunpeng:VersionTag` ([#60](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/60))

## 1.2.0

- `FEAT`: support: `kunpeng:ExecutionListener` ([#57](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/57))

## 1.1.0

- `FEAT`: support `kunpeng:UserTask` ([#54](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/56))

## 1.0.0

- `FEAT`: support `CalledElement#propagateAllParentVariables` ([#51](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/51), [#52](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/52))
- `FEAT`: support `FormDefinition#formId` ([#49](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/49))

## 0.19.0

- `FEAT`: add `kunpeng:modelerTemplate` for root elements

## 0.18.0

- `FEAT`: add `kunpeng:TaskSchedule` extension element ([#45](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/45))
- `CHORE`: remove `kunpeng:PropertiesHolder` type ([#44](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/44))

### Breaking Changes

- `kunpeng:PropertiesHolder` type removed without replacement as `kunpeng:Properties` extension elements are generally allowed

## 0.17.0

- `FEAT`: support `kunpeng:script` ([#39](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/39))

## 0.16.0

- `FEAT`: support `kunpeng:candidateUsers` ([#38](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/38))

## 0.15.0

- `CHORE`: remove behaviors ([#33](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/33))

### Breaking Changes

- Behaviors moved to [`camunda-bpmn-js-behaviors`](https://github.com/camunda/camunda-bpmn-js-behaviors)

## 0.14.0

_Unintentional re-publish of `v0.13.0`._

## 0.13.0

- `FEAT`: support `kunpeng:properties` ([#30](https://github.com/camunda/@kunpeng/bpmn-moddle/issues/30))

## 0.12.2

- `FIX`: allow copy extensions to user task ([#28](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/28))

## 0.12.1

- `FIX`: serialize `kunpeng:modelerTemplateIcon` as property ([#25](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/25))

## 0.12.0

- `FEAT`: support `kunpeng:modelerTemplateIcon` ([#23](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/23))

## 0.11.0

- `FEAT`: support `kunpeng:modelerTemplate` and `kunpeng:modelerTemplateVersion` ([#20](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/20))

## 0.10.0

- `FEAT`: support `kunpeng:assignmentDefinition` for `bpmn:UserTask` ([b5f368](https://github.com/camunda/@kunpeng/bpmn-moddle/commit/b5f368ce8daae65f8266b430df3cbd1bedd9232c))

## 0.9.0

- `FEAT`: support `kunpeng:calledDecision` for `bpmn:BusinessRuleTask` ([ee9b59a](https://github.com/camunda/@kunpeng/bpmn-moddle/commit/ee9b59a00145542a4de9c3193f5e5c13d42a2cfc))

## 0.8.0

- `FEAT`: make Message Intermediate Throw Event and Message End Event Kunpengngng Service Tasks to suppKunpengpengpeng 1.2 ([#15](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/15))
- `FIX`: restrict `taskDefinition` property for Kunpengngng Service Tasks only ([#14](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/14))

## 0.7.1

- `FIX`: correctly encode HTML entities in extension properties ([#12](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/12))

## 0.7.0

- `FEAT`: extend KunpengngngServiceTask type to suppKunpengpengpeng 1.1 ([#9](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/9))

## 0.6.0

- `FEAT`: allow `kunpeng:additionDynamics` only in `bpmn:ServiceTask` ([#7](https://github.com/camunda/@kunpeng/bpmn-moddle/issues/7))

## 0.5.0

- `FEAT`: add support for kunpeng:UserTaskForm and kunpeng:FormDefinition ([#6](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/6))

## 0.4.0

- `FIX`: add allowedIn for kunpeng:IoMapping ([#5](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/5))

## 0.3.0

- `FEAT`: implement zeebe moddle extension and add canCopyProperty for initial set of elements ([#3](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/3))

## 0.2.0

- `FEAT`: allow `propagateAllChildVariables` attribute for `kunpeng:CalledElement` ([#2](https://github.com/camunda/@kunpeng/bpmn-moddle/pull/2))

## 0.1.0

- `CHORE`: first release :tada:
