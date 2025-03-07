<template>
  <div class="button-box">
    <el-row class="title-row" justify="center">
      <h1 class="title">欢迎进入LingLambda知识库管理平台</h1>
    </el-row>

    <el-row class="button-row" justify="center" gutter={20}>
      <el-button class="left-button" type="primary" size="large" @click="toSearch">查询知识库</el-button>
      <el-button class="right-button" type="success" size="large" @click="toManager">管理知识库</el-button>
    </el-row>
  </div>
</template>


<script lang="ts" setup>
import { inject, onMounted, type Ref } from 'vue';
import { useRouter } from 'vue-router'

const router = useRouter();

const activeIndex = inject<Ref<string>>('activeIndex');

onMounted(() => {
  if (activeIndex) {
    activeIndex.value = '0';
  }
})

async function toSearch() {
  console.log(activeIndex)
  if (activeIndex) {
    activeIndex.value = '1';
  }
  router.push({name:"search"})
}

async function toManager() {
  console.log(activeIndex)
  if (activeIndex) {
    activeIndex.value = '2';
  }
  router.push({name:"manager"})
}

defineOptions({
  name: "WelcomePage",
})

</script>

<style scoped>

.button-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80vh;
  padding: 20px;
  text-align: center;
}

.title-row {
  margin-bottom: 40px;
  /* 设置标题的下边距 */
}

.title {
  font-size: 40px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.button-row {
  display: flex;
  gap: 20px;
  /* 设置按钮间距 */
  justify-content: center;
}

.left-button,
.right-button {
  width: 150px;
  /* 设置按钮宽度 */
  height: 50px;
  /* 设置按钮高度 */
  font-size: 18px;
  font-weight: bold;
  border-radius: 25px;
  /* 圆角按钮 */
  transition: all 0.3s ease;
  /* 按钮过渡效果 */
}

.left-button:hover,
.right-button:hover {
  transform: scale(1.05);
  /* 鼠标悬停时放大按钮 */
}

.left-button {
  background-color: #409EFF;
  /* 蓝色 */
  border-color: #409EFF;
}

.right-button {
  background-color: #67C23A;
  /* 绿色 */
  border-color: #67C23A;
}

@media (max-width: 768px) {
  .button-row {
    flex-direction: column;
  }

  .left-button,
  .right-button {
    width: 80%;
    /* 移动端宽度调整 */
    margin-bottom: 10px;
    /* 按钮之间的间距 */
  }

  .title {
    font-size: 28px;
    /* 移动端标题字体大小 */
  }
}
</style>