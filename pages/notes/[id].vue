<template>
  <div class="note-page-wrapper">
    
    <div class="note-header">
      <div class="header-left">
        <NuxtLink to="/notes" class="header-btn" title="返回列表">
          <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6l6 6l1.41-1.41L10.83 12z"></path></svg>
        </NuxtLink>
      </div>
      <span class="header-title">{{ pageTitle }}</span>
      <div class="header-right">
        <span class="status-message">{{ statusMessage }}</span>
      </div>
    </div>

    <ClientOnly>
      <EditorContent :editor="editor" class="editor-content-area" />
      
      <NoteToolbar
        v-if="editor" 
        :editor="editor" 
        @toggle-media-menu="isMediaMenuOpen = !isMediaMenuOpen"
        @insert-date-time="insertDateTime" 
      />
      
      <template #fallback>
        <div class="editor-loading">正在加载编辑器...</div>
        <div class="note-toolbar-placeholder"></div>
      </template>
    </ClientOnly>
    
    <transition name="fade">
      <NoteMediaMenu
        v-if="isMediaMenuOpen"
        @close="isMediaMenuOpen = false"
        @select-media="triggerFileInput"
      />
    </transition>

    <input 
      type="file" 
      ref="fileInputRef" 
      @change="handleFileSelected" 
      :accept="mediaAcceptType"
      style="display: none;" 
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute, navigateTo } from '#imports'
import { useEditor, EditorContent, type Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import { debounce } from 'perfect-debounce'

import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'

// --- *** START: 新增导入 (Link) *** ---
// (Link 包含在 StarterKit 中, 但在此处显式导入类型以备后用)
import Link from '@tiptap/extension-link'
// --- *** END: 新增导入 (Link) *** ---


import { useSupabaseClient, useSupabaseUser } from '#imports'
import NoteToolbar from '~/components/NoteToolbar.vue'
import NoteMediaMenu from '~/components/NoteMediaMenu.vue'

definePageMeta({
  middleware: 'auth',
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()
const router = useRouter()

const currentNoteId = ref<number | null>(null)
const isNewNote = ref(route.params.id === 'new')
const newNoteProjectId = ref(route.query.project_id as string | undefined)
const newNoteFeatureId = ref(route.query.feature_id as string | undefined)

const editor = useEditor({
  onUpdate: () => {
    statusMessage.value = '正在输入...'
    debouncedAutoSave()
  },
  content: '<p>正在加载笔记...</p>',
  extensions: [
    StarterKit.configure({
      horizontalRule: false,
      heading: { levels: [2, 3] },
      
      // --- *** START: 启用链接功能 *** ---
      link: {
        openOnClick: true, // 在新标签页中打开链接
        autolink: true,    // 自动将 URL 文本转换为链接
        linkOnPaste: true, // 粘贴 URL 时自动转换为链接
      }
      // --- *** END: 启用链接功能 *** ---
    }),
    Image,
    TaskList,
    TaskItem.configure({ 
      nested: true,
      content: 'inline*', 
    }),
    Placeholder.configure({
      placeholder: '记录文字、图片或录音...',
    }),
    HorizontalRule,
    Highlight.configure({ multicolor: true }),
    Underline,
  ],
  editorProps: {
    attributes: {
      class: 'tiptap',
    },
    handlePaste(view, event, slice) {
      const files = event.clipboardData?.files
      if (!files || files.length === 0) { return false }
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
      if (imageFiles.length === 0) { return false }
      event.preventDefault()
      imageFiles.forEach(file => { uploadFile(file) })
      return true
    },
  },
})

const fileInputRef = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const isSaving = ref(false)
const statusMessage = ref('已保存')
const isMediaMenuOpen = ref(false)
const mediaAcceptType = ref('image/*')
const pageTitle = ref('笔记')

// --- 时钟功能 ---
function insertDateTime() {
  if (!editor.value) return
  const now = new Date()
  const dateTimeString = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  editor.value.chain().focus().insertContent(dateTimeString + " ").run()
}

// --- 自动保存逻辑 ---
const debouncedAutoSave = debounce(async () => {
  if (!editor.value || !user.value || isSaving.value) return
  if (editor.value.isEmpty) {
    statusMessage.value = '笔记为空'
    return
  }
  isSaving.value = true
  statusMessage.value = '正在保存...'
  let title = '无标题笔记'
  const firstNode = editor.value.state.doc.content.firstChild
  if (firstNode && firstNode.textContent.trim()) {
    title = firstNode.textContent.trim().substring(0, 50)
  }
  const contentJSON = editor.value.getJSON()
  const noteData = {
    id: isNewNote.value ? undefined : currentNoteId.value,
    user_id: user.value.id,
    content: contentJSON,
    note_title: title,
    updated_at: new Date().toISOString(),
    project_id: isNewNote.value ? (newNoteProjectId.value || null) : undefined,
    feature_id: isNewNote.value ? (newNoteFeatureId.value || null) : undefined,
  }
  try {
    let error, data;
    if (isNewNote.value) {
      const { data: insertData, error: insertError } = await supabase
        .from('notes')
        .insert(noteData)
        .select('id')
        .single()
      data = insertData
      error = insertError
    } else {
      const { data: updateData, error: updateError } = await supabase
        .from('notes')
        .update({
          content: noteData.content,
          note_title: noteData.note_title,
          updated_at: noteData.updated_at
        })
        .eq('id', currentNoteId.value!)
        .select('id')
        .single()
      data = updateData
      error = updateError
    }
    if (error) throw error
    statusMessage.value = '已保存'
    if (isNewNote.value && data && data.id) {
      isNewNote.value = false
      currentNoteId.value = data.id
      router.replace({ params: { id: data.id }, query: {} })
      pageTitle.value = title
    }
  } catch (error: any) {
    console.error('自动保存失败:', error)
    statusMessage.value = '保存失败'
  } finally {
    isSaving.value = false
  }
}, 1500)

// --- 加载笔记逻辑 ---
async function loadNote() {
  if (!user.value || !editor.value) return
  if (isNewNote.value) {
    if (newNoteFeatureId.value) {
      pageTitle.value = `新笔记 (关联要素 ${newNoteFeatureId.value})`
    } else {
      pageTitle.value = '新建笔记'
    }
    const defaultContent = `<p>${user.value.email?.split('@')[0] || '你好'}，开始编写新笔记吧！</p>`
    editor.value?.commands.setContent(defaultContent)
    statusMessage.value = '新笔记'
    currentNoteId.value = null
    return
  }
  statusMessage.value = '正在加载...'
  try {
    currentNoteId.value = Number(route.params.id)
    if (isNaN(currentNoteId.value)) {
       throw new Error("无效的笔记 ID")
    }
    const { data, error } = await supabase
      .from('notes')
      .select('id, content, note_title')
      .eq('user_id', user.value.id)
      .eq('id', currentNoteId.value)
      .single()
    if (error) throw error
    if (data && data.content) {
      editor.value?.commands.setContent(data.content)
      pageTitle.value = data.note_title || '笔记'
      statusMessage.value = '已加载'
    } else {
      editor.value?.commands.setContent('<p></p>')
      pageTitle.value = data.note_title || '笔记'
      statusMessage.value = '笔记为空'
    }
  } catch (error: any) {
    console.error('加载笔记失败:', error)
    editor.value?.commands.setContent('<p>加载笔记失败，或笔记不存在。</p>')
    pageTitle.value = '加载失败'
    statusMessage.value = '加载失败'
  }
}

// --- 媒体上传 ---
function triggerFileInput(acceptType: string) {
  mediaAcceptType.value = acceptType
  isMediaMenuOpen.value = false
  fileInputRef.value?.click()
}

async function handleFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  await uploadFile(file)
  if (fileInputRef.value) fileInputRef.value.value = ''
}

async function uploadFile(file: File) {
  if (!editor.value) return
  isUploading.value = true
  statusMessage.value = '正在上传...'
  const formData = new FormData()
  formData.append('file', file)
  try {
    const result = await $fetch('/api/upload-asset', {
      method: 'POST',
      body: formData,
    })
    if (result.url) {
      if (file.type.startsWith('image/')) {
        editor.value.chain().focus().setImage({ src: result.url }).run()
      } else {
        const html = `<p>已上传文件：<a href="${result.url}" target="_blank" rel="noopener noreferrer">${file.name}</a></p>`
        editor.value.chain().focus().insertContent(html).run()
      }
      debouncedAutoSave()
    }
  } catch (error: any) {
    console.error('上传失败:', error)
    statusMessage.value = '上传失败'
  } finally {
    isUploading.value = false
  }
}

// --- 生命周期 ---
watch(editor, (newValue) => {
  if (newValue) {
    loadNote()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  editor.value?.destroy()
})

</script>

<style scoped>
.note-page-wrapper {
  background-color: #1e1e1e;
  color: #e0e0e0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  margin: 0 auto;
  border-left: none;
  border-right: none;
}
@media (min-width: 769px) {
  .note-page-wrapper {
    max-width: 800px;
    border-left: 1px solid #333;
    border-right: 1px solid #333;
  }
}
.note-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 10px;
  background-color: #1e1e1e;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  border-bottom: 1px solid #333;
}
.header-left, .header-right {
  flex-basis: 100px;
  flex-shrink: 0;
}
.header-right { display: flex; justify-content: flex-end; }
.header-left { display: flex; justify-content: flex-start; }
.header-btn {
  background: transparent;
  border: none;
  color: #e0e0e0;
  padding: 6px;
  cursor: pointer;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.header-btn:hover { background-color: #333; }
.header-title {
  flex-grow: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.status-message {
  font-size: 13px;
  color: #888;
  white-space: nowrap;
}
.editor-content-area {
  flex: 1;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 16px 24px;
  padding-bottom: 80px; 
}
@media (min-width: 769px), (orientation: landscape) {
  .editor-content-area {
    padding: 16px 48px;
    padding-bottom: 16px;
    padding-top: 73px;
  }
}
.editor-loading {
  padding: 40px;
  text-align: center;
  color: #888;
  font-size: 16px;
  min-height: 500px;
}
.note-toolbar-placeholder {
  height: 57px;
  background-color: #2c2c2c;
  border-top: 1px solid #444;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
}
:deep(.tiptap) { min-height: 100%; outline: none; color: #e0e0e0; }
:deep(.tiptap p) { margin: 0 0 1em; line-height: 1.7; font-size: 16px; }
:deep(.tiptap p.is-editor-empty:first-child::before) { content: attr(data-placeholder); color: #555; float: left; height: 0; pointer-events: none; }
:deep(.tiptap h2) { font-size: 1.4em; font-weight: 600; margin-top: 1.2em; margin-bottom: 0.5em; }
:deep(.tiptap h3) { font-size: 1.15em; font-weight: 600; margin-top: 1em; margin-bottom: 0.5em; }
:deep(.tiptap u) { text-decoration: underline; }
:deep(.tiptap mark) { background-color: #fde047; color: #1e1e1e; padding: 0.1em 0.2em; border-radius: 3px; }
:deep(.tiptap hr) { border: 0; border-top: 2px solid #444; margin: 1.5em 0; }
:deep(.tiptap blockquote) { border-left: 3px solid #555; padding-left: 1em; margin: 1em 0; color: #9e9e9e; font-style: italic; }
:deep(.tiptap img) { max-width: 100%; height: auto; border-radius: 8px; margin: 1em 0; }
:deep(.tiptap ul[data-type="taskList"]) { list-style: none; padding: 0; }
:deep(.tiptap li[data-type="taskItem"]) { display: flex; align-items: flex-start; gap: 8px; margin: 12px 0; }
:deep(.tiptap li[data-type="taskItem"] label) { flex-shrink: 0; cursor: pointer; margin-top: 3px; user-select: none; }
:deep(.tiptap li[data-type="taskItem"] input[type="checkbox"]) { width: 18px; height: 18px; cursor: pointer; }
:deep(.tiptap li[data-type="taskItem"] div) { flex: 1; min-width: 1px; }
:deep(.tiptap li[data-type="taskItem"] div p) { margin: 0; }
:deep(.tiptap li[data-type="taskItem"][data-checked="true"] > div) { color: #888; text-decoration: line-through; }

/* --- *** START: 新增链接样式 *** --- */
:deep(.tiptap a) {
  color: #81a9f1; /* 链接颜色 */
  text-decoration: underline;
  cursor: pointer;
}
/* --- *** END: 新增链接样式 *** --- */

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>