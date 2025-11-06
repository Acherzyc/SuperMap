<template>
  <div class="note-toolbar">
    <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }" title="粗体">
      B
    </button>
    
    <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }" title="斜体">
      <i>I</i>
    </button>
    
    <button @click="editor.chain().focus().toggleUnderline().run()" :class="{ 'is-active': editor.isActive('underline') }" title="下划线">
      <u>U</u>
    </button>
    
    <button @click="editor.chain().focus().toggleHighlight().run()" :class="{ 'is-active': editor.isActive('highlight') }" title="高亮">
      <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M18.5 1.5a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-18a1 1 0 0 1 1-1zm-13 2H10v18H5.5zm12 0H13v18h4.5zM11 3.5h2v18h-2z"></path></svg>
    </button>
    
    <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }" title="无序列表">
      <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M7 5h14v2H7zm0 6h14v2H7zm0 6h14v2H7zM3 5h2v2H3zm0 6h2v2H3zm0 6h2v2H3z"></path></svg>
    </button>
    
    <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }" title="有序列表">
      <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M7 5h14v2H7zm0 6h14v2H7zm0 6h14v2H7zM4.2 11H3V9.5c0-.17.06-.33.18-.44L3.9 8.34c-.16-.16-.16-.41 0-.57c.16-.16.41-.16.57 0l.7.7c.09.09.14.22.14.35V11h-.6c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h.1V9.5H3.7v.5h.5c.28 0 .5.22.5.5s-.22.5-.5.5zm.3-6.5h.1c.28 0 .5-.22.5-.5S4.88 3 4.6 3H3c-.28 0-.5.22-.5.5S2.72 4 3 4h1v.5H3c-.28 0-.5.22-.5.5s.22.5.5.5zm.5 13c0 .28-.22.5-.5.5H3c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1.5c.28 0 .5.22.5.5z"></path></svg>
    </button>
    
    <button @click="editor.chain().focus().toggleTaskList().run()" :class="{ 'is-active': editor.isActive('taskList') }" title="待办事项">
      <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2m-9 14l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8z"></path></svg>
    </button>
    
    <button @click="setLink" :class="{ 'is-active': editor.isActive('link') }" title="添加链接">
      <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M10.59 13.41c.41.39.41 1.03 0 1.42c-.39.39-1.03.39-1.42 0l-1.83-1.83c-1.17-1.17-1.17-3.07 0-4.24l1.83-1.83c.39-.39 1.03-.39 1.42 0c.41.39.41 1.03 0 1.42L9.34 9.17c-.39.39-.39 1.03 0 1.42zm2.82-4.24c.39-.39 1.03-.39 1.42 0l1.83 1.83c1.17 1.17 1.17 3.07 0 4.24l-1.83 1.83c-.39.39-1.03.39-1.42 0c-.41-.39-.41-1.03 0-1.42l1.17-1.17c.39-.39.39-1.03 0-1.42l-1.17-1.17zM17 7H7a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2m0 8H7a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2"></path></svg>
    </button>
    <button @click="editor.chain().focus().setHorizontalRule().run()" title="分割线">
      <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13H5v-2h14z"></path></svg>
    </button>
    
    <button @click="$emit('insertDateTime')" title="插入时间">
      <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m.5-13H11v6l5.25 3.15l.75-1.23l-4.5-2.67z"></path></svg>
    </button>

    <button @click="$emit('toggleMediaMenu')" title="插入媒体">
      <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z"></path></svg>
    </button>
  </div>
</template>

<script setup>
// --- *** START: 新增 setLink 函数 *** ---
const props = defineProps({
  editor: {
    type: Object,
    required: true,
  },
});
defineEmits(['toggleMediaMenu', 'insertDateTime']);

function setLink() {
  // 如果当前已选中链接，则先取消链接
  if (props.editor.isActive('link')) {
    props.editor.chain().focus().unsetLink().run();
    return;
  }

  // 弹出提示框，要求用户输入 URL
  const previousUrl = props.editor.getAttributes('link').href;
  const url = window.prompt('请输入 URL (留空则取消链接)', previousUrl || 'https://');

  // 如果用户点击 "取消"
  if (url === null) {
    return;
  }

  // 如果用户清空了 URL
  if (url === '') {
    props.editor.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }

  // 设置/更新链接
  props.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
}
// --- *** END: 新增 setLink 函数 *** ---
</script>

<style scoped>
.note-toolbar {
  display: flex;
  align-items: center;
  background-color: #2c2c2c; 
  position: fixed;
  z-index: 10;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  
  /* 移动端 (竖屏) 默认样式 */
  bottom: 0;
  top: auto;
  left: 0;
  right: 0;
  width: 100%;
  border-top: 1px solid #444;
  border-bottom: none;
  padding: 8px 16px; 
  box-sizing: border-box;
}

/* 桌面端 (宽屏) 或 平板横屏 样式 */
@media (min-width: 769px), (orientation: landscape) {
  .note-toolbar {
    bottom: auto;
    top: 57px; 
    border-top: none;
    border-bottom: 1px solid #444;
    max-width: 800px;
    margin: 0 auto;
    left: 0; 
    right: 0;
    border-left: 1px solid #333;
    border-right: 1px solid #333;
    border-radius: 0;
    padding: 8px 48px;
  }
}

@media (max-width: 800px) {
   .note-toolbar {
     border-left: none;
     border-right: none;
   }
}

button {
  background: transparent;
  border: none;
  color: #9e9e9e; 
  font-size: 20px;
  font-weight: bold;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

button:hover {
  background-color: #444;
  color: #fff;
}

button.is-active {
  color: #1890ff; 
}

button i {
  font-style: italic;
  font-family: 'Times New Roman', serif;
}
button u {
  text-decoration: underline;
}
</style>