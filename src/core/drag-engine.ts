import {
  type DDGridStack,
  type GridItemHTMLElement,
  type GridStackNode,
  DDElement,
  Utils
} from "gridstack";
import { type GridEngine, type DragItemOptions } from "./grid-engine";
import { GridStack } from "./grid-stack"

export class DragEngine {
  private readonly grid: GridEngine;

  public constructor(grid: GridEngine) {
    this.grid = grid

    this.setupAccept()
  }

  public destroyDragIn(element: HTMLElement): DDGridStack {
    return GridStack.getDD().draggable(element, 'destroy')
  }

  public setupDragIn<T>(element: HTMLElement, item: DragItemOptions<T>, helper?: 'clone' | ((el: HTMLElement) => HTMLElement)) {
    const ddElement = DDElement.init(element);
    (element as GridItemHTMLElement).gridstackNode = item;

    ddElement.setupDraggable({
      ...this.grid.options.dragInOptions,
      helper: helper ?? this.grid.options.dragInOptions?.helper,
      handle: this.grid.options.handle
    })
  }

  private setupAccept() {
    if (!this.grid) {
      return;
    }
    if (this.grid.options.staticGrid || (!this.grid.options.acceptWidgets && !this.grid.options.removable)) {
      this.getDD().droppable(this.grid.gridstack.el, 'destroy');
      return;
    }

    if (!this.getDD().isDroppable(this.grid.gridstack.el)) {
      const that: GridStack = this.grid.gridstack;
      this.getDD().droppable(this.grid.el, {
        accept: (el: GridItemHTMLElement) => {
          const node: GridStackNode = el.gridstackNode || that._readAttr(el, false);
          // set accept drop to true on ourself (which we ignore) so we don't get "can't drop" icon in HTML5 mode while moving
          if (node && node.grid === that) return true;
          if (!that.opts.acceptWidgets) return false;

          // check for accept method or class matching
          let canAccept = true;
          if (typeof that.opts.acceptWidgets === 'function') {
            canAccept = that.opts.acceptWidgets(el);
          } else {
            const selector = (that.opts.acceptWidgets === true ? '.grid-stack-item' : that.opts.acceptWidgets as string);
            canAccept = el.matches(selector);
          }
          // finally check to make sure we actually have space left #1571 #2633
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
        const that: GridStack = this.grid.gridstack;
        const node = helper?.gridstackNode || el.gridstackNode;
        if (!node) return false;

        if (!node?.grid || node?.grid === that) {
          that._leave(el, helper);

          if (that._isTemp) {
            that.removeAsSubGrid(node);
          }
        }
        return false;
      })
      .off(this.grid.gridstack.el, 'drop')
      .on(this.grid.gridstack.el, 'drop', (event, el: GridItemHTMLElement, helper?: GridItemHTMLElement) => {
        const that: GridStack = this.grid.gridstack;

        const node = (helper?.gridstackNode || el.gridstackNode) as GridStackNode;
        // ignore drop on ourself from ourself that didn't come from the outside - dragend will handle the simple move instead
        if (node?.grid === that && !node._isExternal) return false;
        const wasAdded = !!that.placeholder.parentElement; // skip items not actually added to us because of constrains, but do cleanup #1419
        that.placeholder.remove();
        delete that.placeholder.gridstackNode;

        // disable animation when replacing a placeholder (already positioned) with actual content
        if (wasAdded && that.opts.animate) {
          that.setAnimation(false);
          that.setAnimation(true, true); // delay adding back
        }

        const origNode = el._gridstackNodeOrig!;
        delete el._gridstackNodeOrig;
        if (wasAdded && origNode?.grid && origNode.grid !== that) {
          const oGrid = origNode.grid as GridStack;
          oGrid.engine.removeNodeFromLayoutCache(origNode);
          oGrid.engine.removedNodes.push(origNode);
          oGrid._triggerRemoveEvent()._triggerChangeEvent();
          // if it's an empty sub-grid that got auto-created, nuke it
          if (oGrid.parentGridNode && !oGrid.engine.nodes.length && oGrid.opts.subGridDynamic) {
            oGrid.removeAsSubGrid();
          }
        }

        if (!node) return false;

        // use existing placeholder node as it's already in our list with drop location
        if (wasAdded) {
          that.engine.cleanupNode(node); // removes all internal _xyz values
          node.grid = that;
        }

        delete node.grid?._isTemp;
        this.getDD().off(el, 'drag');
        // if we made a copy insert that instead of the original (sidebar item)
        if (helper !== el) {
          helper?.remove();
          el = helper!;
        } else {
          el.remove(); // reduce flicker as we change depth here, and size further down
        }

        that._removeDD(el);
        if (!wasAdded) return false;
        Utils.copyPos(node, that._readAttr(that.placeholder)); // placeholder values as moving VERY fast can throw things off #1578
        Utils.removePositioningStyles(el);

        that._updateContainerHeight();
        that.engine.endUpdate();


        if (that._gsEventHandler['dropped']) {
          delete node.el
          delete node.grid
          delete node._id
          that._gsEventHandler['dropped']({ ...event, type: 'dropped' }, origNode, node);
        }
      })
  }

  private getDD() {
    return GridStack.getDD()
  }
}