<template>
  <div>
    <el-container>
      <el-aside width="250px" style="background-color: #f9f9f9; height: 100vh;">
        <el-row>
          <h5 style="margin-left: 30px; margin-top: 20px; width: 100px; font-size: 20px;">房间选择</h5>
          <el-button style="margin-left: 30px; margin-top: 20px;" @click="clickNewDialog" round>新对话</el-button>
        </el-row>
        <el-menu class="el-menu-vertical-demo" @select="handleSelect" :default-active="conversationId"
          style="background-color: #f9f9f9;">
          <el-menu-item v-for="room in roomList" :key="room.id" :index="room.id">
            <span>{{ room.title }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container style="height: 100vh;">
        <el-header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2>与AI智能客服对话</h2>
            <el-button v-if="isAdmin" style="margin-right: 2px;"
              @click="router.push({ name: 'manager' });">返回管理页</el-button>
            <el-button v-if="!isAdmin" style="margin-right: 2px;" @click="backToLoginPage">退出登录</el-button>
          </div>
        </el-header>
        <el-main id="main-chat">
          <div class="chat-container" ref='containerRef'>
            <div v-for="(message, index) in messages" :key="index" :class="['message', message.align]">
              <el-card class="message-card" :style="{ width: '500px', maxWidth: windowWidth - 100 + 'px' }">
                <div v-html="message.text"></div>
              </el-card>
            </div>
            <div v-if="messages.length === 0"
              style="position: absolute;left: 50%;top: 50%; transform: translate(-50%,-50%);">
              <h1>招生咨询相关问题都可以问我！</h1>
            </div>
          </div>
          <div class="human-input-box">
            <el-input class="human-input" v-model="humanInput" style="width: 90%; font-size: 20px ;" autosize
              resize="none" type="textarea" placeholder="给ai客服发送消息" @keydown="handleEnterDown" />
            <el-button @click="sendChatMessage" :icon="Promotion" :loading="loading" size="large" circle
              style="background-color: #d7d7d7;  margin-left: 20px; margin-top: 5px;" />
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
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { v4 } from 'uuid'
import { backToLoginPage, getToken, getUserFromToken } from '@/utils/jwtUtil'
import { marked } from 'marked'
import router from '@/router'
import { getCookie, setCookie } from '@/utils/cookieUtil'

interface Chat {
  text: string
  align: string
}
interface Room {
  id: string,
  createTime?: Date,
  updateTIme?: Date,
  userId?: bigint,
  title: string
}


const conversationId = ref()
const humanInput = ref('')
const aiMessage = ref('')
const loading = ref(false)
const messages = ref<Chat[]>([])
const user = getUserFromToken()
const isAdmin = ref(user.roleName === '管理员')
const windowWidth = ref(window.screen.width);
const roomList = ref<Room[]>([])
const containerRef = ref<Ref>(null);

/**
 * 点击房间时，在cookie设置currentRoom为房间id，并查询房间消息
 * @param id
 */
const handleSelect = async (id: string) => {
  conversationId.value = id
  queryRoomMessage()
}

// 处理窗口尺寸变化
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};
onMounted(async () => {
  window.addEventListener('resize', handleResize);

  queryRoomList()

  conversationId.value = getCookie('currentRoom')

  queryRoomMessage()
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

//将ref = container的滚动条滚到底
const scrollToBottom = () => {
  if (containerRef.value) {
    containerRef.value.scrollTop = containerRef.value.scrollTopMax;
  }
}

/**
 * 从后端获取房间列表并填充至 roomList
 */
const queryRoomList = async () => {
  req.get('/room/query_room')
    .then((res) => {
      const code = res.data.code
      if (res.data.code == 200) {
        roomList.value = res.data.data
      } else {
        ElMessage.error(code + " 获取房间列表失败!")
        console.log(code + " 获取房间列表失败!")
      }
    })
    .catch((err) => {
      ElMessage.error("获取房间列表失败!", err)
      console.log("获取房间列表失败!", err)
    })
}

/**
 * 从后端获取当前房间消息并填充至 messages
 */
const queryRoomMessage = async () => {
  req.get(`/room/query_room_message?conversationId=${conversationId.value}`)
    .then((res) => {
      const code = res.data.code
      if (res.data.code == 200) {
        const messageList = res.data.data
        for (const message of messageList) {
          switch (message.messageType) {
            case 'user': {
              messages.value.push({ text: message.message, align: 'right' })
              break;
            }
            case 'assistant': {
              messages.value.push({ text: message.message, align: 'left' })
              break;
            }
          }
        }
      } else {
        ElMessage.error(code + " 获取房间消息列表失败!")
        console.log(code + " 获取房间消息列表失败!")
      }
    }).finally(() => {
      scrollToBottom()
    })
}


// 发送信息 并设置cookie 当前房间
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

  setCookie('currentRoom', conversationId.value)

  fetchChatAIData(inputContent)
};

/**
 * 获取ai流式消息数据
 * @param message 用户消息
 */
const fetchChatAIData = async (message: string) => {
  const baseURL = req.defaults.baseURL
  const ctrl = new AbortController();
  messages.value.push({ text: '', align: 'left' })
  const aiMessageIndex = messages.value.length - 1;
  let fromAiMdMsgCache = '';

  const timeout = setTimeout(async () => {
    ElMessage.error("请求超时")
    console.log("请求超时");
    ctrl.abort()
  }, 30000);

  fetchEventSource(`${baseURL}/chat/vec_chat?message=${message}&conversationId=${conversationId.value}`, {
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
      fromAiMdMsgCache.replace(/\\n/g, '\n');
      const htmlMsg: string = await marked(fromAiMdMsgCache)
      messages.value[aiMessageIndex].text = htmlMsg;
    },
    // 关闭
    onclose() {
      if (messages.value.length === 2) {
        summaryTitle()
      }

      console.log("连接正常关闭");
    },
    // 错误
    onerror(err) {
      ElMessage.error("连接错误" + err)
      console.log('连接错误' + err);
      ctrl.abort()
    },
    // 控制请求取消的信号
    signal: ctrl.signal
  }).finally(() => {
    clearTimeout(timeout);
    ctrl.abort()
    scrollToBottom()
    loading.value = false;
  })
}

/**
 * 回车触发发送
 * @param event 监听
 */
const handleEnterDown = async (event: KeyboardEvent) => {
  const key = event.key;
  if (key === 'Enter' && event.shiftKey) {
  }
  else if (key === 'Enter') {
    event.preventDefault();
    sendChatMessage()
  }
}

const summaryTitle = async () => {
  req.get(`/chat/summary?conversationId=${conversationId.value}`)
    .then((res) => {
      if (res.data.code == 200) {
        for (const room of roomList.value) {
          if (room.id == conversationId.value) {
            room.title = res.data.data
          }
        }
      } else {
        ElMessage.error(res.data.message)
        console.log(res.data.message)
      }
    })
    .catch((err) => {
      ElMessage.error(err)
      console.log(err)
    })
}

const clickNewDialog = async () => {
  conversationId.value = v4()
  messages.value = []
  roomList.value.unshift({ id: conversationId.value, title: '新对话' })
}
</script>

<style scoped>
.chat-container {
  height: auto;
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
  gap: 10px;
  overflow-y: scroll;
  /* 为了避免输入框遮挡最后一条消息 */
  max-height: calc(100vh - 210px);
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

#main-chat {
  overflow: hidden;
  padding: 40px, 40px, 40px, 40px;
  /* 使父元素成为定位参考 */
  position: relative;
}

.human-input-box {
  position: absolute;
  /* 相对于父元素定位 */
  left: 50%;
  /* 使子元素自身的宽偏移一半*/
  transform: translate(-50%);
  bottom: 20px;
  width: 800px;
  display: flex;
  align-items: center;
  background-color: white;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 20px;
  max-width: 100%;
}


.human-input {
  :deep(.el-textarea__inner) {
    box-shadow: 0 0 0 0px var(--el-input-border-color, var(--el-border-color)) inset;
    resize: none;
    cursor: default;
  }
}
</style>


<style>
pre {
  background-color: #f9f9f9;
  border: 1px solid #d4d4d4;
  border-radius: 20px;
  padding: 20px;
  font-size: 14px;
  /* 内容超出时显示滚动条 */
  overflow: auto;
}

pre code {
  font-family: 'Fira Code';
}


/* 容器必须有 overflow 才能触发滚动条 */
.scroll-container {
  width: 300px;
  height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 10px;
}

/* === Chrome / Edge / Safari 自定义滚动条 === */
/* 滚动条整体（默认隐藏） */
::-webkit-scrollbar {
  width: 5px;
  /* 迷你滚动条 */
  height: 5px;
  /* 横向滚动条 */
}

/* 滚动条轨道（背景） */
::-webkit-scrollbar-track {
  background: transparent;
  /* 隐藏背景 */
  border-radius: 5px;
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background: rgba(150, 150, 150, 0.5);
  /* 淡灰色 */
  border-radius: 5px;
}

/* 鼠标悬停时 */
::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 100, 100, 0.7);
  /* 深一点 */
}

/* === Firefox 滚动条 === */
* {
  scrollbar-width: thin;
  /* 细滚动条 */
  scrollbar-color: rgba(150, 150, 150, 0.5) transparent;
  /* 滑块颜色 + 轨道透明 */
}
</style>
