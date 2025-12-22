<script lang="ts" setup>
  import { ref } from 'vue';
  import { MdEditor, type ExposeParam } from 'md-editor-v3';
  import { Note } from '@common/schemas/note';
  import { useNotesStore } from '@renderer/store/notes';

  const props = defineProps<{
    source: boolean;
    note: Note | null;
  }>();

  const headRef = ref<ExposeParam>();

  const headContent = ref(props.note?.head || '');
  const notesStore = useNotesStore();

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
</script>

<template>
  <div v-if="note" class="absolute top-0 bottom-0 left-0 right-0">
    <div v-if="!source">
      <MdEditor
        v-model="headContent"
        theme="dark"
        codeTheme="atom"
        language="en-US"
        ref="headRef"
        :toolbarsExclude="['mermaid']"
        @onUploadImg="uploadImage"
        :noUploadImg="true"
      />
    </div>
    <div v-else>SOURCE</div>
  </div>
</template>
