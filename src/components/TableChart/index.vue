<script lang="ts" setup>
import { h, ref } from "vue";
import { TableOutlined, PieChartOutlined, TeamOutlined } from "@ant-design/icons-vue";
import { MenuProps } from "ant-design-vue";
const current = ref<string[]>(["mail"]);
const items: any = ref<MenuProps["items"]>([
	{
		key: "tallying",
		icon: () => h(TableOutlined),
		label: "理货采集总包",
		title: "理货采集总包",
	},
	{
		key: "chart",
		icon: () => h(PieChartOutlined),
		label: "数据分析",
		title: "数据分析",
	},
	{
		key: "user",
		icon: () => h(TeamOutlined),
		label: "用户管理",
		title: "用户管理",
	},
]);
</script>

<template>
  <div class="index">
    <header>
      <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" />
    </header>
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>


<style scoped>
head main {
 	margin-top: 20px;
}
</style>
