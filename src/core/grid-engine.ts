import { type GridStackOptions, type GridStackWidget, type DDDragOpt, GridStack } from "gridstack"
import { createId } from "./create-id"
import { EventBus } from "./event-bus"
import { microtask } from "./microtask";
import { DragManager } from "./drag-manager";

export interface GridItemOptions extends GridStackWidget {
    /** widget position x (default?: 0) */
    x?: number;
    /** widget position y (default?: 0) */
    y?: number;
    /** widget dimension width (default?: 1) */
    w?: number;
    /** widget dimension height (default?: 1) */
    h?: number;
}

export interface GridItem extends GridItemOptions { }

export interface GridEngineSpec {
    readonly id: string;
}

export interface GridEngineOptions extends GridStackOptions {
    id?: string;
    dragInOptions?: DDDragOpt;
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
    removeTimeout: 10,
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
    public readonly mitt: EventBus = new EventBus()

    public el: HTMLElement;
    public options: GridEngineOptions;
    public gridstack: GridStack;

    private initialized: boolean = false;
    private batching: boolean = false;
    private gridItems: Map<string, GridItem> = new Map()

    private readonly dragManager: DragManager;

    public constructor(el: HTMLElement, options: GridEngineOptions = {}) {
        this.el = el
        this.options = this.configure(options);
        this.id = this.options.id!

        this.gridstack = GridStack.init(this.options, this.el)

        this.dragManager = new DragManager(this)

        this.setup();
    }

    public addItem(el: HTMLElement, options?: GridItemOptions): GridItem {
        const gridItem = { ...options } as GridItem
        const id = gridItem.id!

        this.flush()

        this.gridstack.addWidget({ ...options, el } as GridStackWidget)

        this.gridItems.set(id, gridItem)

        return gridItem
    }

    public updateItem(id: string, options: GridItemOptions) {
        const gridItem = this.gridItems.get(id)
        if (!gridItem) return

        this.flush()
        this.gridstack.update(id, options)

        Object.assign(gridItem, options)
    }

    public removeItem(id: string) {
        const gridItem = this.gridItems.get(id)
        if (!gridItem) return

        this.flush();

        this.gridstack.removeWidget(id)
        this.gridItems.delete(id)
    }

    public getDragManager(): DragManager {
        return this.dragManager
    }

    public destroy() {
        this.dragManager.destroy()

        this.gridstack.destroy(false)
    }

    private setup() {
        if (this.initialized) return

        this.el.classList.add('sylas-grid')
        this.el.setAttribute('data-grid-id', this.id)
        this.initialized = true
    }

    private configure(options: GridEngineOptions): GridEngineOptions {
        return { id: createId(), ...GridEngine.GRID_ENGINE_OPTIONS, ...options }
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
}