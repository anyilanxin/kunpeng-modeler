import { FeelEntry } from '@kunpeng/properties-panel';
import { withTooltipContainer, withVariableContext } from '../provider/HOCs';

export const BpmnFeelEntry = withVariableContext(withTooltipContainer(FeelEntry));

