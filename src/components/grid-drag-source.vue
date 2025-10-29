<script lang="ts">
import { onMounted, ref, watch } from 'vue';
import type { GridDragSourceProps } from './grid.type';
import { GridFactory } from "../core"
</script>

<script setup lang="ts">
const { target, ...options } = defineProps<GridDragSourceProps>()

const gragSourceRef = ref<HTMLElement>()

const setupDrag = async (name?: string) => {
  const el = gragSourceRef.value
  if (!name || !el) return

  const instance = GridFactory.getInstance()
  const grid = await instance.waitForGrid(name)
  grid.draggable.setupDragIn(el, options, () => {
    const el = gragSourceRef.value?.cloneNode(true)
    return el as HTMLElement
  })
}

onMounted(() => {
  setupDrag(target)
})

watch(
  () => target,
  (name) => { setupDrag(name) }, { flush: 'post' })
</script>

<template>
  <div ref="gragSourceRef" class="grid-drag-source grid-stack-item-content">
    <slot></slot>
  </div>
</template>