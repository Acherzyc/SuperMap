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

      <div id="map-search-container">
        <div class="search-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2.5"/><path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <input type="text" id="search-input" placeholder="搜索地点...">
        <div id="search-results-panel"></div>
      </div>
      <div class="bottom-panel-backdrop" :class="{ 'is-visible': panelState.isMobilePanelOpen }" @click="panelActions.closeMobilePanel"></div>
      
      <SidePanel
        :features="allFeatures"
        :selected-feature-id="selectedFeatureId"
        :is-panel-collapsed="panelState.isDesktopPanelCollapsed"
        :is-mobile-panel-open="panelState.isMobilePanelOpen"
        :readonly="true" 
        @toggle-desktop-panel="panelActions.toggleDesktopPanel"
        @close-mobile-panel="panelActions.closeMobilePanel"
        @feature-selected="selectFeatureById"
        @zoom-to-feature="zoomToFeature"
      />
      
      <button id="mobilePanelToggle" class="mobile-panel-toggle-btn" title="显示/隐藏数据面板" @click="panelActions.toggleMobilePanel">
        <svg width="24" height="24" viewBox="0 0 24 24"><path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>

    <ToastNotification :message="toast.message" :type="toast.type" :is-visible="toast.visible" />
    <LoadingIndicator :is-visible="loading" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { useSupabaseClient } from '#imports';
import ToastNotification from '~/components/ToastNotification.vue';
import LoadingIndicator from '~/components/LoadingIndicator.vue';
import SidePanel from '~/components/SidePanel.vue';
/* global AMap, html2canvas */

const route = useRoute();
const supabase = useSupabaseClient();
const map = ref(null);
const loading = ref(true);
const toast = reactive({ message: '', type: 'info', visible: false });

const allFeatures = ref([]);
const selectedFeatureId = ref(null);
const labelsVisible = ref(true);
const isSatelliteVisible = ref(false);
let satelliteLayer, roadNetLayer, drawingLayer, placeSearch;

// --- Responsive Panel Logic ---
function useResponsivePanel(selectedIdRef) {
  const isMobileView = ref(window.innerWidth <= 768);
  const panelState = reactive({ isDesktopPanelCollapsed: false, isMobilePanelOpen: false });
  const handleResize = () => { isMobileView.value = window.innerWidth <= 768; };
  onMounted(() => window.addEventListener('resize', handleResize));
  onBeforeUnmount(() => window.removeEventListener('resize', handleResize));
  const panelActions = {
    openPanelForSelection() {
      if (isMobileView.value) panelState.isMobilePanelOpen = true;
      else panelState.isDesktopPanelCollapsed = false;
    },
    toggleDesktopPanel() { panelState.isDesktopPanelCollapsed = !panelState.isDesktopPanelCollapsed; },
    toggleMobilePanel() {
        panelState.isMobilePanelOpen = !panelState.isMobilePanelOpen;
        if (!panelState.isMobilePanelOpen) selectedIdRef.value = null;
    },
    closeMobilePanel() {
        panelState.isMobilePanelOpen = false;
        selectedIdRef.value = null;
    },
    deselectAndClose() {
        selectedIdRef.value = null;
        if (isMobileView.value) panelState.isMobilePanelOpen = false;
    }
  };
  return { panelState, panelActions };
}

const { panelState, panelActions } = useResponsivePanel(selectedFeatureId);

onMounted(() => {
  const shareId = route.params.id;
  if (!shareId) {
    loading.value = false;
    showToast("无效的分享链接", "error");
    return;
  }
  
  const checkAMap = setInterval(() => {
    if (window.AMap && typeof window.AMap.Map === 'function' && typeof window.AMap.PlaceSearch === 'function') {
      clearInterval(checkAMap);
      loadMapData(shareId);
    }
  }, 100);
});

async function loadMapData(shareId) {
  try {
    const { data, error } = await supabase.from('shared_maps').select('map_data').eq('id', shareId).single();
    if (error) throw error;
    if (!data || !data.map_data) {
        throw new Error("分享的地图数据不存在或已被删除。");
    }
    initMap(data.map_data);
    initSearch(); // <-- 新增: 初始化搜索
  } catch (e) {
    showToast(`加载失败: ${e.message}`, 'error');
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

  map.value.on('click', (e) => { 
    if (!e.target?.getExtData?.().id) panelActions.deselectAndClose();
  });

  map.value.on('complete', () => {
    drawingLayer = new AMap.OverlayGroup();
    map.value.add(drawingLayer);

    satelliteLayer = new AMap.TileLayer.Satellite();
    roadNetLayer = new AMap.TileLayer.RoadNet();
    map.value.add([satelliteLayer, roadNetLayer]);
    satelliteLayer.hide();
    roadNetLayer.hide();

    mapData.features.forEach(addFeatureToMap);

    if (allFeatures.value.length > 0) map.value.setFitView(null, false, [60, 60, 420, 60]);
  });
}

function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResultsPanel = document.getElementById('search-results-panel');

    const autoComplete = new AMap.AutoComplete({
        input: searchInput,
        panel: searchResultsPanel,
        city: '全国'
    });

    placeSearch = new AMap.PlaceSearch({
        map: map.value,
        panel: searchResultsPanel,
        autoFitView: true
    });

    autoComplete.on('select', (e) => {
        placeSearch.setCity(e.poi.adcode);
        placeSearch.search(e.poi.name, (status, result) => {
            if (status === 'complete' && result.info === 'OK') {
                if (result.poiList.pois.length > 0) {
                    map.value.setZoomAndCenter(15, result.poiList.pois[0].location);
                }
            }
        });
        searchInput.value = '';
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
            e.stopPropagation();
        });
        feature.graphic = graphic;
        allFeatures.value.push(feature);
        drawingLayer.addOverlay(graphic);
    }
}

function selectFeatureById(featureId) {
    if (!featureId || selectedFeatureId.value === featureId) {
        panelActions.deselectAndClose();
    } else {
        selectedFeatureId.value = featureId;
        panelActions.openPanelForSelection();
    }
}

function zoomToFeature(featureId) {
    const feature = allFeatures.value.find(f => f.id === featureId);
    if (!feature) return;
    selectFeatureById(featureId);
    if (feature.type === 'point') {
        map.value.setZoomAndCenter(16, feature.geometry.coordinates);
    } else {
        map.value.setFitView([feature.graphic], false, [60, 60, 60, 60]);
    }
    if (window.innerWidth <= 768) {
      panelActions.closeMobilePanel();
    }
}

function toggleMapStyle() {
  isSatelliteVisible.value = !isSatelliteVisible.value;
  satelliteLayer[isSatelliteVisible.value ? 'show' : 'hide']();
  roadNetLayer[isSatelliteVisible.value ? 'show' : 'hide']();
  showToast(isSatelliteVisible.value ? '已切换为卫星影像' : '已切换为标准地图', 'success');
}

function toggleLabels() {
  labelsVisible.value = !labelsVisible.value;
    allFeatures.value.forEach(feature => {
    if (feature.type === 'point' && feature.graphic) {
      feature.graphic.setContent(createMarkerContent(feature));
    }
  });
  showToast(labelsVisible.value ? '已显示标签' : '已隐藏标签', 'success');
}

async function exportAsImage() {
  if (typeof html2canvas === 'undefined') return;
  loading.value = true;
  const selectors = ['.header', '.side-panel', '.amap-logo', '.amap-copyright', '#mobilePanelToggle', '#map-search-container'];
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
</style>