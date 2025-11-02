<script lang="ts">
import { onMounted, onUnmounted, shallowRef, useTemplateRef, watch } from 'vue';
import { type GridDragPortalProps } from "./grid.prop"
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
    console.log(options)
    if (grid.value) grid.value.draggable.setupDragIn(dom, options)
}

watch(
    () => target,
    (name) => setupDrag(name), { flush: 'post' }
)

onMounted(() => setupDrag(target))

onUnmounted(() => {
    if (grid.value) grid.value.draggable.destroyDragIn(el.value!)
})
</script>

<template>
    <div ref="grid-drag-portal" class="grid-drag-portal grid-stack-item-content" tabindex="0">
        <slot></slot>
    </div>
</template>