<template>
  <div
    class="data-item"
    :class="{ selected: isSelected, expanded: isSelected }"
    :data-id="feature.id"
    @click="handleItemClick"
  >
    <div class="data-item-header">
      <div class="data-item-header-content">
        <span class="data-item-name">{{ displayName }}</span>
        <span class="data-item-type" :class="feature.type">{{ typeName }}</span>
      </div>
      <div class="data-item-props" v-if="propsPreview" v-html="propsPreview"></div>
      <div class="data-item-actions">
        <button class="action-btn" title="定位" @click.stop="$emit('zoomToFeature')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg></button>
        <button v-if="!readonly" class="action-btn delete" title="删除" @click.stop="$emit('deleteFeature')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 18L18 6M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
      </div>
    </div>

    <div class="data-item-details">
      <div class="data-item-card" v-if="isSelected">

        <div v-if="readonly">
          <h4>属性信息</h4>
          <table class="info-table">
            <tbody>
              <tr v-for="prop in readonlyProperties" :key="prop.key">
                <td style="width: 35%; font-weight: 500; color: #555;">{{ prop.key }}</td>
                <td>{{ prop.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!readonly">
          <h4>属性编辑</h4>
          <table class="info-table">
            <thead>
              <tr>
                <th style="width: 25%;">属性</th>
                <th style="width: 50%;">值</th>
                <th v-if="feature.type === 'point'" style="width: 15%;">标签</th>
                <th style="width: 10%;">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(prop, index) in editableProperties" :key="index">
                <td><input type="text" v-model="prop.key"></td>
                <td><input type="text" v-model="prop.value"></td>
                <td v-if="feature.type === 'point'">
                  <input type="checkbox" v-model="prop.isLabel">
                </td>
                <td><button class="delete-row-btn" @click="deleteProperty(index)" title="删除属性">×</button></td>
              </tr>
            </tbody>
          </table>
          <button class="add-row-btn" @click="addProperty"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>添加新属性</button>
          <div class="info-actions">
            <button class="info-btn primary" @click="saveProperties"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 2.58579C3.96086 2.21071 4.46957 2 5 2H16L21 7V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 21V13H7V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 3V8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>保存属性</button>
          </div>
          
          <hr>
          <h4>样式设置</h4>
          <div class="style-controls">
              <template v-if="feature.type === 'point'">
                  <div class="style-control"><label>填充颜色</label><input type="color" :value="feature.style.fillColor" @input="$emit('updateStyle', { fillColor: $event.target.value })"></div>
                  <div class="style-control"><label>边框颜色</label><input type="color" :value="feature.style.borderColor" @input="$emit('updateStyle', { borderColor: $event.target.value })"></div>
                  <div class="style-control"><label>大小</label><input type="range" min="8" max="32" :value="feature.style.size" @input="$emit('updateStyle', { size: parseFloat($event.target.value) })"></div>
                  <div class="style-control"><label>透明度</label><input type="range" min="0" max="1" step="0.1" :value="feature.style.opacity" @input="$emit('updateStyle', { opacity: parseFloat($event.target.value) })"></div>
              </template>
              <template v-if="feature.type === 'polyline'">
                  <div class="style-control"><label>颜色</label><input type="color" :value="feature.style.color" @input="$emit('updateStyle', { color: $event.target.value })"></div>
                  <div class="style-control"><label>粗细</label><input type="range" min="1" max="10" :value="feature.style.weight" @input="$emit('updateStyle', { weight: parseFloat($event.target.value) })"></div>
                  <div class="style-control"><label>透明度</label><input type="range" min="0" max="1" step="0.1" :value="feature.style.opacity" @input="$emit('updateStyle', { opacity: parseFloat($event.target.value) })"></div>
                  <div class="style-control"><label>样式</label><select :value="feature.style.style" @change="$emit('updateStyle', { style: $event.target.value })"><option value="solid">实线</option><option value="dashed">虚线</option></select></div>
              </template>
              <template v-if="feature.type === 'polygon'">
                  <div class="style-control"><label>填充颜色</label><input type="color" :value="feature.style.fillColor" @input="$emit('updateStyle', { fillColor: $event.target.value })"></div>
                  <div class="style-control"><label>边框颜色</label><input type="color" :value="feature.style.strokeColor" @input="$emit('updateStyle', { strokeColor: $event.target.value })"></div>
                  <div class="style-control"><label>填充透明度</label><input type="range" min="0" max="1" step="0.1" :value="feature.style.fillOpacity" @input="$emit('updateStyle', { fillOpacity: parseFloat($event.target.value) })"></div>
                  <div class="style-control"><label>边框粗细</label><input type="range" min="1" max="8" :value="feature.style.strokeWeight" @input="$emit('updateStyle', { strokeWeight: parseFloat($event.target.value) })"></div>
              </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  feature: Object,
  isSelected: Boolean,
  readonly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['selectFeature', 'deleteFeature', 'zoomToFeature', 'updateStyle', 'saveProperties']);

const editableProperties = ref([]);

const readonlyProperties = computed(() => {
  if (!props.feature || !props.feature.properties) return [];
  return Object.entries(props.feature.properties)
    .map(([key, value]) => ({ key, value: value || '' }))
    .filter(prop => prop.value); // Only show properties that have a value
});

watch(() => props.isSelected, (newValue) => {
  if (newValue && props.feature && !props.readonly) {
    const labelFields = props.feature.style?.labelFields || [];
    editableProperties.value = Object.entries(props.feature.properties).map(([key, value]) => ({
      key,
      value: value || '',
      isLabel: labelFields.includes(key)
    }));
  }
}, { immediate: true });

const displayName = computed(() => props.feature.properties.name || props.feature.properties['项目名称'] || '(未命名)');
const typeName = computed(() => ({ point: '点', polyline: '线', polygon: '面' }[props.feature.type]));

const propsPreview = computed(() => {
  return Object.entries(props.feature.properties)
    .filter(([key, value]) => key !== 'name' && key !== '项目名称' && value)
    .slice(0, 2) // Show max 2 properties in preview
    .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
    .join('<br>');
});

function addProperty() {
  editableProperties.value.push({ key: `新属性${editableProperties.value.length + 1}`, value: '', isLabel: false });
}

function deleteProperty(index) {
  editableProperties.value.splice(index, 1);
}

function saveProperties() {
  const newProperties = {};
  const newLabelFields = [];
  editableProperties.value.forEach(prop => {
    if (prop.key) {
      newProperties[prop.key.trim()] = prop.value;
      if (prop.isLabel) {
        newLabelFields.push(prop.key.trim());
      }
    }
  });
  emit('saveProperties', { properties: newProperties, labelFields: newLabelFields });
}

function handleItemClick(event) {
  if (event.target.closest('.data-item-details') || event.target.closest('.data-item-actions')) {
    return;
  }
  emit('selectFeature');
}
</script>