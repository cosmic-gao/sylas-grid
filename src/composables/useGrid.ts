import { onMounted, ref } from "vue";
import { GridEngine } from "../core/GridEngine"
import { GridInstance } from "../core/GridInstance"


export function useGrid() {
    const gridRef = ref<HTMLElement>()
    const gridInstance = ref<GridInstance>()

    const initGrid = () => {
        if (!gridRef.value) return

        const engine = GridEngine.getInstance()
        gridInstance.value = engine.create(gridRef.value)
    }

    onMounted(() => {
        initGrid()
    })

    return {
        gridRef
    }
}