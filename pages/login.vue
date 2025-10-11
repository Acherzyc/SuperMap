<template>
  <div class="auth-container">
    <svg style="display: none;">
      <defs>
        <filter id="glass-distortion">
          <feTurbulence type="fractalNoise" :baseFrequency="`${containerStyle.noiseFrequency} ${containerStyle.noiseFrequency}`" numOctaves="2" seed="92" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
          <feDisplacementMap in="SourceGraphic" in2="blurred" :scale="containerStyle.noiseStrength" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>

    <div 
      class="liquid-glass-card" 
      :style="cardDynamicStyles"
    >
      <div class="card-content">
        <div class="auth-header">
          <transition name="fade" mode="out-in">
            <h1 :key="isLogin" class="main-title">{{ isLogin ? '欢迎回来' : '创建账户' }}</h1>
          </transition>
          <transition name="fade" mode="out-in">
            <p :key="isLogin" class="subtitle">{{ isLogin ? '登录到您的账户' : '开始您的旅程' }}</p>
          </transition>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="input-group">
            <div class="liquid-input-wrapper">
              <input type="email" placeholder="邮箱地址" v-model="form.email" class="liquid-input" :class="{ error: errors.email }" @blur="validateEmail" @focus="clearErrors('email')" />
            </div>
            <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
          </div>

          <div class="input-group">
            <div class="liquid-input-wrapper">
              <input type="password" placeholder="密码 (至少6位)" v-model="form.password" class="liquid-input" :class="{ error: errors.password }" @blur="validatePassword" @focus="clearErrors('password')" />
            </div>
            <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
          </div>

          <button type="submit" :disabled="loading || !isFormValid" class="submit-btn">
            <div v-if="loading" class="loading-spinner"></div>
            <transition name="fade" mode="out-in">
                <span :key="isLogin">{{ isLogin ? '登录' : '注册' }}</span>
            </transition>
          </button>
        </form>

        <div class="auth-switch">
          <button @click="toggleMode" :disabled="loading" class="switch-btn">
            <transition name="fade" mode="out-in">
                <span :key="isLogin" class="switch-text">{{ isLogin ? '没有账户？注册新账号' : '已有账户？立即登录' }}</span>
            </transition>
          </button>
        </div>

        <transition name="message-fade">
          <div v-if="notification.message" :class="['message-container', notification.type]">
            <div class="message-icon">{{ notification.type === 'error' ? '⚠️' : '✅' }}</div>
            <span class="message-text">{{ notification.message }}</span>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watchEffect } from 'vue';
import { useSupabaseClient, useSupabaseUser, navigateTo } from '#imports';

// 用户满意的最终参数
const containerStyle = reactive({
  width: 400,
  height: 580,
  borderRadiusPercent: 10,
  // 1. 大幅增加模糊，让背景彻底虚化
  frostBlurRadius: 0,
  // 2. 使用高不透明度的深色，确保白色字体的对比度
  tintColor: 'rgba(255, 255, 255, 0)', // 85%不透明度的深蓝灰色
  // 3. 将内发光改为更明显的亮白色，模拟柔和的边缘高光
  innerShadowColor: 'rgba(255, 255, 255, 0.2)',
  innerShadowBlur: 10,
  innerShadowSpread: 2,

  // 表面纹理可以柔和一些
  noiseStrength: 20,
  noiseFrequency: 0.02,
});

const cardDynamicStyles = computed(() => {
  const borderRadiusValue = Math.min(containerStyle.width, containerStyle.height) * (containerStyle.borderRadiusPercent / 100);
  return {
    '--glass-width': `${containerStyle.width}px`,
    '--glass-height': `${containerStyle.height}px`,
    '--glass-border-radius': `${borderRadiusValue}px`,
    '--frost-blur-radius': `${containerStyle.frostBlurRadius}px`,
    '--inner-shadow-color': containerStyle.innerShadowColor,
    '--inner-shadow-blur': `${containerStyle.innerShadowBlur}px`,
    '--inner-shadow-spread': `${containerStyle.innerShadowSpread}px`,
    '--glass-tint-color': containerStyle.tintColor,
  };
});

// --- 表单逻辑 ---
const form = reactive({ email: '', password: '' });
const errors = reactive({ email: '', password: '' });
const notification = reactive({ type: '', message: '' });
const loading = ref(false);
const isLogin = ref(true);
const supabase = useSupabaseClient();
const user = useSupabaseUser();

watchEffect(() => { if (user.value) navigateTo('/'); });

const isFormValid = computed(() => form.email && form.password && !errors.email && !errors.password);

const validateEmail = () => { errors.email = !form.email ? '请输入邮箱地址' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '请输入有效的邮箱地址' : ''; };

const validatePassword = () => { errors.password = !form.password ? '请输入密码' : form.password.length < 6 ? '密码至少需要6位' : ''; };

const clearErrors = (field) => { if (field && errors[field]) errors[field] = ''; notification.message = ''; };

const resetForm = () => { form.email = ''; form.password = ''; errors.email = ''; errors.password = ''; notification.message = ''; };

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  resetForm();
};

const handleSubmit = async () => {
  validateEmail();
  validatePassword();
  if (!isFormValid.value) return;

  loading.value = true;
  notification.message = '';
  
  try {
    const authMethod = isLogin.value ? 'signInWithPassword' : 'signUp';
    const { error } = await supabase.auth[authMethod]({ email: form.email, password: form.password });
    if (error) throw error;
    if (!isLogin.value) { 
      notification.type = 'success';
      notification.message = '注册成功！请检查您的邮箱进行验证。'; 
    }
  } catch (error) {
    notification.type = 'error';
    if (error.message.includes('Invalid login credentials')) {
      notification.message = '邮箱或密码错误，请重试。';
    } else if (error.message.includes('User already registered')) {
      notification.message = '该邮箱地址已被注册。';
    } else {
      notification.message = error.message;
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-image: url('/background.jpg');
  background-size: cover;
  background-position: center;
  font-family: 'Helvetica Neue', sans-serif;
  overflow: hidden;
  box-sizing: border-box;
}

.liquid-glass-card {
  width: var(--glass-width);
  max-width: 95vw;
  height: var(--glass-height);
  max-height: 95vh;
  border-radius: var(--glass-border-radius);
  position: relative;
  isolation: isolate;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  display: flex;
}

/* ::before 是辉光层，z-index 为 0 */
.liquid-glass-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--glass-border-radius);
  z-index: 0; 
  box-shadow: inset 0 0 var(--inner-shadow-blur) var(--inner-shadow-spread) var(--inner-shadow-color);
  background-color: var(--glass-tint-color);
}

/* ::after 是背景模糊层，z-index 为 -1 (在辉光层之后) */
.liquid-glass-card::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: var(--glass-border-radius);
  backdrop-filter: blur(var(--frost-blur-radius));
  -webkit-backdrop-filter: blur(var(--frost-blur-radius));
  filter: url(#glass-distortion);
  -webkit-filter: url(#glass-distortion);
}

/* 关键修复：提升内容区的层级，确保它在辉光层之上，从而可以被点击 */
.card-content {
  width: 100%;
  padding: 40px 32px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
  position: relative; /* 使 z-index 生效 */
  z-index: 1;         /* 提升层级至 1，高于 ::before 的 0 */
}


@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

.auth-header { text-align: center; margin-bottom: 32px; }
.main-title { font-size: 28px; font-weight: 600; margin-bottom: 8px; color: #ffffff; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); }
.subtitle { font-size: 16px; color: rgba(255, 255, 255, 0.85); font-weight: 300; }
.auth-form { margin-bottom: 24px; }
.input-group { margin-bottom: 20px; }
.liquid-input-wrapper { position: relative; }
.liquid-input { width: 100%; padding: 14px 18px; border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 12px; background: rgba(0, 0, 0, 0.2); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: #ffffff; font-size: 16px; transition: all 0.3s ease; box-sizing: border-box; }
.liquid-input:focus { outline: none; background: rgba(0, 0, 0, 0.3); border-color: rgba(255, 255, 255, 0.5); box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1); }
.liquid-input::placeholder { color: rgba(255, 255, 255, 0.6); }
.liquid-input.error { border-color: rgba(255, 99, 99, 0.7); }
.error-text { display: block; color: #ffcdd2; font-size: 13px; margin-top: 6px; padding-left: 4px; }
.submit-btn { width: 100%; height: 50px; padding: 0 18px; border-radius: 12px; font-size: 17px; font-weight: 500; color: #ffffff; cursor: pointer; transition: all 0.3s ease; margin-top: 10px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.2); }
.submit-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.25); transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.loading-spinner { width: 24px; height: 24px; border: 3px solid rgba(255, 255, 255, 0.3); border-top-color: #ffffff; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.auth-switch { text-align: center; margin-bottom: 16px; }
.switch-btn { background: none; border: none; cursor: pointer; transition: background 0.3s ease; padding: 8px 12px; border-radius: 8px; }
.switch-btn:hover { background: rgba(0, 0, 0, 0.15); }
.switch-text { font-size: 14px; color: rgba(255, 255, 255, 0.8); text-decoration: none; }
.message-container { display: flex; align-items: center; padding: 12px 16px; border-radius: 10px; margin-top: 16px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); }
.message-container.error { background: rgba(255, 99, 99, 0.2); }
.message-container.success { background: rgba(76, 175, 80, 0.2); }
.message-icon { margin-right: 10px; font-size: 18px; }
.message-text { color: #ffffff; font-size: 14px; font-weight: 500; }

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style global>
  html, body { margin: 0; padding: 0; box-sizing: border-box; overflow: hidden; }
</style>