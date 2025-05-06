<template>
  <div class="dashboard-container">
    <div class="welcome-section">
      <h1>欢迎使用 AI 智能客服系统</h1>
      <p class="subtitle">企业版 V3.2 · 今日是 {{ currentDate }}</p>
    </div>

    <!-- 数据概览卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6" v-for="(stat, index) in statistics" :key="index">
          <el-card class="stat-card" :body-style="{ padding: '20px' }" shadow="hover">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
            <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
              <el-icon><component :is="stat.trend > 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
              <span>{{ Math.abs(stat.trend) }}%</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 系统状态和活动 -->
    <el-row :gutter="20" class="dashboard-content">
      <!-- 左侧图表 -->
      <el-col :span="16">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>对话量趋势</span>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-placeholder">
            <div class="chart-mock">
              <div class="chart-line"></div>
              <div class="chart-line"></div>
              <div class="chart-line"></div>
              <div class="chart-line"></div>
              <div class="chart-line"></div>
              <div class="chart-line"></div>
              <div class="chart-line"></div>
            </div>
            <div class="chart-labels">
              <span>周一</span>
              <span>周二</span>
              <span>周三</span>
              <span>周四</span>
              <span>周五</span>
              <span>周六</span>
              <span>周日</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧系统状态 -->
      <el-col :span="8">
        <el-card class="status-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>系统状态</span>
              <el-tag type="success" size="small">运行正常</el-tag>
            </div>
          </template>
          <div class="status-list">
            <div class="status-item" v-for="(status, index) in systemStatus" :key="index">
              <div class="status-label">
                <el-icon><component :is="status.icon" /></el-icon>
                <span>{{ status.label }}</span>
              </div>
              <div class="status-value" :class="status.status">
                {{ status.value }}
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="activity-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
              <el-button type="primary" text>查看全部</el-button>
            </div>
          </template>
          <div class="activity-list">
            <div class="activity-item" v-for="(activity, index) in recentActivities" :key="index">
              <div class="activity-icon" :style="{ backgroundColor: activity.color }">
                <el-icon><component :is="activity.icon" /></el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  ChatDotRound, User, Files, DataAnalysis,
  Cpu, Connection, Monitor, DataLine
} from '@element-plus/icons-vue';

// 当前日期
const currentDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
});

// 时间范围选择
const timeRange = ref('week');

// 统计数据
const statistics = [
  {
    label: '今日对话量',
    value: '1,286',
    icon: 'ChatDotRound',
    color: '#409EFF',
    trend: 12.5
  },
  {
    label: '活跃用户',
    value: '342',
    icon: 'User',
    color: '#67C23A',
    trend: 8.2
  },
  {
    label: '知识库条目',
    value: '5,678',
    icon: 'Files',
    color: '#E6A23C',
    trend: 3.1
  },
  {
    label: '平均响应时间',
    value: '0.8s',
    icon: 'DataAnalysis',
    color: '#F56C6C',
    trend: -5.2
  }
];

// 系统状态
const systemStatus = [
  {
    label: 'CPU使用率',
    value: '32%',
    icon: 'Cpu',
    status: 'normal'
  },
  {
    label: '内存使用率',
    value: '45%',
    icon: 'Monitor',
    status: 'normal'
  },
  {
    label: 'API调用次数',
    value: '12,345',
    icon: 'Connection',
    status: 'normal'
  },
  {
    label: '系统负载',
    value: '低',
    icon: 'DataLine',
    status: 'normal'
  }
];

// 最近活动
const recentActivities = [
  {
    title: '新增知识库条目',
    time: '10分钟前',
    icon: 'Files',
    color: '#409EFF'
  },
  {
    title: '系统更新完成',
    time: '30分钟前',
    icon: 'Monitor',
    color: '#67C23A'
  },
  {
    title: '新用户注册',
    time: '1小时前',
    icon: 'User',
    color: '#E6A23C'
  },
  {
    title: 'API调用异常',
    time: '2小时前',
    icon: 'Connection',
    color: '#F56C6C'
  }
];
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.welcome-section {
  margin-bottom: 30px;
  text-align: center;
}

.welcome-section h1 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 16px;
  color: #909399;
}

.stats-cards {
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon .el-icon {
  font-size: 24px;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-trend {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
}

.stat-trend.up {
  color: #67C23A;
  background-color: rgba(103, 194, 58, 0.1);
}

.stat-trend.down {
  color: #F56C6C;
  background-color: rgba(245, 108, 108, 0.1);
}

.dashboard-content {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px 0;
}

.chart-mock {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 0 20px;
}

.chart-line {
  width: 40px;
  background: linear-gradient(to top, #409EFF, #a0cfff);
  border-radius: 4px 4px 0 0;
  animation: grow 1.5s ease-out;
}

.chart-line:nth-child(1) { height: 60%; }
.chart-line:nth-child(2) { height: 80%; }
.chart-line:nth-child(3) { height: 40%; }
.chart-line:nth-child(4) { height: 70%; }
.chart-line:nth-child(5) { height: 90%; }
.chart-line:nth-child(6) { height: 50%; }
.chart-line:nth-child(7) { height: 75%; }

@keyframes grow {
  from { height: 0; }
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  padding: 10px 20px;
  color: #909399;
  font-size: 12px;
}

.status-card {
  margin-bottom: 20px;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.status-value {
  font-weight: 500;
}

.status-value.normal {
  color: #67C23A;
}

.status-value.warning {
  color: #E6A23C;
}

.status-value.danger {
  color: #F56C6C;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-icon .el-icon {
  font-size: 18px;
  color: white;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #909399;
}
</style>
