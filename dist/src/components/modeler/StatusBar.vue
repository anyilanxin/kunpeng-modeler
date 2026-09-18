<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useLintIssuesStore } from '@/stores/lintIssues';
import { useTabsStore } from '@/stores/tabs';
import VersionPopover from './VersionPopover.vue';

const { t } = useI18n();
const tabsStore = useTabsStore();
const lintIssuesStore = useLintIssuesStore();

const viewMode = inject<Ref<'model' | 'xml'>>('viewMode', ref('model'));
const toggleView = inject<() => void>('toggleView', () => {});

// Problems 面板开关（点击错误区域切换）
const showProblems = inject<Ref<boolean>>('showProblems', ref(false));
const toggleProblems = inject<() => void>('toggleProblems', () => {});

// 当前激活 tab 的校验问题——错误数量统计用 activeAllIssues（清空消息不影响数量）
const problems = computed(() => lintIssuesStore.activeAllIssues);

// 版本信息浮层开关
const showVersion = ref(false);
function toggleVersion() {
  showVersion.value = !showVersion.value;
}

const activeTab = computed(() => tabsStore.activeTab);
const isBpmn = computed(() => activeTab.value?.type === 'bpmn');
const isSaved = computed(() =>
  activeTab.value ? tabsStore.isTabSaved(activeTab.value.id) : true,
);

// 视图切换按钮文字（显示"另一个视图"的名称）
const toggleLabel = computed(() => {
  if (viewMode.value === 'model') {
    return t('statusbar.xmlView');
  }
  return t('statusbar.modelView');
});

const toggleTip = computed(() => {
  if (viewMode.value === 'model') {
    return t('statusbar.switchToXml');
  }
  return t('statusbar.switchToModel');
});

// 校验状态（来自当前 tab 的真实校验结果）
const errorCount = computed(() => problems.value.filter((p) => p.severity === 'error').length);
const warnCount = computed(() => problems.value.filter((p) => p.severity === 'warning').length);
const hasErrors = computed(() => problems.value.length > 0);
</script>

<template>
  <div class="statusbar" v-if="activeTab">
    <!-- 视图切换 -->
    <button
      class="seg view-toggle"
      :class="{ active: viewMode === 'xml' }"
      :title="toggleTip"
      @click="toggleView()"
    >
      <div class="vt-icon i-carbon-code"></div>
      {{ toggleLabel }}
    </button>

    <!-- 保存状态 -->
    <div class="seg">
      <span class="status-dot" :class="isSaved ? 'saved' : 'unsaved'"></span>
      {{ isSaved ? t('tabs.saved') : t('tabs.unsaved') }}
    </div>

    <!-- 规格 -->
    <div class="seg">{{ isBpmn ? 'BPMN 2.0' : 'DMN 1.3' }}</div>

    <!-- 校验报错（点击切换 Problems 面板，选中时阴影高亮） -->
    <div
      class="seg seg-lint"
      :class="{ active: showProblems }"
      :title="t('statusbar.viewErrors')"
      @click="toggleProblems()"
    >
      <template v-if="hasErrors">
        <span v-if="errorCount > 0" class="lint-item lint-error">
          <div class="i-carbon-close-outline"></div>{{ errorCount }}
        </span>
        <span v-if="warnCount > 0" class="lint-item lint-warn">
          <div class="i-carbon-warning"></div>{{ warnCount }}
        </span>
      </template>
      <span v-else class="lint-ok">
        <div class="i-carbon-checkmark-outline"></div>{{ t('statusbar.noErrors') }}
      </span>
    </div>

    <!-- 中间留空 -->
    <div class="status-spacer"></div>

    <!-- 版本信息：点击弹出版本详情浮层 -->
    <div
      class="seg version-plain"
      :class="{ active: showVersion }"
      :title="t('about.productName')"
      @click="toggleVersion()"
    >
      {{ t('app.version') }}
    </div>

    <!-- 版本信息悬浮卡片 -->
    <VersionPopover v-if="showVersion" @close="showVersion = false" />
  </div>
</template>

<style scoped>
.statusbar {
  height: 28px;
  display: flex;
  align-items: stretch;
  padding: 0;
  background: var(--naive-card-color);
  border-top: 1px solid var(--naive-border-color);
  font-size: 11px;
  color: var(--naive-text-color-3);
  flex-shrink: 0;
}

/* 统一的状态项：平铺，无竖线分隔 */
.seg {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 10px;
  white-space: nowrap;
}

/* 视图切换按钮：可点击，选中时阴影高亮 */
.view-toggle {
  border: none;
  background: transparent;
  color: var(--naive-text-color-2);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.view-toggle:hover,
.view-toggle.active {
  background: var(--naive-hover-color);
  color: var(--naive-text-color);
}

.view-toggle.active {
  box-shadow: inset 0 -2px 0 #165DFF;
}

.vt-icon {
  font-size: 13px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-dot.saved {
  background: #10b981;
}

.status-dot.unsaved {
  background: #f59e0b;
}

.status-spacer {
  flex: 1;
}

/* 校验报错整块 */
.seg-lint {
  cursor: pointer;
  gap: 8px;
}

.seg-lint:hover {
  background: var(--naive-hover-color);
}

/* 选中态：比 hover 更明显的阴影/背景，表示当前激活 */
.seg-lint.active {
  background: var(--naive-hover-color);
  box-shadow: inset 0 -2px 0 #165DFF;
}

/* 校验项：图标 + 数字，无背景色块，与状态栏其他项风格一致 */
.lint-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 500;
}

.lint-item .i-carbon-close-outline,
.lint-item .i-carbon-warning,
.lint-ok .i-carbon-checkmark-outline {
  font-size: 13px;
}

/* 图标本身着色（不再用背景色块） */
.lint-error {
  color: #ef4444;
}

.lint-warn {
  color: #f59e0b;
}

/* 无错误时绿色图标提示 */
.lint-ok {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #10b981;
}

/* 版本信息：可点击，选中时底部蓝色高亮条 */
.version-plain {
  color: var(--naive-text-color-3);
  font-weight: 400;
  cursor: pointer;
  transition: background 0.15s;
}

.version-plain:hover,
.version-plain.active {
  background: var(--naive-hover-color);
  color: var(--naive-text-color);
}

.version-plain.active {
  box-shadow: inset 0 -2px 0 #165DFF;
}
</style>
