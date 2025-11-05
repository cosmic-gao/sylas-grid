<script lang="ts">
import { type ShallowRef, onMounted, computed, useTemplateRef, shallowRef, onBeforeUnmount } from "vue";
import { type GridEmits, type GridProps, type GridItemProps } from "./grid.type"
import { provideGrid } from "./grid.context"
import GridItem from "./grid-item.vue"
import { type GridEngine, createGrid } from "../core"
</script>

<script setup lang="ts">
const { name, modelValue, options = {} } = defineProps<GridProps>()
const emit = defineEmits<GridEmits>()

const el = useTemplateRef<HTMLElement>('sylas-grid')
const grid = shallowRef() as ShallowRef<GridEngine>
provideGrid(grid)

const items = computed<GridItemProps[]>({
  get: () => modelValue ?? [],
  set: (value) => emit('update:modelValue', value),
})

onMounted(() => {
  if (!el.value) return

  const finalOptions = { ...options, id: name }
  grid.value = createGrid(el.value, finalOptions)

  grid.value.on('dropped', ({ node }) => {
    items.value.push(node)
    emit('dropped', node)
  })
})

onBeforeUnmount(() => {
  if (grid.value) grid.value.destroy()
})
</script>

<template>
  <div ref="sylas-grid" class="grid-stack sylas-grid-vue">
    <slot v-if="$slots.default"></slot>

    <template v-else>
      <GridItem v-for="item in items" :key="item.id" v-bind="item">
        <slot :item="item"></slot>
      </GridItem>
    </template>
  </div>
</template>

<style lang="scss">
@use 'G:/gridstack.js/src/gridstack.scss';

.sylas-grid-vue {
  background-color: #f5f5f5;
}
</style>