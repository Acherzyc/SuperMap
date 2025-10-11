<template>
  <div v-if="isVisible" class="toast" :class="type">
    {{ message }}
  </div>
</template>

<script setup>
import { watch, ref } from 'vue';

const props = defineProps({
  isVisible: Boolean,
  message: String,
  type: String
});

const internalVisible = ref(props.isVisible);

watch(() => props.isVisible, (newValue) => {
  internalVisible.value = newValue;
});
</script>

<style scoped>
/* Scoped styles can be added here if needed, but global styles from main.css will apply */
</style>