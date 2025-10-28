import { type GridEngineOptions, GridEngine } from "./grid-engine"

export interface GridSpec { }

export interface GridFactoryOptions { }

export class GridFactory implements GridSpec {
  private static GRID_FACTORY_OPTIONS: GridFactoryOptions = {}

  public static grids = new Map<string, GridEngine>();

  public static get(target: string | HTMLElement): GridEngine | undefined {
    const id =
      typeof target === 'string'
        ? target
        : target.getAttribute('data-grid-id') ?? undefined;

    return id ? GridFactory.grids.get(id) : undefined;
  }

  public options: GridFactoryOptions;

  public constructor(options: GridFactoryOptions = {}) {
    this.options = this.configure(options);
  }

  public create(container: HTMLElement, options: GridEngineOptions = {}): GridEngine {
    const grid = new GridEngine(container, options)
    GridFactory.grids.set(grid.id, grid)

    return grid
  }

  private configure(options: GridFactoryOptions): GridFactoryOptions {
    return Object.assign({}, GridFactory.GRID_FACTORY_OPTIONS, options)
  }
}