import DrdViewer from './DrdViewer';
import openDrgElementModule from './open-drg-element';
import overviewRendererModule from './overview-renderer';

const OVERVIEW_ZOOM_SCALE = 0.66;

const LOW_PRIORITY = 500;
const HIGH_PRIORITY = 2500;

/**
 * Manages a side-by-side DRD overview that stays in sync with a DMN modeler.
 *
 * Responsibilities:
 *   1. Keep the overview (a DRD-only viewer) in sync with the modeler's XML.
 *   2. Attach / detach the overview to a DOM container on demand.
 *   3. Highlight the currently open DRG element inside the overview.
 *   4. Open the corresponding view in the modeler when a DRG element is clicked
 *      inside the overview.
 */
export default class OverviewManager {
  constructor(modeler) {
    this._modeler = modeler;

    this._overview = new DrdViewer({
      drd: {
        additionalModules: [openDrgElementModule, overviewRendererModule],
      },
    });

    this._offCommandStackChanged = null;

    this._bindModelerEvents();
    this._bindOverviewEvents();

    // If the modeler already has definitions loaded, the initial
    // import.parse.start event was missed (OverviewManager is created
    // during the first view switch, after import). Re-feed the overview
    // with the current XML so it has content to render.
    if (modeler.getDefinitions()) {
      modeler
        .saveXML()
        .then(({ xml }) => {
          this.showOverview(xml);
        })
        .catch(() => {});
    }
  }

  // modeler → overview sync /////////////////////////////////////////////

  _attachOverview(parentNode) {
    const activeViewer = this._overview.getActiveViewer();

    if (!activeViewer) {
      return false;
    }

    if (this._overview._container.parentNode === parentNode) {
      return false;
    }

    this._detachOverview();

    this._modeler._emit('attachOverview');

    this._overview.attachTo(parentNode);

    activeViewer.get('canvas').resized();

    const activeView = this._modeler.getActiveView();

    if (activeView && activeView.type !== 'drd') {
      activeViewer.get('eventBus').fire('drgElementOpened', {
        id: activeView.element.id,
      });
    }

    return true;
  }

  _bindModelerEvents() {
    const modeler = this._modeler;

    // (1) import overview initially
    this._onImportParseStart = ({ xml }) => {
      this.showOverview(xml);
    };
    modeler.on('import.parse.start', this._onImportParseStart);

    // keep track of view type
    let previousActiveViewType;

    this._onViewsChangedTracking = ({ activeView }) => {
      previousActiveViewType = activeView.type;
    };
    modeler.on('views.changed', LOW_PRIORITY, this._onViewsChangedTracking);

    // (2) update overview on changes in modeler
    this._onViewsChanged = ({ activeView }) => {
      if (previousActiveViewType === activeView.type) {
        return;
      }

      if (this._offCommandStackChanged) {
        this._offCommandStackChanged();
      }

      const handleCommandStackChanged = () => {
        this._offCommandStackChanged();
        this._modeler.once('saveXML.done', onCommandStackChanged);
        this._updateOverview();
      };

      const viewer = this._modeler._viewers[activeView.type];
      const eventBus = viewer && viewer.get('eventBus', false);

      if (!eventBus) {
        return;
      }

      const onCommandStackChanged = () => {
        eventBus.on('commandStack.changed', handleCommandStackChanged);
      };

      this._offCommandStackChanged = () => {
        eventBus.off('commandStack.changed', handleCommandStackChanged);
      };

      onCommandStackChanged();
    };
    modeler.on('views.changed', this._onViewsChanged);

    // (3) highlight current open DRG element on views changed
    this._onViewsChangedHighlight = ({ activeView }) => {
      if (activeView.type !== 'drd') {
        const activeViewer = this._overview.getActiveViewer();

        if (activeViewer && this._overview._container.parentNode) {
          activeViewer.get('eventBus').fire('drgElementOpened', {
            id: activeView.element.id,
          });
        }
      }
    };
    modeler.on('views.changed', this._onViewsChangedHighlight);

    // (4) propagate overview open to allow re-centering.
    //     Defer to the next frame so the overview viewer's canvas has
    //     completed layout (non-zero size) before OpenDrgElement
    //     tries to center the viewbox.
    this._onOverviewOpen = () => {
      requestAnimationFrame(() => {
        const activeViewer = this._overview.getActiveViewer();

        if (activeViewer) {
          activeViewer.get('eventBus').fire('overviewOpen');
        }
      });
    };
    modeler.on('overviewOpen', this._onOverviewOpen);
  }

  // attach / detach overview viewer to panel ////////////////////////////

  _bindOverviewEvents() {
    // (5) open DRG element on click inside the overview
    this._overview.once('import.done', () => {
      const activeViewer = this._overview.getActiveViewer();

      if (!activeViewer) {
        return;
      }

      this._onOpenDrgElement = ({ id }) => {
        const view = this._modeler.getViews().find(({ element }) => {
          return element.id === id;
        });

        if (view && view.type !== 'drd') {
          this._modeler.open(view);
        }
      };
      activeViewer.on('openDrgElement', this._onOpenDrgElement);
    });
  }

  _detachOverview() {
    const activeViewer = this._overview.getActiveViewer();

    if (!activeViewer) {
      return;
    }

    if (!this._overview._container.parentNode) {
      return;
    }

    this._modeler._emit('detachOverview');

    this._overview.detach();
  }

  _handleOverviewImport(err) {
    if (!this._overview || !this._overview.getActiveViewer()) {
      return;
    }

    if (err) {
      console.error(err);
    } else {
      this._overview.getActiveViewer().get('canvas').zoom(OVERVIEW_ZOOM_SCALE);
    }
  }

  _updateOverview() {
    if (!this._overview) {
      return;
    }

    // Prevent others from hooking in when updating overview
    this._modeler.once('saveXML.start', HIGH_PRIORITY, () => false);

    return this._modeler
      .saveXML()
      .then(({ xml }) => this.showOverview(xml))
      .catch((error) => {
        console.error(error);
      });
  }

  destroy() {
    const modeler = this._modeler;

    if (!modeler) {
      return;
    }

    if (this._offCommandStackChanged) {
      this._offCommandStackChanged();
      this._offCommandStackChanged = null;
    }

    modeler.off('import.parse.start', this._onImportParseStart);
    modeler.off('views.changed', LOW_PRIORITY, this._onViewsChangedTracking);
    modeler.off('views.changed', this._onViewsChanged);
    modeler.off('views.changed', this._onViewsChangedHighlight);
    modeler.off('overviewOpen', this._onOverviewOpen);

    const activeViewer = this._overview && this._overview.getActiveViewer();
    if (activeViewer && this._onOpenDrgElement) {
      activeViewer.off('openDrgElement', this._onOpenDrgElement);
    }

    if (this._overview) {
      this._overview.destroy();
      this._overview = null;
    }

    this._modeler = null;
  }

  showOverview(xml) {
    return this._overview
      .importXML(xml)
      .then(
        () => {},
        (error) => error,
      )
      .then((err) => this._handleOverviewImport(err));
  }

  /**
   * Attach the overview to a parent node, or detach it when no node is provided.
   *
   * @param {HTMLElement|null} parentNode
   * @param {boolean} [open]
   */
  updateOverview(parentNode, open) {
    if (!parentNode) {
      this._detachOverview();
      return;
    }

    const attached = this._attachOverview(parentNode);

    if (attached && open) {
      this._modeler._emit('overviewOpen');
    }
  }
}
