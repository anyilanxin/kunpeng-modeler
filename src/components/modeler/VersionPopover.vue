<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <!-- 透明遮罩：点击外部关闭 -->
  <div class="version-popover-overlay" @click="$emit('close')">
    <!-- 悬浮卡片：阻止冒泡，避免点卡片内部误关闭 -->
    <div class="version-popover" @click.stop>
      <!-- 关闭按钮 -->
      <button class="vp-close" :title="t('problems.close')" @click="$emit('close')">
        <div class="i-carbon-close"></div>
      </button>

      <!-- 产品名 + 版本号 -->
      <div class="vp-header">
        <div class="vp-logo i-carbon-cube-view"></div>
        <div class="vp-title-block">
          <div class="vp-product">{{ t('about.productName') }}</div>
          <div class="vp-version">{{ t('about.versionLabel') }} {{ t('app.version') }}</div>
        </div>
      </div>

      <!-- 正文描述 -->
      <p class="vp-desc">{{ t('about.description') }}</p>

      <!-- 版权 -->
      <div class="vp-copyright">{{ t('about.copyright') }}</div>
    </div>
  </div>
</template>

<script lang="ts">
// 定义 emits（单独的 script 块，避免与 setup 冲突）
export default {
  emits: ['close'],
};
</script>

<style scoped>
/* 透明遮罩：覆盖整个视口，点击关闭浮层 */
.version-popover-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  /* 透明但可点击，用于捕获外部点击 */
}

/* 悬浮卡片：固定在右下角，状态栏上方 */
.version-popover {
  position: absolute;
  right: 12px;
  bottom: 36px;
  width: 320px;
  padding: 18px 18px 16px;
  background: var(--naive-card-color);
  border: 1px solid var(--naive-border-color);
  border-radius: 10px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
  animation: vp-fade-in 0.16s ease;
}

@keyframes vp-fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 关闭按钮 */
.vp-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: var(--naive-text-color-3);
  cursor: pointer;
  font-size: 15px;
  transition: all 0.15s;
}

.vp-close:hover {
  background: var(--naive-hover-color);
  color: var(--naive-text-color);
}

/* 头部：图标 + 产品名/版本 */
.vp-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 24px;
}

.vp-logo {
  font-size: 34px;
  color: #165DFF;
  flex-shrink: 0;
}

.vp-title-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vp-product {
  font-size: 16px;
  font-weight: 600;
  color: var(--naive-text-color);
}

.vp-version {
  font-size: 12px;
  color: var(--naive-text-color-3);
}

/* 正文描述 */
.vp-desc {
  margin: 14px 0 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--naive-text-color-2);
}

/* 版权 */
.vp-copyright {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--naive-border-color);
  font-size: 11px;
  color: var(--naive-text-color-3);
}
</style>
