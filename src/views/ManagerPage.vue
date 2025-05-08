<template>
  <div class="manager-container">
    <div class="page-header">
      <h1>知识库管理</h1>
      <p>上传或输入内容以扩充AI客服知识库</p>
    </div>

    <div class="content-area">
      <!-- 左侧文件上传区域 -->
      <div class="panel file-panel">
        <div class="panel-header">
          <div class="panel-title">
            <i class="el-icon-upload"></i>
            <span>文件上传</span>
          </div>
          <el-tooltip content="查看JSON格式示例" placement="top">
            <el-button class="template-btn" type="primary" text @click="jsonTemplate">
              <i class="el-icon-info"></i> JSON格式示例
            </el-button>
          </el-tooltip>
        </div>
        <div class="panel-content">
          <div class="supported-formats">
            <span>支持格式:</span>
            <el-tag size="small" type="info">TXT</el-tag>
            <el-tag size="small" type="info">Markdown</el-tag>
            <el-tag size="small" type="info">PDF</el-tag>
            <el-tag size="small" type="info">JSON</el-tag>
          </div>
          <ManagerFileUpload />
        </div>
      </div>

      <!-- 右侧文本输入区域 -->
      <div class="panel text-panel">
        <div class="panel-header">
          <div class="panel-title">
            <i class="el-icon-edit-outline"></i>
            <span>文本直接输入</span>
          </div>
        </div>
        <div class="panel-content">
          <ManagerTextUpload />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ManagerFileUpload from '@/components/ManagerFileUpload.vue';
import ManagerTextUpload from '@/components/ManagerTextUpload.vue';
import { ElMessageBox } from 'element-plus';

const jsonTemplate = () => {
  ElMessageBox.alert(`<pre style="color: #333; background-color: #f8f8f8; padding: 15px; border-radius: 5px; font-family: monospace; line-height: 1.5;">
{
  <span style="color: #0366d6;">"date"</span>: <span style="color: #032f62;">"2025-12-31"</span>,
  <span style="color: #0366d6;">"city"</span>: <span style="color: #032f62;">"Beijing"</span>,
  <span style="color: #0366d6;">"temperature"</span>: {
    <span style="color: #0366d6;">"min"</span>: <span style="color: #005cc5;">-5.2</span>,
    <span style="color: #0366d6;">"max"</span>: <span style="color: #005cc5;">15.6</span>
  },
  <span style="color: #0366d6;">"humidity"</span>: <span style="color: #005cc5;">60</span>,
  <span style="color: #0366d6;">"wind_speed"</span>: <span style="color: #005cc5;">5.8</span>,
  <span style="color: #0366d6;">"content"</span>: <span style="color: #032f62;">"SunnySunnySunnySunnySunnySunny"</span>
}
</pre>`, 'JSON格式示例',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '知道了',
      center: true,
      customClass: 'json-dialog'
    })
}
</script>

<style scoped>
.manager-container {
  min-height: 90vh;
  padding: 30px;
  background-color: #f8f9fc;
  display: flex;
  flex-direction: column;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
  font-weight: 600;
}

.page-header p {
  font-size: 16px;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.content-area {
  display: flex;
  flex: 1;
  gap: 30px;
  margin-top: 20px;
}

@media (max-width: 1200px) {
  .content-area {
    flex-direction: column;
  }
}

.panel {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.panel:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.file-panel {
  background: linear-gradient(to bottom, rgba(87, 128, 242, 0.03), rgba(87, 128, 242, 0.05));
  border-left: 4px solid #5780f2;
}

.text-panel {
  background: linear-gradient(to bottom, rgba(64, 169, 255, 0.03), rgba(64, 169, 255, 0.05));
  border-left: 4px solid #40a9ff;
}

.panel-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-content {
  padding: 25px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.supported-formats {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.supported-formats .el-tag {
  margin-right: 5px;
  font-weight: 500;
}

.template-btn {
  font-size: 14px;
}

:deep(.json-dialog) {
  border-radius: 10px;
  overflow: hidden;
}

:deep(.json-dialog .el-message-box__header) {
  background-color: #f8f9fa;
  padding: 15px 20px;
}

:deep(.json-dialog .el-message-box__content) {
  padding: 0;
}

:deep(.json-dialog .el-message-box__title) {
  font-weight: 600;
  font-size: 18px;
  color: #333;
}

:deep(.json-dialog pre) {
  margin: 0;
  max-height: 400px;
  overflow: auto;
}
</style>
