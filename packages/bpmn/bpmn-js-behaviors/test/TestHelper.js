
import kunpengModdle from '@kunpeng/bpmn-moddle/resources/kunpeng.json';

export * from 'bpmn-js/test/helper';

import { bootstrapModeler } from 'bpmn-js/test/helper';

import kunpengCloudModule from 'src';

const defaultKunpengCloudAdditionalModules = [
  kunpengCloudModule
];


export function bootstrapKunpengCloudModeler(diagram, options = {}) {
  const { additionalModules = [] } = options;

  return bootstrapModeler(diagram, {
    additionalModules: [
      ...defaultKunpengCloudAdditionalModules,
      ...additionalModules
    ],
    moddleExtensions: {
      kunpeng: kunpengModdle
    }
  });
}
