import {
  type GridStackOptions,
  type GridStackNode,
  type GridStackWidget,
  type DDDragOpt,
  type GridStackDroppedHandler,
  type GridStackEventHandler,
  type GridStackNodesHandler,
  type GridStackElementHandler,
  type GridItemHTMLElement
} from "gridstack";
import { createId } from "./create-id"
import { microtask } from "./microtask";
import { type EventCallback, type WildcardCallback, EventBus } from "./event-bus";
import { DragEngine } from "./drag-engine"
import { GridStack } from "./grid-stack"

export interface GridItemOptions extends Omit<GridStackWidget, 'content'> { }


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

  public static trimmed<T extends GridItemOptions>(obj: T): Partial<T> {
    const result = {} as T;
    for (const key in obj) {
      if (obj[key] !== undefined) result[key] = obj[key];
    }
    return result;
  }

  public static getElement(els: string | HTMLElement): HTMLElement {
    return typeof els === 'string'
      ? document.querySelector(els) as HTMLElement
      : els
  }

  public static isElement(els: string | HTMLElement): boolean {
    const el = GridEngine.getElement(els) as GridItemHTMLElement;
    return !!el.gridstackNode
  }

  public static getId(els: string | HTMLElement): string {
    return typeof els === 'string' ? els : els.getAttribute('gs-id')!
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

  public constructor(els: string | HTMLElement, options: GridEngineOptions = {}) {
    this.el = GridEngine.getElement(els)
    this.id = options?.id ?? createId();

    this.options = this.configure(options);

    this.gridstack = GridStack.init(this.options, this.el) as GridStack

    this.driver = new DragEngine(this)

    this.setup()
  }

  public addItem(els: string | HTMLElement, options: GridItemOptions = {}): GridItem {
    const el = GridEngine.getElement(els)

    if (options.id && this.items.has(options.id)) {
      return this.items.get(options.id)!;
    }

    this.flush()

    const item = this.createItem(el, options, options.id);
    this.gridstack.addWidget(item)
    this.items.set(item.id!, item);

    return item
  }

  public removeItem(els: string | HTMLElement): boolean {
    const id = GridEngine.getId(els)
    if (!this.items.has(id)) return false

    this.flush()

    this.gridstack.removeWidget(els)
    this.items.delete(id)
    return true
  }

  public updateItem(els: string | HTMLElement, options: GridItemOptions = {}): false | GridItem {
    const id = GridEngine.getId(els)

    let item = this.items.get(id) ?? null;
    if (!item) {
      const el = GridEngine.getElement(els) as GridItemHTMLElement
      if (!el.gridstackNode) return false

      item = this.createItem(el, options, id)
    }

    this.flush()

    const { el, grid, ...opts } = item
    this.gridstack.update(els, opts)
    this.items.has(id) ? Object.assign(item, opts) : this.items.set(id, item!)

    return item
  }

  public on<K extends keyof EventEmitt>(type: K, callback: EventCallback<EventEmitt[K]>): () => void;
  public on<K extends keyof EventEmitt>(type: "*", callback: WildcardCallback<EventEmitt>): () => void;
  public on<K extends keyof EventEmitt>(type: K | "*", callback: EventCallback<EventEmitt[K]> | WildcardCallback<EventEmitt>): () => void {
    return this.mitt.on(type, callback)
  }

  public emit<K extends keyof EventEmitt>(type: K, event: EventEmitt[K]): void {
    this.mitt.emit(type, event)
  }

  public setup() {
    if (this.initialized) return

    this.setupEvents()

    this.el.classList.add('sylas-grid')
    this.el.setAttribute('data-grid-id', this.id)


    this.initialized = true
  }

  public destroy() {
    this.mitt.off("*")
    
    if (this.gridstack) this.gridstack.destroy()

    this.items.clear()

    this.el.classList.remove('sylas-grid')
    this.el.removeAttribute('data-grid-id')

    this.batching = false
    this.initialized = false
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
  * el: Existing DOM element reference (typically a `.grid-stack-item` node).
  * 
  * Providing `el` allows GridStack's `addWidget()` to **reuse** an existing element
  * instead of creating a new widget container. This ensures that the original DOM
  * structure, event bindings, and internal state are preserved.
  */
  private createItem(el: HTMLElement, options: GridItemOptions, id?: string): GridItem {
    const finalId = id ?? createId();
    const finalOptions = { id: finalId, el, ...GridEngine.trimmed(options) } as GridStackWidget;
    return { ...finalOptions, grid: this } as unknown as GridItem;
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
        console.log('flush')
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