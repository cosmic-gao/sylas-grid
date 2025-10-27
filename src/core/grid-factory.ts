import { type GridEngineOptions, GridEngine } from "./grid-engine"

export interface GridSpec { }

export interface GridFactoryOptions { }

export class GridFactory implements GridSpec {
  private static GRID_FACTORY_OPTIONS: GridFactoryOptions = {}

  public options: GridFactoryOptions;

  public constructor(options: GridFactoryOptions = {}) {
    this.options = this.configure(options);
  }

  public create(container: HTMLElement, options: GridEngineOptions = {}) {
    const engine = new GridEngine(container, options)
    return engine
  }

  private configure(options: GridFactoryOptions): GridFactoryOptions {
    return Object.assign({}, GridFactory.GRID_FACTORY_OPTIONS, options)
  }
}