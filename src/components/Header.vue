<template>
  <el-container>
    <el-header style="height: auto">
      <el-menu :default-active="activeIndex" :ellipsis="false" mode="horizontal" @select="handleSelect">
        <el-menu-item index="0">
          <img class="logo" src="../assets/images/logo.png" alt="Logo" @click="router.push({ name: 'welcome' })"
            style="height: 80%;">
        </el-menu-item>
        <div class="spacer"></div>
        <el-menu-item index="4">
          <el-text tag="b">与AI智能客服对话</el-text>
        </el-menu-item>
        <el-menu-item index="1">
          <el-text tag="b">查询知识库</el-text>
        </el-menu-item>
        <el-menu-item index="2">
          <el-text tag="b">管理知识库</el-text>
        </el-menu-item>
        <el-sub-menu index="3">
          <template #title>欢迎你 {{ user.username }}</template>
          <el-menu-item index="3-1" disabled>权限等级：{{ user.roleName }}</el-menu-item>
          <el-menu-item index="3-2">退出登录</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-header>
    <el-main>
      <RouterView />
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import { backToLoginPage, getUserFromToken } from '@/utils/jwtUtil';
import { onBeforeMount, provide, ref } from 'vue'
import { defineOptions } from 'vue'
import { useRouter } from 'vue-router'


const activeIndex = ref('0');
const router = useRouter();
const user = ref();

const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
  switch (key) {
    case "4": {
      router.push({ name: "chat" })
      break;
    }
    case "1": {
      router.push({ name: "search" })
      break;
    }
    case "2": {
      router.push({ name: "manager" })
      break;
    }
    case "3-1": {
      break;
    }
    case "3-2": {
      backToLoginPage()
    }
  }
}
onBeforeMount(async () => {
  user.value = getUserFromToken()
}
)

defineOptions({
  name: "HeaderComp"
})


provide('activeIndex', activeIndex);//提供给其他组件访问
</script>

<style>
.menu-flex {
  display: flex;
  justify-content: space-between;
  /* 让各项均匀分布 */
}

.spacer {
  flex-grow: 1;
  /* 这个空的 div 会占据剩余空间，推送后面的菜单项到右边 */
}

.el-menu-item {
  flex-shrink: 0;
  /* 防止菜单项被压缩 */
}
</style>
