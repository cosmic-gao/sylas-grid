import { type GridEngineOptions, GridEngine } from "./grid-engine"

export interface GridSpec { }

export interface GridFactoryOptions { }

export class GridFactory implements GridSpec {
  private static GRID_FACTORY_OPTIONS: GridFactoryOptions = {}
  private static instance: GridFactory | null = null

  public static engines = new Map<string, GridEngine>();

  public static getEngine(target: string | HTMLElement): GridEngine | undefined {
    const id =
      typeof target === 'string'
        ? target
        : target.getAttribute('data-grid-id') ?? undefined;

    return id ? GridFactory.engines.get(id) : undefined;
  }

  public static getInstance(options?: GridFactoryOptions): GridFactory {
    if (!GridFactory.instance) {
      GridFactory.instance = new GridFactory(options)
    }
    return GridFactory.instance
  }

  public options: GridFactoryOptions;

  public constructor(options: GridFactoryOptions = {}) {
    this.options = this.configure(options);

    this.initialize()
  }

  public create(el: HTMLElement, options: GridEngineOptions = {}): GridEngine {
    const grid = new GridEngine(el, options)
    GridFactory.engines.set(grid.id, grid)
    return grid
  }

  public destroy() {
    GridFactory.engines.forEach(engine => {
      engine.destroy()
    });
    GridFactory.engines.clear()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    window.addEventListener('beforeunload', () => {
      this.destroy()
    })
  }

  private configure(options: GridFactoryOptions): GridFactoryOptions {
    return { ...GridFactory.GRID_FACTORY_OPTIONS, ...options }
  }
}