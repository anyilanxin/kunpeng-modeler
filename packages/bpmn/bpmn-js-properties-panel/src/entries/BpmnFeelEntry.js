import { FeelEntry } from '@kunpeng-js/properties-panel';
import { withTooltipContainer, withVariableContext } from '../provider/HOCs';

export const BpmnFeelEntry = withVariableContext(withTooltipContainer(FeelEntry));

