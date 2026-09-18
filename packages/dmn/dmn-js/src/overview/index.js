import Overview from './Overview';

/**
 * DMN Overview module.
 *
 * Usage:
 *
 * ```js
 * import { OverviewModule } from '@kunpeng/dmn-js/lib/overview';
 *
 * new DmnModeler({
 *   drd: {
 *     additionalModules: [OverviewModule]
 *   }
 * });
 * ```
 */
export const OverviewModule = {
  __init__: ['overview'],
  overview: ['type', Overview],
};

export { default as DrdViewer } from './DrdViewer';
export { default as Overview } from './Overview';
export { default as OverviewManager } from './OverviewManager';

export default OverviewModule;
