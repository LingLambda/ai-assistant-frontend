import axios from 'axios'
import { getToken } from './jwtUtil'

const req = axios.create({
  baseURL: 'http://localhost:8080',
})

// 添加请求拦截器
req.interceptors.request.use(
  async function (config) {
    const token = await getToken()
    if (token) {
      config.headers['Authorization'] = token
    } 
    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

export default req
