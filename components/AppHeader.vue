<template>
  <div class="header">
    <div class="header-content">
      <div class="header-title">
        <svg width="32" height="32" t="1753179095637" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5892"><path d="M640 119.68l-256.64 96L96 122.24v674.56L384 904.32l256.64-96 287.36 93.44V227.2L640 119.68z m224 152.32v263.04l-399.36 49.28-46.08-313.6L640 187.52l224 84.48z m-704 200.32l214.4-60.16 26.24 180.48-240.64 29.44V472.32z m194.56-199.04l10.88 74.88-205.44 57.6V210.56l194.56 62.72zM160 752v-65.28l250.24-31.36 23.68 161.92-49.92 19.2-224-84.48z m479.36-11.52l-144 53.76-21.76-146.56 390.4-48.64v214.4l-224.64-72.96z" fill="#ffffff" p-id="5893"></path><path d="M601.6 422.4l51.2 51.2 51.2-51.2c28.16-28.16 28.16-74.24 0-102.4s-74.24-28.16-102.4 0-28.16 74.24 0 102.4z" fill="#ffffff" p-id="5894"></path></svg>
        炒鸡Map
      </div>
      <div class="toolbar">
        <div class="tool-group">
          <button class="tool-btn" :class="{ active: currentTool === 'select' }" @click="$emit('setTool', 'select')" title="选择工具"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></button>
          <button class="tool-btn" :class="{ active: currentTool === 'point' }" @click="$emit('setTool', 'point')" title="绘制点"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="4" fill="currentColor"/></svg></button>
          <button class="tool-btn" :class="{ active: currentTool === 'polyline' }" @click="$emit('setTool', 'polyline')" title="绘制线"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12L7 4L13 14L17 6L21 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></button>
          <button class="tool-btn" :class="{ active: currentTool === 'polygon' }" @click="$emit('setTool', 'polygon')" title="绘制面"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L3 7L3 17L12 22L21 17V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></button>
          <button class="tool-btn" :class="{ active: currentTool === 'ranging' }" @click="$emit('setTool', 'ranging')" title="测距工具"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12L7 8L13 14L21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="3" cy="12" r="2" fill="currentColor"/><circle cx="21" cy="6" r="2" fill="currentColor"/></svg></button>
        </div>
        <div class="tool-group">
          <button class="tool-btn" title="导入表格"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 14L12 17L15 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>导入</span><input type="file" @change="$emit('importFile', $event)" accept=".xlsx,.xls,.csv" /></button>
          <button class="tool-btn" @click="$emit('exportExcel')" title="导出表格"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 17V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 14L12 11L15 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>导出</span></button>
          <button class="tool-btn" @click="$emit('openCloudPanel')" title="云端保存/读取"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><polyline points="16 16 12 12 8 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline></svg><span>云端</span></button>
          
          <button class="tool-btn" @click="$emit('generateShareLink')" title="生成分享链接">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><polyline points="13 2 13 9 20 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline><path d="M10 9H8m6 4H8m8 4H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>
            <span>分享</span>
          </button>
          </div>
        <div class="tool-group">
          <button class="tool-btn" @click="$emit('toggleMapStyle')" title="切换底图"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35a2 2 0 0 1-1.35-.5l-7.2-5.4A2 2 0 0 1 3 14V8a2 2 0 0 1 1.45-1.9L10.65 2.5a2 2 0 0 1 2.7 0L19.55 6.1A2 2 0 0 1 21 8v6a2 2 0 0 1-1.45 1.9l-7.2 5.4a2 2 0 0 1-1.35.45z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><path d="M12 21.35V16M19.55 6.1L12 11.35M4.45 6.1L12 11.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg><span>影像</span></button>
          <button class="tool-btn" @click="$emit('saveImage')" title="保存为图片"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="17 8 12 3 7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>图片</span></button>
          <button class="tool-btn" @click="$emit('clearAll')" title="清除所有"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>清除</span></button>
          <button class="tool-btn" @click="$emit('toggleLabels')" title="显示/隐藏标签"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>标签</span></button>
        </div>
        
        <div class="tool-group user-actions">
          <button class="tool-btn logout-btn" @click="handleLogout" title="登出账户">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { useSupabaseClient, navigateTo } from '#imports';

defineProps({
  currentTool: String
});

// ========== 代码变更开始 ==========
// 确保 'generateShareLink' 在这个数组中
defineEmits([
  'setTool', 'importFile', 'exportExcel', 'openCloudPanel', 'generateShareLink',
  'toggleMapStyle', 'saveImage', 'clearAll', 'toggleLabels'
]);
// ========== 代码变更结束 ==========

const supabase = useSupabaseClient();

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('登出失败:', error);
    alert('登出时发生错误，请稍后重试。');
  } else {
    await navigateTo('/login');
  }
};
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  height: 100%;
}

.user-actions {
  margin-left: auto;
}
</style>