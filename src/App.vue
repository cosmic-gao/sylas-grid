<script lang="ts">
import { ref } from "vue";
import { type GridItemProps } from "./components/grid.type"
</script>

<script setup lang="ts">
import Grid from "./components/grid.vue"
import GridItem from "./components/grid-item.vue"
import GridGragSource from "./components/grid-drag-source.vue"

const items = ref<GridItemProps[]>([
  { id: "0", x: 0, y: 0, w: 2, h: 2, minW: 1, autoPosition: true }
])

const onAddWidget = () => {
  items.value.push({ id: "1", x: 3, y: 0, w: 3, h: 2 })
}

const added = (item: any) => {
  // items.value.push(item)
}
</script>

<template>
  <button @click="onAddWidget">Add a widget</button>
  <button>Delete the last widget</button>
  <GridGragSource target="dashboard">
    <div style="border: 1px solid #0a59f7;width:70px;height: 70px;background-color: #e6eeff;">
      Add External widget1
    </div>
  </GridGragSource>
  <GridGragSource target="dashboard">
    <div style="border: 1px solid #0a59f7;width:70px;height: 70px;background-color: #e6eeff;">
      Add External widget2
    </div>
  </GridGragSource>

  <Grid name="dashboard" @added="added">
    <GridItem v-for="item in items" :key="item.id" v-bind="item">{{ item.id }}</GridItem>
  </Grid>
</template>