import { type DDGridStack, type GridItemHTMLElement, type GridStackNode, GridStack, DDElement, Utils } from "gridstack";
import { type GridEngine, type GridItemOptions } from "./grid-engine";

export interface DragItemOptions extends GridItemOptions {

}

export class DragEngine {
  private readonly grid: GridEngine;
  private dragInItem?: DragItemOptions;

  public constructor(grid: GridEngine) {
    this.grid = grid

    this.setup()
  }

  public destroyDragIn(element: HTMLElement): DDGridStack {
    return GridStack.getDD().draggable(element, 'destroy')
  }

  public setupDragIn<T extends DragItemOptions = DragItemOptions>(
    element: HTMLElement,
    item: T,
    helper?: 'clone' | ((el: HTMLElement) => HTMLElement)
  ) {
    const ddElement = DDElement.init(element);
    (element as GridItemHTMLElement).gridstackNode = item;

    ddElement.setupDraggable({
      ...this.grid.options.dragInOptions,
      helper: helper ?? this.grid.options.dragInOptions?.helper,
      handle: this.grid.options.handle,
      start: () => {
        this.dragInItem = item;
      },
    })
  }

  private setup() {
    if (!this.getDD().isDroppable(this.grid.gridstack.el)) {
      const that: GridStack = this.grid.gridstack;
      this.getDD().droppable(this.grid.el, {
        accept: (el: GridItemHTMLElement) => {
          const node: GridStackNode = el.gridstackNode!;
          // set accept drop to true on ourself (which we ignore) so we don't get "can't drop" icon in HTML5 mode while moving
          if (node && node.grid === that) {
            return true;
          }

          if (!that.opts.acceptWidgets) {
            return false;
          }
          let canAccept = true;
          if (typeof that.opts.acceptWidgets === 'function') {
            canAccept = that.opts.acceptWidgets(el);
          } else {
            const selector = that.opts.acceptWidgets === true ? '.grid-stack-item' : (that.opts.acceptWidgets as string);
            canAccept = el.matches(selector);
          }

          if (canAccept && node && that.opts.maxRow) {
            const n = { w: node.w, h: node.h, minW: node.minW, minH: node.minH }; // only width/height matters and autoPosition
            canAccept = that.engine.willItFit(n);
          }
          return canAccept;
        }
      })
    }

    this.getDD()
      .off(this.grid.gridstack.el, 'dropout')
      .on(this.grid.gridstack.el, 'dropout', (_event, el: GridItemHTMLElement, helper?: GridItemHTMLElement) => {
        const that: any = this.grid.gridstack;
        const node = el.gridstackNode!;
        if (!node.grid || node.grid === that) {
          that._leave(el, helper);
        }
        this.getDD().off(el, 'drag');
        return false;
      })
      .off(this.grid.gridstack.el, 'drop')
      .on(this.grid.gridstack.el, 'drop', (_event, el: GridItemHTMLElement, helper?: GridItemHTMLElement) => {
        const that: GridStack = this.grid.gridstack;

        const node: GridStackNode = el.gridstackNode!;
        if (node && node.grid === that && !node._isExternal) {
          return false;
        }

        const wasAdded = !!that.placeholder.parentElement;
        that.placeholder.remove();

        const origNode = el._gridstackNodeOrig;
        // delete el._gridstackNodeOrig;

        if (!node) {
          return false;
        }

        if (wasAdded) {
          that.engine.cleanupNode(node);
          node.grid = that;
        }

        if (helper !== el) {
          helper?.remove();
          el.gridstackNode = origNode;
        } else {
          Utils.removePositioningStyles(el);
        }

        this.getDD().off(el, 'drag');
        that.engine.removeNode(node);

        (that as any)._updateContainerHeight();

        console.log(node, origNode, el , that.placeholder)

        this.grid.emit('added', this.dragInItem)
      })
  }

  private getDD() {
    return GridStack.getDD() as DDGridStack
  }
}