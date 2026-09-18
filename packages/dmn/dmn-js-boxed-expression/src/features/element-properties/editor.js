import ElementPropertiesEditor from './ElementPropertiesEditor';
import DebounceInput from '@kunpeng/dmn-js-shared/lib/features/debounce-input';

export default {
  __depends__: [ DebounceInput ],
  __init__: [ 'elementProperties' ],
  elementProperties: [ 'type', ElementPropertiesEditor ]
};
