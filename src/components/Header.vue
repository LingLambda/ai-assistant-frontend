<template>
  <el-container>
    <el-header style="height: auto">
      <el-menu :default-active="activeIndex" :ellipsis="false" mode="horizontal" @select="handleSelect" background-color="#001529" text-color="#fff" active-text-color="#409EFF">
        <el-menu-item index="0" class="logo-container">
          <img class="logo" src="../assets/images/logo.png" alt="Logo" @click="router.push({ name: 'welcome' })" style="height: 80%;">
          <span class="system-title">AI智能客服系统 <el-tag size="small" type="success">企业版 V3.2</el-tag></span>
        </el-menu-item>
        <div class="spacer"></div>

        <!-- 首页 -->
        <el-menu-item index="dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>系统首页</span>
        </el-menu-item>

        <!-- 客服模块 -->
        <el-sub-menu index="customer-service">
          <template #title>
            <el-icon><Service /></el-icon>
            <span>客服中心</span>
          </template>
          <el-menu-item index="4">
            <el-icon><ChatDotRound /></el-icon>
            <span>AI客服对话</span>
          </el-menu-item>
          <el-menu-item index="customer-analytics">
            <el-icon><DataAnalysis /></el-icon>
            <span>对话分析</span>
          </el-menu-item>
          <el-menu-item index="service-config">
            <el-icon><Setting /></el-icon>
            <span>客服配置</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 知识库模块 -->
        <el-sub-menu index="knowledge">
          <template #title>
            <el-icon><Files /></el-icon>
            <span>知识库</span>
          </template>
          <el-menu-item index="1">
            <el-icon><Search /></el-icon>
            <span>知识检索</span>
          </el-menu-item>
          <el-menu-item index="2">
            <el-icon><Management /></el-icon>
            <span>知识管理</span>
          </el-menu-item>
          <el-menu-item index="vector-search">
            <el-icon><Connection /></el-icon>
            <span>向量检索</span>
            <el-tag size="small" type="success">新</el-tag>
          </el-menu-item>
        </el-sub-menu>

        <!-- 数据分析 -->
        <!-- <el-sub-menu index="data">
          <template #title>
            <el-icon><Histogram /></el-icon>
            <span>数据中心</span>
          </template>
          <el-menu-item index="analytics">
            <el-icon><TrendCharts /></el-icon>
            <span>分析报表</span>
          </el-menu-item>
          <el-menu-item index="statistics">
            <el-icon><PieChart /></el-icon>
            <span>统计数据</span>
          </el-menu-item>
          <el-menu-item index="export">
            <el-icon><Download /></el-icon>
            <span>数据导出</span>
          </el-menu-item>
        </el-sub-menu> -->

        <!-- 系统管理 -->
        <el-sub-menu index="admin">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
            <el-tag size="small" type="danger" v-if="user.roleId >= 2">管理员</el-tag>
          </template>
          <el-menu-item index="user-management">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="roles">
            <el-icon><Lock /></el-icon>
            <span>角色权限</span>
          </el-menu-item>
          <el-menu-item index="system-log">
            <el-icon><Document /></el-icon>
            <span>系统日志</span>
          </el-menu-item>
          <el-menu-item index="api-config">
            <el-icon><Connection /></el-icon>
            <span>API配置</span>
          </el-menu-item>
          <el-menu-item index="backup">
            <el-icon><DataBoard /></el-icon>
            <span>备份恢复</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 用户信息 -->
        <el-sub-menu index="3" class="user-menu">
          <template #title>
            <el-avatar :size="32" :src="userAvatar">{{ user.username.substring(0,1) }}</el-avatar>
            <span class="username">{{ user.username }}</span>
          </template>
          <el-menu-item index="profile">
            <el-icon><UserFilled /></el-icon>
            <span>个人中心</span>
          </el-menu-item>
          <el-menu-item index="notifications">
            <el-icon><Bell /></el-icon>
            <span>消息通知</span>
            <el-badge value="3" />
          </el-menu-item>
          <el-menu-item index="3-1" disabled>
            <el-icon><InfoFilled /></el-icon>
            <span>权限等级：{{ user.roleName }}</span>
          </el-menu-item>
          <el-divider />
          <el-menu-item index="help">
            <el-icon><QuestionFilled /></el-icon>
            <span>帮助中心</span>
          </el-menu-item>
          <el-menu-item index="3-2">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-header>
    <el-main>
      <RouterView />
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import { backToLoginPage, getUserFromToken } from '@/utils/jwtUtil';
import { onBeforeMount, provide, ref, computed } from 'vue'
import { defineOptions } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  HomeFilled, ChatDotRound, Service, DataAnalysis,
  Setting, Files, Search, Management, Connection,
  Histogram, TrendCharts, PieChart, Download, User,
  Lock, Document, DataBoard, UserFilled,
  Bell, InfoFilled, QuestionFilled, SwitchButton
} from '@element-plus/icons-vue'

const activeIndex = ref('0');
const router = useRouter();
const user = ref({
  username: '',
  roleName: '',
  roleId: 1
});

// 随机生成用户头像URL或返回空
const userAvatar = computed(() => {
  return '';
});

const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
  switch (key) {
    case "dashboard": {
      router.push({ name: "welcome" })
      break;
    }
    case "4": {
      router.push({ name: "chat" })
      break;
    }
    case "1": {
      router.push({ name: "search" })
      break;
    }
    case "2": {
      router.push({ name: "manager" })
      break;
    }
    case "vector-search": {
      router.push({ name: "vector-search" })
      break;
    }
    case "user-management": {
      router.push({ name: "user-management" })
      break;
    }
    case "system-log": {
      router.push({ name: "system-log" })
      break;
    }
    case "analytics": {
      router.push({ name: "analytics" })
      break;
    }
    case "3-1": {
      break;
    }
    case "3-2": {
      backToLoginPage()
      break;
    }
    // 下面是假页面，不会真正跳转
    default: {
      if (key !== "0") { // 如果不是logo
        // 显示开发中消息
        ElMessage({
          message: '该功能正在开发中，敬请期待...',
          type: 'info',
          duration: 2000
        });
      }
      break;
    }
  }
}

onBeforeMount(async () => {
  const userInfo = getUserFromToken();
  user.value = {
    username: userInfo.username || '',
    roleName: userInfo.roleName || '',
    roleId: Number(userInfo.roleId) || 1
  };
})

defineOptions({
  name: "HeaderComp"
})

provide('activeIndex', activeIndex);//提供给其他组件访问
</script>

<style>
.menu-flex {
  display: flex;
  justify-content: space-between;
}

.spacer {
  flex-grow: 1;
}

.el-menu-item {
  flex-shrink: 0;
}

.logo-container {
  display: flex;
  align-items: center;
  padding-right: 20px !important;
}

.system-title {
  margin-left: 10px;
  font-weight: bold;
  color: #fff;
  font-size: 18px;
}

.el-menu--horizontal {
  border-bottom: none;
}

.el-menu--horizontal>.el-sub-menu .el-sub-menu__title {
  height: 60px;
  line-height: 60px;
}

.el-menu--horizontal>.el-menu-item {
  height: 60px;
  line-height: 60px;
}

.user-menu {
  margin-left: 20px;
}

.username {
  margin-left: 8px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.el-divider {
  margin: 8px 0;
}

.el-menu--popup {
  min-width: 160px;
}

/* 激活菜单项的样式 */
.el-menu-item.is-active {
  background-color: #1890ff !important;
  color: white !important;
}

/* 用于子菜单项的hover效果 */
.el-menu--popup .el-menu-item:hover {
  background-color: #1890ff20 !important;
}
</style>
