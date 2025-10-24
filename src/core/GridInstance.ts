import type { GridInstanceSpec, GridItemOptions, GridItem, GridOptions } from "./type"

import { GridStack } from "gridstack"
import { useId } from "./useId"

export class GridInstance implements GridInstanceSpec {
    private static GRID_INSTANCE_OPTIONS: GridOptions = {
    }

    public readonly id: string = useId()
    public container: HTMLElement;
    public gridstack: GridStack;
    public options: GridOptions
    public items: Map<string, GridItem> = new Map()

    private initialized: boolean = false

    public constructor(container: HTMLElement, options: GridOptions = {}) {
        this.container = container
        this.options = this.refine(options)

        this.gridstack = GridStack.init(this.options, container)

        this.init()
    }

    public init() {
        if (this.initialized) return

        this.initialized = true
        this.container.classList.add('sylas-grid')
        this.container.setAttribute('data-grid-id', this.id)
    }

    public addItem(element: HTMLElement, options: GridItemOptions): GridItem {
        this.gridstack.addWidget(element)

        const gridItem = {}

        return gridItem
    }

    private refine(options?: GridOptions) {
        return Object.assign({}, GridInstance.GRID_INSTANCE_OPTIONS, options)
    }
}