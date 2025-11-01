import {
  type GridStackOptions,
  type GridStackNode,
  type GridStackWidget,
  type DDDragOpt,
  type GridHTMLElement,
  type DDElementHost,
  type GridStackDroppedHandler,
  type GridStackEventHandler,
  type GridStackNodesHandler,
  type GridStackElementHandler,
  GridStack as GridStackNative,
} from "gridstack";
import { createId } from "./create-id"
import { microtask } from "./microtask";
import { EventBus } from "./event-bus";
import { DragEngine } from "./drag-engine"

export interface GridEngineOptions extends GridStackOptions {
  id?: string;
  dragInOptions?: DDDragOpt;
  dragIn?: string | HTMLElement[]
}

export interface GridItemOptions extends GridStackWidget {

}

export interface GridItem extends GridItemOptions {
  el: HTMLElement;
  grid: GridEngine;
}

export interface GridEngineSpec {
  readonly id: string;
}

export interface GridStackEventEmitt {
  dropped: GridStackDroppedHandler;
  enable: GridStackEventHandler;
  disable: GridStackEventHandler;
  change: GridStackNodesHandler;
  added: GridStackNodesHandler;
  removed: GridStackNodesHandler;
  resizecontent: GridStackNodesHandler;
  resizestart: GridStackElementHandler;
  resize: GridStackElementHandler;
  resizestop: GridStackElementHandler;
  dragstart: GridStackElementHandler;
  drag: GridStackElementHandler;
  dragstop: GridStackElementHandler;
};

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  window.navigator.userAgent
);

const dragDropOptions = {
  alwaysShowResizeHandle: isMobile,
  resizable: {
    autoHide: !isMobile,
    handles: 'se'
  },
  acceptWidgets: '.grid-drag-source',
  dragIn: '.grid-drag-source',  // class that can be dragged from outside
  dragInOptions: { revert: 'invalid', scroll: true, appendTo: 'body', helper: 'clone' },
  removable: '.grid-stack-library-trash', // drag-out delete class
} as const;

const displayOptions = {
  column: 12,
  cellHeight: 160,
  margin: 8,
  float: true,
} as const;

export class GridStack extends GridStackNative {
  public _gsEventHandler: Partial<{
    [K in keyof GridStackEventEmitt]: GridStackEventEmitt[K];
  }> = {};

  public constructor(el: GridHTMLElement, opts: GridStackOptions = {}) {
    super(el, opts)
  }

  public removeDD(el: DDElementHost): GridStack {
    super._removeDD(el);
    return this;
  }

  public readAttr(el: HTMLElement, clearDefaultAttr = true): GridStackWidget {
    return super._readAttr(el, clearDefaultAttr);
  }

  public triggerChangeEvent(): GridStack {
    super._triggerChangeEvent();
    return this;
  }

  public triggerRemoveEvent(): GridStack {
    super._triggerRemoveEvent();
    return this;
  }
}

export class GridEngine implements GridEngineSpec {
  private static readonly GRID_ENGINE_OPTIONS: GridEngineOptions = {
    ...displayOptions,
    ...dragDropOptions,
    disableDrag: false,
    disableResize: false,
    animate: true
  }

  public readonly id: string;
  public readonly el: HTMLElement;
  public options: GridEngineOptions;
  public draggable: DragEngine;

  public readonly gridstack: GridStack;
  public readonly mitt: EventBus = new EventBus()

  private items: Map<string, GridItem> = new Map()

  private initialized: boolean = false
  private batching: boolean = false;

  public constructor(el: HTMLElement, options: GridEngineOptions = {}) {
    this.el = el
    this.id = options?.id ?? createId();
    this.options = this.configure(options);

    this.gridstack = GridStack.init(this.options, this.el) as GridStack

    this.draggable = new DragEngine(this)

    this.setup()
  }

  public addItem(el: HTMLElement, options?: GridItemOptions): GridItem {
    const id = options?.id ?? createId();
    if (this.items.has(id)) return this.items.get(id)!;

    this.flush()

    const finalItemOptions = { id, el, ...options } as GridStackWidget;

    this.gridstack.addWidget(finalItemOptions)

    const item = { ...finalItemOptions, grid: this } as unknown as GridItem
    this.items.set(id, item)

    return item
  }

  public on(type: string, callback: (...args: any[]) => void): () => void {
    return this.mitt.on(type, callback)
  }


  public emit(type: string, ...args: any[]): void {
    this.mitt.emit(type, ...args)
  }

  public destroy() {
    this.mitt.off("*")
    this.gridstack.destroy(false)
  }

  private setup() {
    if (this.initialized) return

    this.el.classList.add('sylas-grid')
    this.el.setAttribute('data-grid-id', this.id)

    this.setupEvents()

    this.initialized = true
  }

  private setupEvents() {
    this.gridstack.on("added", (_event: Event, nodes: GridStackNode[]) => {
      const items = nodes.map(node => this.items.get(node.id!))
      // this.mitt.emit("added", items)
    })
    this.gridstack.on("dropped", (_event: Event, _previousNode: GridStackNode, item: GridStackNode) => {
      this.mitt.emit("added", [{ id: "1", x: 3, y: 0, w: 3, h: 2 }])
    })
  }

  private flush() {
    if (!this.batching) {
      this.gridstack.batchUpdate();
      this.batching = true;

      microtask(() => {
        this.gridstack.batchUpdate(false);
        this.batching = false;
      });
    }
  }

  private configure(options: GridEngineOptions): GridEngineOptions {
    return { ...GridEngine.GRID_ENGINE_OPTIONS, ...options, id: this.id }
  }
}