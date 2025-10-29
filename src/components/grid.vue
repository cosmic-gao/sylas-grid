<script lang="ts">
import { onMounted, ref, shallowReactive } from "vue";
import { type GridItemOptions, createGrid } from "../core"
import { type GridEmits, type GridProps } from "./grid.type"
import { type GridContext, provideGrid } from "./grid.context"
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<GridProps>(), {
  options: () => ({})
})
const emit = defineEmits<GridEmits>()

const gridRef = ref<HTMLElement>()

const context = shallowReactive<GridContext>({ engine: null })
provideGrid(context)

onMounted(() => {
  if (!gridRef.value) return
  context.engine = createGrid(gridRef.value, { ...props.options, id: props.name })

  context.engine.on("added", (item: any) => {
    emit('added', item)
  })
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