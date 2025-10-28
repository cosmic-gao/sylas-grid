<script lang="ts">
import { ref, watch } from 'vue';
import type { GridDragSourceProps } from './grid.props';
import { GridEngine, GridFactory } from "../core"
</script>

<script setup lang="ts">
const props = defineProps<GridDragSourceProps>()

const gragSourceRef = ref<HTMLElement>()
const engine = ref<GridEngine>()

watch(() => props.target, (gridId) => {
  if (!gridId || !gragSourceRef.value) return

  engine.value = GridFactory.get(gridId)
  if (engine.value) {
    engine.value.getDragManager().setupDragIn(gragSourceRef.value)
  }
}, { flush: 'post' })
</script>

<template>
  <div ref="gragSourceRef" class="grid-drag-source">
    <slot></slot>
  </div>
</template>