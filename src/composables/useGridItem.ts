import { type Ref, ref, inject, onMounted, onUnmounted } from "vue";

import { type GridItem } from "../core/type"
import { GridInstance } from "../core/GridInstance"

export function useGridItem() {
    const itemRef = ref<HTMLElement>()
    const gridItem = ref<GridItem>()
    const gridInstance = inject<Ref<GridInstance>>('grid-instance')

    onMounted(() => {
        if (!itemRef.value || !gridInstance?.value) return
    })

    onUnmounted(() => {
        if (!gridItem.value || !gridInstance?.value) return
    })

    return {
        itemRef,
        gridItem
    }
}