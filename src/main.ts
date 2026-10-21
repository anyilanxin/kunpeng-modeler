import { createApp } from 'vue';

import i18n, { t } from '@/locales';
import router from '@/router';
import { createPinia } from 'pinia';

import App from './App.vue';

import 'virtual:uno.css';
import '@/styles/modeler-base.css';
import '@/styles/modeler-dark.css';

const app = createApp(App);

// 捕获组件渲染和模块加载阶段的错误，打印到 console
app.config.errorHandler = (err, _instance, info) => {
  console.error('[Vue ErrorHandler]', info, err);
};
window.addEventListener('error', (event) => {
  console.error('[window error]', event.error ?? event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('[unhandled rejection]', event.reason);
});

app.use(createPinia());
app.use(router);
app.use(i18n);

// 挂载全局 $t 方法，虽然 vue-i18n 插件已经自动挂载了 $t，但为了符合用户要求显式二次封装
app.config.globalProperties.$t = t;

app.mount('#app');
