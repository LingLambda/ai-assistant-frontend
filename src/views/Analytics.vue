<template>
  <div class="analytics-container">
    <div class="page-header">
      <h1>数据分析报表</h1>
      <p class="subtitle">AI客服系统数据分析与统计</p>
    </div>

    <!-- 时间选择器 -->
    <el-card class="time-filter-card" shadow="hover">
      <div class="time-filter">
        <el-radio-group v-model="timeRange" size="large">
          <el-radio-button label="today">今日</el-radio-button>
          <el-radio-button label="week">本周</el-radio-button>
          <el-radio-button label="month">本月</el-radio-button>
          <el-radio-button label="quarter">本季度</el-radio-button>
          <el-radio-button label="year">本年</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-model="customRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :disabled="timeRange !== 'custom'"
          @change="timeRange = 'custom'"
        />
      </div>
    </el-card>

    <!-- 数据概览 -->
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" v-for="(stat, index) in statistics" :key="index">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" :style="{ backgroundColor: stat.color }">
                <el-icon><component :is="stat.icon" /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
            <div class="stat-chart">
              <div class="mock-chart">
                <div v-for="(bar, i) in 7" :key="i" class="mock-bar"
                     :style="{ height: (20 + Math.random() * 80) + '%', backgroundColor: stat.color + '80' }">
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="chart-section">
      <el-row :gutter="20">
        <!-- 对话量趋势 -->
        <el-col :span="16">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>对话量趋势</span>
                <el-select v-model="trendType" size="small" placeholder="请选择">
                  <el-option label="日对话量" value="daily" />
                  <el-option label="周对话量" value="weekly" />
                  <el-option label="月对话量" value="monthly" />
                </el-select>
              </div>
            </template>
            <div class="trend-chart-container">
              <div class="mock-line-chart">
                <div class="chart-y-axis">
                  <div>1200</div>
                  <div>900</div>
                  <div>600</div>
                  <div>300</div>
                  <div>0</div>
                </div>
                <div class="chart-content">
                  <div class="mock-line"></div>
                  <div class="mock-area"></div>
                </div>
                <div class="chart-x-axis">
                  <span>1月</span>
                  <span>2月</span>
                  <span>3月</span>
                  <span>4月</span>
                  <span>5月</span>
                  <span>6月</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 问题分类饼图 -->
        <el-col :span="8">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>问题分类占比</span>
                <el-button type="primary" text>详情</el-button>
              </div>
            </template>
            <div class="pie-chart-container">
              <div class="mock-pie-chart">
                <div class="pie-segment segment-1"></div>
                <div class="pie-segment segment-2"></div>
                <div class="pie-segment segment-3"></div>
                <div class="pie-segment segment-4"></div>
                <div class="pie-center"></div>
              </div>
              <div class="pie-legend">
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #409EFF"></div>
                  <div class="legend-label">产品咨询 (35%)</div>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #67C23A"></div>
                  <div class="legend-label">售后服务 (25%)</div>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #E6A23C"></div>
                  <div class="legend-label">账户问题 (20%)</div>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #F56C6C"></div>
                  <div class="legend-label">其他 (20%)</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 热门问题和客服评分 -->
    <el-row :gutter="20" class="data-tables">
      <!-- 热门问题表格 -->
      <el-col :span="12">
        <el-card class="table-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>热门问题 TOP 10</span>
              <el-button type="primary" text>查看全部</el-button>
            </div>
          </template>
          <el-table :data="topQuestions" style="width: 100%" :show-header="false">
            <el-table-column width="50">
              <template #default="scope">
                <div class="rank-number" :class="{ 'top-rank': scope.row.rank <= 3 }">
                  {{ scope.row.rank }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="question" label="问题">
              <template #default="scope">
                <div class="question-text">{{ scope.row.question }}</div>
                <div class="question-count">{{ scope.row.count }}次询问</div>
              </template>
            </el-table-column>
            <el-table-column width="100" align="right">
              <template #default="scope">
                <div class="trend-tag" :class="scope.row.trend > 0 ? 'up' : 'down'">
                  <el-icon><component :is="scope.row.trend > 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
                  {{ Math.abs(scope.row.trend) }}%
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 客服评分 -->
      <el-col :span="12">
        <el-card class="table-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>客服满意度</span>
              <div class="overall-rating">
                总体评分:
                <span class="rating-value">4.8</span>
                <el-rate
                  v-model="overallRating"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template=""
                ></el-rate>
              </div>
            </div>
          </template>
          <div class="rating-stats">
            <div class="rating-bar" v-for="(rating, index) in ratings" :key="index">
              <div class="rating-label">{{ rating.stars }}星</div>
              <div class="rating-progress">
                <div class="progress-bar" :style="{ width: rating.percentage + '%', backgroundColor: rating.color }"></div>
              </div>
              <div class="rating-percentage">{{ rating.percentage }}%</div>
            </div>
          </div>
          <div class="rating-comments">
            <div class="comment-header">最新评价</div>
            <div class="rating-comment" v-for="(comment, index) in latestComments" :key="index">
              <div class="comment-user">
                <el-avatar :size="32">{{ comment.user.substring(0, 1) }}</el-avatar>
                <div class="user-info">
                  <div class="user-name">{{ comment.user }}</div>
                  <div class="comment-time">{{ comment.time }}</div>
                </div>
              </div>
              <div class="comment-rating">
                <el-rate v-model="comment.rating" disabled></el-rate>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 组件名称
defineOptions({
  name: 'AnalyticsPage'
});

// 时间范围选择
const timeRange = ref('month');
const customRange = ref([]);

// 图表类型选择
const trendType = ref('daily');

// 总体评分
const overallRating = ref(4.8);

// 统计数据
const statistics = [
  {
    label: '总对话量',
    value: '284',
    icon: 'ChatDotRound',
    color: '#409EFF'
  },
  {
    label: '用户数量',
    value: '7',
    icon: 'User',
    color: '#67C23A'
  },
  {
    label: '平均响应时间',
    value: '6.5s',
    icon: 'Timer',
    color: '#E6A23C'
  },
  {
    label: '解决率',
    value: '89.2%',
    icon: 'Finished',
    color: '#F56C6C'
  }
];

// 热门问题数据
const topQuestions = [
  { rank: 1, question: '如何申请入学？', count: 15, trend: 2 },
  { rank: 2, question: '入学条件是什么？', count: 12, trend: -1 },
  { rank: 3, question: '学费是多少？', count: 10, trend: 0 },
  { rank: 4, question: '有哪些奖学金？', count: 8, trend: 3 },
  { rank: 5, question: '如何申请奖学金？', count: 7, trend: -2 },
  { rank: 6, question: '入学申请截止日期？', count: 6, trend: 1 },
  { rank: 7, question: '需要哪些申请材料？', count: 5, trend: 0 },
  { rank: 8, question: '如何预约校园参观？', count: 4, trend: 2 },
  { rank: 9, question: '是否提供住宿？', count: 3, trend: -1 },
  { rank: 10, question: '如何联系招生办公室？', count: 2, trend: 0 }
];

// 客服评分数据
const ratings = [
  { stars: 5, percentage: 85, color: '#67C23A' },
  { stars: 4, percentage: 10, color: '#E6A23C' },
  { stars: 3, percentage: 3, color: '#F56C6C' },
  { stars: 2, percentage: 1, color: '#909399' },
  { stars: 1, percentage: 1, color: '#C0C4CC' }
];

// 最新评价
const latestComments = [
  {
    user: '用户15342',
    time: '2024-03-15 14:30',
    rating: 5,
    content: '客服反应非常迅速，问题解决得很好，感谢！'
  },
  {
    user: '用户24857',
    time: '2024-03-15 12:15',
    rating: 5,
    content: '很专业的解答，一下就解决了我的问题。'
  },
  {
    user: '用户18673',
    time: '2024-03-15 10:45',
    rating: 4,
    content: '整体还不错，就是等待时间有点长。'
  }
];
</script>

<style scoped>
.analytics-container {
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 16px;
  color: #909399;
}

.time-filter-card {
  margin-bottom: 30px;
}

.time-filter {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.stats-overview {
  margin-bottom: 30px;
}

.stat-card {
  height: 160px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  overflow: hidden;
  margin-bottom: 20px;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
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

.stat-chart {
  flex: 1;
  padding: 0 15px 10px;
}

.mock-chart {
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.mock-bar {
  width: 8px;
  border-radius: 4px 4px 0 0;
}

.chart-section {
  margin-bottom: 30px;
}

.chart-card {
  margin-bottom: 20px;
  height: 420px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trend-chart-container {
  height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mock-line-chart {
  width: 100%;
  height: 300px;
  display: flex;
  position: relative;
}

.chart-y-axis {
  width: 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #909399;
  font-size: 12px;
  padding-right: 10px;
  text-align: right;
}

.chart-content {
  flex: 1;
  position: relative;
  border-bottom: 1px solid #EBEEF5;
  border-left: 1px solid #EBEEF5;
}

.mock-line {
  position: absolute;
  width: 100%;
  height: 100%;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 300'%3E%3Cpath d='M0,240 C100,180 250,150 350,210 C450,270 550,240 650,180 C750,120 850,90 1000,150' stroke='%23409EFF' stroke-width='3' fill='none'/%3E%3C/svg%3E") no-repeat;
  background-size: 100% 100%;
}

.mock-area {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 60%;
  background: linear-gradient(to bottom, rgba(64, 158, 255, 0.2), rgba(64, 158, 255, 0));
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 300'%3E%3Cpath d='M0,240 C100,180 250,150 350,210 C450,270 550,240 650,180 C750,120 850,90 1000,150 L1000,300 L0,300 Z' fill='black'/%3E%3C/svg%3E") no-repeat;
  mask-size: 100% 100%;
}

.chart-x-axis {
  height: 30px;
  display: flex;
  justify-content: space-around;
  color: #909399;
  font-size: 12px;
  margin-top: 10px;
}

.pie-chart-container {
  height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.mock-pie-chart {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  position: relative;
  margin-bottom: 30px;
}

.pie-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  clip: rect(0, 200px, 200px, 100px);
}

.segment-1 {
  background-color: #409EFF;
  clip-path: polygon(50% 0%, 100% 0%, 100% 35%, 50% 50%);
  transform: rotate(0deg);
}

.segment-2 {
  background-color: #67C23A;
  clip-path: polygon(50% 0%, 100% 0%, 85% 85%, 50% 50%);
  transform: rotate(126deg);
}

.segment-3 {
  background-color: #E6A23C;
  clip-path: polygon(50% 0%, 100% 0%, 75% 100%, 50% 50%);
  transform: rotate(216deg);
}

.segment-4 {
  background-color: #F56C6C;
  clip-path: polygon(50% 0%, 100% 0%, 50% 100%, 50% 50%);
  transform: rotate(288deg);
}

.pie-center {
  position: absolute;
  width: 120px;
  height: 120px;
  background-color: white;
  border-radius: 50%;
  top: 40px;
  left: 40px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-label {
  font-size: 14px;
  color: #606266;
}

.data-tables {
  margin-bottom: 30px;
}

.table-card {
  margin-bottom: 20px;
  min-height: 500px;
}

.rank-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #F2F6FC;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-weight: bold;
}

.rank-number.top-rank {
  background-color: #409EFF;
  color: white;
}

.question-text {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
}

.question-count {
  font-size: 12px;
  color: #909399;
}

.trend-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  width: fit-content;
}

.trend-tag.up {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.trend-tag.down {
  background-color: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

.overall-rating {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #606266;
}

.rating-value {
  font-weight: bold;
  color: #303133;
  margin: 0 5px;
}

.rating-stats {
  padding: 20px;
}

.rating-bar {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.rating-label {
  width: 40px;
  font-size: 14px;
  color: #606266;
}

.rating-progress {
  flex: 1;
  height: 8px;
  background-color: #F2F6FC;
  border-radius: 4px;
  margin: 0 15px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;
}

.rating-percentage {
  width: 40px;
  font-size: 14px;
  color: #303133;
  text-align: right;
}

.rating-comments {
  padding: 0 20px 20px;
}

.comment-header {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 15px;
}

.rating-comment {
  padding: 15px;
  border-radius: 8px;
  background-color: #F9FAFC;
  margin-bottom: 15px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  color: #303133;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-rating {
  margin-bottom: 10px;
}

.comment-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}
</style>
