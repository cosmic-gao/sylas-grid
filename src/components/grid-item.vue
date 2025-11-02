<script lang="ts">
import { computed, watch, onMounted, onUnmounted, ref, useTemplateRef } from 'vue';
import { type GridItemProps } from './grid.prop';
import { GRID_ITEM_KEYS } from "./grid.const"
import { useGrid } from "./grid.context"
import { type GridItem, type GridItemOptions, GRID_ITEM_ATTRS, GridEngine } from "../core"
</script>

<script setup lang="ts">
const props = defineProps<GridItemProps>();

const el = useTemplateRef<HTMLElement>('grid-item')

const gridItem = ref<GridItem>()

const grid = useGrid()


const gridAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(GRID_ITEM_ATTRS)
      .map(([key, attr]) => [`gs-${attr}`, props[key as keyof GridItemOptions]])
  )
)

const properties = computed(() => ({ ...gridAttrs.value }))

watch(
  () => GridEngine.pick(props, GRID_ITEM_KEYS),
  (options) => {
    if (!el.value || !grid.value) return
    grid.value.gridstack.update(el.value, options);
  },
  { flush: 'post' }
)

watch(
  () => props.noResize,
  (noResize) => {
    if (!el.value || !grid.value) return
    grid.value.gridstack.resizable(el.value, !!noResize);
  },
  { flush: 'post' }
)

watch(
  () => props.noMove,
  (noMove) => {
    if (!el.value || !grid.value) return
    grid.value.gridstack.movable(el.value, !!noMove);
  },
  { flush: 'post' }
)

onMounted(() => {
  if (!el.value || !grid.value) return
  gridItem.value = grid.value.addItem(el.value, props)
})

onUnmounted(() => {
  if (!el.value || !grid.value) return
  grid.value.removeItem(el.value)
})
</script>

<template>
  <div ref="grid-item" class="grid-stack-item sylas-grid-item" v-bind="properties">
    <div class="grid-stack-item-content sylas-grid-item-content">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss">
.sylas-grid-item-content {
  border: 1px solid transparent;
  background: #ffffff;
}
</style>