<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { xml } from '@codemirror/lang-xml';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, lineNumbers } from '@codemirror/view';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    readonly?: boolean;
    dark?: boolean;
  }>(),
  {
    modelValue: '',
    readonly: false,
    dark: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const editorContainer = ref<HTMLElement>();
let editorView: EditorView | null = null;

/** 用新内容替换编辑器全部文本（不触发 updateListener 回灌） */
function replaceContent(content: string) {
  if (!editorView) return;
  const current = editorView.state.doc.toString();
  if (current === content) return;
  editorView.dispatch({
    changes: { from: 0, to: editorView.state.doc.length, insert: content },
  });
}

function initializeEditor() {
  if (!editorContainer.value) return;

  const extensions = [
    lineNumbers(),
    xml(),
    EditorView.lineWrapping,
    EditorState.readOnly.of(props.readonly),
    EditorView.theme({
      '&': { fontSize: '13px', height: '100%' },
      '.cm-scroller': { overflow: 'auto', fontFamily: "'Fira Code', 'Courier New', monospace" },
      '.cm-gutters': { borderRight: '1px solid #e2e8f0' },
    }),
  ];

  if (props.dark) {
    extensions.push(oneDark);
  }

  editorView = new EditorView({
    state: EditorState.create({
      doc: props.modelValue || '',
      extensions: [
        ...extensions,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            emit('update:modelValue', update.state.doc.toString());
          }
        }),
      ],
    }),
    parent: editorContainer.value,
  });
}

function destroyEditor() {
  if (editorView) {
    editorView.destroy();
    editorView = null;
  }
}

/** 外部 modelValue 变化时同步到编辑器 */
watch(
  () => props.modelValue,
  (newContent) => {
    replaceContent(newContent || '');
  },
);

/** 只读模式切换 */
watch(
  () => props.readonly,
  () => {
    if (!editorView) return;
    // 重新创建编辑器以应用新的 readOnly 配置
    destroyEditor();
    initializeEditor();
  },
);

/** 主题切换 */
watch(
  () => props.dark,
  () => {
    destroyEditor();
    initializeEditor();
  },
);

onMounted(() => {
  initializeEditor();
});

onBeforeUnmount(() => {
  destroyEditor();
});
</script>

<template>
  <div ref="editorContainer" class="code-editor"></div>
</template>

<style scoped>
.code-editor {
  height: 100%;
  overflow: hidden;
}

.code-editor :deep(.cm-editor) {
  height: 100%;
}

.code-editor :deep(.cm-editor.cm-focused) {
  outline: none;
}
</style>
