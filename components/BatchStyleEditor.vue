<template>
  <div v-if="isVisible" class="modal-backdrop" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>批量修改样式</h3>
        <button class="close-btn" @click="close" title="关闭">×</button>
      </div>
      <div class="modal-body">
        <p class="selection-info">正在为 {{ count }} 个要素修改样式</p>

        <div class="style-section">
          <h4>通用样式</h4>
          <div class="style-controls">
            <div class="style-control"><label>边框/线条颜色</label><input type="color" v-model="styles.strokeColor"></div>
            <div class="style-control"><label>边框/线条粗细</label><input type="range" min="1" max="10" v-model="styles.strokeWeight"></div>
            <div class="style-control"><label>填充颜色</label><input type="color" v-model="styles.fillColor"></div>
            <div class="style-control"><label>填充透明度</label><input type="range" min="0" max="1" step="0.1" v-model="styles.fillOpacity"></div>
          </div>
        </div>

        <div class="style-section">
          <h4>点样式</h4>
          <div class="style-controls">
            <div class="style-control"><label>大小</label><input type="range" min="8" max="32" v-model="styles.pointSize"></div>
          </div>
        </div>
        
        <div class="style-section">
          <h4>线样式</h4>
          <div class="style-controls">
             <div class="style-control"><label>样式</label>
                <select v-model="styles.lineStyle">
                    <option value="solid">实线</option>
                    <option value="dashed">虚线</option>
                </select>
            </div>
          </div>
        </div>

      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="close">取消</button>
        <button class="btn btn-primary" @click="applyStyles">应用</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const props = defineProps({
  isVisible: Boolean,
  count: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['close', 'apply']);

const styles = reactive({
  strokeColor: '#000000',
  strokeWeight: 2,
  fillColor: '#FFFFFF',
  fillOpacity: 0.5,
  pointSize: 14,
  lineStyle: 'solid'
});

function close() {
  emit('close');
}

function applyStyles() {
  const styleUpdates = {
    // Universal
    strokeColor: styles.strokeColor,
    strokeWeight: parseFloat(styles.strokeWeight),
    fillColor: styles.fillColor,
    fillOpacity: parseFloat(styles.fillOpacity),
    
    // Aliases for different feature types
    color: styles.strokeColor, // for polylines
    weight: parseFloat(styles.strokeWeight), // for polylines
    borderColor: styles.strokeColor, // for points

    // Point specific
    size: parseFloat(styles.pointSize),

    // Polyline specific
    style: styles.lineStyle,
  };
  emit('apply', styleUpdates);
  close();
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
}
.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 400px;
  max-width: 90vw;
  animation: slide-up 0.3s ease-out;
}
@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
  margin-bottom: 16px;
}
.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  line-height: 1;
}
.selection-info {
    color: var(--text-secondary);
    margin-bottom: 20px;
    font-size: 14px;
    background-color: var(--bg-secondary);
    padding: 8px 12px;
    border-radius: var(--border-radius);
}
.style-section {
    margin-bottom: 20px;
}
.style-section h4 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 12px;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
}
.style-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.style-control {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.style-control label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}
.style-control input,
.style-control select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}
.style-control input[type="color"] {
    height: 38px;
    padding: 4px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition);
}
.btn-secondary {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  color: var(--text-color);
}
.btn-secondary:hover {
  background-color: #e9e9e9;
}
.btn-primary {
  background-color: var(--primary-color);
  color: white;
}
.btn-primary:hover {
  background-color: var(--primary-hover);
}
</style>