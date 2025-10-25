import { GridEngine } from "./GridEngine"

export interface GridFactoryOptions { }

export interface GridFactorySpec { }

export class GridFactory implements GridFactorySpec {
    private static GRID_FACTORY_OPTIONS: GridFactoryOptions = {}
    private static instance: GridFactory | null = null

    public static getGridEngine(options: GridFactoryOptions): GridFactory {
        if (!GridFactory.instance) {
            GridFactory.instance = new GridFactory(options)
        }
        return GridFactory.instance
    }

    public static getInstance(options?: GridFactoryOptions): GridFactory {
        if (!GridFactory.instance) {
            GridFactory.instance = new GridFactory(options)
        }
        return GridFactory.instance
    }

    private readonly options: GridFactoryOptions
    private readonly engines: Map<string, GridEngine> = new Map()

    public constructor(options: GridFactoryOptions = {}) {
        this.options = this.configure(options);
    }

    public create(container: HTMLElement): GridEngine {
        const engine = new GridEngine(container)
        this.engines.set(engine.id, engine)

        return engine
    }

    public get(id: string): GridEngine | undefined {
        return this.engines.get(id)
    }

    private configure(options: GridFactoryOptions): GridFactoryOptions {
        return Object.assign({}, GridFactory.GRID_FACTORY_OPTIONS, options)
    }
}