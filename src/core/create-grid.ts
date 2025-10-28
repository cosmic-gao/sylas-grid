import { type GridEngine } from "./grid-engine"
import { type GridFactoryOptions, GridFactory } from "./grid-factory"

export interface GridOptions extends GridFactoryOptions { }

export function createGrid(element: HTMLElement | string,  options: GridOptions = {}): GridEngine {
  const el = typeof element === 'string'
    ? document.querySelector(element) as HTMLElement
    : element

  if (!element) {
    throw new Error('Container element not found')
  }

  const factory = GridFactory.getInstance()
  return factory.create(el, options)
}