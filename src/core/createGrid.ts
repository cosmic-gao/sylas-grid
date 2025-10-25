import { type GridFactoryOptions, GridFactory } from "./GridFactory"
import { type GridEngine } from "./GridEngine"

export interface GridOptions extends GridFactoryOptions { }

export function createGrid(
    container: HTMLElement | string
): GridEngine {
    const element = typeof container === 'string'
        ? document.querySelector(container) as HTMLElement
        : container

    if (!element) {
        throw new Error('Container element not found')
    }

    const factory = GridFactory.getInstance()
    return factory.create(element)
}
