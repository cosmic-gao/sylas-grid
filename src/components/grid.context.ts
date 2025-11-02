import type { ShallowRef } from "vue"
import { useContext } from '../composables/use-context'
import { GridEngine } from "../core"

export const [provideGrid, useGrid] = useContext<[ShallowRef<GridEngine>], ShallowRef<GridEngine>>('GridContext')