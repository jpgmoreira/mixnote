<script lang="ts" setup>
  import { ref } from 'vue';
  import { MdEditor, type ExposeParam } from 'md-editor-v3';
  import { Note } from '@common/schemas/note';
  import { useNotesStore } from '@renderer/store/notes';
  import CustomPreview from './CustomPreview.vue';

  const props = defineProps<{ note: Note | null }>();

  const headRef = ref<ExposeParam>();

  const headContent = ref(props.note?.head || '');
  const notesStore = useNotesStore();

  // --- Image manipulation: ---

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
      headRef.value?.insert(() => ({ targetValue: md }));
    });
  }

  function persistImageWidth(img: HTMLImageElement) {
    const src = img.getAttribute('src');
    const width = img.style.width;
    if (!src || !width) return;

    const escapedSrc = src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const regex = new RegExp(`<img([^>]*?)src=["']${escapedSrc}["']([^>]*?)>`, 'i');

    headContent.value = headContent.value.replace(regex, (match) => {
      if (/style=/.test(match)) {
        return match.replace(/style=["'][^"']*["']/, `style="width: ${width};"`);
      }

      return match.replace('<img', `<img style="width: ${width};"`);
    });
  }

  let startX = 0;
  let startWidth = 0;

  function startResize(e: MouseEvent, img: HTMLImageElement) {
    e.preventDefault();

    startX = e.clientX;
    startWidth = img.offsetWidth;

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      img.style.width = Math.max(50, startWidth + delta) + 'px';
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      persistImageWidth(img);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function onPreviewRemount() {
    const preview = document.querySelector('.md-editor-preview');
    if (!preview) return;

    preview.querySelectorAll('img').forEach((img) => {
      const el = img as HTMLImageElement;

      if ((el as any).__resizeBound) return;
      (el as any).__resizeBound = true;

      el.style.cursor = 'ew-resize';
      el.addEventListener('mousedown', (e) => startResize(e, el));
    });
  }

  //  --- ---
</script>

<template>
  <div v-if="note" class="absolute top-0 bottom-0 left-0 right-0">
    <MdEditor
      v-model="headContent"
      theme="dark"
      codeTheme="atom"
      language="en-US"
      ref="headRef"
      :toolbarsExclude="['mermaid']"
      @onUploadImg="uploadImage"
      :noUploadImg="true"
      noImgZoomIn
      :previewComponent="CustomPreview"
      @onRemount="onPreviewRemount"
    />
  </div>
</template>

<style>
  .md-editor-preview img {
    max-width: 100%;
  }

  .md-editor-preview img:hover {
    outline: 1px dashed #4c9ffe;
  }
</style>
