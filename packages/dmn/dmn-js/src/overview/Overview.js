import {
  classes as domClasses,
  domify,
  query as domQuery,
  remove as domRemove,
} from 'min-dom';

import createDragger from './dragger';
import OverviewManager from './OverviewManager';

const DEFAULT_WIDTH = 300;
const MIN_WIDTH = 150;
const MAX_WIDTH = 650;

/**
 * A didi service that provides a self-contained DMN overview.
 *
 * Registered via `drd.additionalModules` — on instantiation it resolves the
 * parent Manager (modeler), lazily creates a shared `OverviewManager`, and
 * mounts a floating toggle button + overview panel into the modeler container.
 *
 * The host application does not need to provide any DOM.
 *
 * @param {object} injector
 * @param {EventBus} eventBus  (drd viewer's event bus)
 */
export default class Overview {
  constructor(injector, eventBus) {
    this._injector = injector;
    this._eventBus = eventBus;

    // resolve parent (top-level Manager / modeler)
    this._parent = injector.get('_parent', false);

    if (!this._parent) {
      return;
    }

    // lazily create / reuse the shared overview manager on the parent
    this._manager = getOrCreateManager(this._parent);

    // local panel state
    this._isOpen = false;
    this._width = DEFAULT_WIDTH;
    this._resizeStartWidth = DEFAULT_WIDTH;
    this._mounted = false;

    this._initDom();

    // mount toggle button + panel immediately so the button is ready
    // to appear as soon as the user switches to a non-DRD view
    this._mount();

    // show/hide toolbar based on the active view type
    const updateButtonVisibility = ({ activeView }) => {
      const isDrd = !activeView || activeView.type === 'drd';

      // toolbar visible only in non-DRD views
      domClasses(this._toolbar).toggle('hidden', isDrd);

      // auto-close overview when switching back to DRD
      if (isDrd && this._isOpen) {
        this.close();
      }
    };

    this._parent.on('views.changed', updateButtonVisibility);

    // apply current state immediately (in case views.changed already fired)
    const activeView = this._parent.getActiveView();
    updateButtonVisibility({ activeView });

    // cleanup on modeler destroy
    this._parent.on('destroy', () => {
      this.destroy();
    });
  }

  /**
   * Build the floating toolbar + overview panel DOM.
   */
  _initDom() {
    // toolbar with "Edit DRD" + "Overview" buttons (floating, top-left)
    this._toolbar = domify(
      '<div class="dmn-overview-toolbar hidden">' +
        '<button type="button" class="dmn-overview-edit-drd" title="Switch back to DRD view">Edit DRD</button>' +
        '<button type="button" class="dmn-overview-toggle-button" title="Toggle DRD overview">Open overview</button>' +
        '</div>',
    );

    this._editDrdButton = domQuery('.dmn-overview-edit-drd', this._toolbar);
    this._toggleButton = domQuery('.dmn-overview-toggle-button', this._toolbar);

    this._editDrdButton.addEventListener('click', () => {
      this._switchToDrd();
    });

    this._toggleButton.addEventListener('click', () => {
      this.toggle();
    });

    // overview panel
    this._panel = domify(
      '<div class="dmn-overview-panel">' +
        '<div class="dmn-overview-resize-handle"></div>' +
        '<div class="dmn-overview-close" title="Close overview">&times;</div>' +
        '<div class="dmn-overview-viewer"></div>' +
        '</div>',
    );

    this._viewerContainer = domQuery('.dmn-overview-viewer', this._panel);
    this._resizeHandle = domQuery('.dmn-overview-resize-handle', this._panel);
    this._closeButton = domQuery('.dmn-overview-close', this._panel);

    this._panel.style.width = '0px';

    // close button
    this._closeButton.addEventListener('click', () => {
      this.close();
    });

    // resize via mousedown drag
    const handleResize = (_event, delta) => {
      const { x: dx } = delta;

      const width = Math.min(
        Math.max(this._resizeStartWidth + dx, MIN_WIDTH),
        MAX_WIDTH,
      );

      this._width = width;
      this._panel.style.width = `${width}px`;

      // notify the overview viewer that its container resized
      const activeViewer =
        this._manager._overview && this._manager._overview.getActiveViewer();
      if (activeViewer) {
        activeViewer.get('canvas').resized();
      }
    };

    this._resizeHandle.addEventListener('mousedown', (event) => {
      createDragger(handleResize, () => {
        // onEnd: remove resizing highlight
        domClasses(this._panel).remove('resizing');
      })(event);

      this._resizeStartWidth = this._width;
      domClasses(this._panel).add('resizing');
    });
  }

  /**
   * Append toolbar + panel into the modeler container.
   */
  _mount() {
    if (this._mounted) {
      return;
    }

    const container = this._parent._container;

    if (!container) {
      return;
    }

    container.append(this._toolbar);
    container.append(this._panel);
    this._mounted = true;
  }

  /**
   * Switch back to the DRD view (analogous to the engine's "View DRD" button).
   */
  _switchToDrd() {
    const parent = this._parent;
    if (!parent) {
      return;
    }

    const drdView = parent.getViews().find((view) => view.type === 'drd');

    if (drdView) {
      parent.open(drdView);
    }
  }

  /**
   * Remove toolbar + panel from the DOM.
   */
  _unmount() {
    if (!this._mounted) {
      return;
    }

    domRemove(this._toolbar);
    domRemove(this._panel);
    this._mounted = false;
  }

  // open / close ////////////////////////////////////////////////////////

  /**
   * Sync the toggle button label/title with the current open state.
   */
  _updateToggleButton() {
    const isOpen = this._isOpen;

    this._toggleButton.textContent = isOpen
      ? 'Close overview'
      : 'Open overview';
    this._toggleButton.title = isOpen
      ? 'Close DRD overview'
      : 'Open DRD overview';
  }

  close() {
    if (!this._isOpen) {
      return;
    }

    this._isOpen = false;

    domClasses(this._panel).remove('open');
    this._panel.style.width = '0px';

    this._manager.updateOverview(null, false);

    this._updateToggleButton();
  }

  destroy() {
    this._unmount();
    this._parent = null;
  }

  open() {
    if (this._isOpen) {
      return;
    }

    // ensure DOM is mounted
    this._mount();

    this._isOpen = true;

    domClasses(this._panel).add('open');
    this._panel.style.width = `${this._width}px`;

    // attach the overview DRD viewer into the panel container
    this._manager.updateOverview(this._viewerContainer, true);

    this._updateToggleButton();
  }

  toggle() {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}

Overview.$inject = ['injector', 'eventBus'];

/**
 * Get the shared OverviewManager from the parent Manager, creating it lazily
 * on first access. This ensures only one overview viewer exists even though
 * the Overview didi service is instantiated per drd viewer.
 */
function getOrCreateManager(parent) {
  if (!parent._overviewManager) {
    parent._overviewManager = new OverviewManager(parent);
  }

  return parent._overviewManager;
}
