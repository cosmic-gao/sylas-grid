import { type DDGridStack, type GridStackWidget, type GridItemHTMLElement, type GridStackNode, GridStack, DDElement, Utils } from "gridstack";
import { type GridEngine, type GridItemOptions } from "./grid-engine";

export interface DragItemOptions extends GridItemOptions {

}

export class DragEngine {
  private readonly grid: GridEngine;
  private dragInItem?: DragItemOptions;

  public constructor(grid: GridEngine) {
    this.grid = grid

    this.setupAccept()
  }

  public destroyDragIn(element: HTMLElement): DDGridStack {
    return GridStack.getDD().draggable(element, 'destroy')
  }

  public setupDragIn(
    element: HTMLElement,
    item: GridStackWidget,
    helper?: 'clone' | ((el: HTMLElement) => HTMLElement)
  ) {
    const ddElement = DDElement.init(element);
    (element as GridItemHTMLElement).gridstackNode = item;

    ddElement.setupDraggable({
      ...this.grid.options.dragInOptions,
      helper: helper ?? this.grid.options.dragInOptions?.helper,
      handle: this.grid.options.handle
    })
  }

  private setupAccept() {
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
      .on(this.grid.gridstack.el, 'drop', (event, el: GridItemHTMLElement, helper?: GridItemHTMLElement) => {
        const that: any = this.grid.gridstack;

        const node = (helper?.gridstackNode || el.gridstackNode) as GridStackNode;
        // ignore drop on ourself from ourself that didn't come from the outside - dragend will handle the simple move instead
        if (node?.grid === that && !node._isExternal) return false;
        const wasAdded = !!that.placeholder.parentElement; // skip items not actually added to us because of constrains, but do cleanup #1419
        const wasSidebar = el !== helper;
        that.placeholder.remove();
        delete that.placeholder.gridstackNode;

        const origNode = el._gridstackNodeOrig;
        delete el._gridstackNodeOrig;
        if (wasAdded && origNode?.grid && origNode.grid !== that) {
          const oGrid = origNode.grid;
          oGrid.engine.removeNodeFromLayoutCache(origNode);
          oGrid.engine.removedNodes.push(origNode);
          (oGrid._triggerRemoveEvent() as any)._triggerChangeEvent();
          // if it's an empty sub-grid that got auto-created, nuke it
          if (oGrid.parentGridNode && !oGrid.engine.nodes.length && oGrid.opts.subGridDynamic) {
            oGrid.removeAsSubGrid();
          }
        }

        if (!node) {
          return false;
        }

        // use existing placeholder node as it's already in our list with drop location
        if (wasAdded) {
          that.engine.cleanupNode(node); // removes all internal _xyz values
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

        if (!wasAdded) return false;
        const subGrid = node.subGrid?.el?.gridstack; // set when actual sub-grid present
        Utils.copyPos(node, that._readAttr(that.placeholder)); // placeholder values as moving VERY fast can throw things off #1578
        Utils.removePositioningStyles(el);

        that.engine.endUpdate();
        if (that._gsEventHandler['dropped']) {
          that._gsEventHandler['dropped']({ ...event, type: 'dropped' }, origNode && origNode.grid ? origNode : undefined, node);
        }
      })
  }

  private getDD() {
    return GridStack.getDD() as DDGridStack
  }
}