<template>
  <div class="search-page">
    <el-input v-model="input" style="max-width: 600px" placeholder="向量搜索仅显示匹配度最高的前10个数据" class="input-with-select">
      <template #append>
        <el-button :icon="Search" @click="searchInput" />
      </template>
    </el-input>
  </div>
  <div>
    <el-table v-loading="isLoading" :data="response" class="tb">
      <el-table-column prop="id" label="id" />
      <el-table-column prop="text" label="text" />
      <el-table-column prop="media" label="media" />
      <el-table-column label="Metadata">
        <template #default="{ row }">
          <pre>{{ formatMetadata(row.metadata) }}</pre>
        </template>
      </el-table-column>
      <el-table-column width="100" #default="{ row }">
        <el-popconfirm :title="'确定要删除' + row.id + '吗'" @confirm="removeItem(row.id)">
          <template #reference>
            <el-button>删除此项</el-button>
          </template>
        </el-popconfirm>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Search } from '@element-plus/icons-vue'
import req from '@/utils/request';
import { ElMessage } from 'element-plus';

const input = ref('');
const response = ref([]);
const isLoading = ref(false)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatMetadata = (metadata: any) => {
  try {
    return JSON.stringify(metadata, null, 2); // 格式化 JSON，使其显示为多行缩进的格式
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return 'Invalid JSON'; // 如果解析失败，返回 'Invalid JSON'
  }
}

const searchInput = () => {
  isLoading.value = true;
  req.get("/admin/vector/query", {
    params: {
      message: input.value,
      top_k: 10
    }
  })
    .then(res => {
      isLoading.value = false;
      if (res.data.code != 200) {
        console.log("查询失败：" + res.data.message)
        ElMessage.error("查询失败：" + res.data.message)
        return;
      }
      response.value = res.data.data;
      ElMessage.success("查询成功!")
    })
    .catch(err => {
      isLoading.value = false;
      console.log("查询失败：" + err)
      ElMessage.error("查询失败!" + err);
    })
}

const removeItem = (id: string) => {
  const idList = [id];
  req.post('/admin/vector/delete', idList)
    .then(res => {
      isLoading.value = false;
      if (res.data.code != 200) {
        console.log("删除失败：" + res.data.message)
        ElMessage.error("删除失败：" + res.data.message)
        return;
      } else {
        ElMessage.success("删除成功!")
        searchInput();
      }
    })
    .catch(err => {
      console.log("删除成功!" + err)
      ElMessage.error("删除成功!" + err);
    })
}

</script>


<style scoped>
/* 设置页面整体的背景和字体样式 */
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  background-color: #f9f9f9;
}

.tb {
  width: 200vh;
}

/* 搜索页面容器 */
.search-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #ffffff;
}

/* 输入框样式 */
.input-with-select {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* 搜索按钮的样式 */
.search-button {
  background-color: #409EFF;
  border-color: #409EFF;
  color: #ffffff;
  font-size: 14px;
  padding: 10px;
}

/* 搜索按钮的 hover 状态 */
.search-button:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

/* 表格样式 */
.result-table {
  width: 100%;
  max-width: 800px;
  margin-top: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 表格标题的样式 */
.el-table .cell {
  font-weight: 500;
  font-size: 14px;
}

/* 表格的每一行的 hover 效果 */
.el-table__row:hover {
  background-color: #f5f7fa;
}

/* 表格的数据行文字样式 */
.el-table td {
  font-size: 14px;
  color: #555;
}

/* loading 状态的样式 */
.el-loading-spinner {
  margin: 0 auto;
  padding: 30px;
}
</style>