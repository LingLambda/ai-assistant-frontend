<template>
  <div class="user-management-container">
    <div class="page-header">
      <h1>用户管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showAddUserDialog">
          <el-icon><Plus /></el-icon> 添加用户
        </el-button>
        <el-button type="success" @click="handleExport">
          <el-icon><Download /></el-icon> 导出用户
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card" shadow="hover">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="用户名">
          <el-input v-model="filterForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="filterForm.role" placeholder="请选择角色" clearable>
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
            <el-option label="访客" value="guest" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
            <el-option label="待审核" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item label="注册时间">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
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

    <!-- 用户列表 -->
    <el-card class="user-list-card" shadow="hover">
      <el-table
        :data="userList"
        style="width: 100%"
        border
        stripe
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户信息" min-width="200">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="40" :src="scope.row.avatar">
                {{ scope.row.username.substring(0, 1) }}
              </el-avatar>
              <div class="user-details">
                <div class="username">{{ scope.row.username }}</div>
                <div class="email">{{ scope.row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="120">
          <template #default="scope">
            <el-tag :type="getRoleTagType(scope.row.role)">
              {{ scope.row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" width="180" />
        <el-table-column prop="registerTime" label="注册时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="success" size="small" @click="handleResetPassword(scope.row)">
                <el-icon><Key /></el-icon>
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(scope.row)"
                :disabled="scope.row.role === 'admin'"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
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

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
            <el-option label="访客" value="guest" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="userForm.status" placeholder="请选择状态">
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
            <el-option label="待审核" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitUser">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import {
  Plus, Download, Search, Refresh, Edit, Key, Delete
} from '@element-plus/icons-vue';

// 组件名称
defineOptions({
  name: 'UserManagementPage'
});

// 筛选表单
const filterForm = reactive({
  username: '',
  role: '',
  status: '',
  dateRange: []
});

// 用户表单
const userFormRef = ref<FormInstance>();
const userForm = reactive({
  username: '',
  email: '',
  role: '',
  status: '',
  password: ''
});

// 表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
};

// 对话框控制
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');

// 分页控制
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(100);
const loading = ref(false);

// 模拟用户数据
const userList = ref([
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2025-03-15 14:30:25',
    registerTime: '2025-01-01 00:00:00',
    avatar: ''
  },
  {
    id: 2,
    username: 'user1',
    email: 'user1@example.com',
    role: 'user',
    status: 'active',
    lastLogin: '2025-03-15 10:15:42',
    registerTime: '2025-01-15 08:30:00',
    avatar: ''
  },
  {
    id: 3,
    username: 'guest1',
    email: 'guest1@example.com',
    role: 'guest',
    status: 'pending',
    lastLogin: '2025-03-14 16:45:10',
    registerTime: '2025-02-01 12:00:00',
    avatar: ''
  },
  {
    id: 4,
    username: 'user2',
    email: 'user2@example.com',
    role: 'user',
    status: 'disabled',
    lastLogin: '2025-03-10 09:20:15',
    registerTime: '2025-01-20 14:30:00',
    avatar: ''
  },
  {
    id: 5,
    username: 'user3',
    email: 'user3@example.com',
    role: 'user',
    status: 'active',
    lastLogin: '2025-03-15 11:05:30',
    registerTime: '2025-02-10 10:00:00',
    avatar: ''
  }
]);

// 获取角色标签类型
const getRoleTagType = (role: string) => {
  switch (role) {
    case 'admin': return 'danger';
    case 'user': return 'primary';
    case 'guest': return 'info';
    default: return '';
  }
};

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'active': return 'success';
    case 'disabled': return 'danger';
    case 'pending': return 'warning';
    default: return '';
  }
};

// 搜索
const handleSearch = () => {
  loading.value = true;
  // 模拟搜索延迟
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('搜索完成');
  }, 1000);
};

// 重置筛选
const resetFilter = () => {
  filterForm.username = '';
  filterForm.role = '';
  filterForm.status = '';
  filterForm.dateRange = [];
  handleSearch();
};

// 显示添加用户对话框
const showAddUserDialog = () => {
  dialogType.value = 'add';
  userForm.username = '';
  userForm.email = '';
  userForm.role = '';
  userForm.status = '';
  userForm.password = '';
  dialogVisible.value = true;
};

// 编辑用户
const handleEdit = (row: any) => {
  dialogType.value = 'edit';
  userForm.username = row.username;
  userForm.email = row.email;
  userForm.role = row.role;
  userForm.status = row.status;
  dialogVisible.value = true;
};

// 重置密码
const handleResetPassword = (row: any) => {
  ElMessageBox.confirm(
    `确定要重置用户 ${row.username} 的密码吗？`,
    '重置密码',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟重置密码
    setTimeout(() => {
      ElMessage.success(`用户 ${row.username} 的密码已重置为默认密码`);
    }, 1000);
  }).catch(() => {});
};

// 删除用户
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除用户 ${row.username} 吗？`,
    '删除用户',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟删除
    setTimeout(() => {
      ElMessage.success(`用户 ${row.username} 已删除`);
    }, 1000);
  }).catch(() => {});
};

// 提交用户表单
const handleSubmitUser = async () => {
  if (!userFormRef.value) return;

  await userFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟提交
      setTimeout(() => {
        ElMessage.success(dialogType.value === 'add' ? '用户添加成功' : '用户更新成功');
        dialogVisible.value = false;
      }, 1000);
    }
  });
};

// 导出用户
const handleExport = () => {
  ElMessage.success('用户数据导出中...');
  // 模拟导出
  setTimeout(() => {
    ElMessage.success('用户数据导出成功');
  }, 2000);
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
.user-management-container {
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

.user-list-card {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 500;
  color: #303133;
}

.email {
  font-size: 12px;
  color: #909399;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
