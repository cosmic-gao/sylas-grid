<script lang="ts">
import { type ShallowRef, onMounted, computed, useTemplateRef, shallowRef } from "vue";
import { type GridEmits, type GridProps, type GridItemProps } from "./grid.prop"
import { provideGrid } from "./grid.context"
import { type GridEngine, createGrid } from "../core"
</script>

<script setup lang="ts">
const { name, modelValue, options = {} } = defineProps<GridProps>()
const emit = defineEmits<GridEmits>()

const el = useTemplateRef<HTMLElement>('sylas-grid')

const items = computed<GridItemProps[]>({
  get: () => modelValue ?? [],
  set: (value) => emit('update:modelValue', value),
})

const grid = shallowRef() as ShallowRef<GridEngine>
provideGrid(grid)

onMounted(() => {
  if (!el.value) return

  options.id = name
  grid.value = createGrid(el.value, options)

  grid.value.on('dropped', ({ node }) => {
    items.value = [...items.value, node]
    emit('dropped', node)
  })
})
</script>

<template>
  <div ref="sylas-grid" class="grid-stack sylas-grid-vue">
    <slot></slot>
  </div>
</template>

<style lang="scss">
@use 'F:/gridstack.js/src/gridstack.scss';

.sylas-grid-vue {
  background-color: #f5f5f5;
}
</style>