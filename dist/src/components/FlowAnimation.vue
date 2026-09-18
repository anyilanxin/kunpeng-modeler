<script setup lang="ts">
/**
 * 流程节点连线动画
 * 模拟 BPMN 流程：节点逐个亮起，光点沿连线传递
 */
const nodes = [
  { cx: 30, color: '#165DFF', delay: '0s' },
  { cx: 150, color: '#0ea5e9', delay: '0.6s' },
  { cx: 250, color: '#8b5cf6', delay: '1.2s' },
  { cx: 370, color: '#165DFF', delay: '1.8s' },
];

const segments = [
  { x1: 40, x2: 140, color: '#94bfff', dur: '2s', delay: '0.3s' },
  { x1: 160, x2: 240, color: '#7dd3fc', dur: '2s', delay: '0.9s' },
  { x1: 260, x2: 360, color: '#c4b5fd', dur: '2s', delay: '1.5s' },
];
</script>

<template>
  <div class="flow-animation">
    <svg viewBox="0 0 400 40" class="flow-svg" preserveAspectRatio="xMidYMid meet">
      <!-- 连接线 -->
      <line
        v-for="(seg, i) in segments"
        :key="`line-${i}`"
        :x1="seg.x1"
        y1="20"
        :x2="seg.x2"
        y2="20"
        :stroke="seg.color"
        stroke-width="2"
        opacity="0.25"
      />
      <!-- 光点沿连线流动 -->
      <circle
        v-for="(seg, i) in segments"
        :key="`particle-${i}`"
        cy="20"
        r="3"
        :fill="seg.color"
      >
        <animate
          attributeName="cx"
          :values="`${seg.x1};${seg.x2}`"
          :dur="seg.dur"
          :begin="seg.delay"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          :dur="seg.dur"
          :begin="seg.delay"
          repeatCount="indefinite"
        />
      </circle>
      <!-- 节点 -->
      <circle
        v-for="(node, i) in nodes"
        :key="`node-${i}`"
        :cx="node.cx"
        cy="20"
        r="6"
        :fill="node.color"
        class="flow-node"
        :style="{ animationDelay: node.delay }"
      />
      <!-- 节点外环 -->
      <circle
        v-for="(node, i) in nodes"
        :key="`ring-${i}`"
        :cx="node.cx"
        cy="20"
        r="6"
        fill="none"
        :stroke="node.color"
        stroke-width="2"
        class="flow-ring"
        :style="{ animationDelay: node.delay }"
      />
    </svg>
  </div>
</template>

<style scoped>
.flow-animation {
  width: 100%;
  max-width: 340px;
}

.flow-svg {
  width: 100%;
  height: 40px;
}

.flow-node {
  filter: drop-shadow(0 0 6px currentColor);
  animation: nodePulse 2.4s ease-in-out infinite;
  transform-origin: center;
  transform-box: fill-box;
}

.flow-ring {
  animation: ringExpand 2.4s ease-out infinite;
  transform-origin: center;
  transform-box: fill-box;
}

@keyframes nodePulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
}

@keyframes ringExpand {
  0% { opacity: 0.6; transform: scale(1); }
  100% { opacity: 0; transform: scale(2.2); }
}

@media (prefers-reduced-motion: reduce) {
  .flow-node,
  .flow-ring {
    animation: none;
  }
}
</style>
