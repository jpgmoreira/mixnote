<script lang="ts" setup>
  import { ref, useTemplateRef } from 'vue';
  import { MdEditor, ToolbarNames, type ExposeParam } from 'md-editor-v3';
  import CustomPreview from './CustomPreview.vue';
  import ColorPicker from './ColorPicker.vue';

  const emit = defineEmits<{
    (e: 'change', content: string): void;
  }>();

  const props = defineProps<{ initial: string }>();
  const content = ref(props.initial);
  const editorRef = useTemplateRef<ExposeParam>('editor-ref');

  const toolbars: ToolbarNames[] = [
    'revoke',
    'next',
    '-',
    'bold',
    'underline',
    'italic',
    'strikeThrough',
    'sub',
    'sup',
    'quote',
    0,
    '-',
    'unorderedList',
    'orderedList',
    'task',
    'table',
    'link',
    '-',
    'prettier',
    'preview',
    'previewOnly',
  ];

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

  function insertColor(color: string) {
    editorRef.value?.insert(() => ({ targetValue: color }));
  }
</script>

<template>
  <MdEditor
    v-model="content"
    ref="editor-ref"
    language="en-US"
    theme="dark"
    @onUploadImg="uploadImage"
    noUploadImg
    noImgZoomIn
    :previewComponent="CustomPreview"
    :toolbars="toolbars"
    noMermaid
    noEcharts
    :autoFoldThreshold="999999"
    placeholder="HEAD"
    @onChange="emit('change', content)"
  >
    <template #defToolbars>
      <ColorPicker @select="insertColor" />
    </template>
  </MdEditor>
</template>
