import { GridEngine } from "./GridEngine"

export function createGrid(container: HTMLElement | string) {
    const element = typeof container === 'string'
        ? document.querySelector(container) as HTMLElement
        : container

    if (!element) throw new Error('Container element not found')

    const manager = GridEngine.getInstance()
    return manager.create(element)
}