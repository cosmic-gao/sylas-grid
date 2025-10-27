import { type GridStackOptions, type GridStackWidget, GridStack } from "gridstack"
import { useId } from "./use-id"
import { EventBus } from "./event-bus"

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

export interface GridEngineSpec { }

export interface GridEngineOptions extends GridStackOptions { }

export class GridEngine implements GridEngineSpec {
    private static GRID_ENGINE_OPTIONS: GridEngineOptions = {}

    public readonly id: string = useId()
    public readonly mitt: EventBus = new EventBus()

    public container: HTMLElement;
    public options: GridEngineOptions;
    public gridstack: GridStack;

    private initialized: boolean = false;

    public constructor(container: HTMLElement, options: GridEngineOptions = {}) {
        this.container = container
        this.options = this.configure(options);

        this.gridstack = GridStack.init(this.options, this.container)

        this.initialize();
    }

    public addItem(element: HTMLElement, options?: GridItemOptions) {
        const el = GridStack.getElement(element);
        console.log(el, el.gridstackNode)

        if (el && el.gridstackNode) return
        console.log(el, el.gridstackNode)
        this.gridstack.makeWidget(element, options)
    }

    public updateItem(element: HTMLElement, options?: GridItemOptions) { }

    public removeItem() { }

    public destroy() {
        this.gridstack.destroy(false)
    }

    private initialize() {
        if (this.initialized) return

        this.container.classList.add('sylas-grid')
        this.container.setAttribute('data-grid-id', this.id)
        this.initialized = true
    }

    private configure(options: GridEngineOptions): GridEngineOptions {
        return Object.assign({}, GridEngine.GRID_ENGINE_OPTIONS, options)
    }
}