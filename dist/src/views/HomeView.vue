<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import FlowAnimation from '@/components/FlowAnimation.vue';
import LogoHolo from '@/components/LogoHolo.vue';
import { createEmptyBpmn } from '@/utils/bpmn-templates';
import { createEmptyDmn } from '@/utils/dmn-templates';
import { useTabsStore } from '@/stores/tabs';

const { t } = useI18n();
const router = useRouter();
const tabsStore = useTabsStore();

function createBpmn() {
  tabsStore.openTab({
    type: 'bpmn',
    title: tabsStore.nextDefaultName('bpmn'),
    xml: createEmptyBpmn(),
  });
  router.push({ name: 'designer', params: { type: 'bpmn' } });
}

function createDmn() {
  tabsStore.openTab({
    type: 'dmn',
    title: tabsStore.nextDefaultName('dmn'),
    xml: createEmptyDmn(),
  });
  router.push({ name: 'designer', params: { type: 'dmn' } });
}
</script>

<template>
  <div class="home-view">
    <div class="welcome-hero">
      <LogoHolo />
      <h1 class="welcome-title">Process Modeler</h1>

      <!-- 流程节点动画 -->
      <FlowAnimation class="hero-flow anim-in" style="--delay: 0.1s" />

      <p class="welcome-subtitle anim-in" style="--delay: 0.2s">{{ t('home.subtitle') }}</p>
    </div>

    <div class="welcome-actions">
      <div class="create-card bpmn anim-in" style="--delay: 0.3s" @click="createBpmn">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" class="card-svg"><path d="M12.11 2l.086.002c.283.005.563.023.84.05.216.023.387.19.424.405l.273 1.585a.52.52 0 00.38.41 7.816 7.816 0 011.748.711.52.52 0 00.553-.024l1.302-.919a.484.484 0 01.585.015c.537.436 1.028.927 1.465 1.464.137.169.14.408.014.585l-.9 1.274a.52.52 0 00-.019.56c.32.556.575 1.154.753 1.784a.52.52 0 00.408.376l1.522.262a.484.484 0 01.403.425 9.956 9.956 0 01.05 1.29l-.002.071c-.008.239-.024.475-.048.71a.484.484 0 01-.403.424l-1.498.258a.522.522 0 00-.41.381 7.82 7.82 0 01-.75 1.823.52.52 0 00.021.557l.873 1.237a.484.484 0 01-.015.585 10.065 10.065 0 01-1.464 1.465.484.484 0 01-.585.014l-1.244-.878a.52.52 0 00-.55-.016 7.82 7.82 0 01-1.823.75.52.52 0 00-.381.41l-.258 1.497a.485.485 0 01-.425.404 10.06 10.06 0 01-2.07 0 .484.484 0 01-.424-.403l-.265-1.533a.521.521 0 00-.374-.398 7.796 7.796 0 01-.917-.321 7.807 7.807 0 01-.885-.425.52.52 0 00-.55.02l-1.266.893a.485.485 0 01-.585-.015 10.043 10.043 0 01-.77-.694l-.166-.17a10.08 10.08 0 01-.528-.6.484.484 0 01-.015-.585l.876-1.241a.52.52 0 00.02-.56 7.817 7.817 0 01-.758-1.82.52.52 0 00-.41-.378l-1.49-.257a.484.484 0 01-.405-.425 10.061 10.061 0 010-2.07.484.484 0 01.404-.425l1.491-.257a.52.52 0 00.41-.378c.173-.63.426-1.242.758-1.82a.52.52 0 00-.02-.56L4.22 6.284a.484.484 0 01.015-.585c.168-.207.344-.407.528-.6l.166-.17a10.021 10.021 0 01.77-.695.484.484 0 01.585-.014l1.27.896c.162.11.374.114.546.017a7.82 7.82 0 011.793-.73.52.52 0 00.382-.41l.266-1.536a.484.484 0 01.424-.404c.313-.032.627-.05.942-.053h.204zM12 6a6 6 0 100 12 6 6 0 000-12zm-2 3.135a1 1 0 011.64-.768l3.438 2.865a1 1 0 010 1.536l-3.438 2.865a1 1 0 01-1.64-.768z" fill="currentColor"></path></svg>
        </div>
        <div class="card-body">
          <div class="card-title">{{ t('home.bpmnTitle') }}</div>
          <div class="card-desc">{{ t('home.bpmnDesc') }}</div>
        </div>
        <div class="card-arrow">
          <div class="i-carbon-arrow-right"></div>
        </div>
      </div>

      <div class="create-card dmn anim-in" style="--delay: 0.4s" @click="createDmn">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" class="card-svg"><path d="M5 2.996a2 2 0 00-2 2l-.006 14.012a2 2 0 002 2h14a2 2 0 002-1.999L21 4.997a2 2 0 00-2-2.001H5zM11 11l7.994.008v2.996L11 13.996V11zm0-5.996l7.994.01v3.99L11 8.994v-3.99zm-6 0l4 .01v3.99l-4-.01v-3.99zm3.977 8.992L4.994 14v-2.996L8.977 11v2.996zM4.994 16l3.983-.004V19l-3.983.004V16zM11 19.004v-3.012l7.994.008v3.008L11 19.004z" fill="currentColor"></path></svg>
        </div>
        <div class="card-body">
          <div class="card-title">{{ t('home.dmnTitle') }}</div>
          <div class="card-desc">{{ t('home.dmnDesc') }}</div>
        </div>
        <div class="card-arrow">
          <div class="i-carbon-arrow-right"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 36px;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: var(--naive-body-color);
  background-image: radial-gradient(
    ellipse at 50% 0%,
    rgb(22 93 255 / 6%) 0%,
    transparent 60%
  );
}

/* ===== Hero 区域 ===== */
.welcome-hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.welcome-title {
  margin: 0;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -1px;
  background: linear-gradient(90deg, #165DFF, #4080FF, #8b5cf6, #165DFF);
  background-size: 200% auto;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientFlow 6s linear infinite, fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.05s both;
}

@keyframes gradientFlow {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}

.welcome-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--naive-text-color-3);
}

.hero-flow {
  margin: 4px 0;
}

/* ===== 操作卡片 ===== */
.welcome-actions {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: 460px;
}

.create-card {
  display: flex;
  gap: 20px;
  align-items: center;
  width: 100%;
  padding: 20px 24px;
  text-align: left;
  cursor: pointer;
  background: var(--naive-card-color);
  border: 1px solid var(--naive-border-color);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 6%);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.create-card:hover {
  border-color: #165DFF;
  box-shadow: 0 12px 32px rgb(0 0 0 / 12%);
  transform: translateY(-3px);
}

.card-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  font-size: 26px;
  border-radius: 12px;
}

.create-card.bpmn .card-icon {
  color: #165DFF;
  background: rgb(22 93 255 / 10%);
}

.create-card.dmn .card-icon {
  color: #8b5cf6;
  background: rgb(139 92 246 / 10%);
}

.card-svg {
  width: 26px;
  height: 26px;
}

.card-body {
  flex: 1;
}

.card-title {
  margin-bottom: 4px;
  font-size: 15px;
  font-weight: 600;
  color: var(--naive-text-color);
}

.card-desc {
  font-size: 13px;
  line-height: 1.4;
  color: var(--naive-text-color-3);
}

.card-arrow {
  font-size: 20px;
  color: var(--naive-text-color-3);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.create-card:hover .card-arrow {
  color: #165DFF;
  transform: translateX(6px);
}

/* ===== 入场动画 ===== */
.anim-in {
  opacity: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: var(--delay, 0s);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }

  .anim-in {
    opacity: 1;
  }
}
</style>
