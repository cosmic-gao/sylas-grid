<template>
  <div ref="itemRef" class="grid-stack-item">
    <div class="grid-stack-item-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGridItem } from "../composables/useGridItem"

const { itemRef } = useGridItem()
</script>

<style>
.grid-stack-item {
  position: absolute;
}

.grid-stack-item-content {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
