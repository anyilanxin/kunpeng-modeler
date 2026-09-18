import { domify } from 'min-dom';
import { kunpengBuiltins } from '@kunpeng/expression-builtins';

export const domifiedBuiltins = kunpengBuiltins.map(builtin => ({
  ...builtin,
  info: () => domify(builtin.info),
}));
