<template>
  <div class="app-wrapper">
    <AppHeader
      :current-tool="currentTool"
      @set-tool="setTool"
      @import-file="handleFileImport"
      @export-excel="exportToExcel"
      @open-cloud-panel="isCloudPanelVisible = true"

      @generate-share-link="shareToCloud"

      @toggle-map-style="toggleMapStyle"
      @save-image="exportAsImage"
      @clear-all="clearAll"
      @toggle-labels="toggleLabels"
    />

    <div class="main-container">
      <div id="map" :class="{ 'drawing-mode': isDrawingMode }"></div>

      <button id="mobilePanelToggle" class="mobile-panel-toggle-btn" title="显示/隐藏数据面板" @click="toggleMobilePanel">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>

      <div id="bottomPanelBackdrop" class="bottom-panel-backdrop" :class="{ 'is-visible': isMobilePanelOpen }" @click="closeMobilePanel"></div>

      <SidePanel
        :features="features"
        :selected-feature-id="selectedFeature?.id"
        :is-panel-collapsed="isDesktopPanelCollapsed"
        :is-mobile-panel-open="isMobilePanelOpen"
        @toggle-desktop-panel="toggleDesktopPanel"
        @close-mobile-panel="closeMobilePanel"
        @feature-selected="selectFeatureById"
        @feature-deleted="deleteFeature"
        @zoom-to-feature="zoomToFeature"
        @update-feature-style="updateFeatureStyle"
        @save-feature-properties="saveFeatureProperties"
      />

      <div class="coordinates">经度: <span>{{ mouseCoords.lng }}</span> | 纬度: <span>{{ mouseCoords.lat }}</span></div>
      <div class="draw-tip" v-show="drawTipText">{{ drawTipText }}</div>
    </div>

    <LoadingIndicator :is-visible="isLoading" />
    <ToastNotification :message="toast.message" :type="toast.type" :is-visible="toast.visible" />

    <CloudSyncPanel
      ref="cloudPanelRef"
      :is-visible="isCloudPanelVisible"
      @close="isCloudPanelVisible = false"
      @save-project="handleSaveProject"
      @load-project="handleLoadProject"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import DrawingToolbar from '~/components/DrawingToolbar.vue';
import CloudSyncPanel from '~/components/CloudSyncPanel.vue';
import { useSupabaseClient, useSupabaseUser } from '#imports';
/* global AMap, XLSX, html2canvas */

// --- STATE MANAGEMENT ---
const map = ref(null);
const features = ref([]);
const selectedFeature = ref(null);
const currentTool = ref('select');
const isLoading = ref(false);
const toast = reactive({ message: '', type: 'info', visible: false });
const mouseCoords = reactive({ lng: '--', lat: '--' });

// === FINAL OPTIMIZATION: AMap.MouseTool integration ===
let mouseTool = null; 
// ======================================================

// Drawing state
const isDrawing = ref(false); // This will now be controlled by MouseTool
let drawingLayer = null;

// UI State
const labelsVisible = ref(true);
const isDesktopPanelCollapsed = ref(false);
const isMobilePanelOpen = ref(false);

// Other
let featureIdCounter = 1;
let rangingTool = null;
let isSatelliteVisible = ref(false);

// Map Layers
let satelliteLayer = null;
let roadNetLayer = null;
const customMapStyle = 'amap://styles/1b8bbb3ab585491ce8bee8fd90f016f9';

// Supabase and cloud sync panel state
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const isCloudPanelVisible = ref(false);
const cloudPanelRef = ref(null);

const defaultStyles = {
    point: { fillColor: '#FF4444', borderColor: '#000000', size: 14, opacity: 1, labelFields: ['name'] },
    polyline: { color: '#0066FF', weight: 3, opacity: 0.8, style: 'solid' },
    polygon: { fillColor: '#00AA00', fillOpacity: 0.3, strokeColor: '#00AA00', strokeWeight: 2, strokeOpacity: 0.8 }
};

// --- COMPUTED PROPERTIES ---
const isDrawingMode = computed(() => ['point', 'polyline', 'polygon'].includes(currentTool.value));
const drawTipText = computed(() => {
    if (!isDrawingMode.value || currentTool.value === 'select') return '';
    const tips = {
        point: '点击地图添加点标注',
        polyline: '点击地图开始绘制线段, 双击或右键结束',
        polygon: '点击地图开始绘制多边形, 双击或右键结束'
    };
    return tips[currentTool.value];
});

// --- LIFECYCLE HOOK ---
onMounted(() => {
  const checkAMap = setInterval(() => {
    if (window.AMap && typeof window.AMap.Map === 'function') {
      clearInterval(checkAMap);
      init();
    }
  }, 100);
});

onBeforeUnmount(() => {
    map.value?.destroy();
    document.removeEventListener('keydown', handleGlobalKeyDown);
});

// --- METHODS ---

async function init() {
  try {
    await initMap();
    bindGlobalEvents();
    showToast('系统初始化完成', 'success');
  } catch (error) {
    console.error('系统初始化失败:', error);
    showToast(`系统初始化失败: ${error.message}`, 'error');
  }
}

function initMap() {
  return new Promise((resolve, reject) => {
    try {
      map.value = new AMap.Map('map', {
        zoom: 12,
        center: [113.323587, 23.106573],
        viewMode: '2D',
        mapStyle: customMapStyle,
        WebGLParams: { preserveDrawingBuffer: true },
        crossOrigin: 'anonymous'
      });

      map.value.on('complete', () => {
        drawingLayer = new AMap.OverlayGroup();
        map.value.add(drawingLayer);

        satelliteLayer = new AMap.TileLayer.Satellite();
        roadNetLayer = new AMap.TileLayer.RoadNet();
        map.value.add([satelliteLayer, roadNetLayer]);
        satelliteLayer.hide();
        roadNetLayer.hide();
        
        // === FINAL OPTIMIZATION: Initialize MouseTool ===
        AMap.plugin(['AMap.Scale', 'AMap.RangingTool', 'AMap.MouseTool'], () => {
          map.value.addControl(new AMap.Scale());
          rangingTool = new AMap.RangingTool(map.value);
          
          mouseTool = new AMap.MouseTool(map.value);
          mouseTool.on('draw', handleDrawComplete);
        });
        // ===============================================

        map.value.on('mousemove', handleMapMouseMove);
        
        // The click, dblclick, and rightclick handlers are now managed by MouseTool for drawing.
        // We only need a general click for feature selection.
        map.value.on('click', (e) => {
            if (currentTool.value === 'select' && e.target?.getExtData?.().id) {
                selectFeatureById(e.target.getExtData().id);
            }
        });

        resolve();
      });

      map.value.on('error', (e) => reject(new Error('地图加载失败')));

    } catch (error) {
      reject(error);
    }
  });
}


function bindGlobalEvents() {
    document.addEventListener('keydown', handleGlobalKeyDown);
}

const handleGlobalKeyDown = (e) => {
    if (e.key === 'Escape') {
        if (isDrawing.value) {
            cancelDrawing();
        }
        closeMobilePanel();
        isCloudPanelVisible.value = false;
    } else if (e.key === 'Delete' && selectedFeature.value) {
        deleteFeature(selectedFeature.value.id);
    }
};

const handleMapMouseMove = (e) => {
    if (e.lnglat) {
        mouseCoords.lng = e.lnglat.getLng().toFixed(6);
        mouseCoords.lat = e.lnglat.getLat().toFixed(6);
    }
};

// --- Tooling & Drawing ---

function setTool(tool) {
    // Always close any active tool before starting a new one
    if (mouseTool) {
        mouseTool.close(true); // true means close and remove the drawing
    }
    isDrawing.value = false;
    
    currentTool.value = tool;

    // Stop ranging tool if active
    rangingTool?.turnOff(true);

    switch (tool) {
        case 'point':
            mouseTool.marker({
                content: createMarkerContent({ style: defaultStyles.point, properties: {} }),
                offset: new AMap.Pixel(0, 0),
            });
            isDrawing.value = true;
            break;
        case 'polyline':
            mouseTool.polyline({
                strokeColor: defaultStyles.polyline.color,
                strokeWeight: defaultStyles.polyline.weight,
                strokeOpacity: defaultStyles.polyline.opacity,
                strokeStyle: 'solid',
            });
            isDrawing.value = true;
            break;
        case 'polygon':
            mouseTool.polygon({
                fillColor: defaultStyles.polygon.fillColor,
                fillOpacity: defaultStyles.polygon.fillOpacity,
                strokeColor: defaultStyles.polygon.strokeColor,
                strokeWeight: defaultStyles.polygon.strokeWeight,
            });
            isDrawing.value = true;
            break;
        case 'ranging':
            rangingTool?.turnOn();
            showToast('测距工具已启用', 'success');
            break;
        case 'select':
            // MouseTool is already closed, do nothing.
            break;
    }
    closeMobilePanel();
}


function handleDrawComplete(event) {
    const obj = event.obj; // The drawn graphic object (Marker, Polyline, Polygon)
    let featureData = {};
    let type = '';

    // Determine type and extract geometry
    if (obj instanceof AMap.Marker) {
        type = 'point';
        const position = obj.getPosition();
        featureData.geometry = { coordinates: [position.getLng(), position.getLat()] };
    } else if (obj instanceof AMap.Polyline) {
        type = 'polyline';
        const path = obj.getPath().map(p => [p.getLng(), p.getLat()]);
        featureData.geometry = { coordinates: path };
    } else if (obj instanceof AMap.Polygon) {
        type = 'polygon';
        const path = obj.getPath().map(p => [p.getLng(), p.getLat()]);
        featureData.geometry = { coordinates: path };
    }

    if (type) {
        const feature = {
            id: 'feature_' + featureIdCounter++,
            type: type,
            geometry: featureData.geometry,
            properties: { name: `${{point:'点',polyline:'线',polygon:'面'}[type]}${features.value.filter(f => f.type === type).length + 1}` },
            style: JSON.parse(JSON.stringify(defaultStyles[type]))
        };
        
        // Remove the temporary graphic drawn by MouseTool
        mouseTool.close(false); // false keeps the overlay on map, but we will add our own permanent one
        map.value.remove(obj);
        
        // Add our own feature which is managed by our state
        addFeature(feature);
        showToast('添加成功', 'success');
    }
    
    // Reset tool to select mode after drawing
    setTool('select');
}


function cancelDrawing() {
    if (mouseTool) {
        mouseTool.close(true); // true will clear the drawing
    }
    isDrawing.value = false;
    setTool('select'); // Revert to select tool
}

function finishDrawing() {
    if (mouseTool) {
        mouseTool.close(false); // false will trigger the 'draw' event
    }
    // The rest is handled by handleDrawComplete
}


// --- Feature Management (largely unchanged) ---

function addFeature(feature) {
    if (features.value.some(f => f.id === feature.id)) return;
    let graphic;
    const commonOptions = { extData: { id: feature.id }, clickable: true };

    if (feature.type === 'point') {
        graphic = new AMap.Marker({
            position: feature.geometry.coordinates,
            content: createMarkerContent(feature),
            offset: new AMap.Pixel(0, 0),
            draggable: true,
            ...commonOptions
        });
        graphic.on('dragend', (e) => {
            const pos = e.target.getPosition();
            const f = features.value.find(item => item.id === e.target.getExtData().id);
            if(f) f.geometry.coordinates = [pos.getLng(), pos.getLat()];
        });
    } else if (feature.type === 'polyline') {
        graphic = new AMap.Polyline({
            path: feature.geometry.coordinates,
            strokeColor: feature.style.color, strokeWeight: feature.style.weight,
            strokeOpacity: feature.style.opacity, strokeStyle: feature.style.style,
            ...commonOptions
        });
    } else if (feature.type === 'polygon') {
        graphic = new AMap.Polygon({
            path: feature.geometry.coordinates,
            fillColor: feature.style.fillColor, fillOpacity: feature.style.fillOpacity,
            strokeColor: feature.style.strokeColor, strokeWeight: feature.style.strokeWeight,
            ...commonOptions
        });
    }

    if (graphic) {
        graphic.on('click', (e) => {
          if (currentTool.value === 'select') selectFeatureById(e.target.getExtData().id)
        });
        feature.graphic = graphic;
        features.value.push(feature);
        drawingLayer.addOverlay(graphic);

        const numericId = parseInt(String(feature.id).replace('feature_', ''));
        if (!isNaN(numericId) && numericId >= featureIdCounter) {
            featureIdCounter = numericId + 1;
        }
    }
}

function selectFeatureById(featureId) {
    if (!featureId) {
        selectedFeature.value = null;
        return;
    }
    const feature = features.value.find(f => f.id === featureId);
    if (selectedFeature.value?.id === featureId) {
      selectedFeature.value = null;
      if (window.innerWidth <= 768) closeMobilePanel();
    } else {
      selectedFeature.value = feature;
      if (window.innerWidth <= 768) openMobilePanel();
      if (isDesktopPanelCollapsed.value) isDesktopPanelCollapsed.value = false;
    }
}

function deleteFeature(featureId) {
    if (!confirm('确定要删除这个要素吗？')) return;
    const index = features.value.findIndex(f => f.id === featureId);
    if (index === -1) return;

    if (features.value[index] && features.value[index].graphic) {
      drawingLayer.removeOverlay(features.value[index].graphic); // Use drawingLayer to remove
    }

    features.value.splice(index, 1);

    if (selectedFeature.value?.id === featureId) selectedFeature.value = null;
    
    closeMobilePanel();
    showToast('删除成功', 'success');
}

function zoomToFeature(featureId) {
    const feature = features.value.find(f => f.id === featureId);
    if (!feature) return;
    selectedFeature.value = feature;
    if (feature.type === 'point') {
        map.value.setZoomAndCenter(16, feature.geometry.coordinates);
    } else {
        map.value.setFitView([feature.graphic], false, [60, 60, 60, 60]);
    }
    if (window.innerWidth <= 768) closeMobilePanel();
}

function clearAll() {
    if (!features.value.length) return showToast('没有数据可清除', 'warning');
    if (confirm(`确定要清除所有 ${features.value.length} 个要素吗？这不会影响云端已保存的项目。`)) {
        drawingLayer.clearOverlays();
        features.value = [];
        selectedFeature.value = null;
        closeMobilePanel();
        showToast('已清除所有要素', 'success');
    }
}

// --- Style & Property Updates ---

function updateFeatureStyle({ featureId, styleUpdates }) {
    const feature = features.value.find(f => f.id === featureId);
    if (!feature) return;

    Object.assign(feature.style, styleUpdates);

    if (feature.type === 'point') {
        feature.graphic.setContent(createMarkerContent(feature));
    } else if (feature.type === 'polyline') {
        feature.graphic.setOptions({ strokeColor: feature.style.color, strokeWeight: feature.style.weight, strokeOpacity: feature.style.opacity, strokeStyle: feature.style.style });
    } else if (feature.type === 'polygon') {
        feature.graphic.setOptions({ fillColor: feature.style.fillColor, fillOpacity: feature.style.fillOpacity, strokeColor: feature.style.strokeColor, strokeWeight: feature.style.strokeWeight });
    }
}

function saveFeatureProperties({ featureId, properties, labelFields }) {
    const feature = features.value.find(f => f.id === featureId);
    if (!feature) return;

    feature.properties = properties;
    if (feature.type === 'point') {
        feature.style.labelFields = labelFields;
        feature.graphic.setContent(createMarkerContent(feature));
    }
    showToast('属性保存成功', 'success');
}

// --- Data I/O ---

async function handleSaveProject(payload) {
  if (!user.value) return showToast('请先登录', 'error');
  const serializableFeatures = features.value.map(({ graphic, ...rest }) => rest);
  const projectData = { user_id: user.value.id, project_name: payload.name, map_data: serializableFeatures };

  try {
    const query = payload.id 
      ? supabase.from('projects').update({ map_data: projectData.map_data, project_name: projectData.project_name }).eq('id', payload.id)
      : supabase.from('projects').insert(projectData);
    
    const { error } = await query;
    if (error) throw error;
    showToast(`项目 "${payload.name}" 保存成功！`, 'success');
    cloudPanelRef.value?.onSaveComplete();
  } catch (error) {
    showToast(`保存失败: ${error.message}`, 'error');
    cloudPanelRef.value?.onSaveComplete();
  }
}

async function handleLoadProject(projectId) {
  isLoading.value = true;
  isCloudPanelVisible.value = false;
  try {
    const { data, error } = await supabase.from('projects').select('map_data').eq('id', projectId).single();
    if (error) throw error;

    drawingLayer.clearOverlays();
    features.value = [];
    selectedFeature.value = null;

    const parsedFeatures = data.map_data || [];
    if (Array.isArray(parsedFeatures) && parsedFeatures.length > 0) {
      parsedFeatures.forEach(addFeature);
      setTimeout(() => map.value.setFitView(null, false, [60, 60, 60, 60]), 200);
      showToast(`成功加载了 ${parsedFeatures.length} 个要素`, 'success');
    } else {
      showToast('该项目为空，未加载任何要素', 'info');
    }
  } catch (error) {
    showToast(`加载项目失败: ${error.message}`, 'error');
  } finally {
    isLoading.value = false;
  }
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (typeof XLSX === 'undefined') return showToast('Excel处理库未加载', 'error');
    isLoading.value = true;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            if (!firstSheetName) {
                throw new Error('Excel文件中没有找到任何工作表');
            }
            const data = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);
            const parsedFeatures = parseDataToFeatures(data);
            if (parsedFeatures.length === 0) throw new Error('未找到有效数据');
            parsedFeatures.forEach(addFeature);
            setTimeout(() => map.value.setFitView(), 200);
            showToast(`成功导入 ${parsedFeatures.length} 个点`, 'success');
        } catch (error) {
            showToast(`文件导入失败: ${error.message}`, 'error');
        } finally {
            isLoading.value = false;
            event.target.value = ''; 
        }
    };
    reader.readAsBinaryString(file);
}

function parseDataToFeatures(data) {
    const parsed = [];
    const lngFields = ['经度', 'longitude', 'lng', 'lon', 'x'];
    const latFields = ['纬度', 'latitude', 'lat', 'y'];

    data.forEach(row => {
        let lng = null, lat = null;
        const findCoord = (fields) => {
            for (const field of fields) {
                const key = Object.keys(row).find(k => k.toLowerCase() === field);
                if (key && !isNaN(parseFloat(row[key]))) return parseFloat(row[key]);
            }
            return null;
        };
        lng = findCoord(lngFields);
        lat = findCoord(latFields);

        if (lng !== null && lat !== null) {
            const properties = { ...row };
            if (!properties.name) properties.name = properties['项目名称'] || properties['Name'] || `导入点 ${parsed.length + 1}`;
            parsed.push({
                id: 'feature_' + featureIdCounter++, type: 'point',
                geometry: { coordinates: [lng, lat] },
                properties: properties,
                style: JSON.parse(JSON.stringify(defaultStyles.point))
            });
        }
    });
    return parsed;
}

function exportToExcel() {
    if (!features.value.length) return showToast('没有数据可导出', 'warning');
    const data = features.value.map(f => {
        const row = { ...f.properties, '类型': f.type };
        if (f.type === 'point') {
            row['经度'] = f.geometry.coordinates[0];
            row['纬度'] = f.geometry.coordinates[1];
        } else {
            row['坐标点'] = f.geometry.coordinates.map(c => c.join(',')).join(';');
        }
        return row;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'WebGIS数据');
    XLSX.writeFile(wb, `WebGIS_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('导出Excel成功', 'success');
}

async function shareToCloud() {
    if (!user.value) {
        return showToast('请先登录才能分享', 'warning');
    }
    if (!features.value.length) {
        return showToast('没有数据可分享', 'warning');
    }
    isLoading.value = true;
    try {
        const serializableFeatures = features.value.map(({ graphic, ...rest }) => rest);
        const mapDataToShare = {
            mapView: { center: map.value.getCenter().toJSON(), zoom: map.value.getZoom() },
            features: serializableFeatures
        };

        const uploadData = {
            map_data: mapDataToShare,
            user_email: user.value.email, 
        };

        const { data, error } = await supabase
            .from('shared_maps')
            .insert(uploadData)
            .select('id')
            .single();

        if (error) throw error;

        if (data && data.id) {
            const shareableLink = `${window.location.origin}/share/${data.id}`;
            navigator.clipboard.writeText(shareableLink);
            showToast('分享链接已成功创建并复制到剪贴板！', 'success');
        } else {
            throw new Error('未能获取到分享ID。');
        }

    } catch (error) {
        showToast(`分享失败: ${error.message}`, 'error');
    } finally {
        isLoading.value = false;
    }
}

async function exportAsImage() {
    if (typeof html2canvas === 'undefined') return showToast('导出库加载失败', 'error');
    isLoading.value = true;
    const elementsToHide = ['.header', '.side-panel', '.coordinates', '.draw-tip', '.amap-logo', '.amap-copyright', '#mobilePanelToggle', '.drawing-toolbar'];
    elementsToHide.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.style.visibility = 'hidden';
    });
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const canvas = await html2canvas(document.getElementById('map'), { useCORS: true, backgroundColor: null });
        downloadFile(canvas.toDataURL("image/png"), `WebGIS_Map.png`);
        showToast('图片导出成功', 'success');
    } catch (error) {
        showToast(`导出图片失败: ${error.message}`, 'error');
    } finally {
        isLoading.value = false;
        elementsToHide.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) el.style.visibility = 'visible';
        });
    }
}

// --- UI & UX Helpers ---

function toggleDesktopPanel() { isDesktopPanelCollapsed.value = !isDesktopPanelCollapsed.value; }
function toggleMobilePanel() { isMobilePanelOpen.value ? closeMobilePanel() : openMobilePanel(); }
function openMobilePanel() { isMobilePanelOpen.value = true; }
function closeMobilePanel() { isMobilePanelOpen.value = false; selectedFeature.value = null; }

function showToast(message, type = 'info') {
    toast.message = message;
    toast.type = type;
    toast.visible = true;
    setTimeout(() => { toast.visible = false; }, 3000);
}

function toggleLabels() {
    labelsVisible.value = !labelsVisible.value;
    features.value.forEach(feature => {
        if (feature.type === 'point' && feature.graphic) {
            feature.graphic.setContent(createMarkerContent(feature));
        }
    });
    showToast(labelsVisible.value ? '已显示标签' : '已隐藏标签', 'success');
}

function toggleMapStyle() {
    if (!map.value || !satelliteLayer || !roadNetLayer) return;
    isSatelliteVisible.value = !isSatelliteVisible.value;
    if (isSatelliteVisible.value) {
        satelliteLayer.show();
        roadNetLayer.show();
        showToast('已切换为卫星影像', 'success');
    } else {
        satelliteLayer.hide();
        roadNetLayer.hide();
        showToast('已切换为标准地图', 'success');
    }
}

// --- UTILITIES ---

function escapeHTML(str) {
    return str?.toString().replace(/[&<>"']/g, (match) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[match])) || '';
}

function createMarkerContent(feature) {
    const size = feature.style.size || 14;
    const labelFields = feature.style.labelFields || (feature.properties.name ? ['name'] : []);
    const labelHtml = labelFields.map(field => escapeHTML(feature.properties[field])).filter(text => text).join(' ');
    const labelDisplay = labelsVisible.value && labelHtml ? 'block' : 'none';
    return `<div class="marker-container"><div class="marker-icon" style="width:${size}px; height:${size}px; background-color:${feature.style.fillColor}; border:2px solid ${feature.style.borderColor}; opacity:${feature.style.opacity};"></div><div class="feature-label" style="display:${labelDisplay}">${labelHtml}</div></div>`;
}

function downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = contentType ? new Blob([content], { type: contentType }) : content;
    a.href = contentType ? URL.createObjectURL(file) : content;
    a.download = fileName;
    a.click();
    if(contentType) URL.revokeObjectURL(a.href);
}

</script>

<style scoped>
.app-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.main-container {
  height: 100%;
}
/* Make cursor more intuitive when drawing */
#map.drawing-mode {
    cursor: crosshair;
}
</style>