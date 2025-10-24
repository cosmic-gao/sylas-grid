<template>
  <div ref="gridRef" class="grid-stack sylas-grid-vue">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useGrid } from "../composables/useGrid"

const { gridRef } = useGrid()
</script>