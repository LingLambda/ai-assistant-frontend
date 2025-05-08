<template>
  <div class="system-log-container">
    <div class="page-header">
      <h1>系统日志</h1>
      <div class="header-actions">
        <el-button type="primary" @click="refreshLogs">
          <el-icon><Refresh /></el-icon> 刷新日志
        </el-button>
        <el-button type="success" @click="exportLogs">
          <el-icon><Download /></el-icon> 导出日志
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card" shadow="hover">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="操作类型">
          <el-select v-model="filterForm.actionType" placeholder="请选择操作类型" clearable>
            <el-option label="登录" value="login" />
            <el-option label="登出" value="logout" />
            <el-option label="新增" value="create" />
            <el-option label="修改" value="update" />
            <el-option label="删除" value="delete" />
            <el-option label="导出" value="export" />
            <el-option label="系统" value="system" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="filterForm.username" placeholder="请输入操作人" clearable />
        </el-form-item>
        <el-form-item label="日志级别">
          <el-select v-model="filterForm.level" placeholder="请选择日志级别" clearable>
            <el-option label="普通" value="info" />
            <el-option label="警告" value="warning" />
            <el-option label="错误" value="error" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="resetFilter">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 日志列表 -->
    <el-card class="log-list-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>日志列表</span>
          <div>
            <span class="log-count">总日志数: {{ total }}</span>
            <el-tag v-if="logStats.info > 0" type="info" class="log-stat">正常: {{ logStats.info }}</el-tag>
            <el-tag v-if="logStats.warning > 0" type="warning" class="log-stat">警告: {{ logStats.warning }}</el-tag>
            <el-tag v-if="logStats.error > 0" type="danger" class="log-stat">错误: {{ logStats.error }}</el-tag>
          </div>
        </div>
      </template>

      <el-table
        :data="logList"
        style="width: 100%"
        border
        stripe
        v-loading="loading"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div class="log-detail">
              <p><strong>详细信息:</strong></p>
              <pre>{{ props.row.details }}</pre>
              <p v-if="props.row.stackTrace"><strong>堆栈跟踪:</strong></p>
              <pre v-if="props.row.stackTrace">{{ props.row.stackTrace }}</pre>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="time" label="时间" width="180" sortable />
        <el-table-column prop="username" label="操作人" width="120" />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="module" label="模块" width="100" />
        <el-table-column prop="actionType" label="操作类型" width="100">
          <template #default="scope">
            <el-tag>{{ scope.row.actionType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="日志级别" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.level === 'error' ? 'danger' : scope.row.level === 'warning' ? 'warning' : 'info'"
            >
              {{ scope.row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button
              type="danger"
              size="small"
              @click="handleDeleteLog(scope.row)"
              :disabled="!isAdmin"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Refresh, Download, Search, Delete
} from '@element-plus/icons-vue';
import { getUserFromToken } from '@/utils/jwtUtil';

// 组件名称
defineOptions({
  name: 'SystemLogPage'
});

// 用户权限
const userInfo = getUserFromToken();
const isAdmin = computed(() => Number(userInfo.roleId) >= 2);

// 筛选表单
const filterForm = reactive({
  actionType: '',
  username: '',
  level: '',
  dateRange: []
});

// 分页控制
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(320);
const loading = ref(false);

// 日志统计
const logStats = reactive({
  info: 245,
  warning: 56,
  error: 19
});

// 模拟日志数据
const logList = ref([
  {
    id: 1001,
    time: '2025-03-15 16:30:45',
    username: 'admin',
    ip: '192.168.1.100',
    module: '用户管理',
    actionType: 'create',
    level: 'info',
    description: '创建了新用户: user5',
    details: '{"username":"user5","email":"user5@example.com","role":"user","status":"active"}',
    stackTrace: null
  },
  {
    id: 1000,
    time: '2025-03-15 16:28:12',
    username: 'admin',
    ip: '192.168.1.100',
    module: '系统设置',
    actionType: 'update',
    level: 'info',
    description: '更新了系统配置',
    details: '{"oldValue":{"maxUploadSize":"10MB"},"newValue":{"maxUploadSize":"20MB"}}',
    stackTrace: null
  },
  {
    id: 999,
    time: '2025-03-15 15:45:30',
    username: 'user1',
    ip: '192.168.1.101',
    module: '知识库',
    actionType: 'update',
    level: 'info',
    description: '更新了知识库文档',
    details: '{"documentId":"doc123","title":"客服手册"}',
    stackTrace: null
  },
  {
    id: 998,
    time: '2025-03-15 14:20:15',
    username: 'system',
    ip: '127.0.0.1',
    module: '系统',
    actionType: 'system',
    level: 'warning',
    description: '系统存储空间不足 (85%)',
    details: '{"diskUsage":"85%","availableSpace":"15GB"}',
    stackTrace: null
  },
  {
    id: 997,
    time: '2025-03-15 13:10:05',
    username: 'user2',
    ip: '192.168.1.102',
    module: 'API',
    actionType: 'login',
    level: 'error',
    description: '登录失败，密码错误',
    details: '{"username":"user2","attemptCount":"3"}',
    stackTrace: 'Error: Authentication failed\n    at AuthService.authenticate (auth.service.ts:45:11)\n    at LoginController.login (login.controller.ts:28:35)'
  }
]);

// 刷新日志
const refreshLogs = () => {
  loading.value = true;
  // 模拟刷新延迟
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('日志已更新');
  }, 800);
};

// 搜索
const handleSearch = () => {
  loading.value = true;
  // 模拟搜索延迟
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('搜索完成');
  }, 800);
};

// 重置筛选
const resetFilter = () => {
  filterForm.actionType = '';
  filterForm.username = '';
  filterForm.level = '';
  filterForm.dateRange = [];
  handleSearch();
};

// 导出日志
const exportLogs = () => {
  ElMessage.success('日志导出中...');
  // 模拟导出
  setTimeout(() => {
    ElMessage.success('日志导出成功');
  }, 1500);
};

// 删除日志
const handleDeleteLog = (row: {id: number, description: string}) => {
  ElMessageBox.confirm(
    `确定要删除日志 #${row.id} (${row.description}) 吗？`,
    '删除日志',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟删除
    setTimeout(() => {
      ElMessage.success(`日志 #${row.id} 已删除`);
    }, 800);
  }).catch(() => {});
};

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  handleSearch();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  handleSearch();
};

onMounted(() => {
  handleSearch();
});
</script>

<style scoped>
.system-log-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  color: #303133;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.log-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-count {
  margin-right: 10px;
  color: #606266;
}

.log-stat {
  margin-left: 8px;
}

.log-detail {
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.log-detail pre {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 12px;
  color: #606266;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
