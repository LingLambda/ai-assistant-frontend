import router from '@/router'
import { ElMessage } from 'element-plus'
import { jwtDecode, type JwtPayload } from 'jwt-decode'
import { deleteCookie, getCookie, setCookie } from './cookieUtil'

export interface CustomJwtPayload extends JwtPayload {
  username: string
  roleId: string
  roleName: string
}

export function getToken(): string {
  try {
    const token = getCookie('token')
    if (token) {
      const payLoad = jwtDecode<JwtPayload>(token)
      if (payLoad && payLoad.exp && Date.now() / 1000 < payLoad.exp) {
        return token // Token 有效
      } else {
        backToLoginPage() // Token 过期
      }
    }
  } catch (error) {
    console.error('Token 解析错误:', error)
    backToLoginPage() // 解析错误
  }
  return '' // 没有 token 或 token 无效
}

export function checkToken() {
  try {
    const token = getCookie('token')
    if (token) {
      const payLoad = jwtDecode<JwtPayload>(token)
      if (payLoad && payLoad.exp && Date.now() / 1000 < payLoad.exp) {
        return true
      }
    }
  } catch (error) {
    console.error('Token 解析错误:', error)
    backToLoginPage() // 解析错误
  }
  return false
}

export function getUserFromToken() {
  const token = getToken()
  if (!token) {
    return {
      userId: '',
      username: '',
      roleId: '',
      roleName: '',
    }
  }
  const payload = jwtDecode<CustomJwtPayload>(token)
  return {
    userId: payload.sub,
    username: payload.username,
    roleId: payload.roleId,
    roleName: payload.roleName,
  }
}

export function setToken(token: string) {
  setCookie('token', token, 30)
}

export async function backToLoginPage() {
  ElMessage.error('令牌已过期')
  deleteCookie('token')
  router.push({ name: 'login' })
}
