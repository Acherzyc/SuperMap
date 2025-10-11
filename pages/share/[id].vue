<template>
  <div class="share-page-wrapper">
    <div class="header">
      <div class="header-content">
        <div class="header-title">
          <svg width="28" height="28" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M640 119.68l-256.64 96L96 122.24v674.56L384 904.32l256.64-96 287.36 93.44V227.2L640 119.68z m224 152.32v263.04l-399.36 49.28-46.08-313.6L640 187.52l224 84.48z m-704 200.32l214.4-60.16 26.24 180.48-240.64 29.44V472.32z m194.56-199.04l10.88 74.88-205.44 57.6V210.56l194.56 62.72zM160 752v-65.28l250.24-31.36 23.68 161.92-49.92 19.2-224-84.48z m479.36-11.52l-144 53.76-21.76-146.56 390.4-48.64v214.4l-224.64-72.96z" fill="#ffffff"></path><path d="M601.6 422.4l51.2 51.2 51.2-51.2c28.16-28.16 28.16-74.24 0-102.4s-74.24-28.16-102.4 0-28.16 74.24 0 102.4z" fill="#ffffff"></path></svg>
          <span>炒鸡Map</span>
        </div>
        <div class="toolbar">
          <div class="tool-group">
            <button class="tool-btn" @click="toggleMapStyle" title="切换底图"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35a2 2 0 0 1-1.35-.5l-7.2-5.4A2 2 0 0 1 3 14V8a2 2 0 0 1 1.45-1.9L10.65 2.5a2 2 0 0 1 2.7 0L19.55 6.1A2 2 0 0 1 21 8v6a2 2 0 0 1-1.45 1.9l-7.2 5.4a2 2 0 0 1-1.35.45z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><path d="M12 21.35V16M19.55 6.1L12 11.35M4.45 6.1L12 11.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg><span>影像</span></button>
            <button class="tool-btn" @click="exportAsImage" title="保存为图片"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="17 8 12 3 7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>图片</span></button>
            <button class="tool-btn" @click="toggleLabels" title="显示/隐藏标签"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>标签</span></button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="main-container">
      <div id="map-viewer" class="map-viewer"></div>
      
      <div class="bottom-panel-backdrop" :class="{ 'is-visible': isMobilePanelOpen }" @click="closeMobilePanel"></div>

      <div class="side-panel" :class="{ 'collapsed': isDesktopPanelCollapsed, 'is-open': isMobilePanelOpen }">
        <div class="panel-toggle" @click="isDesktopPanelCollapsed = !isDesktopPanelCollapsed">
          <svg width="20" height="20" viewBox="0 0 24 24" :style="{ transform: isDesktopPanelCollapsed ? 'rotate(180deg)' : 'rotate(0)' }"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>

        <div class="panel-header">
           <div class="panel-grabber"></div>
           <div class="panel-header-top-row">
            <div class="panel-title"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/></svg>数据列表</div>
             <button class="panel-close-btn-mobile" title="关闭面板" @click="closeMobilePanel">
              <svg width="20" height="20" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
           </div>
          <div class="search-box">
            <input type="text" class="search-input" v-model="searchTerm" placeholder="搜索要素名称...">
          </div>
          <div class="filter-group">
            <button class="filter-btn" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">全部</button>
            <button class="filter-btn" :class="{ active: activeFilter === 'point' }" @click="activeFilter = 'point'">点</button>
            <button class="filter-btn" :class="{ active: activeFilter === 'polyline' }" @click="activeFilter = 'polyline'">线</button>
            <button class="filter-btn" :class="{ active: activeFilter === 'polygon' }" @click="activeFilter = 'polygon'">面</button>
          </div>
        </div>

        <div class="data-list">
          <div v-if="!filteredFeatures.length" class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24"><path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.58172 6.58172 2 11 2C15.4183 2 19 5.58172 19 10C19 10.5523 19.4477 11 20 11C20.5523 11 21 10.5523 21 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/></svg>
            <h3>未找到匹配的要素</h3>
            <p>尝试修改筛选或搜索条件</p>
          </div>
          <div v-for="feature in filteredFeatures" :key="feature.id"
            class="data-item"
            :class="{ selected: selectedFeature && selectedFeature.id === feature.id, expanded: selectedFeature && selectedFeature.id === feature.id }"
            @click="selectFeatureById(feature.id)"
          >
            <div class="data-item-header">
              <div class="data-item-header-content">
                <span class="data-item-name">{{ feature.properties.name || '(未命名)' }}</span>
                <span class="data-item-type" :class="feature.type">
                  {{ { point: '点', polyline: '线', polygon: '面' }[feature.type] }}
                </span>
              </div>
              <div class="data-item-actions">
                 <button class="action-btn" title="定位" @click.stop="zoomToFeature(feature.id)"><svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg></button>
              </div>
            </div>
            <div class="data-item-details">
               <div class="data-item-card">
                 <h4>属性信息</h4>
                 <table class="info-table-display">
                   <tbody>
                     <tr v-for="(value, key) in feature.properties" :key="key">
                       <td>{{ key }}</td>
                       <td>{{ value }}</td>
                     </tr>
                   </tbody>
                 </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button id="mobilePanelToggle" class="mobile-panel-toggle-btn" title="显示/隐藏数据面板" @click="isMobilePanelOpen = !isMobilePanelOpen">
        <svg width="24" height="24" viewBox="0 0 24 24"><path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>

    <ToastNotification :message="toast.message" :type="toast.type" :is-visible="toast.visible" />
    <LoadingIndicator :is-visible="loading" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSupabaseClient } from '#imports';
import ToastNotification from '~/components/ToastNotification.vue';
import LoadingIndicator from '~/components/LoadingIndicator.vue';
/* global AMap, html2canvas */

const route = useRoute();
const supabase = useSupabaseClient();
const map = ref(null);
const loading = ref(true);
const toast = reactive({ message: '', type: 'info', visible: false });

const allFeatures = ref([]);
const selectedFeature = ref(null);
const labelsVisible = ref(true);
const isSatelliteVisible = ref(false);
let satelliteLayer = null;
let roadNetLayer = null;
let drawingLayer = null;

const searchTerm = ref('');
const activeFilter = ref('all');
const isDesktopPanelCollapsed = ref(false);
const isMobilePanelOpen = ref(false);

const filteredFeatures = computed(() => {
  let items = allFeatures.value;
  if (activeFilter.value !== 'all') {
    items = items.filter(f => f.type === activeFilter.value);
  }
  if (searchTerm.value.trim()) {
    const lowerCaseSearch = searchTerm.value.toLowerCase();
    items = items.filter(f => {
      const name = f.properties.name || '';
      return name.toLowerCase().includes(lowerCaseSearch);
    });
  }
  return items;
});

watch(labelsVisible, () => {
  allFeatures.value.forEach(feature => {
    if (feature.type === 'point' && feature.graphic) {
      feature.graphic.setContent(createMarkerContent(feature));
    }
  });
});

onMounted(() => {
  const shareId = route.params.id;
  if (!shareId) {
    loading.value = false;
    return;
  }
  const checkAMap = setInterval(() => {
    if (window.AMap && typeof window.AMap.Map === 'function') {
      clearInterval(checkAMap);
      loadMapData(shareId);
    }
  }, 100);
});

async function loadMapData(shareId) {
  try {
    const { data } = await supabase.from('shared_maps').select('map_data').eq('id', shareId).single();
    if (!data || !data.map_data) throw new Error("未找到地图数据。");
    initMap(data.map_data);
  } catch (e) {
    // silent fail
  } finally {
    loading.value = false;
  }
}

function initMap(mapData) {
  map.value = new AMap.Map('map-viewer', {
    zoom: mapData.mapView.zoom,
    center: mapData.mapView.center,
    viewMode: '2D',
    mapStyle: 'amap://styles/1b8bbb3ab585491ce8bee8fd90f016f9',
    WebGLParams: { preserveDrawingBuffer: true },
    crossOrigin: 'anonymous'
  });

  map.value.on('click', () => { 
    if(selectedFeature.value) {
      selectedFeature.value = null;
    }
   });

  map.value.on('complete', () => {
    drawingLayer = new AMap.OverlayGroup();
    map.value.add(drawingLayer);

    satelliteLayer = new AMap.TileLayer.Satellite();
    roadNetLayer = new AMap.TileLayer.RoadNet();
    map.value.add([satelliteLayer, ]);
    satelliteLayer.hide();
    roadNetLayer.hide();

    mapData.features.forEach(addFeatureToMap);

    if (allFeatures.value.length > 0) map.value.setFitView(null, false, [60, 60, 420, 60]);
  });
}

function addFeatureToMap(feature) {
    let graphic;
    const opts = { extData: { id: feature.id }, clickable: true };
    if (feature.type === 'point') {
        graphic = new AMap.Marker({ position: feature.geometry.coordinates, content: createMarkerContent(feature), offset: new AMap.Pixel(0, 0), ...opts });
    } else if (feature.type === 'polyline') {
        graphic = new AMap.Polyline({ path: feature.geometry.coordinates, ...feature.style, ...opts });
    } else if (feature.type === 'polygon') {
        graphic = new AMap.Polygon({ path: feature.geometry.coordinates, ...feature.style, ...opts });
    }
    if (graphic) {
        graphic.on('click', (e) => {
            selectFeatureById(e.target.getExtData().id);
            // 【关键修正】: 移除 e.stopPropagation()
        });
        feature.graphic = graphic;
        allFeatures.value.push(feature);
        drawingLayer.addOverlay(graphic);
    }
}

function selectFeatureById(featureId) {
    if (!featureId) {
        selectedFeature.value = null;
        return;
    }
    // Toggle selection
    if(selectedFeature.value && selectedFeature.value.id === featureId) {
      selectedFeature.value = null;
    } else {
      selectedFeature.value = allFeatures.value.find(f => f.id === featureId);
    }

    if (window.innerWidth <= 768 && selectedFeature.value) {
      isMobilePanelOpen.value = true;
    }
}

function zoomToFeature(featureId) {
    const feature = allFeatures.value.find(f => f.id === featureId);
    if (!feature) return;
    selectFeatureById(feature.id);
    if (feature.type === 'point') {
        map.value.setZoomAndCenter(16, feature.geometry.coordinates);
    } else {
        map.value.setFitView([feature.graphic], false, [60, 60, 60, 60]);
    }
    if (window.innerWidth <= 768) {
      isMobilePanelOpen.value = false;
    }
}

function closeMobilePanel() {
  isMobilePanelOpen.value = false;
}

function toggleMapStyle() {
  isSatelliteVisible.value = !isSatelliteVisible.value;
  satelliteLayer[isSatelliteVisible.value ? 'show' : 'hide']();
  roadNetLayer[isSatelliteVisible.value ? 'show' : 'hide']();
  showToast(isSatelliteVisible.value ? '已切换为卫星影像' : '已切换为标准地图', 'success');
}

function toggleLabels() {
  labelsVisible.value = !labelsVisible.value;
  showToast(labelsVisible.value ? '已显示标签' : '已隐藏标签', 'success');
}

async function exportAsImage() {
  if (typeof html2canvas === 'undefined') return;
  loading.value = true;
  const selectors = ['.header', '.side-panel', '.amap-logo', '.amap-copyright', '#mobilePanelToggle'];
  selectors.forEach(s => {
      const el = document.querySelector(s);
      if (el) el.style.visibility = 'hidden';
  });
  try {
    await new Promise(r => setTimeout(r, 500));
    const canvas = await html2canvas(document.getElementById('map-viewer'), { useCORS: true, backgroundColor: null });
    const link = document.createElement('a');
    link.download = 'WebGIS_Share_Map.png';
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast('图片导出成功', 'success');
  } catch (e) {
    // silent fail
  } finally {
    loading.value = false;
    selectors.forEach(s => {
        const el = document.querySelector(s);
        if (el) el.style.removeProperty('visibility');
    });
  }
}

function showToast(message, type = 'info') {
    toast.message = message;
    toast.type = type;
    toast.visible = true;
    setTimeout(() => { toast.visible = false; }, 3000);
}

function createMarkerContent(feature) {
  const { size = 14, labelFields = ['name'], fillColor, borderColor, opacity } = feature.style;
  const labelHtml = labelFields.map(f => feature.properties[f]).filter(Boolean).join(' ');
  const labelDisplay = labelsVisible.value && labelHtml ? 'block' : 'none';
  return `<div class="marker-container"><div class="marker-icon" style="width:${size}px; height:${size}px; background-color:${fillColor}; border:2px solid ${borderColor}; opacity:${opacity};"></div><div class="feature-label" style="display:${labelDisplay}">${labelHtml}</div></div>`;
}
</script>

<style>
/* 导入您项目中的全局样式 */
@import '~/assets/css/main.css';

/* 页面特定样式 */
.share-page-wrapper {
  display: flex; flex-direction: column; height: 100vh; width: 100vw; overflow: hidden;
}
.main-container {
  flex: 1; display: flex; position: relative; overflow: hidden;
}
.map-viewer {
  flex-grow: 1; height: 100%;
}
.info-table-display {
  width: 100%; border-collapse: collapse; background-color: white;
}
.info-table-display td {
  padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px;
  vertical-align: top; word-break: break-all;
}
.info-table-display td:first-child {
  font-weight: 500; color: #666; width: 35%;
}

/* 覆盖 side-panel 默认的 margin-right 动画, 使用 transform */
.side-panel {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
@media (min-width: 769px) {
  .side-panel.collapsed {
    transform: translateX(100%);
  }
}
</style>