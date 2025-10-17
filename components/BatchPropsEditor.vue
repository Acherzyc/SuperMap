<template>
  <div v-if="isVisible" class="modal-backdrop" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>批量修改属性</h3>
        <button class="close-btn" @click="close" title="关闭">×</button>
      </div>
      <div class="modal-body">
        <p class="selection-info">正在为 {{ count }} 个要素修改属性</p>

        <div class="action-type-selector">
          <button :class="{ active: actionType === 'add' }" @click="actionType = 'add'">添加/修改属性</button>
          <button :class="{ active: actionType === 'delete' }" @click="actionType = 'delete'">删除属性</button>
        </div>

        <div v-if="actionType === 'add'" class="action-form">
          <div class="form-group">
            <label for="prop-key-add">属性名</label>
            <input id="prop-key-add" type="text" v-model="add.key" placeholder="例如：负责人">
          </div>
          <div class="form-group">
            <label for="prop-value-add">属性值</label>
            <input id="prop-value-add" type="text" v-model="add.value" placeholder="例如：张三">
          </div>
           <p class="form-hint">如果属性名已存在，将更新其值；如果不存在，将添加为新属性。</p>
        </div>

        <div v-if="actionType === 'delete'" class="action-form">
          <div class="form-group">
            <label for="prop-key-delete">要删除的属性名</label>
            <input id="prop-key-delete" type="text" v-model="deleteKey" placeholder="输入要删除的属性名">
          </div>
          <p class="form-hint">此操作将从所有选中要素中移除该属性，请谨慎操作。</p>
        </div>

      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="close">取消</button>
        <button class="btn btn-primary" @click="applyChanges" :disabled="isApplyDisabled">应用</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const props = defineProps({
  isVisible: Boolean,
  count: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['close', 'apply']);

const actionType = ref('add'); // 'add' or 'delete'

const add = reactive({
  key: '',
  value: ''
});

const deleteKey = ref('');

const isApplyDisabled = computed(() => {
    if (actionType.value === 'add') {
        return !add.key.trim();
    }
    if (actionType.value === 'delete') {
        return !deleteKey.value.trim();
    }
    return true;
});


function close() {
  emit('close');
}

function applyChanges() {
  const payload = {
    action: actionType.value,
    key: actionType.value === 'add' ? add.key.trim() : deleteKey.value.trim(),
    value: add.value
  };
  emit('apply', payload);
  // Reset state
  add.key = '';
  add.value = '';
  deleteKey.value = '';
  close();
}
</script>

<style scoped>
/* Using similar styles as BatchStyleEditor for consistency */
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex; justify-content: center; align-items: center; z-index: 1200;
}
.modal-content {
  background: white; padding: 24px; border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 420px; max-width: 90vw;
  animation: slide-up 0.3s ease-out;
}
@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px; margin-bottom: 16px;
}
.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 600; }
.close-btn {
  background: none; border: none; font-size: 1.75rem; cursor: pointer;
  color: var(--text-secondary); padding: 0; line-height: 1;
}
.selection-info {
    color: var(--text-secondary); margin-bottom: 20px; font-size: 14px;
    background-color: var(--bg-secondary); padding: 8px 12px; border-radius: var(--border-radius);
}
.action-type-selector {
    display: flex;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    overflow: hidden;
    margin-bottom: 24px;
}
.action-type-selector button {
    flex: 1;
    padding: 12px;
    border: none;
    background: white;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    color: var(--text-secondary);
}
.action-type-selector button:first-child {
    border-right: 1px solid var(--border-color);
}
.action-type-selector button.active {
    background-color: var(--primary-color);
    color: white;
}
.action-form .form-group {
    margin-bottom: 16px;
}
.action-form label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
}
.action-form input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    font-size: 15px;
}
.form-hint {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 8px;
}
.modal-footer {
  display: flex; justify-content: flex-end; gap: 12px;
  margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color);
}
.btn {
  padding: 10px 20px; border: none; border-radius: var(--border-radius);
  cursor: pointer; font-size: 14px; font-weight: 500; transition: var(--transition);
}
.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.btn-secondary {
  background-color: var(--bg-color); border: 1px solid var(--border-color); color: var(--text-color);
}
.btn-secondary:hover:not(:disabled) { background-color: #e9e9e9; }
.btn-primary { background-color: var(--primary-color); color: white; }
.btn-primary:hover:not(:disabled) { background-color: var(--primary-hover); }
</style>