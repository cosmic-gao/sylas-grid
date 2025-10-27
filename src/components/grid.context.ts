import { GridEngine } from "../core"
import { useContext } from '../composables/use-context'

export interface GridContext {
  engine: GridEngine | null;
}

export const [provideGrid, useGrid] = useContext('GridContext', (context: GridContext) => context)