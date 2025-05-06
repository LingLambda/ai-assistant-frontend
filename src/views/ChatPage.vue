<template>
  <div class="chat-app">
    <el-container class="app-container">
      <!-- 侧边栏 -->
      <el-aside width="280px" class="sidebar">
        <div class="sidebar-header">
          <h2 class="app-title">AI智能助手</h2>
          <el-button type="primary" class="new-chat-btn" @click="clickNewDialog">
            <el-icon><Plus /></el-icon>新对话
          </el-button>
        </div>

        <!-- 智能体选择 -->
        <div class="agent-selector">
          <div class="agent-title">选择智能体</div>
          <el-select v-model="currentAgent" class="agent-select" placeholder="选择智能体">
            <el-option
              v-for="agent in agents"
              :key="agent.id"
              :label="agent.name"
              :value="agent.id">
              <div class="agent-option">
                <div class="agent-icon" :style="{ backgroundColor: agent.color }">
                  <el-icon>
                    <component :is="getAgentIcon(agent.icon)" />
                  </el-icon>
                </div>
                <div class="agent-info">
                  <div class="agent-name">{{ agent.name }}</div>
                  <div class="agent-desc">{{ agent.description }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
        </div>

        <div class="room-list-container">
          <el-menu class="room-list" @select="handleSelect" :default-active="conversationId">
            <el-menu-item v-for="room in roomList" :key="room.id" :index="room.id" class="room-item">
              <el-icon><ChatDotRound /></el-icon>
              <span class="room-title">{{ room.title }}</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-aside>

      <!-- 主内容区 -->
      <el-container class="main-content">
        <el-header class="main-header">
          <div class="header-content">
            <h2 class="chat-title">AI智能客服</h2>
            <div class="header-actions">
              <el-button v-if="isAdmin" type="info" @click="router.push({ name: 'manager' });">
                <el-icon><Setting /></el-icon>管理控制台
              </el-button>
              <el-button v-if="!isAdmin" type="danger" @click="backToLoginPage">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-button>
            </div>
          </div>
        </el-header>

        <el-main id="main-chat" class="chat-main">
          <div class="chat-container" ref="containerRef">
            <div v-if="messages.length === 0" class="welcome-container">
              <div class="welcome-content">
                <div class="ai-avatar"></div>
                <h1 class="welcome-title">欢迎使用AI智能客服</h1>
                <p class="welcome-text">招生咨询相关问题都可以问我！</p>

                <!-- 功能展示 -->
                <div class="feature-showcase">
                  <div class="feature-item">
                    <el-icon><Document /></el-icon>
                    <span>文件解析</span>
                  </div>
                  <div class="feature-item">
                    <el-icon><DataAnalysis /></el-icon>
                    <span>数据分析</span>
                  </div>
                  <div class="feature-item">
                    <el-icon><Picture /></el-icon>
                    <span>图像识别</span>
                  </div>
                  <div class="feature-item">
                    <el-icon><Notebook /></el-icon>
                    <span>总结归纳</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 消息列表 -->
            <template v-else>
              <div v-for="(message, index) in messages" :key="index"
                  :class="['message-wrapper', message.align === 'left' ? 'ai-message' : 'user-message']">
                <div class="avatar-container" v-if="message.align === 'left'">
                  <div class="ai-avatar"></div>
                </div>
                <el-card :class="['message-card', message.align === 'left' ? 'ai-card' : 'user-card']"
                      :style="{ maxWidth: windowWidth - 400 + 'px' }">
                  <div v-html="message.text" class="message-content"></div>

                  <!-- 文件展示 -->
                  <div v-if="message.files && message.files.length > 0" class="file-attachments">
                    <div v-for="(file, fileIndex) in message.files" :key="fileIndex" class="file-item">
                      <div class="file-icon">
                        <el-icon>
                          <component :is="getIconComponent(file.type)" />
                        </el-icon>
                      </div>
                      <div class="file-info">
                        <div class="file-name">{{ file.name }}</div>
                        <div class="file-size">{{ formatFileSize(file.size) }}</div>
                      </div>
                      <el-button class="file-download" size="small" type="primary" plain>
                        <el-icon><Download /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </el-card>
                <div class="avatar-container" v-if="message.align === 'right'">
                  <div class="user-avatar"></div>
                </div>
              </div>
            </template>
          </div>

          <!-- 输入框区域 -->
          <div class="input-container">
            <!-- 功能工具栏 -->
            <div class="tools-bar">
              <div class="tool-item" @click="toggleFileUpload">
                <el-icon><Paperclip /></el-icon>
              </div>
              <div class="tool-item" @click="toggleVoiceInput">
                <el-icon><Microphone /></el-icon>
              </div>
              <div class="tool-item" @click="toggleScreenshot">
                <el-icon><PictureRounded /></el-icon>
              </div>
              <div class="tool-item" @click="toggleAgentMode">
                <el-icon><MagicStick /></el-icon>
              </div>
            </div>

            <el-input
              class="message-input"
              v-model="humanInput"
              autosize
              resize="none"
              type="textarea"
              placeholder="输入您的问题..."
              @keydown="handleEnterDown"
              :disabled="loading"
            />

            <!-- 文件上传区域 -->
            <div v-if="showFileUpload" class="file-upload-container">
              <div class="upload-hint">
                <el-icon><Upload /></el-icon>
                <span>拖拽文件到此处或</span>
                <el-button size="small" type="primary">选择文件</el-button>
              </div>
              <div v-if="selectedFiles.length > 0" class="selected-files">
                <div v-for="(file, index) in selectedFiles" :key="index" class="selected-file-item">
                  <div class="file-icon">
                    <el-icon>
                      <component :is="getIconComponent(file.type)" />
                    </el-icon>
                  </div>
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-remove" @click="removeSelectedFile(index)">
                    <el-icon><Close /></el-icon>
                  </div>
                </div>
              </div>
            </div>

            <el-button
              @click="sendChatMessage"
              :loading="loading"
              type="primary"
              class="send-button"
              :disabled="!humanInput.trim() && selectedFiles.length === 0"
            >
              <el-icon><Position /></el-icon>
            </el-button>
          </div>
        </el-main>
      </el-container>
    </el-container>

    <!-- 语音输入弹窗 -->
    <el-dialog
      title="语音输入"
      v-model="voiceDialogVisible"
      width="400px"
      custom-class="voice-dialog"
    >
      <div class="voice-input-container">
        <div class="voice-wave" :class="{ 'recording': isRecording }">
          <div v-for="n in 5" :key="n" class="wave-bar"></div>
        </div>
        <div class="voice-status">{{ isRecording ? '正在录音...' : '点击按钮开始录音' }}</div>
        <div class="voice-time" v-if="isRecording">{{ recordingTime }}s</div>
        <el-button
          :type="isRecording ? 'danger' : 'primary'"
          class="voice-button"
          @click="toggleRecording"
        >
          <el-icon>
            <component :is="isRecording ? 'Microphone': 'Microphone'" />
          </el-icon>
          {{ iRecording ? '停止' : '开始录音' }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 智能体功能弹窗 -->
    <el-dialog
      title="智能体功能"
      v-model="agentDialogVisible"
      width="600px"
      custom-class="agent-dialog"
    >
      <div class="agent-functions">
        <div v-for="(func, index) in agentFunctions" :key="index" class="agent-function-item"
          @click="selectAgentFunction(func)">
          <div class="function-icon" :style="{ backgroundColor: func.color }">
            <el-icon>
              <component :is="getIconComponent(func.icon)" />
            </el-icon>
          </div>
          <div class="function-info">
            <div class="function-name">{{ func.name }}</div>
            <div class="function-desc">{{ func.description }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import req from '@/utils/request'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { ElMessage } from 'element-plus'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { v4 } from 'uuid'
import { backToLoginPage, getToken, getUserFromToken } from '@/utils/jwtUtil'
import { marked } from 'marked'
import router from '@/router'
import { getCookie, setCookie } from '@/utils/cookieUtil'
import {
  Plus,
  ChatDotRound,
  Position,
  Setting,
  SwitchButton,
  Document,
  DataAnalysis,
  Picture,
  Notebook,
  Paperclip,
  Microphone,
  PictureRounded,
  MagicStick,
  Upload,
  Close,
  Download,
  Reading,
  School,
  OfficeBuilding,
  Share,
  Tickets,
  DataLine,
  DocumentCopy,
  Grid,
  VideoCamera,
  Headset,
  Help
} from '@element-plus/icons-vue'

interface Chat {
  text: string
  align: string
  files?: FileItem[]
}

interface Room {
  id: string,
  createTime?: Date,
  updateTIme?: Date,
  userId?: bigint,
  title: string
}

interface FileItem {
  name: string,
  type: string,
  size: number,
  url?: string
}

interface Agent {
  id: string,
  name: string,
  description: string,
  icon: string,
  color: string
}

interface AgentFunction {
  id: string,
  name: string,
  description: string,
  icon: string,
  color: string
}

// 基础数据
const conversationId = ref()
const humanInput = ref('')
const loading = ref(false)
const messages = ref<Chat[]>([])
const user = getUserFromToken()
const isAdmin = ref(user.roleName === '管理员')
const windowWidth = ref(window.innerWidth)
const roomList = ref<Room[]>([])
const containerRef = ref<HTMLElement | null>(null)

// 文件上传相关
const showFileUpload = ref(false)
const selectedFiles = ref<FileItem[]>([])

// 语音输入相关
const voiceDialogVisible = ref(false)
const isRecording = ref(false)
const recordingTime = ref(0)
let recordingTimer: number | null = null

// 智能体相关
const currentAgent = ref('general')
const agentDialogVisible = ref(false)
const agents = ref<Agent[]>([
  {
    id: 'general',
    name: '通用智能体',
    description: '擅长回答各类常见问题',
    icon: 'el-icon-s-help',
    color: '#4e6ef2'
  },
  {
    id: 'academic',
    name: '学术智能体',
    description: '专注于学术和研究类问题',
    icon: 'el-icon-reading',
    color: '#42b983'
  },
  {
    id: 'enrollment',
    name: '招生顾问',
    description: '提供详细的招生信息和建议',
    icon: 'el-icon-school',
    color: '#f56c6c'
  },
  {
    id: 'career',
    name: '就业顾问',
    description: '为就业提供指导和资源',
    icon: 'el-icon-office-building',
    color: '#e6a23c'
  }
])

const agentFunctions = ref<AgentFunction[]>([
  {
    id: 'summary',
    name: '对话总结',
    description: '总结当前对话的要点',
    icon: 'el-icon-document',
    color: '#409eff'
  },
  {
    id: 'analysis',
    name: '数据分析',
    description: '分析上传的数据文件',
    icon: 'el-icon-data-line',
    color: '#67c23a'
  },
  {
    id: 'translate',
    name: '多语言翻译',
    description: '将文本翻译成多种语言',
    icon: 'el-icon-share',
    color: '#e6a23c'
  },
  {
    id: 'code',
    name: '代码生成',
    description: '生成和解释各种编程语言代码',
    icon: 'el-icon-tickets',
    color: '#f56c6c'
  },
  {
    id: 'image',
    name: '图像识别',
    description: '分析和描述图像内容',
    icon: 'el-icon-picture',
    color: '#9c27b0'
  }
])

/**
 * 点击房间时，在cookie设置currentRoom为房间id，并查询房间消息
 * @param id
 */
const handleSelect = async (id: string) => {
  conversationId.value = id
  messages.value = []
  setCookie('currentRoom', id)
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
    const container = containerRef.value as HTMLElement;
    container.scrollTop = container.scrollHeight;
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
  messages.value = []

  if (!conversationId.value) return

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
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    })
}


// 发送信息 并设置cookie 当前房间
const sendChatMessage = () => {
  if (loading.value) return
  const message = humanInput.value;
  humanInput.value = '';
  const inputContent = message.trim();
  const hasFiles = selectedFiles.value.length > 0;

  if (!inputContent && !hasFiles) {
    ElMessage.error("请输入要发送的信息或选择文件");
    return;
  }

  if (!conversationId.value) {
    clickNewDialog()
  }

  // 创建用户消息对象
  const userMessage: Chat = {
    text: message,
    align: 'right'
  }

  // 如果有文件，添加到消息中
  if (hasFiles) {
    userMessage.files = [...selectedFiles.value]
    selectedFiles.value = []
    showFileUpload.value = false
  }

  messages.value.push(userMessage)
  loading.value = true;

  setCookie('currentRoom', conversationId.value)

  setTimeout(() => {
    scrollToBottom()
  }, 50)

  fetchChatAIData(inputContent)
};

/**
 * 获取ai流式消息数据
 * @param message 用户消息
 */
const fetchChatAIData = async (message: string) => {
  const baseURL = req.defaults.baseURL
  const ctrl = new AbortController();
  messages.value.push({ text: '<div class="typing-indicator"><span></span><span></span><span></span></div>', align: 'left' })
  const aiMessageIndex = messages.value.length - 1;
  let fromAiMdMsgCache = '';

  setTimeout(() => {
    scrollToBottom()
  }, 50)

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
      setTimeout(() => {
        scrollToBottom()
      }, 50)
    },
    // 关闭
    onclose() {
      if (messages.value.length === 2) {
        summaryTitle()
      }

      // 有10%概率模拟AI回复附带文件
      const shouldAddFile = Math.random() < 0.1 && message.length > 10;
      if (shouldAddFile) {
        setTimeout(() => {
          if (messages.value[aiMessageIndex]) {
            // 向AI消息添加文件(随机选择1-2个文件)
            const fileCount = Math.floor(Math.random() * 2) + 1;
            const files: FileItem[] = [];

            for (let i = 0; i < fileCount; i++) {
              const types = ['application/pdf', 'image/jpeg'];
              const names = ['招生简章.pdf', '校园地图.jpg'];
              const idx = Math.floor(Math.random() * types.length);

              files.push({
                name: names[idx],
                type: types[idx],
                size: Math.floor(Math.random() * 1024 * 1024 * 2)
              });
            }

            messages.value[aiMessageIndex].files = files;
            scrollToBottom();
          }
        }, 1000);
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
    // Shift+Enter 允许换行
  }
  else if (key === 'Enter') {
    event.preventDefault();
    // 有20%的概率在发送消息前添加模拟文件
    if (Math.random() < 0.2) {
      addDemoFile();
    }
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

// 文件相关功能函数
const toggleFileUpload = () => {
  showFileUpload.value = !showFileUpload.value
}

const removeSelectedFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return size + 'B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + 'KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(1) + 'MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(1) + 'GB'
  }
}

// 添加模拟文件
const addDemoFile = () => {
  if (humanInput.value.trim() && !selectedFiles.value.length) {
    // 随机选择一种文件类型添加
    const fileTypes = ['application/pdf', 'image/jpeg', 'application/msword', 'application/vnd.ms-excel']
    const fileNames = ['申请材料.pdf', '校园风景.jpg', '入学指南.docx', '招生数据.xlsx']
    const index = Math.floor(Math.random() * fileTypes.length)

    selectedFiles.value.push({
      name: fileNames[index],
      type: fileTypes[index],
      size: Math.floor(Math.random() * 1024 * 1024 * 5) // 随机文件大小，最大5MB
    })
  }
}

// 语音相关功能函数
const toggleVoiceInput = () => {
  voiceDialogVisible.value = true
}

const toggleRecording = () => {
  isRecording.value = !isRecording.value

  if (isRecording.value) {
    // 开始录音，设置计时器
    recordingTime.value = 0
    const timer = window.setInterval(() => {
      recordingTime.value++
      // 模拟20秒后自动停止
      if (recordingTime.value >= 20) {
        toggleRecording()
      }
    }, 1000)
    recordingTimer = timer
  } else {
    // 停止录音，清除计时器
    if (recordingTimer) {
      window.clearInterval(recordingTimer)
      recordingTimer = null
    }

    // 模拟语音识别结果
    if (recordingTime.value > 1) {
      setTimeout(() => {
        humanInput.value = "我想了解贵校的招生政策和申请条件"
        voiceDialogVisible.value = false
      }, 1000)
    } else {
      ElMessage.warning('录音时间太短')
    }
  }
}

// 智能体相关功能
const toggleAgentMode = () => {
  agentDialogVisible.value = true
}

const toggleScreenshot = () => {
  // 模拟选择截图功能，直接添加一个图片文件
  selectedFiles.value.push({
    name: '屏幕截图_' + new Date().toLocaleTimeString() + '.png',
    type: 'image/png',
    size: Math.floor(Math.random() * 1024 * 1024 * 2) // 随机文件大小，最大2MB
  })
}

const selectAgentFunction = (func: AgentFunction) => {
  agentDialogVisible.value = false

  // 根据不同功能类型设置不同的提示语
  switch(func.id) {
    case 'summary':
      humanInput.value = "请总结一下我们当前的对话要点"
      break
    case 'analysis':
      if (selectedFiles.value.length === 0) {
        selectedFiles.value.push({
          name: '数据分析.xlsx',
          type: 'application/vnd.ms-excel',
          size: Math.floor(Math.random() * 1024 * 1024 * 3)
        })
      }
      humanInput.value = "请分析这个数据文件并给出关键洞察"
      break
    case 'translate':
      humanInput.value = "请将以下文本翻译成英文：'我对贵校的计算机科学专业很感兴趣'"
      break
    case 'code':
      humanInput.value = "请用Python写一个简单的爬虫程序来获取大学排名数据"
      break
    case 'image':
      selectedFiles.value.push({
        name: '校园图片.jpg',
        type: 'image/jpeg',
        size: Math.floor(Math.random() * 1024 * 1024 * 2)
      })
      humanInput.value = "请描述这张图片中的内容"
      break
  }

  // 自动聚焦到输入框
  setTimeout(() => {
    const textarea = document.querySelector('.message-input textarea')
    if (textarea) {
      (textarea as HTMLTextAreaElement).focus()
    }
  }, 100)
}

const getAgentIcon = (iconName: string) => {
  switch (iconName) {
    case 'el-icon-s-help':
      return Help
    case 'el-icon-reading':
      return Reading
    case 'el-icon-school':
      return School
    case 'el-icon-office-building':
      return OfficeBuilding
    default:
      return Help
  }
}

const getIconComponent = (type: string) => {
  if (type.includes('image')) return Picture
  if (type.includes('pdf')) return DocumentCopy
  if (type.includes('word') || type.includes('doc')) return Document
  if (type.includes('excel') || type.includes('sheet')) return Grid
  if (type.includes('video')) return VideoCamera
  if (type.includes('audio')) return Headset

  // 对于功能图标
  if (type === 'el-icon-document') return Document
  if (type === 'el-icon-data-line') return DataLine
  if (type === 'el-icon-share') return Share
  if (type === 'el-icon-tickets') return Tickets
  if (type === 'el-icon-picture') return Picture

  return Document
}
</script>

<style scoped>
/* 应用全局样式 */
.chat-app {
  width: 100%;
  height: 100vh;
  background-color: #f9fafc;
  color: #333;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

.app-container {
  height: 100%;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}

/* 侧边栏样式 */
.sidebar {
  background: linear-gradient(180deg, #2c3e50 0%, #1a2a38 100%);
  color: white;
  height: 100vh;
  border-right: 1px solid #243342;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.app-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin-bottom: 15px;
}

.new-chat-btn {
  width: 100%;
  border-radius: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #4e6ef2;
  border: none;
  transition: all 0.2s ease;
}

.new-chat-btn:hover {
  background-color: #3b5de7;
  transform: translateY(-1px);
}

/* 智能体选择器 */
.agent-selector {
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.agent-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
}

.agent-select {
  width: 100%;
}

.agent-option {
  display: flex;
  align-items: center;
  padding: 5px 0;
}

.agent-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  color: white;
}

.agent-info {
  flex: 1;
}

.agent-name {
  font-weight: 500;
  font-size: 14px;
}

.agent-desc {
  font-size: 12px;
  color: #999;
}

.room-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.room-list {
  background: transparent;
  border-right: none;
}

.room-item {
  margin: 5px 10px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  height: 45px;
  line-height: 45px;
  display: flex;
  align-items: center;
}

.room-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.room-item.is-active {
  background-color: rgba(78, 110, 242, 0.2);
  color: white;
}

.room-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.95rem;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f9fafc;
}

.main-header {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 0 20px;
  height: 70px;
  display: flex;
  align-items: center;
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.chat-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 聊天主区域样式 */
.chat-main {
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f9fafc;
}

.chat-container {
  flex: 1;
  padding: 20px 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: calc(100vh - 150px);
}

/* 欢迎页样式 */
.welcome-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.welcome-content {
  text-align: center;
  max-width: 600px;
  padding: 30px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.5s ease-out;
}

.welcome-title {
  font-size: 2rem;
  margin-bottom: 15px;
  color: #333;
  font-weight: 600;
}

.welcome-text {
  font-size: 1.2rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
}

/* 功能展示 */
.feature-showcase {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background-color: #f8f9fa;
  width: 100px;
  transition: all 0.2s ease;
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  background-color: #f2f4f8;
}

.feature-item i {
  font-size: 24px;
  margin-bottom: 8px;
  color: #4e6ef2;
}

/* 消息样式 */
.message-wrapper {
  display: flex;
  margin-bottom: 15px;
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;
}

.ai-message {
  align-self: flex-start;
  justify-content: flex-start;
}

.user-message {
  align-self: flex-end;
  justify-content: flex-end;
}

.avatar-container {
  width: 36px;
  height: 36px;
  margin: 0 10px;
  flex-shrink: 0;
}

.ai-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #4e6ef2;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>');
  background-size: 60%;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f06292;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>');
  background-size: 60%;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.message-card {
  border-radius: 12px;
  padding: 12px;
  max-width: 70%;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.2s ease;
}

.ai-card {
  background-color: white;
  border-top-left-radius: 0;
}

.user-card {
  background-color: #4e6ef2;
  color: white;
  border-bottom-right-radius: 0;
}

.message-content {
  line-height: 1.5;
  font-size: 1rem;
}

.user-card .message-content {
  color: white;
}

/* 文件附件样式 */
.file-attachments {
  margin-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding-top: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 8px;
}

.user-card .file-item {
  background-color: rgba(255, 255, 255, 0.1);
}

.file-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.user-card .file-icon {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
}

.file-size {
  font-size: 12px;
  color: #999;
}

.user-card .file-size {
  color: rgba(255, 255, 255, 0.7);
}

.file-download {
  font-size: 16px;
}

/* 输入区域样式 */
.input-container {
  padding: 15px 20px;
  background-color: white;
  border-top: 1px solid #eee;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

/* 工具栏 */
.tools-bar {
  display: flex;
  margin-bottom: 10px;
}

.tool-item {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  margin-right: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-item:hover {
  background-color: #ebedf2;
  color: #4e6ef2;
  transform: translateY(-2px);
}

.message-input {
  flex: 1;
  border-radius: 8px;
  margin-right: 15px;
  background-color: #f5f7fa;
  transition: all 0.3s ease;
}

.message-input :deep(.el-textarea__inner) {
  border: none;
  padding: 12px 15px;
  max-height: 120px;
  font-size: 16px;
  box-shadow: none;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.message-input :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #4e6ef2 inset;
  background-color: white;
}

/* 文件上传区域 */
.file-upload-container {
  background-color: #f5f7fa;
  border: 2px dashed #dde0e5;
  border-radius: 8px;
  padding: 15px;
  margin: 10px 0 15px;
  transition: all 0.2s ease;
}

.file-upload-container:hover {
  border-color: #4e6ef2;
}

.upload-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
}

.upload-hint i {
  font-size: 24px;
  margin-right: 10px;
  color: #999;
}

.selected-files {
  margin-top: 15px;
}

.selected-file-item {
  display: flex;
  align-items: center;
  background-color: rgba(78, 110, 242, 0.08);
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 8px;
}

.selected-file-item .file-icon {
  width: 28px;
  height: 28px;
  font-size: 14px;
  background-color: #4e6ef2;
  color: white;
}

.selected-file-item .file-name {
  flex: 1;
  margin-left: 10px;
  font-size: 12px;
}

.file-remove {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
}

.file-remove:hover {
  color: #f56c6c;
}

.send-button {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background-color: #4e6ef2;
  border: none;
  box-shadow: 0 3px 5px rgba(78, 110, 242, 0.3);
  transition: all 0.2s ease;
}

.send-button:hover {
  background-color: #3b5de7;
  transform: translateY(-2px);
  box-shadow: 0 5px 8px rgba(78, 110, 242, 0.4);
}

.send-button:active {
  transform: translateY(0);
}

/* 语音输入弹窗 */
:deep(.voice-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.voice-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.voice-wave {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  width: 200px;
  margin-bottom: 20px;
}

.wave-bar {
  width: 4px;
  height: 20px;
  background-color: #4e6ef2;
  margin: 0 3px;
  border-radius: 2px;
  transition: height 0.2s ease;
}

.recording .wave-bar {
  animation: wave 1s infinite ease-in-out;
}

.recording .wave-bar:nth-child(1) {
  animation-delay: 0s;
}

.recording .wave-bar:nth-child(2) {
  animation-delay: 0.2s;
}

.recording .wave-bar:nth-child(3) {
  animation-delay: 0.4s;
}

.recording .wave-bar:nth-child(4) {
  animation-delay: 0.6s;
}

.recording .wave-bar:nth-child(5) {
  animation-delay: 0.8s;
}

@keyframes wave {
  0%, 100% {
    height: 20px;
  }
  50% {
    height: 60px;
  }
}

.voice-status {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
}

.voice-time {
  font-size: 24px;
  font-weight: 500;
  color: #4e6ef2;
  margin-bottom: 20px;
}

.voice-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160px;
}

/* 智能体功能弹窗 */
:deep(.agent-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.agent-functions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  padding: 10px;
}

.agent-function-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background-color: #f9fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.agent-function-item:hover {
  background-color: #f2f4f8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.function-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
  font-size: 18px;
}

.function-info {
  flex: 1;
}

.function-name {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 5px;
}

.function-desc {
  font-size: 12px;
  color: #777;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 正在输入指示器 */
.typing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 0;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  margin: 0 2px;
  background-color: #4e6ef2;
  border-radius: 50%;
  display: inline-block;
  opacity: 0.6;
}

.typing-indicator span:nth-child(1) {
  animation: bounce 1.5s 0.3s infinite;
}

.typing-indicator span:nth-child(2) {
  animation: bounce 1.5s 0.5s infinite;
}

.typing-indicator span:nth-child(3) {
  animation: bounce 1.5s 0.7s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-5px);
  }
}
</style>


<style>
/* 公共样式，以支持Markdown内容的美观展示 */
pre {
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  margin: 10px 0;
  overflow: auto;
  position: relative;
}

pre code {
  font-family: 'Fira Code', Consolas, Monaco, 'Andale Mono', monospace;
  tab-size: 2;
}

/* 代码块顶部样式 */
pre::before {
  content: "代码";
  position: absolute;
  top: 0;
  right: 10px;
  font-size: 12px;
  color: #64748b;
  padding: 2px 8px;
  background-color: #f1f5f980;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

/* Markdown 样式 */
h1, h2, h3, h4, h5, h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
  color: #111827;
}

h1 {
  font-size: 1.875em;
}

h2 {
  font-size: 1.5em;
}

h3 {
  font-size: 1.25em;
}

p {
  margin-top: 1em;
  margin-bottom: 1em;
  line-height: 1.6;
}

a {
  color: #3b82f6;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

ul, ol {
  padding-left: 1.5em;
  margin: 1em 0;
}

li {
  margin: 0.5em 0;
}

blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1em;
  margin: 1em 0;
  color: #4b5563;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}

table th, table td {
  padding: 0.5em;
  border: 1px solid #e5e7eb;
}

table th {
  background-color: #f9fafb;
  font-weight: 600;
}

hr {
  border: 0;
  border-top: 1px solid #e5e7eb;
  margin: 1.5em 0;
}

img {
  max-width: 100%;
  border-radius: 4px;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.3);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.5);
}

* {
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 116, 139, 0.3) transparent;
}
</style>
