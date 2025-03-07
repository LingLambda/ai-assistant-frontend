<template>
  <div class="container">
    <el-row :gutter="20" class="full-height">
      <!-- 左侧文件上传区域 -->
      <el-col :span="12" class="left-panel">
        <el-card class="upload-card">
          <template #header>
            <div class="card-header">
              <span>文件上传方式(支持txt,markdown,pdf,json)</span> <el-button @click="jsonTemplate">点我查看json示例</el-button>
            </div>
          </template>
          <ManagerFileUpload />
        </el-card>
      </el-col>

      <!-- 右侧文本输入区域 -->
      <el-col :span="12" class="right-panel">
        <el-card class="input-card">
          <template #header>
            <div class="card-header">
              <span>文本输入方式</span>
            </div>
          </template>
          <ManagerTextUpload/>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import ManagerFileUpload from '@/components/ManagerFileUpload.vue';
import ManagerTextUpload from '@/components/ManagerTextUpload.vue';
import {ElMessageBox } from 'element-plus';

const jsonTemplate = () => {
  ElMessageBox.alert(`<pre>
{
  "date": "2024-12-31",
  "city": "Beijing",
  "temperature": {
    "min": -5.2,
    "max": 15.6
  },
  "humidity": 60,
  "wind_speed": 5.8,
  "content": "SunnySunnySunnySunnySunnySunny"
}
    </pre>`, '请仿造该格式上传json',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: 'OK',
      callback: () => { },
    })
}


</script>


<style scoped>
.container {
  height: 80vh;
  padding: 20px;
  background-color: #f5f7fa;
}

.full-height {
  height: 100%;
}

.left-panel,
.right-panel {
  height: 100%;
}

.upload-card,
.input-card {
  height: 100%;
  box-sizing: border-box;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
}

.upload-demo {
  height: calc(100% - 60px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.el-upload-dragger {
  width: 100%;
  height: 300px;
}

.text-input {
  margin-bottom: 20px;
}

.button-wrapper {
  text-align: right;
}

.el-textarea {
  flex: 1;
}
</style>