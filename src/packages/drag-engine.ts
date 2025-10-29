import { type DDGridStack, type GridItemHTMLElement, type GridStackNode, GridStack, DDElement } from "gridstack";
import { type GridEngine, type GridItemOptions } from "./grid-engine";

export interface DragItemOptions extends GridItemOptions {
  grid: GridEngine;
}

export class DragEngine {
  public static destroyDragIn(element: HTMLElement): DDGridStack {
    return GridStack.getDD().draggable(element, 'destroy')
  }

  public static setupDragIn<T extends DragItemOptions = DragItemOptions>(
    element: HTMLElement,
    item: T,
    helper?: 'clone' | ((el: HTMLElement) => HTMLElement)
  ) {
    const grid = item.grid as GridEngine
    const ddElement = DDElement.init(element);
    ddElement.setupDraggable({
      ...grid.options.dragInOptions,
      helper: helper ?? grid.options.dragInOptions?.helper,
      handle: grid.options.handle,
      start() { },
      stop() { }
    })
  }

  private readonly grid: GridEngine

  public constructor(grid: GridEngine) {
    this.grid = grid

    this.setup()
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

          return true
        }
      })
    }
  }

  private getDD() {
    return GridStack.getDD() as DDGridStack
  }
}