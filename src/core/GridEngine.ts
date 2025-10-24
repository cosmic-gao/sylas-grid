import type { GridOptions, GridEngineConfig } from "./type"

import { GridInstance } from "./GridInstance"

export class GridEngine {
    private static engine: GridEngine | null = null
    private static GRID_ENGINE_CONFIG: GridEngineConfig = {
        maxInstances: 100
    }

    private config: GridEngineConfig
    private grids: Map<string, GridInstance> = new Map()

    public static getInstance(config?: Partial<GridEngineConfig>) {
        if (!GridEngine.engine) GridEngine.engine = new GridEngine(config);
        return GridEngine.engine
    }

    public constructor(config: Partial<GridEngineConfig> = {}) {
        this.config = this.refine(config)
    }

    public create(container: HTMLElement, options: GridOptions = {}): GridInstance {
        if (this.grids.size >= this.config.maxInstances)
            throw new Error(`Maximum number of grid instances (${this.config.maxInstances}) reached`)

        const grid = new GridInstance(container)
        this.grids.set(grid.id, grid)

        return grid
    }

    private refine(config?: Partial<GridEngineConfig>): GridEngineConfig {
        return Object.assign({}, GridEngine.GRID_ENGINE_CONFIG, config)
    }
}