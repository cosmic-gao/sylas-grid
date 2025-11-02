<script lang="ts">
import { onMounted, ref, shallowReactive, computed } from "vue";
import { createGrid } from "../core"
import { type GridEmits, type GridProps, type GridItemProps } from "./grid.type"
import { type GridContext, provideGrid } from "./grid.context"
</script>

<script setup lang="ts">
const { name, modelValue, options = {} } = defineProps<GridProps>()
const emit = defineEmits<GridEmits>()

const gridRef = ref<HTMLElement>()

const items = computed<GridItemProps[]>({
  get: () => modelValue ?? [],
  set: (value) => emit('update:modelValue', value),
})

const context = shallowReactive<GridContext>({ engine: null })
provideGrid(context)

onMounted(() => {
  if (!gridRef.value) return

  options.id = name
  context.engine = createGrid(gridRef.value, options)

  context.engine.on('dropped', ({ node }) => {
    items.value = [...items.value, node]
    emit('dropped', node)
  })
})
</script>

<template>
  <div ref="gridRef" class="grid-stack sylas-grid-vue">
    <slot></slot>
  </div>
</template>

<style lang="scss">
@use 'F:/gridstack.js/src/gridstack.scss';

.sylas-grid-vue {
  background-color: #f5f5f5;
}
</style>