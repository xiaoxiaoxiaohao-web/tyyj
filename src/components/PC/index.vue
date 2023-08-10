<script lang="ts" setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { h, ref } from "vue";
import { TableOutlined, PieChartOutlined, TeamOutlined, UserOutlined, CaretDownOutlined } from "@ant-design/icons-vue";
import { MenuProps, message } from "ant-design-vue";
import { useRouter } from 'vue-router';
import { useHomeStore } from '@/store/home'

dayjs.locale('zh');

let router = useRouter()
const homeStore = useHomeStore()
const current = ref<string[]>(['mailno'])
const items: any = ref<MenuProps["items"]>([
	{
		key: 'mailno',
		icon: () => h(TableOutlined),
		label: "入库邮件",
		title: "入库邮件",
	},
	{
		key: 'tallying',
		icon: () => h(TableOutlined),
		label: "理货总包",
		title: "理货总包",
	},
	{
		key: 'user',
		icon: () => h(TeamOutlined),
		label: "用户管理",
		title: "用户管理",
	},
	{
		key: 'data',
		icon: () => h(PieChartOutlined),
		label: "数据展示",
		title: "数据展示",
	},
])

function onMenuClick({ item, key, keyPath }) {
	switch(key){
		case 'tallying':
			router.push({name: 'tallyingtable'})
			break;
		case 'mailno':
			router.push({name: 'mailnotable'})
			break;
		case 'user':
			router.push({name: 'usertable'})
			break;
		case 'data':
			router.push({name: 'datadisplay'})
			break;
		default:
			router.push({name: 'mailnotable'})
	}
	
}

function onInfoClick() {

}

function onExitClick() {
	router.push({name: 'pclogin'})
}

</script>

<template>
 <a-config-provider :locale="zhCN">
	<div class="index">
		<header>
			<!-- <div class="title">
				<img src="@/assets/images/logo.png" alt="logo">
			</div> -->
			<div class="menu">
				<a-menu id="dddddd" v-model:selectedKeys="current" mode="horizontal" :items="items" @click="onMenuClick" />
			</div>
			<div class="user">
				<a-avatar :size="48" style="background-color: #1989fa">
					<template #icon><UserOutlined /></template>
				</a-avatar>
				<div class="info">
					<!-- <span>{{ homeStore.user.PERSON_NAME }} <caret-down-outlined /></span> -->
					<a-dropdown>
						<span class="ant-dropdown-link" @click.prevent>{{ homeStore.user.PERSON_NAME }}<CaretDownOutlined /></span>
							<template #overlay>
								<a-menu>
									<a-menu-item>
										<span href="javascript:;">个人信息</span>
									</a-menu-item>
									<a-menu-item>
										<span href="javascript:;">修改密码</span>
									</a-menu-item>
									<a-menu-item>
										<span @click="onExitClick">退出</span>
									</a-menu-item>
								</a-menu>
							</template>
					</a-dropdown>
				</div>
			</div>
		</header>
		<main>
			<router-view></router-view>
		</main>
	</div>
 </a-config-provider>
</template>


<style scoped>
header {
	display: flex;
	border-bottom: 1px solid rgba(5, 5, 5, 0.06);
}
/* .title {
	width: 10%;
	text-align: center;
	padding: 10px 20px;
}
.title > img {
	width: 115.8px;
	object-fit: cover;
} */
.ant-menu-horizontal {
	line-height: 50px;
}
.menu {
	width: calc(100% - 100px);
}
.user {
	width: 10%;
	line-height: 50px;
	display: flex;
}
.info {
	width: 50%;
	padding-left: 10px;
	cursor: pointer;
}
</style>
