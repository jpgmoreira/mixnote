<script lang="ts" setup>
  import { NormalToolbar } from 'md-editor-v3';
  import { PaletteIcon } from 'lucide-vue-next';

  const colors = ['#d19a66', '#61afef', '#98c379', '#e06c75', '#c678dd', '#56b6c2'];

  function copyColor(color: string) {
    navigator.clipboard.writeText(color);
  }
</script>

<template>
  <NormalToolbar title="Color picker">
    <PaletteIcon class="md-editor-icon" />
  </NormalToolbar>
</template>
