<script setup lang="ts">
import { ref } from "vue";

import { type GridItemOptions } from "./core/type"
import GridStack from "./components/GridStack.vue"
import GridItem from "./components/GridItem.vue"

const items = ref<GridItemOptions[]>([])
</script>

<template>
  <GridStack>
    <GridItem v-for="item in items" :key="item.id" v-bind="item">

    </GridItem>
  </GridStack>
</template>
