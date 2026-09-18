<script setup lang="ts">
/**
 * Logo + 全息旋转环动画
 * Logo 上下浮动，外围两层圆环不同方向旋转
 */
</script>

<template>
  <div class="logo-container">
    <svg class="holo-ring" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="54" fill="none" stroke="#4080FF" stroke-width="1.5"
        stroke-dasharray="8 4 2 4 12 4" opacity="0.5" />
    </svg>
    <svg class="holo-ring holo-ring-2" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="48" fill="none" stroke="#165DFF" stroke-width="1"
        stroke-dasharray="20 6 4 6" opacity="0.35" />
    </svg>
    <div class="logo-box">
      <div class="i-carbon-cloud-service-management"></div>
    </div>
  </div>
</template>

<style scoped>
.logo-container {
  position: relative;
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.logo-box {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  font-size: 30px;
  color: #fff;
  background: linear-gradient(135deg, #4080FF, #165DFF);
  border-radius: 15px;
  box-shadow:
    0 0 24px rgb(22 93 255 / 40%),
    0 8px 20px rgb(22 93 255 / 25%),
    inset 0 1px 0 rgb(255 255 255 / 20%);
  animation: logoFloat 3.5s ease-in-out infinite;
}

.holo-ring {
  position: absolute;
  width: 96px;
  height: 96px;
  animation: ringRotate1 14s linear infinite;
}

.holo-ring-2 {
  width: 84px;
  height: 84px;
  animation: ringRotate2 10s linear infinite reverse;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes ringRotate1 {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes ringRotate2 {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  .logo-box,
  .holo-ring,
  .holo-ring-2 {
    animation: none;
  }
}
</style>
