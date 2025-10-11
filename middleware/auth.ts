// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser();

  // 如果用户未登录，并且尝试访问的不是登录页面，则重定向到登录页
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login');
  }
});