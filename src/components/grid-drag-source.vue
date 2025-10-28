<script lang="ts">
import { onMounted, ref, watch } from 'vue';
import type { GridDragSourceProps } from './grid.props';
import { GridEngine, GridFactory } from "../core"
</script>

<script setup lang="ts">
const props = defineProps<GridDragSourceProps>()

const gragSourceRef = ref<HTMLElement>()
const engine = ref<GridEngine>()

const setupDrag = (name?: string) => {
  const el = gragSourceRef.value

  if (!name || !el) return

  engine.value = GridFactory.getEngine(name)
  console.log(engine.value)
  if (engine.value) {
    engine.value.getDragManager().setupDragIn(el)
  }
}

onMounted(() => {
  setupDrag(props.target)
})

watch(
  () => props.target,
  (name) => { setupDrag(name) }, { flush: 'post' })
</script>

<template>
  <div ref="gragSourceRef" class="grid-drag-source">
    <slot></slot>
  </div>
</template>