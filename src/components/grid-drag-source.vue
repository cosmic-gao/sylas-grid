<script lang="ts">
import { ref } from 'vue';
</script>

<script setup lang="ts">
const gragSourceRef = ref<HTMLElement>()
</script>

<template>
  <div ref="gragSourceRef" class="grid-drag-source">
    <slot></slot>
  </div>
</template>