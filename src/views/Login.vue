<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-left">
        <h1 class="platform-title">AI 智能客服系统</h1>
        <p class="platform-slogan">赋能企业客服，提升服务体验</p>
      </div>
      <el-card class="login-card" shadow="always">
        <div class="login-header">
          <h2>系统登录</h2>
          <p class="login-welcome">欢迎回来，请登录您的账户</p>
        </div>
        <div class="login-form">
          <el-form :model="formData" ref="formRef" label-position="top" :rules="rules">
            <el-form-item prop="username">
              <el-input v-model="formData.username" placeholder="请输入用户名" prefix-icon="User" @keyup.enter="handleLogin(formRef)" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="formData.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password @keyup.enter="handleLogin(formRef)" />
            </el-form-item>
            <el-form-item prop="code">
              <div class="captcha-container">
                <el-input v-model="formData.code" placeholder="请输入验证码" @keyup.enter="handleLogin(formRef)" />
                <div class="captcha-image" @click="refreshCaptcha">
                  <img :src="captchaUrl" alt="验证码" />
                </div>
              </div>
            </el-form-item>
            <div class="login-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <el-link type="primary">忘记密码?</el-link>
            </div>
            <el-form-item>
              <el-button type="primary" class="login-button" :loading="loading" @click="handleLogin(formRef)">登录</el-button>
            </el-form-item>
            <div class="register-link">
              <span>还没有账号? </span>
              <el-link type="primary" @click="router.push('/sign_up')">立即注册</el-link>
            </div>
          </el-form>
        </div>
      </el-card>
    </div>
    <div class="login-footer">
      <p>© 2024 AI客服平台 · 技术支持</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getUserFromToken, setToken } from '@/utils/jwtUtil';
import req from '@/utils/request';
import { ElMessage, type FormInstance } from 'element-plus';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({
  name: "LoginPage",
})

const formRef = ref();
const loading = ref(false);
const rememberMe = ref(false);
const captchaUrl = ref('');

const formData = ref({
  username: '',
  password: '',
  code: '',
});

const rules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
});

const router = useRouter();

// 生成随机验证码图片URL
const generateCaptchaUrl = () => {
  const random = Math.floor(Math.random() * 10000);
  return `https://dummyimage.com/120x50/f0f0f0/333333.png&text=验证码${random}`;
};

// 刷新验证码
const refreshCaptcha = () => {
  captchaUrl.value = generateCaptchaUrl();
};

onMounted(() => {
  refreshCaptcha();
});

const handleLogin = async (formEl: FormInstance) => {
  if (!formEl) return;

  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true;

      // 模拟验证码验证
      if (formData.value.code.length < 4) {
        ElMessage.error('验证码错误');
        loading.value = false;
        refreshCaptcha();
        return;
      }

      req.post('/auth/login', formData.value)
        .then((res) => {
          switch (res.data.code) {
            case 200:
              setToken(res.data.data);
              const userInfo = getUserFromToken();
              // 将roleId转换为数字再比较
              if (Number(userInfo.roleId) >= 2) {
                router.push('/');
              } else {
                router.push({ name: 'chat' });
              }
              ElMessage.success('登录成功');
              break;
            case 401: case 403:
              ElMessage.error(res.data.message + "：" + res.data.data);
              refreshCaptcha();
              break;
            default:
              console.log(res.data);
              ElMessage.error('发生错误' + res.data.message);
              refreshCaptcha();
              break;
          }
        })
        .catch((err) => {
          console.log(err);
          ElMessage.error('发生错误' + err);
          refreshCaptcha();
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      ElMessage.error('请完成所有必填项');
    }
  });
};
</script>

<style scoped>
.login-container {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
  background: linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b);
  background-size: 200% 200%;
  animation: gradientBackground 15s ease infinite;
  position: relative;
  overflow: hidden;
}

@keyframes gradientBackground {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 添加粒子效果 */
.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.2) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}

.login-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  flex: 1;
  z-index: 1;
}

.login-left {
  color: white;
  margin-right: 40px;
  max-width: 400px;
  text-align: left;
  animation: fadeIn 1s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.platform-title {
  font-size: 42px;
  font-weight: bold;
  margin-bottom: 16px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.platform-slogan {
  font-size: 20px;
  opacity: 0.9;
  margin-bottom: 30px;
}

.login-card {
  width: 400px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.8s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.login-welcome {
  color: #666;
  font-size: 16px;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.captcha-container {
  display: flex;
  gap: 10px;
}

.captcha-image {
  width: 120px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  letter-spacing: 1px;
  margin-top: 10px;
  background: linear-gradient(90deg, #3a1c71, #d76d77);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.login-footer {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  z-index: 1;
}

@media (max-width: 900px) {
  .login-content {
    flex-direction: column;
  }

  .login-left {
    margin-right: 0;
    margin-bottom: 40px;
    text-align: center;
  }

  .login-card {
    width: 100%;
    max-width: 400px;
  }
}
</style>
