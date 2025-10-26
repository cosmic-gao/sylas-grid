import { type GridStackOptions, GridStack } from "gridstack"
import { useId } from "./use-id"

export interface GridEngineSpec { }

export interface GridEngineOptions extends GridStackOptions { }

export class GridEngine implements GridEngineSpec {
    private static GRID_ENGINE_OPTIONS: GridEngineOptions = {}

    public readonly id: string = useId()
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

    public addItem(element: HTMLElement) {
        this.gridstack.makeWidget(element)
    }

    public updateItem() { }

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