<script lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { type GridItem } from "../core"
import { type GridItemProps } from './grid.type';
import { GRID_ITEM_ATTRS } from "./grid.const"
import { useGrid } from "./grid.context"
</script>

<script setup lang="ts">
const props = defineProps<GridItemProps>();

const itemRef = ref<HTMLElement>()
const gridItem = ref<GridItem>()

const { engine } = useGrid()

const gridAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(GRID_ITEM_ATTRS)
      .map(([key, attr]) => [`gs-${attr}`, props[key as keyof GridItemProps]])
  )
)

const properties = computed(() => ({ ...gridAttrs.value }))

onMounted(() => {
  if (!itemRef.value || !engine) return
  gridItem.value = engine.addItem(itemRef.value, props)
})
</script>

<template>
  <div ref="itemRef" class="grid-stack-item sylas-grid-item" v-bind="properties">
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