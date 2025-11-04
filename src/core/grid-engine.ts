import {
  type GridStackOptions,
  type GridStackNode,
  type GridStackWidget,
  type DDDragOpt,
  type GridStackDroppedHandler,
  type GridStackEventHandler,
  type GridStackNodesHandler,
  type GridStackElementHandler,
} from "gridstack";
import { createId } from "./create-id"
import { microtask } from "./microtask";
import { type EventCallback, type WildcardCallback, EventBus } from "./event-bus";
import { DragEngine } from "./drag-engine"
import { GridStack } from "./grid-stack"

export interface GridItemOptions extends Omit<GridStackWidget, 'content'> {

}

export interface DragItemOptions<T> extends GridItemOptions {
  data?: T
}

export interface GridItem extends GridItemOptions {
  el: HTMLElement;
  grid: GridEngine;
}

export interface GridEngineOptions extends Omit<GridStackOptions, 'children'> {
  id?: string;
  dragInOptions?: DDDragOpt;
  dragIn?: string | HTMLElement[]
}

export interface GridEngineSpec {
  readonly id: string;
  el: HTMLElement;
  options: GridEngineOptions;
  driver: DragEngine;
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

export interface EventEmitt {
  dropped: { event: Event; node: DragItemOptions<any> };
  added: { event: Event; nodes: GridItemOptions[] };
}

export const GRID_ITEM_ATTRS = {
  x: 'x',
  y: 'y',
  w: 'w',
  h: 'h',
  maxW: 'max-w',
  maxH: 'max-h',
  minW: 'min-w',
  minH: 'min-h',
  noResize: 'no-resize',
  noMove: 'no-move',
  locked: 'locked',
  static: 'static',
  id: 'id',
  sizeToContent: 'size-to-content',
  autoPosition: 'auto-position'
} as const

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  window.navigator.userAgent
);

const dragDropOptions: GridEngineOptions = {
  alwaysShowResizeHandle: isMobile,
  resizable: {
    autoHide: !isMobile,
    handles: 'se'
  },
  acceptWidgets: '.grid-drag-portal',
  dragIn: '.grid-drag-portal',  // class that can be dragged from outside
  dragInOptions: { scroll: true, appendTo: 'body', helper: 'clone' },
  removable: '.grid-stack-library-trash', // drag-out delete class
};

const displayOptions: GridEngineOptions = {
  column: 12,
  cellHeight: 160,
  margin: 8,
  float: true,
};

export class GridEngine implements GridEngineSpec {
  private static readonly GRID_ENGINE_OPTIONS: GridEngineOptions = {
    ...displayOptions,
    ...dragDropOptions,
    disableDrag: false,
    disableResize: false,
    animate: true
  }

  public static pick<T extends object, K extends keyof T>(
    obj: T,
    keys: readonly K[]
  ): Pick<T, K> {
    return keys.reduce((res, key) => {
      if (Object.hasOwn(obj, key)) res[key] = obj[key]
      return res
    }, {} as Pick<T, K>)
  }

  public readonly id: string;
  public readonly el: HTMLElement;
  public readonly driver: DragEngine;

  public options: GridEngineOptions;

  public readonly gridstack: GridStack;
  public readonly mitt: EventBus<EventEmitt> = new EventBus()

  private items: Map<string, GridItem> = new Map()

  private initialized: boolean = false
  private batching: boolean = false;

  public constructor(el: HTMLElement, options: GridEngineOptions = {}) {
    this.el = el
    this.id = options?.id ?? createId();

    this.options = this.configure(options);

    this.gridstack = GridStack.init(this.options, this.el) as GridStack

    this.driver = new DragEngine(this)

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

  public removeItem(els: string | HTMLElement) { }

  public on<K extends keyof EventEmitt>(type: K, callback: EventCallback<EventEmitt[K]>): () => void;
  public on<K extends keyof EventEmitt>(type: "*", callback: WildcardCallback<EventEmitt>): () => void;
  public on<K extends keyof EventEmitt>(type: K | "*", callback: EventCallback<EventEmitt[K]> | WildcardCallback<EventEmitt>): () => void {
    return this.mitt.on(type, callback)
  }

  public emit<K extends keyof EventEmitt>(type: K, event: EventEmitt[K]): void {
    this.mitt.emit(type, event)
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
    this.gridstack.on("added", (event: Event, nodes: GridStackNode[]) => {
      this.mitt.emit("added", { event, nodes })
    })
    this.gridstack.on("dropped", (event: Event, _previousNode: GridStackNode, node: GridStackNode) => {
      this.mitt.emit("dropped", { event, node })
    })
  }

  /**
   * Flush batched grid updates in a microtask cycle.
   * 
   * Ensures `gridstack.batchUpdate()` is called once per microtask,
   * then automatically closed (`batchUpdate(false)`) after all synchronous
   * changes finish. Prevents redundant reflows during rapid updates.
   */
  private flush() {
    if (this.batching) return;

    this.batching = true;
    this.gridstack.batchUpdate();

    microtask(() => {
      try {
        this.gridstack.batchUpdate(false);
      } finally {
        this.batching = false;
      }
    });
  }


  private configure(options: GridEngineOptions): GridEngineOptions {
    return { ...GridEngine.GRID_ENGINE_OPTIONS, ...options, id: this.id }
  }
}