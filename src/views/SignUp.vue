<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <h1 class="platform-title">AI客服平台注册页</h1>
      <div class="login-form">
        <el-form :model="formData" ref="formRef" label-position="top" label-width="100px" :rules="rules">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="formData.username" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="formData.password" type="password" placeholder="请输入密码"></el-input>
          </el-form-item>
          <el-link @click="router.push('/login')">
            已有账号？
          </el-link>
          <el-form-item>
            <el-button type="primary" @click="handleLogin(formRef)">注册</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { setToken } from '@/utils/jwtUtil';
import req from '@/utils/request';
import { ElMessage, type FormInstance } from 'element-plus';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({
  name: "LoginPage",
})

const formRef = ref();

const formData = ref(
  {
    username: '',
    password: '',
  }
)
const rules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
});
const router = useRouter();
const handleLogin = async (formEl: FormInstance) => {
  await formEl.validate((valid) => {
    if (valid) {
      req.post('/auth/sign_up', formData.value)
        .then((res) => {
          switch (res.data.code) {
            case 200:
              setToken(res.data.data)
              ElMessage.success('注册成功，请登录')
              router.push('/login')
              break;
            default:
              console.log(res.data)
              ElMessage.error('发生错误' + res.data.message)
              break;
          }
        })
        .catch((err) => {
          console.log(err)
          ElMessage.error('发生错误' + err)
        })
    } else {
      ElMessage.error('请输入完整注册信息')
    }
  })
};
</script>
<style scoped>
.login-container {
  box-sizing: border-box;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-height: 100vh;
  background-image: url('../assets/images/backgroud.webp');
  background-size: auto;
  background-position: center;
}

.login-card {
  width: 400px;
  background: rgba(255, 255, 255, 0.6);
  /* 半透明背景色 */
  border-radius: 16px;
  /* 圆角 */
  padding: 20px;
  backdrop-filter: blur(15px);
  /* 毛玻璃效果 */
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* 轻微的边框 */
  margin-right: 10%;
}

.platform-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
  /* 居中显示 */
}

.login-form {
  display: flex;
  flex-direction: column;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-button {
  margin-top: 20px;
  width: 100%;
}

/* 右对齐忘记密码链接 */
.forgot-password-container {
  display: flex;
  justify-content: flex-end;
  /* 使链接右对齐 */
}
</style>
