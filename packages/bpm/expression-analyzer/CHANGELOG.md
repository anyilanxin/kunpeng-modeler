# Changelog

All notable changes to [@bpmn-io/feel-analyzer](https://github.com/bpmn-io/feel-analyzer) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

_**Note:** Yet to be released changes appear here._

## 0.5.0

- `FEAT`: add `analyzeTree` API to analyze an already-parsed tree ([#13](https://github.com/bpmn-io/feel-analyzer/pull/13))
- `DEPS`: add `@lezer/common` ([#13](https://github.com/bpmn-io/feel-analyzer/pull/13))

## 0.4.0

- `FEAT`: return invoked function position (`from`, `to`) per invocation, in source order ([#11](https://github.com/bpmn-io/feel-analyzer/pull/11))

## 0.3.0

- `FEAT`: add `validity` analyzer ([#10](https://github.com/bpmn-io/feel-analyzer/pull/10))

## 0.2.2

- `FIX`: detect user-defined functions shadowing builtins ([#8](https://github.com/bpmn-io/feel-analyzer/pull/8))

## 0.2.1

No user-facing changes.

The library can now be consumed by both CommonJS and ES modules.

## 0.2.0

- `FEAT`: extract called function names from expressions ([#6](https://github.com/bpmn-io/feel-analyzer/pull/6))

## 0.1.0

- `FEAT`: initial release, analyse inputs and their structure ([#4](https://github.com/bpmn-io/feel-analyzer/pull/4))
