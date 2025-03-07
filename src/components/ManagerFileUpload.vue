<template>
  <el-upload ref="uploadRef" class="upload-demo" accept=".pdf,.json" :auto-upload="false" :http-request="mySub"
    :limit="1" :on-exceed="handleExceed">
    <el-button type="primary">选择文件</el-button>


    <template #tip>
      <div class="el-upload__tip">
        一次只能上传一个文件(支持pdf,json格式)
      </div>
    </template>
  </el-upload>
  <el-button class="ml-3" type="success" @click="submitUpload" v-loading.fullscreen.lock="loading">
    上传文件到知识库
  </el-button>
</template>




<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage, genFileId, type UploadInstance, type UploadProps, type UploadRawFile, type UploadRequestOptions } from 'element-plus'
import req from '@/utils/request';

const uploadRef = ref<UploadInstance>()

const loading = ref(false);

const submitUpload = () => {
  uploadRef.value!.submit();
}
//选择新文件时候覆盖上一个
const handleExceed: UploadProps['onExceed'] = (files) => {
  uploadRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
}



const mySub = (request: UploadRequestOptions) => {

  loading.value = true;

  const file = request.file;

  // 验证文件扩展名
  const allowedExtensions = ['pdf', 'json'];
  const fileExtension = file.name.split('.').pop()?.toLowerCase(); // 获取文件扩展名
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    ElMessage.error('只支持上传 pdf 或 json 格式的文件');
    loading.value = false;
    return; // 结束上传
  }

  // 验证 MIME 类型
  const allowedMimeTypes = ['application/pdf', 'application/json'];
  if (!allowedMimeTypes.includes(file.type)) {
    ElMessage.error('文件类型不正确，请选择 pdf 或 json 文件');
    loading.value = false;
    return; // 结束上传
  }

  console.log('文件类型验证通过，开始上传');

  const fileForm = new FormData();
  fileForm.append('file', request.file);
  console.log(fileForm);
  req.post('/admin/vector/add', fileForm)
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
