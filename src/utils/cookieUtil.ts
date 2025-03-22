export const setCookie = (key: string, value: string, day = 7) => {
  const expires = new Date(Date.now() + day * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${key}=${value};expires=${expires};`
}

export const deleteCookie = (key: string) => {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export const getCookie = (key: string) => {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [k, v] = cookie.split('=')
    if (k.trim() === key) return v ? v.trim() : '' //确认v存在
  }
  return ''
}
