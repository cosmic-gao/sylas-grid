<script lang="ts">
import { onMounted, onBeforeUnmount, shallowRef, useTemplateRef, watch } from 'vue';
import { type GridDragPortalProps } from "./grid.type"
import { type GridEngine, GridFactory } from "../core"
</script>

<script setup lang="ts">
const { target, ...options } = defineProps<GridDragPortalProps>()

const el = useTemplateRef<HTMLElement>('grid-drag-portal')

const grid = shallowRef<GridEngine>()

const setupDrag = async (name?: string) => {
    const dom = el.value
    if (!name || !dom) return

    const instance = GridFactory.getInstance()
    grid.value = await instance.waitForGrid(name)
    if (grid.value) grid.value.driver.setupDragIn(dom, options)
}

watch(
    () => target,
    (name) => setupDrag(name), { flush: 'post' }
)

onMounted(() => setupDrag(target))

onBeforeUnmount(() => {
    if (grid.value) grid.value.driver.destroyDragIn(el.value!)
})
</script>

<template>
    <div ref="grid-drag-portal" class="sylas-grid-drag-portal grid-drag-portal grid-stack-item-content" tabindex="0">
        <slot></slot>
    </div>
</template>

<style lang="scss">
.sylas-grid-drag-portal {
    display: inline-block;
}
</style>