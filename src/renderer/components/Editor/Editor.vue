<script lang="ts" setup>
  import { ref, useTemplateRef } from 'vue';
  import { MdEditor, type ExposeParam } from 'md-editor-v3';
  import CustomPreview from './CustomPreview.vue';

  const props = defineProps<{ content: string }>();
  const content = ref(props.content);
  const editorRef = useTemplateRef<ExposeParam>('editor-ref');

  // --- Paste images: ---

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function uploadImage(files: File[]) {
    files.forEach(async (file) => {
      const dataUrl = await fileToDataUrl(file);
      const md = `<img src="${dataUrl}" />`;
      editorRef.value?.insert(() => ({ targetValue: md }));
    });
  }

  //  --- ---
</script>

<template>
  <MdEditor
    v-model="content"
    ref="editor-ref"
    language="en-US"
    theme="dark"
    @onUploadImg="uploadImage"
    :noUploadImg="true"
    noImgZoomIn
    :previewComponent="CustomPreview"
    :toolbarsExclude="['pageFullscreen', 'fullscreen']"
    noMermaid
    noEcharts
  />
</template>
