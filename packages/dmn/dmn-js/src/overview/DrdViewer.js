import NavigatedDrdViewer from '@kunpeng-js/dmn-js-drd/lib/NavigatedViewer';
import Manager from '@kunpeng-js/dmn-js-shared/lib/base/Manager';
import { containsDi } from '@kunpeng-js/dmn-js-shared/lib/util/DiUtil';
import { is } from '@kunpeng-js/dmn-js-shared/lib/util/ModelUtil';

/**
 * DRD-only viewer used as the DMN overview.
 *
 * It only knows how to render a DRD view, which is exactly what the overview needs.
 */
export default class DrdViewer extends Manager {
  _getViewProviders() {
    return [
      {
        id: 'drd',
        constructor: NavigatedDrdViewer,
        opens(element) {
          return is(element, 'dmn:Definitions') && containsDi(element);
        },
      },
    ];
  }
}
