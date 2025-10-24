import type { GridInstanceSpec, GridOptions } from "./type"

import { GridStack } from "gridstack"
import { useId } from "./useId"

export class GridInstance implements GridInstanceSpec {
    private static GRID_INSTANCE_OPTIONS: GridOptions = {
    }

    public readonly id: string = useId()
    public container: HTMLElement;
    public gridstack: GridStack;
    public options: GridOptions

    private initialized: boolean = false

    public constructor(container: HTMLElement, options: GridOptions = {}) {
        this.container = container
        this.options = this.refine(options)

        this.gridstack = GridStack.init(this.options, container)
    }

    public init() {
        if (this.initialized) return

        this.initialized = true
        this.container.classList.add('sylas-grid')
    }

    private refine(options?: GridOptions) {
        return Object.assign({}, GridInstance.GRID_INSTANCE_OPTIONS, options)
    }
}