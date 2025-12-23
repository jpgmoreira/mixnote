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
    border-color: #3a3a3a !important;
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
    background-color: #535353 !important;
  }

  /* Footer */
  .md-editor-footer,
  .md-editor-footer-left,
  .md-editor-footer-right {
    height: fit-content !important;
    padding: 1px !important;
    border-color: #3a3a3a !important;
  }

  /* Resizer */
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
    border: 1px solid #363636 !important;
    background-color: #1f1f1f !important;
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
    font-size: 0.91rem !important;
  }
  .md-editor-code-block {
    margin-top: 1px;
  }

  /* Inline code */
  .md-editor-preview code:not(.md-editor-code code):not(pre code) {
    padding: 0.15em 0.35em !important;
    font-size: 0.9rem !important;
    font-family: 'Fira Code', 'JetBrains Mono', monospace !important;
    color: #d19a66 !important;
    border-radius: 4px;
    white-space: nowrap;
  }

  /* Unordered lists */
  .md-editor-preview ul {
    list-style: disc !important;
  }

  .md-editor-preview ul ul {
    list-style: circle !important;
  }

  /* Ordered lists */
  .md-editor-preview ol {
    list-style: decimal !important;
  }

  /* Autocomplete */
  .md-editor .cm-tooltip {
    display: none;
    pointer-events: none;
  }

  /* Tables */
  .md-editor-preview table th {
    background-color: #353535 !important;
    border-color: #4d4d4d !important;
    border-bottom: none !important;
    border-top: none !important;
  }
  .md-editor-preview table tbody td {
    background-color: #2b2b2b !important;
    border-color: #4d4d4d !important;
  }
  .md-editor-preview table tbody tr:hover td {
    background-color: #313131 !important;
  }

  /* Colors */
  .md-editor {
    border: none !important;
  }
  .md-editor,
  .md-editor .cm-scroller {
    background-color: #222222 !important;
  }
  .md-editor-custom-scrollbar__track {
    background-color: #222222 !important;
  }
  .md-editor-custom-scrollbar__thumb {
    background-color: #3b3b3b !important;
  }
  .md-editor blockquote {
    background-color: #161616 !important;
  }
  .md-editor hr {
    border-color: #4d4d4d !important;
    border-width: 2px !important;
  }
  .md-editor-dropdown {
    background-color: #222222 !important;
  }
  .md-editor-table-shape-col-default {
    background-color: #0f0f0f !important;
  }
  .md-editor-table-shape-col-include {
    background-color: #424242 !important;
  }

  /* Checkboxes */
  .md-editor-preview .task-list-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .md-editor-preview .task-list-item-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 15px;
    height: 15px;
    border: 1.5px solid #555555;
    border-radius: 4px;
    background-color: #1e1e1e;
    cursor: pointer;
    display: grid;
    place-items: center;
  }
  .md-editor-preview .task-list-item-checkbox:checked {
    background-color: #d19a66;
    border-color: #db720f;
  }
  .md-editor-preview .task-list-item-checkbox:checked::after {
    content: '✓';
    color: #1a1a1a;
    position: absolute;
    font-size: 18px;
    font-weight: bold;
    line-height: 1;
  }
</style>
