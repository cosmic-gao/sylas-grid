import { type GridEngineOptions } from "./grid-engine";
import { GridFactory } from "./grid-factory";

export interface GridOptions extends Omit<GridEngineOptions, 'id'> {
  name: string;
}

export function createGrid(els: string | HTMLElement, options?: GridOptions) {
  const factory = GridFactory.create()
  return factory.createGrid(els, options)
}