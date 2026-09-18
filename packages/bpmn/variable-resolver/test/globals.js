import { use } from 'chai';
import sinonChai from 'sinon-chai';

import { variableAssertions } from './assertions.js';

use(variableAssertions);
use(sinonChai);
