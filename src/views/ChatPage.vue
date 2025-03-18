<template>
  <div>
    <el-container style="height: 100%;">
      <el-aside width="250px" style="background-color: #f9f9f9;" height="300px">
        <el-row>
          <h5 style="margin-left: 30px; margin-top: 20px; width: 100px; font-size: 20px;">房间选择</h5>
          <el-button style="margin-left: 30px; margin-top: 20px;" round>新对话</el-button>
        </el-row>
        <el-menu class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
          style="background-color: #f9f9f9;">
          <el-menu-item index="1">
            <span>选项1</span>
          </el-menu-item>
          <el-menu-item index="2">
            <span>选项2</span>
          </el-menu-item>
          <el-menu-item index="3" disabled>
            <span>选项3</span>
          </el-menu-item>
          <el-menu-item index="4">
            <span>选项4</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2>与AI智能客服对话</h2>
            <el-button v-if="isAdmin" style="margin-right: 2px;"
              @click="router.push({ name: 'manager' });">返回管理页</el-button>
            <el-button v-if="!isAdmin" style="margin-right: 2px;" @click="backToLoginPage">退出登录</el-button>
          </div>
        </el-header>
        <el-main>
          <div class="chat-container">
            <div v-for="(message, index) in messages" :key="index" :class="['message', message.align]">
              <el-card class="message-card" :style="{ width: '500px', maxWidth: windowWidth - 100 + 'px' }">
                <div v-html="message.text"></div>
              </el-card>
            </div>
          </div>
          <div class="human-input">
            <el-input v-model="humanInput" style="width: 90%; font-size: 20px" autosize type="textarea"
              placeholder="给ai客服发送消息" @keydown="handleEnterDown" />
            <el-button @click="sendChatMessage" :icon="Promotion" :loading="loading" size="large" circle
              style="background-color: #d7d7d7;   " />
          </div>
          {{ aiMessage }}
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import req from '@/utils/request'
import { Promotion } from '@element-plus/icons-vue'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { ElMessage } from 'element-plus'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { v4 } from 'uuid'
import { backToLoginPage, getToken, getUserFromToken } from '@/utils/jwtUtil'
import { marked } from 'marked'
import router from '@/router'

interface Chat {
  text: string
  align: string
}

const conversationId = ref(v4())
const humanInput = ref('')
const aiMessage = ref('')
const loading = ref(false)
const messages = ref<Chat[]>([])
const isAdmin = ref(false)
const user = getUserFromToken()
const windowWidth = ref(window.screen.width);
// 处理窗口尺寸变化
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

if (user.roleName === '管理员') {
  isAdmin.value = true;
}

messages.value.push({ text: '您好，我是ai智能客服，请问有什么可以帮您', align: 'left' })
// 发送信息
const sendChatMessage = () => {
  if (loading.value) return
  const message = humanInput.value;
  humanInput.value = '';
  const inputContent = message.trim();
  if (!inputContent) {
    ElMessage.error("请输入要发送的信息");
    return;
  }

  messages.value.push({ text: message, align: 'right' })
  loading.value = true;

  setTimeout(async () => {
    await fetchChatAIData(inputContent)
    loading.value = false;
  }, 2000);
};

/**
 * 获取ai消息数据
 * @param message 问题
 */
const fetchChatAIData = async (message: string) => {
  const baseURL = req.defaults.baseURL
  const ctrl = new AbortController();
  messages.value.push({ text: '', align: 'left' })
  const aiMessageIndex = messages.value.length - 1;

  let fromAiMdMsgCache = '';
  await fetchEventSource(`${baseURL}/chat/vec_chat?message=${message}&conversationId=${conversationId.value}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": getToken()
    },
    // 监听消息
    async onmessage(event) {
      const data = JSON.parse(event.data)
      console.log(data)
      const content = data?.result?.output?.text
      if (!content) return;
      fromAiMdMsgCache += content;
      fromAiMdMsgCache.replace('\\n', '\n');
      const htmlMsg: string = await marked(fromAiMdMsgCache)
      messages.value[aiMessageIndex].text = htmlMsg;
    },
    // 关闭
    onclose() {
      console.log("连接关闭");
    },
    // 错误
    onerror(err) {
      console.log('连接错误' + err);
      ctrl.abort()
    },
    // 控制请求取消的信号
    signal: ctrl.signal
  })
}

/**
 * 回车触发发送
 * @param event 监听
 */
const handleEnterDown = async (event) => {
  const key = event.key;
  if (key === 'Enter' && event.shiftKey) {
  }
  else if (key === 'Enter') {
    sendChatMessage()
  }
}

</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 80px;
  /* 为了避免输入框遮挡最后一条消息 */
  overflow-y: auto;
  max-height: calc(100vh - 120px);
  /* 根据实际布局调整 */
}

.message {
  max-width: 60%;
}

.message.left {
  align-self: flex-start;
}

.message.right {
  align-self: flex-end;
}

.message-card {}

.human-input {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  background-color: white;
  padding: 10px;
  border-top: 1px solid #ccc;
}
</style>


<style>
pre {
  background-color: #f9f9f9;
  border: 1px solid #d4d4d4;
  border-radius: 20px;
  padding: 20px;
  font-size: 14px;
  overflow: auto;
  /* 内容超出时显示滚动条 */
}

pre code {
  font-family: 'Fira Code';
}
</style>