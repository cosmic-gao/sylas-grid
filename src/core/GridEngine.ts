import { type GridStackOptions, type GridStackNode, GridStack } from "gridstack"
import { useId } from "./useId"

export interface GridItemOptions extends GridStackNode { }

export interface GridItem extends GridItemOptions { }

export interface GridEngineOptions extends GridStackOptions { }

export interface GridEngineSpec {
    readonly id: string;
    container: HTMLElement;
    options: GridEngineOptions;
    gridstack: GridStack;
    items: Map<string, GridItem>
}


export class GridEngine implements GridEngineSpec {
    private static GRID_ENGINE_OPTIONS: GridEngineOptions = {}

    public id: string = useId();
    public container: HTMLElement;
    public options: GridEngineOptions;
    public gridstack: GridStack;
    public items: Map<string, GridItem> = new Map();

    private initialized: boolean = false;

    public constructor(container: HTMLElement, options: GridEngineOptions = {}) {
        this.container = container
        this.options = this.configure(options)

        this.gridstack = GridStack.init(this.options, this.container)

        this.setup()
    }

    public setup() {
        if (this.initialized) return;

        this.setupEventListeners()
        this.initialized = true

        this.container.classList.add('sylas-grid');
        this.container.setAttribute('data-grid-id', this.id)
    }

    public getItem(id: string): GridItem | undefined {
        return this.items.get(id)
    }

    public destroy(): void {
        this.gridstack.destroy(false);

        this.container.classList.remove('sylas-grid')
        this.container.removeAttribute('data-grid-id')

        this.initialized = false
    }

    private setupEventListeners() {
        this.gridstack.on('added', (_event: Event, nodes: GridStackNode[]) => {
            nodes.forEach(node => {
                const gridItem = this.items.get(node.id!)
                if (gridItem) { }

            })
        })
    }

    private configure(options: GridEngineOptions): GridEngineOptions {
        return Object.assign({}, GridEngine.GRID_ENGINE_OPTIONS, options)
    }
}