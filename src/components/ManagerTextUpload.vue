<template>
  <el-input v-model="inputText" type="textarea" :rows="8" placeholder="粘贴纯文本内容到此处..." resize="none"
    class="text-input" />
  <div class="button-wrapper">
    <el-button type="primary" @click="submitText" v-loading.fullscreen.lock="loading">上传文本到知识库</el-button>
  </div>
</template>

<script setup lang="ts">
import req from '@/utils/request';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

const loading = ref(false);

const inputText = ref('');

const submitText = () => {
  if (!inputText.value.trim()) {
    ElMessage.error("文本不能为空！")
    return;
  }
  loading.value = true;
  req.post('/admin/vector/add_text', {
    stringText: inputText.value
  }
  )
    .then((res) => {
      if (res.data.code == '200') {
        ElMessage.success(res.data.message + "：" + res.data.data)
      } else {
        ElMessage.error(res.data.message + "：" + + res.data.data)
      }
      console.log(res.data.message + "：" + res.data.data)
      loading.value = false;
    })
    .catch((err) => {
      ElMessage.error('上传失败' + err);
      loading.value = false;
    })
}
</script>