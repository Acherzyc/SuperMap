<template>
  <div class="loading" v-if="isVisible">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <div>正在处理...</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isVisible: Boolean
});
</script>