<template>
  <div 
    class="side-panel" 
    :class="{ collapsed: isPanelCollapsed, 'is-open': isMobilePanelOpen }"
    :style="mobilePanelStyle"
    ref="sidePanelRef"
  >
    <div class="panel-toggle" @click="$emit('toggleDesktopPanel')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :style="{ transform: isPanelCollapsed ? 'rotate(180deg)' : 'rotate(0)' }"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    
    <div class="panel-header">
      <div 
        class="panel-grabber"
        @touchstart.passive="handleTouchStart"
        @touchmove.passive="handleTouchMove"
        @touchend="handleTouchEnd"
      ></div>
      <div class="panel-header-top-row">
        <div class="panel-title"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/></svg>数据管理</div>
        <button class="panel-close-btn-mobile" title="关闭面板" @click="$emit('closeMobilePanel')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <div class="search-box">
        <input type="text" class="search-input" v-model="searchTerm" placeholder="搜索要素名称...">
        <button class="search-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>搜索</button>
      </div>
      <div class="filter-group">
        <button class="filter-btn" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">全部</button>
        <button class="filter-btn" :class="{ active: activeFilter === 'point' }" @click="activeFilter = 'point'">点</button>
        <button class="filter-btn" :class="{ active: activeFilter === 'polyline' }" @click="activeFilter = 'polyline'">线</button>
        <button class="filter-btn" :class="{ active: activeFilter === 'polygon' }" @click="activeFilter = 'polygon'">面</button>
      </div>
    </div>
    
    <div class="data-list">
      <div v-if="!features.length" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.58172 6.58172 2 11 2C15.4183 2 19 5.58172 19 10C19 10.5523 19.4477 11 20 11C20.5523 11 21 10.5523 21 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/></svg>
        <h3>暂无数据</h3>
        <p>开始绘制或导入数据来创建地图要素</p>
      </div>
      <div v-else-if="!filteredFeatures.length" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.58172 6.58172 2 11 2C15.4183 2 19 5.58172 19 10C19 10.5523 19.4477 11 20 11C20.5523 11 21 10.5523 21 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/></svg>
        <h3>未找到匹配的要素</h3>
        <p>尝试修改筛选或搜索条件</p>
      </div>
      <DataItem
        v-for="feature in filteredFeatures"
        :key="feature.id"
        :data-id="feature.id"
        :feature="feature"
        :is-selected="feature.id === selectedFeatureId"
        @select-feature="$emit('featureSelected', feature.id)"
        @delete-feature="$emit('featureDeleted', feature.id)"
        @zoom-to-feature="$emit('zoomToFeature', feature.id)"
        @update-style="(styleUpdates) => $emit('updateFeatureStyle', { featureId: feature.id, styleUpdates })"
        @save-properties="(payload) => $emit('saveFeatureProperties', { featureId: feature.id, ...payload })"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import DataItem from './DataItem.vue';

const props = defineProps({
  features: Array,
  selectedFeatureId: String,
  isPanelCollapsed: Boolean,
  isMobilePanelOpen: Boolean
});

const emit = defineEmits([
  'toggleDesktopPanel', 'closeMobilePanel', 'featureSelected', 'featureDeleted',
  'zoomToFeature', 'updateFeatureStyle', 'saveFeatureProperties'
]);

const searchTerm = ref('');
const activeFilter = ref('all');
const sidePanelRef = ref(null);

// **OPTIMIZATION 2: Auto-scroll to selected item**
watch(() => props.selectedFeatureId, (newId) => {
  if (newId) {
    nextTick(() => {
      const el = sidePanelRef.value?.querySelector(`[data-id="${newId}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
});

const filteredFeatures = computed(() => {
  let items = props.features;
  if (activeFilter.value !== 'all') {
    items = items.filter(f => f.type === activeFilter.value);
  }
  if (searchTerm.value.trim()) {
    const lowerCaseSearch = searchTerm.value.toLowerCase();
    items = items.filter(f => {
      const name = f.properties.name || f.properties['项目名称'] || '';
      return name.toLowerCase().includes(lowerCaseSearch);
    });
  }
  return items;
});

// **OPTIMIZATION 3: Mobile panel drag logic**
const isDragging = ref(false);
const startY = ref(0);
const startHeight = ref(0);
const panelHeight = ref(66); // Initial height in vh

const mobilePanelStyle = computed(() => {
  if (typeof window === 'undefined' || window.innerWidth > 768) {
    return null;
  }
  return {
    height: `${panelHeight.value}vh`,
    transition: isDragging.value ? 'none' : 'height 0.3s ease',
  };
});

function handleTouchStart(e) {
  if (window.innerWidth > 768) return;
  isDragging.value = true;
  startY.value = e.touches[0].clientY;
  startHeight.value = sidePanelRef.value.offsetHeight;
}

function handleTouchMove(e) {
  if (!isDragging.value || window.innerWidth > 768) return;
  const currentY = e.touches[0].clientY;
  const deltaY = startY.value - currentY;
  const newHeight = startHeight.value + deltaY;
  
  // Convert new height to vh and clamp between 20vh and 90vh
  const newVh = (newHeight / window.innerHeight) * 100;
  panelHeight.value = Math.max(20, Math.min(90, newVh));
}

function handleTouchEnd(e) {
  if (!isDragging.value) return;
  isDragging.value = false;

  // If dragged down significantly, close the panel
  if (panelHeight.value < 40) {
    emit('closeMobilePanel');
    panelHeight.value = 66; // Reset for next open
  } else {
    // Snap to a more reasonable height
    panelHeight.value = 66;
  }
}
</script>