import { type DDGridStack, type GridItemHTMLElement, type GridStackNode, DDElement, GridStack, Utils } from "gridstack"
import { type GridEngine, type GridItem } from "./grid-engine";

export class DragManager {
  public readonly engine: GridEngine;

  private getDD() {
    return GridStack.getDD() as DDGridStack
  }

  public constructor(engine: GridEngine) {
    this.engine = engine

    this.setup()
  }

  public setupDragIn(element: HTMLElement, helper?: 'clone' | ((el: HTMLElement) => HTMLElement)) {
    const ddElement = DDElement.init(element);
    ddElement.setupDraggable({
      ...this.engine.options.dragInOptions,
      helper: helper ?? this.engine.options.dragInOptions?.helper,
      handle: this.engine.options.handle,
      start() { },
      stop() { }
    })
  }

  public destroyDragIn(element: HTMLElement) {
    GridStack.getDD().draggable(element, 'destroy')
  }

  public destroy() { }

  private setup() {
    if (!this.getDD().isDroppable(this.engine.gridstack.el)) {
      const that: GridStack = this.engine.gridstack;
      this.getDD().droppable(this.engine.el, {
        accept: (el: GridItemHTMLElement) => {
          const node: GridStackNode = el.gridstackNode!;
          // set accept drop to true on ourself (which we ignore) so we don't get "can't drop" icon in HTML5 mode while moving
          if (node && node.grid === that) {
            return true;
          }

          return true
        }
      })
    }

    this.getDD()
      .off(this.engine.gridstack.el, 'dropout')
      .on(this.engine.gridstack.el, 'dropout', (_event, el: GridItemHTMLElement) => {
        const that: GridStack = this.engine.gridstack;
        const node = el.gridstackNode!;
        if (!node.grid || node.grid === that) {
        }
        this.getDD().off(el, 'drag');
        return false;
      })
      .off(this.engine.gridstack.el, 'drop')
      .on(this.engine.gridstack.el, 'drop', (_event, el: GridItemHTMLElement, helper?: GridItemHTMLElement) => {
        const that: GridStack = this.engine.gridstack;

        const node: GridStackNode = el.gridstackNode!;
        if (node && node.grid === that && !node._isExternal) {
          return false;
        }

        const origNode = el._gridstackNodeOrig;

        if (!node) {
          return false;
        }

        if (helper !== el) {
          helper?.remove();
          el.gridstackNode = origNode;
        } else {
          Utils.removePositioningStyles(el);
        }

        this.getDD().off(el, 'drag');
        that.engine.removeNode(node);
      })
  }
}