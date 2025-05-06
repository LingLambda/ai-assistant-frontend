<template>
  <div class="welcome-container">
    <div class="welcome-content">
      <div class="logo-container">
        <div class="logo-animation">
          <el-icon class="logo-icon"><DataAnalysis /></el-icon>
        </div>
      </div>

      <div class="welcome-card">
        <h1 class="title">欢迎进入LingLambda知识库管理平台</h1>
        <p class="subtitle">强大的知识管理与向量检索系统</p>

        <div class="features-grid">
          <div class="feature-item">
            <el-icon><Search /></el-icon>
            <span>智能检索</span>
          </div>
          <div class="feature-item">
            <el-icon><ChatDotRound /></el-icon>
            <span>语义理解</span>
          </div>
          <div class="feature-item">
            <el-icon><Connection /></el-icon>
            <span>向量化</span>
          </div>
          <div class="feature-item">
            <el-icon><Document /></el-icon>
            <span>文档管理</span>
          </div>
        </div>

        <div class="button-row">
          <el-button
            class="action-button search-button"
            type="primary"
            size="large"
            @click="toSearch"
            :icon="Search"
          >
            查询知识库
          </el-button>
          <el-button
            class="action-button manage-button"
            type="success"
            size="large"
            @click="toManager"
            :icon="Management"
          >
            管理知识库
          </el-button>
        </div>
      </div>

      <div class="version-info">
        <span>版本: v1.2.3</span>
        <span class="dot-separator">•</span>
        <span>©2023-2024 LingLambda</span>
      </div>
    </div>

    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="dots-grid"></div>
    </div>
  </div>
</template>


<script lang="ts" setup>
import { inject, onMounted, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  Search,
  Management,
  Document,
  DataAnalysis,
  ChatDotRound,
  Connection
} from '@element-plus/icons-vue';

const router = useRouter();

const activeIndex = inject<Ref<string>>('activeIndex');

onMounted(() => {
  if (activeIndex) {
    activeIndex.value = '0';
  }
})

async function toSearch() {
  if (activeIndex) {
    activeIndex.value = '1';
  }
  router.push({name:"search"})
}

async function toManager() {
  if (activeIndex) {
    activeIndex.value = '2';
  }
  router.push({name:"manager"})
}

defineOptions({
  name: "WelcomePage",
})
</script>

<style scoped>
.welcome-container {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
}

.welcome-content {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  padding: 20px;
}

.logo-container {
  margin-bottom: 30px;
}

.logo-animation {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4e6ef2 0%, #3b82f6 100%);
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
  animation: pulse 3s infinite ease-in-out;
}

.logo-icon {
  font-size: 40px;
  color: white;
}

.welcome-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
  animation: fadeInUp 0.8s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.title {
  font-size: 36px;
  font-weight: 700;
  color: #1d4ed8;
  margin: 0 0 15px 0;
  background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeIn 1s ease-out;
}

.subtitle {
  color: #64748b;
  font-size: 18px;
  margin-bottom: 40px;
  animation: fadeIn 1.2s ease-out;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
  animation: fadeIn 1.4s ease-out;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 1);
}

.feature-item .el-icon {
  font-size: 24px;
  color: #3b82f6;
}

.feature-item span {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.button-row {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
  animation: fadeIn 1.6s ease-out;
}

.action-button {
  width: 180px;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-button {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
}

.search-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(59, 130, 246, 0.3);
}

.manage-button {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
}

.manage-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(16, 185, 129, 0.3);
}

.version-info {
  margin-top: 40px;
  font-size: 14px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dot-separator {
  font-size: 12px;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.3;
}

.circle-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  top: -200px;
  right: -200px;
  animation: float 15s infinite ease-in-out;
}

.circle-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  bottom: -100px;
  left: -100px;
  animation: float 12s infinite ease-in-out reverse;
}

.circle-3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  top: 60%;
  right: 10%;
  animation: float 10s infinite ease-in-out;
}

.dots-grid {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0.5;
}

/* 动画 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(20px, 20px);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .welcome-card {
    padding: 30px 20px;
  }

  .title {
    font-size: 28px;
  }

  .subtitle {
    font-size: 16px;
    margin-bottom: 30px;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .button-row {
    flex-direction: column;
    width: 100%;
  }

  .action-button {
    width: 100%;
  }
}
</style>