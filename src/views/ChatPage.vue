<template>
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
          <el-card>
            <div v-html="message.text"></div>
          </el-card>
        </div>
      </div>
      <div class="human-input">
        <el-input v-model="humanInput" style="width: 90%; font-size: 20px" autosize type="textarea"
          placeholder="给ai客服发送消息" />
        <el-button @click="sendChatMessage" :icon="Promotion" :loading="loading" size="large" circle
          style="background-color: #d7d7d7;   " />
      </div>
      {{ aiMessage }}
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import req from '@/utils/request'
import { Promotion } from '@element-plus/icons-vue'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
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

if (user.roleName === '管理员') {
  isAdmin.value = true;
}

messages.value.push({ text: '您好，我是ai智能客服，请问有什么可以帮您', align: 'left' })
// 发送信息
const sendChatMessage = () => {
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
      const content = data?.result?.output?.content
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
