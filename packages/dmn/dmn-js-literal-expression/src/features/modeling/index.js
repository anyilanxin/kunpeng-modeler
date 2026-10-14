import CommandStack from 'diagram-js/lib/command/CommandStack';
import IdChangeBehavior from
  '@kunpeng-js/dmn-js-shared/lib/features/modeling/behavior/IdChangeBehavior';
import NameChangeBehavior from
  '@kunpeng-js/dmn-js-shared/lib/features/modeling/behavior/NameChangeBehavior';
import Modeling from './Modeling';

export default {
  __init__: [ 'idChangeBehavior', 'nameChangeBehavior', 'modeling' ],
  commandStack: [ 'type', CommandStack ],
  idChangeBehavior: [ 'type', IdChangeBehavior ],
  nameChangeBehavior: [ 'type', NameChangeBehavior ],
  modeling: [ 'type', Modeling ]
};
