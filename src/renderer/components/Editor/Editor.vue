<script lang="ts" setup>
  import { ref, useTemplateRef, watch } from 'vue';
  import { MdEditor, ToolbarNames, type ExposeParam } from 'md-editor-v3';
  import CustomPreview from './CustomPreview.vue';
  import ColorPicker from './ColorPicker.vue';
  import Focus from './Focus.vue';

  defineExpose({
    getContent,
    resetContent,
    setPreviewOnly,
  });

  const emit = defineEmits<{
    (e: 'input'): void;
    (e: 'keydown'): void;
    (e: 'blur'): void;
    (e: 'toggleFocusMode'): void;
  }>();

  const props = defineProps<{
    initial: string;
    placeholder?: string;
  }>();
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
    1,
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

  function getContent() {
    return content.value;
  }

  function resetContent() {
    content.value = props.initial;
  }

  function setPreviewOnly(value: boolean) {
    editorRef.value?.togglePreviewOnly(value);
  }

  // Beware: can cause unexpected behavior if updating the content on every change.
  // You should update it just on blur, or use a debounce on change.
  watch(
    () => props.initial,
    (newValue) => (content.value = newValue)
  );
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
    :autoFoldThreshold="Infinity"
    :placeholder="props.placeholder || ''"
    @onInput="emit('input')"
    @onBlur="emit('blur')"
    @keydown="emit('keydown')"
  >
    <template #defToolbars>
      <ColorPicker @select="insertColor" />
      <Focus @toggle="emit('toggleFocusMode')" />
    </template>
  </MdEditor>
</template>
