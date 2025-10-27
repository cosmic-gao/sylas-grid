<script lang="ts">
import { computed, ref, watch, watchEffect } from 'vue';
import { type GridItemProps } from './grid.props';
import { GRID_ITEM_ATTRS } from "./grid.const"
import { useGrid } from "./grid.context"
</script>

<script setup lang="ts">
const props = defineProps<GridItemProps>();

const itemRef = ref<HTMLElement>()

const context = useGrid()

const engine = computed(() => context.engine!)

const gridAttrs = computed(() =>
  Object.fromEntries(
    GRID_ITEM_ATTRS.map(key => [`gs-${key}`, props[key]])
  )
)

const properties = computed(() => ({ ...gridAttrs.value }))

watch(engine, () => {
  if (!itemRef.value || !engine.value) return
  engine.value.addItem(itemRef.value, props)
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