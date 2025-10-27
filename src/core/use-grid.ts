import { GridFactory } from "./grid-factory"

export function useGrid(container: HTMLElement) {
  const factory = new GridFactory()
  return factory.create(container)
}