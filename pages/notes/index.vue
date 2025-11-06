<template>
  <div class="note-list-wrapper">
    <div class="note-header">
      <div class="header-left">
        <NuxtLink to="/" class="header-btn" title="返回地图">
          <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6l6 6l1.41-1.41L10.83 12z"></path></svg>
        </NuxtLink>
      </div>
      <span class="header-title">所有笔记</span>
      <div class="header-right">
        <button class="header-btn primary" @click="createNewNote" title="新建笔记">
          <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"></path></svg>
        </button>
      </div>
    </div>

    <div class="note-list-container">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>正在加载笔记...</span>
      </div>
      
      <div v-else-if="notes.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        <h3>没有找到笔记</h3>
        <p>点击右上角的 "+" 按钮创建一篇新笔记。</p>
      </div>

      <ul v-else class="note-list">
        <li v-for="note in notes" :key="note.id">
          <NuxtLink :to="`/notes/${note.id}`" class="note-item-link">
            <div class="note-item-content">
              <span class="note-item-title">{{ note.note_title || '无标题笔记' }}</span>
              <span v-if="note.projects" class="note-item-project">
                关联项目: {{ note.projects.project_name }}
              </span>
              <span v-else class="note-item-project">
                (未关联项目)
              </span>
              <span class="note-item-date">{{ formatRelativeTime(note.updated_at) }}</span>
            </div>
          </NuxtLink>
          <button class="delete-btn" @click="deleteNote(note.id)" title="删除笔记">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"></path></svg>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient, useSupabaseUser, navigateTo } from '#imports'

// 必须登录才能访问
definePageMeta({
  middleware: 'auth',
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const notes = ref<any[]>([])
const loading = ref(true)

// 加载所有笔记，并抓取关联的项目名称
async function fetchNotes() {
  if (!user.value) return
  loading.value = true
  try {
    // RLS (行级安全) 策略会在此处自动生效
    const { data, error } = await supabase
      .from('notes')
      // 选择所有列, 并从 'projects' 表中抓取 'project_name'
      .select(`
        id, 
        note_title, 
        updated_at,
        projects ( project_name ) 
      `) 
      .eq('user_id', user.value.id)
      .order('updated_at', { ascending: false }) // 按更新时间倒序
    
    if (error) throw error
    notes.value = data || []
  } catch (error: any) {
    console.error('加载笔记列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 挂载时加载
onMounted(() => {
  fetchNotes()
})

// 新建笔记 (不关联任何项目)
function createNewNote() {
  // 导航到 /notes/new，[id].vue 页面会处理这个特殊的 "new" ID
  navigateTo('/notes/new')
}

// 删除笔记
async function deleteNote(id: number) {
  if (!confirm('确定要删除这篇笔记吗？此操作无法撤销。')) {
    return
  }
  
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      
    if (error) throw error
    
    // 从 UI 列表中立即移除
    notes.value = notes.value.filter(note => note.id !== id)
    
  } catch (error: any) {
    console.error('删除笔记失败:', error)
    alert('删除失败，请稍后重试。')
  }
}

// 格式化时间
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', { 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
/* 使用与 notes/[id].vue 类似的样式 */
.note-list-wrapper {
  background-color: #1e1e1e;
  color: #e0e0e0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0 auto;
  border-left: 1px solid #333;
  border-right: 1px solid #333;
}


/* 头部 */
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
  flex-basis: 60px;
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
.header-btn.primary { color: #1890ff; }
.header-btn.primary svg {
  width: 28px; /* 让加号更大 */
  height: 28px;
}
.header-title {
  flex-grow: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 500;
  color: #fff;
}

/* 列表容器 */
.note-list-container {
  flex: 1;
  overflow-y: auto;
}

.note-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.note-list li {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #333;
}
.note-list li:last-child {
  border-bottom: none;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #444; /* 默认灰色 */
  padding: 20px;
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.2s ease;
}
.note-list li:hover .delete-btn {
  color: #f44336; /* 悬停时显示红色 */
}
.delete-btn:hover {
  background-color: #444;
}

.note-item-link {
  flex-grow: 1;
  padding: 20px 24px;
  text-decoration: none;
  color: #e0e0e0;
  display: block;
  transition: background-color 0.2s ease;
  /* 确保链接可点击区域更大 */
  min-width: 0;
}
.note-item-link:hover {
  background-color: #2c2c2c;
}

.note-item-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* 确保长文本被截断 */
  overflow: hidden;
}
.note-item-title {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.note-item-project {
  font-size: 13px;
  color: #1890ff; /* 蓝色高亮 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.note-item-date {
  font-size: 13px;
  color: #888;
}

/* 状态 */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #888;
  height: 70%;
}
.empty-state svg {
  color: #555;
  margin-bottom: 24px;
}
.empty-state h3 {
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 8px;
}
.empty-state p {
  font-size: 14px;
  max-width: 250px;
  line-height: 1.5;
}
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #444;
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>