import { createRouter, createWebHistory } from 'vue-router'
import SearchPage from '@/views/SearchPage.vue'
import { ElMessage } from 'element-plus'
import SignUp from '@/views/SignUp.vue'
import Login from '@/views/Login.vue'
import Welcome from '@/views/Welcome.vue'
import Header from '@/components/Header.vue'
import ChatPage from '@/views/ChatPage.vue'
import { checkToken, getUserFromToken } from '@/utils/jwtUtil'
import ManagerPage from '@/views/ManagerPage.vue'
import UserManagement from '@/views/UserManagement.vue'
import SystemLog from '@/views/SystemLog.vue'
import Analytics from '@/views/Analytics.vue'
import VectorSearchPage from '@/views/VectorSearchPage.vue'

const routes = [
  {
    path: '/',
    name: 'main',
    component: Header,
    children: [
      {
        path: '',
        name: 'welcome',
        component: Welcome,
      },
      {
        path: 'manager',
        name: 'manager',
        component: ManagerPage,
      },
      {
        path: 'search',
        name: 'search',
        component: SearchPage,
      },
      {
        path: 'vector-search',
        name: 'vector-search',
        component: VectorSearchPage,
      },
      {
        path: 'user-management',
        name: 'user-management',
        component: UserManagement,
      },
      {
        path: 'system-log',
        name: 'system-log',
        component: SystemLog,
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: Analytics,
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/sign_up',
    name: 'signUp',
    component: SignUp,
  },
  {
    path: '/chat',
    name: 'chat',
    component: ChatPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  try {
    if (to.name !== 'login' && to.name !== 'signUp') {
      if (!checkToken()) {
        ElMessage.error('请先登录！')
        return { name: 'login' }
      } else {
        const user = getUserFromToken()
        // 检查用户权限
        if (user.roleName === '用户' && to.name !== 'chat') {
          ElMessage.error('无权访问')
          return { name: 'chat' }
        }
      }
    }
  } catch (error) {
    console.error('导航守卫错误:', error)
    ElMessage.error('发生错误，请重试')
    return false
  }
})

export default router
