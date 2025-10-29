import {
  type GridStackOptions,
  type GridStackNode,
  type GridStackWidget,
  type DDDragOpt,
  GridStack,
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
  id: string;
}

export interface GridItem extends GridItemOptions {
  el: HTMLElement;
  grid: GridEngine;
}

export interface GridEngineSpec {
  readonly id: string;
}

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

    this.gridstack = GridStack.init(this.options, this.el)

    this.draggable = new DragEngine(this)

    this.setup()
  }

  public addItem(el: HTMLElement, options?: GridItemOptions): GridItem {
    this.flush()

    const id = options?.id ?? createId();
    const finalItemOptions = { id, el, ...options } as GridStackWidget;

    this.gridstack.addWidget(finalItemOptions)

    const item = { ...finalItemOptions, grid: this } as unknown as GridItem
    this.items.set(id, item)

    return item
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
      this.mitt.emit("added", items)
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