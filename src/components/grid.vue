<script lang="ts">
import { onMounted, ref, shallowReactive } from "vue";
import { createGrid } from "../core"
import { type GridProps } from "./grid.props"
import { type GridContext, provideGrid } from "./grid.context"
</script>

<script setup lang="ts">
defineProps<GridProps>()

const gridRef = ref<HTMLElement>()

const context = shallowReactive<GridContext>({ engine: null })
provideGrid(context)

onMounted(() => {
  if (!gridRef.value) return

  context.engine = createGrid(gridRef.value)
})
</script>

<template>
  <div ref="gridRef" class="grid-stack sylas-grid-vue">
    <slot></slot>
  </div>
</template>

<style lang="scss">
@use 'G:/gridstack.js/src/gridstack.scss';

.sylas-grid-vue {
  background-color: #f5f5f5;
}
</style>