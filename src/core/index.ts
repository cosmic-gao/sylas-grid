import { type GridOptions } from "./type"

export function createGrid(container: HTMLElement | string, options: GridOptions = {}) {
    const element = typeof container === 'string'
        ? document.querySelector(container) as HTMLElement
        : container

    if (!element) throw new Error('Container element not found')
}