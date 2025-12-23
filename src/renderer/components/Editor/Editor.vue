<script lang="ts" setup>
  import { ref, useTemplateRef } from 'vue';
  import { MdEditor, ToolbarNames, type ExposeParam } from 'md-editor-v3';
  import CustomPreview from './CustomPreview.vue';

  const props = defineProps<{ content: string }>();
  const content = ref(props.content);
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
    :toolbars="toolbars"
    noMermaid
    noEcharts
  />
</template>

<style>
  /* Toolbar */
  .md-editor-toolbar-wrapper {
    padding: 0 !important;
  }
  .md-editor-toolbar-left,
  .md-editor-toolbar-right {
    padding: 0 !important;
    display: flex;
    flex-wrap: wrap;
  }
  .md-editor-toolbar-item {
    padding: 3px !important;
  }
  .md-editor-icon {
    padding: 0 !important;
  }
  .md-editor-divider {
    margin: 3px !important;
  }

  /* Footer */
  .md-editor-footer,
  .md-editor-footer-left,
  .md-editor-footer-right {
    height: fit-content !important;
    padding: 1px !important;
  }

  /* Resizer */
  .md-editor-custom-scrollbar__track {
    display: none !important;
  }
  .md-editor-resize-operate {
    height: 100%;
    padding: 1.2px;
    background: rgb(66, 66, 66) !important;
    cursor: col-resize;
    z-index: 10;
  }
  .md-editor-resize-operate:hover,
  .md-editor-resize-operate:active {
    background: #0087e7 !important;
  }

  /* Code editor */
  .md-editor-code {
    margin: 15px 0 !important;
  }
  .md-editor-code-head {
    display: flex !important;
    justify-content: end !important;
    border: 1px solid #292929 !important;
  }
  .md-editor-code-flag {
    display: none !important;
  }
  .md-editor-code-lang {
    color: #d19a66 !important;
    font-weight: bold !important;
    text-transform: uppercase;
    font-size: 11.5px;
  }
  .md-editor-code pre {
    padding: 0 !important;
    border: none !important;
  }
  .md-editor-code code {
    border-top-left-radius: 0 !important;
    border-top-right-radius: 0 !important;
  }
  .md-editor-code-block {
    margin-top: 1px;
  }
</style>
