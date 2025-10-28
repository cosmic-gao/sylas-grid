<script lang="ts">
import { ref } from "vue";
import { type GridItemProps } from "./components/grid.props"
</script>

<script setup lang="ts">
import Grid from "./components/grid.vue"
import GridItem from "./components/grid-item.vue"

const items = ref<GridItemProps[]>([
  { id: "0", x: 0, y: 0, w: 2, h: 2, minW: 1, autoPosition: true }
])

const onAddWidget = () => {
  items.value.push({ id: "1", x: 3, y: 4, w: 3, h: 2, lazyLoad: true })
}
</script>

<template>
  <button @click="onAddWidget">Add a widget</button>
  <button>Delete the last widget</button>

  <Grid>
    <GridItem v-for="item in items" :key="item.id" v-bind="item">{{ item.id }}</GridItem>
  </Grid>
</template>