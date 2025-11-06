<template>
  <div class="media-menu-backdrop" @click.self="$emit('close')">
    <div class="media-menu-grid">
      <button class="media-btn" @click="$emit('selectMedia', 'image/*')">
        <div class="media-icon">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5z"></path></svg>
        </div>
        <span>图片</span>
      </button>

      <button class="media-btn" @click="$emit('selectMedia', 'video/*')">
        <div class="media-icon">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11z"></path></svg>
        </div>
        <span>视频</span>
      </button>

      <button class="media-btn" @click="$emit('selectMedia', 'audio/*')">
        <div class="media-icon">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2s2-.9 2-2V5c0-1.1-.9-2-2-2m-1 10.1V17c0 .55.45 1 1 1s1-.45 1-1v-3.9c1.73-.43 3-1.95 3-3.82V5h-2v4.28c0 1.54-1.16 2.79-2.68 2.82zM5 10v2c0 3.53 2.61 6.43 6 6.92V22h2v-3.08c3.39-.49 6-3.39 6-6.92v-2h-2v2c0 2.76-2.24 5-5 5s-5-2.24-5-5v-2z"></path></svg>
        </div>
        <span>录音</span>
      </button>
      
      <button class="media-btn" @click="$emit('selectMedia', '*/*')">
        <div class="media-icon">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8zm-1 13H7v-2h6zm0-4H7v-2h6zm-2-4V3.5L18.5 9H13z"></path></svg>
        </div>
        <span>文件</span>
      </button>
      </div>
  </div>
</template>

<script setup>
defineEmits(['close', 'selectMedia']);
</script>

<style scoped>
.media-menu-backdrop {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.media-menu-grid {
  background-color: #2c2c2c;
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.media-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #e0e0e0;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.media-icon {
  width: 56px;
  height: 56px;
  background-color: #444;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-icon svg {
  width: 28px;
  height: 28px;
  color: #fff;
}
</style>