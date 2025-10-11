<template>
  <div class="drawing-toolbar">
    <button class="drawing-toolbar-btn finish" @click="$emit('finishDrawing')" title="完成绘制">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <button class="drawing-toolbar-btn cancel" @click="$emit('cancelDrawing')" title="取消绘制">
       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
       </svg>
    </button>
  </div>
</template>

<script setup>
defineEmits(['finishDrawing', 'cancelDrawing']);
</script>