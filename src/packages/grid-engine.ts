import { type GridStackOptions, type GridStackNode, type GridStackWidget, type DDDragOpt, GridStack } from "gridstack";
import { createId } from "./create-id"
import { microtask } from "./microtask";
import { EventBus } from "./event-bus";

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

const dragDropOption = {
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

const displayOption = {
  column: 12,
  cellHeight: 160,
  margin: 8,
  float: true,
} as const;

export class GridEngine implements GridEngineSpec {
  private static GRID_ENGINE_OPTIONS: GridEngineOptions = {
    ...displayOption,
    ...dragDropOption,
    disableDrag: false,
    disableResize: false,
    animate: true
  }

  public readonly id: string;
  public readonly el: HTMLElement;
  public options: GridEngineOptions;

  private readonly gridstack: GridStack;
  private items: Map<string, GridItem> = new Map()

  private readonly mitt: EventBus = new EventBus()

  private initialized: boolean = false
  private batching: boolean = false;

  public constructor(el: HTMLElement, options: GridEngineOptions = {}) {
    this.el = el
    this.options = this.configure(options);
    this.id = this.options.id!

    this.gridstack = GridStack.init(this.options, this.el)

    this.setup()
  }

  public addItem(el: HTMLElement, options?: GridItemOptions) {
    this.flush()

    this.gridstack.addWidget({ ...options, el } as GridStackWidget)
  }

  private setup() {
    if (this.initialized) return

    this.setupEvents()

    this.el.classList.add('sylas-grid')
    this.el.setAttribute('data-grid-id', this.id)
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
    return { id: createId(), ...GridEngine.GRID_ENGINE_OPTIONS, ...options }
  }
}