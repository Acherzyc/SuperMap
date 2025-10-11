<template>
  <div class="modal-backdrop" v-if="isVisible" @click.self="closePanel">
    <svg style="display: none;">
      <defs>
        <filter id="glass-distortion-panel">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="2" seed="92" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
          <feDisplacementMap in="SourceGraphic" in2="blurred" scale="50" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>

    <div class="liquid-glass-card" :style="cardDynamicStyles">
      <div class="card-content">
        <div class="panel-header-save">
          <h3>云端数据同步</h3>
          <button class="close-btn" @click="closePanel" title="关闭">×</button>
        </div>

        <div class="action-section">
          <h4 class="section-title">保存当前地图</h4>
          <div class="save-form">
            <div class="liquid-input-wrapper">
              <input type="text" v-model="projectName" placeholder="输入项目名称..." class="liquid-input">
            </div>
            <button @click="handleSave" :disabled="!projectName.trim() || isSaving" class="submit-btn save">
              <div v-if="isSaving" class="loading-spinner"></div>
              <span v-else>保存</span>
            </button>
          </div>
        </div>

        <div class="action-section">
          <h4 class="section-title">读取云端项目</h4>
          <div class="liquid-input-wrapper">
            <input type="text" v-model="searchTerm" placeholder="搜索已保存的项目..." class="liquid-input">
          </div>
          <div class="project-list-container">
            <div v-if="isLoading" class="state-indicator">
              <div class="loading-spinner"></div>
              <span>加载中...</span>
            </div>
            <ul v-else-if="filteredProjects.length" class="project-list">
              <li v-for="project in filteredProjects" :key="project.id" class="project-item">
                <div class="project-info" @click="handleLoad(project)" title="点击加载此项目">
                  <strong class="project-title">{{ project.project_name }}</strong>
                  <span class="project-date">更新于: {{ formatDateTime(project.updated_at) }}</span>
                </div>
                <button @click="handleDelete(project.id)" class="delete-project-btn" title="删除此项目">
                  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </li>
            </ul>
            <div v-else class="state-indicator">
              <span>未找到任何项目。</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue';
import { useSupabaseClient } from '#imports';

// --- 逻辑部分 (无改动) ---
const props = defineProps({ isVisible: Boolean });
const emit = defineEmits(['close', 'saveProject', 'loadProject']);
const supabase = useSupabaseClient();
const projectName = ref('');
const searchTerm = ref('');
const projects = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
watch(() => props.isVisible, (nv) => { if (nv) fetchProjects(); });
const filteredProjects = computed(() => {
  if (!searchTerm.value.trim()) return projects.value;
  const lowerCaseSearch = searchTerm.value.toLowerCase();
  return projects.value.filter(p => p.project_name.toLowerCase().includes(lowerCaseSearch));
});
function closePanel() { emit('close'); }
async function fetchProjects() {
  isLoading.value = true;
  try {
    const { data, error } = await supabase.from('projects').select('id, project_name, updated_at').order('updated_at', { ascending: false });
    if (error) throw error;
    projects.value = data;
  } catch (error) { alert(`加载项目列表失败: ${error.message}`); }
  finally { isLoading.value = false; }
}
async function handleSave() {
  isSaving.value = true;
  const existing = projects.value.find(p => p.project_name === projectName.value.trim());
  if (existing) {
    if (confirm(`已存在名为 "${projectName.value.trim()}" 的项目。您要覆盖它吗？`)) {
      emit('saveProject', { name: projectName.value.trim(), id: existing.id });
    } else { isSaving.value = false; }
  } else { emit('saveProject', { name: projectName.value.trim() }); }
}
function handleLoad(project) {
  if (confirm(`确定要加载项目 "${project.project_name}" 吗？\n当前地图上的未保存更改将会丢失。`)) {
    emit('loadProject', project.id);
  }
}
async function handleDelete(projectId) {
  if (confirm(`您确定要永久删除这个项目吗？此操作无法撤销。`)) {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
      projects.value = projects.value.filter(p => p.id !== projectId);
    } catch (error) { alert(`删除项目失败: ${error.message}`); }
  }
}
function formatDateTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('zh-CN', { dateStyle: 'short', timeStyle: 'short' });
}
function onSaveComplete() {
  isSaving.value = false;
  projectName.value = '';
  fetchProjects();
}
defineExpose({ onSaveComplete });


// ========== 核心参数调整 ==========
const cardStyle = reactive({
  width: 550,
  height: 600,
  borderRadiusPercent: 6,
  
  // 1. 大幅增加模糊，让背景彻底虚化
  frostBlurRadius: 20,
  
  // 2. 使用高不透明度的深色，确保白色字体的对比度
  tintColor: 'rgba(40, 50, 45, 0.2)', // 85%不透明度的深蓝灰色

  // 3. 将内发光改为更明显的亮白色，模拟柔和的边缘高光
  innerShadowColor: 'rgba(255, 255, 255, 0.2)',
  innerShadowBlur: 10,
  innerShadowSpread: 2,

  // 表面纹理可以柔和一些
  noiseStrength: 20,
  noiseFrequency: 0.02,
});
// =================================


const cardDynamicStyles = computed(() => {
  const borderRadiusValue = Math.min(cardStyle.width, cardStyle.height) * (cardStyle.borderRadiusPercent / 100);
  return {
    '--glass-width': `${cardStyle.width}px`,
    '--glass-height': `${cardStyle.height}px`,
    '--glass-border-radius': `${borderRadiusValue}px`,
    '--frost-blur-radius': `${cardStyle.frostBlurRadius}px`,
    '--glass-tint-color': cardStyle.tintColor,
    '--inner-shadow-color': cardStyle.innerShadowColor,
    '--inner-shadow-blur': `${cardStyle.innerShadowBlur}px`,
    '--inner-shadow-spread': `${cardStyle.innerShadowSpread}px`,
  };
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.liquid-glass-card {
  width: var(--glass-width);
  max-width: 95vw;
  height: var(--glass-height);
  max-height: 90vh;
  border-radius: var(--glass-border-radius);
  position: relative;
  isolation: isolate;
  
  /* ========== 核心样式调整 ========== */
  /* 4. 移除深色外阴影，改为更柔和、更浅的阴影 */
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08);
  /* ================================= */

  animation: slideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  display: flex;
  /* 增加一个细微的边框，让边缘更清晰 */
  border: 1px solid rgba(255, 255, 255, 0.1); 
}

/* ::before 和 ::after 伪元素负责实现玻璃效果，无需改动 */
.liquid-glass-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--glass-border-radius);
  z-index: 0;
  box-shadow: inset 0 0 var(--inner-shadow-blur) var(--inner-shadow-spread) var(--inner-shadow-color);
  background-color: var(--glass-tint-color);
}
.liquid-glass-card::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: var(--glass-border-radius);
  backdrop-filter: blur(var(--frost-blur-radius));
  -webkit-backdrop-filter: blur(var(--frost-blur-radius));
}
/* 其他样式保持不变，它们与新参数兼容得很好 */
.card-content { width: 100%; padding: 0; box-sizing: border-box; display: flex; flex-direction: column; justify-content: flex-start; position: relative; z-index: 1; color: #ffffff; }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.panel-header-save { display: flex; justify-content: space-between; align-items: center; padding: 20px 28px; flex-shrink: 0; }
.panel-header-save h3 { margin: 0; font-size: 22px; font-weight: 600; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); }
.close-btn { background: none; border: none; color: rgba(255, 255, 255, 0.7); font-size: 32px; cursor: pointer; padding: 0; line-height: 1; transition: all 0.2s ease; }
.close-btn:hover { color: #fff; transform: rotate(90deg); }
.action-section { padding: 10px 28px; }
.section-title { font-size: 16px; font-weight: 500; color: rgba(255, 255, 255, 0.85); margin-bottom: 16px; }
.save-form { display: flex; gap: 12px; align-items: center; }
.liquid-input-wrapper { position: relative; flex-grow: 1; }
.liquid-input { width: 100%; padding: 12px 16px; border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 10px; background: rgba(0, 0, 0, 0.2); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: #ffffff; font-size: 15px; transition: all 0.3s ease; box-sizing: border-box; }
.liquid-input:focus { outline: none; background: rgba(0, 0, 0, 0.3); border-color: rgba(255, 255, 255, 0.5); box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1); }
.liquid-input::placeholder { color: rgba(255, 255, 255, 0.6); }
.submit-btn { height: 46px; padding: 0 24px; border-radius: 10px; font-size: 16px; font-weight: 500; color: #ffffff; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.2); flex-shrink: 0; }
.submit-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.25); transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.loading-spinner { width: 20px; height: 20px; border: 3px solid rgba(255, 255, 255, 0.3); border-top-color: #ffffff; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(3D); } }
.project-list-container { height: 280px; overflow-y: auto; background-color: rgba(0, 0, 0, 0.2); border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.1); margin-top: 16px; padding: 8px; }
.project-list { list-style: none; padding: 0; margin: 0; }
.project-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-radius: 8px; transition: background-color 0.2s ease; }
.project-item:hover { background-color: rgba(255, 255, 255, 0.1); }
.project-info { cursor: pointer; flex-grow: 1; overflow: hidden; margin-right: 10px; }
.project-title { display: block; color: #e0e0e0; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.project-date { font-size: 12px; color: rgba(255, 255, 255, 0.6); }
.delete-project-btn { background: transparent; border: none; color: rgba(255, 255, 255, 0.6); width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s ease; }
.delete-project-btn:hover { background-color: rgba(255, 99, 99, 0.2); color: #ffcdd2; }
.state-indicator { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgba(255, 255, 255, 0.6); gap: 12px; }
.project-list-container::-webkit-scrollbar { width: 8px; }
.project-list-container::-webkit-scrollbar-track { background: transparent; }
.project-list-container::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.2); border-radius: 10px; border: 2px solid transparent; background-clip: content-box; }
.project-list-container::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.4); }
</style>