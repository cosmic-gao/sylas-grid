<script lang="ts">
import { ref } from "vue";
import { type GridItemProps } from "./components/grid.type"
</script>

<script setup lang="ts">
import Grid from "./components/grid.vue"
import GridDragPortal from "./components/grid-drag-portal.vue"

const items = ref<GridItemProps[]>([
  { id: "0", x: 0, y: 0, w: 2, h: 2, minW: 1 }
])

const onAddWidget = () => {
  items.value.push({ id: "1", x: 3, y: 0, w: 3, h: 2 })
}

setTimeout(() => {
  // (items.value[0]!).w = 6
}, 5000)
</script>

<template>
  <button @click="onAddWidget">Add a widget</button>
  <button>Delete the last widget</button>
  <GridDragPortal target="dashboard">
    <div style="border: 1px solid #0a59f7;width:70px;height: 70px;background-color: #e6eeff;">
      Add External widget1
    </div>
  </GridDragPortal>
  <GridDragPortal target="dashboard">
    <div style="border: 1px solid #0a59f7;width:70px;height: 70px;background-color: #e6eeff;">
      Add External widget2
    </div>
  </GridDragPortal>

  <Grid name="dashboard" v-model="items" />
</template>