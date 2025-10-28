import { type GridStackOptions, type GridStackWidget, GridStack } from "gridstack"
import { useId } from "./use-id"
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

export interface GridEngineSpec { }

export interface GridEngineOptions extends GridStackOptions {
    id?: string;
}

export class GridEngine implements GridEngineSpec {
    private static GRID_ENGINE_OPTIONS: GridEngineOptions = {}

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

        this.initialize();
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

    private initialize() {
        if (this.initialized) return

        this.el.classList.add('sylas-grid')
        this.el.setAttribute('data-grid-id', this.id)
        this.initialized = true
    }

    private configure(options: GridEngineOptions): GridEngineOptions {
        return Object.assign({ id: useId() }, GridEngine.GRID_ENGINE_OPTIONS, options)
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