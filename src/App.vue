<script setup lang="ts">
import TabbarView from "@/views/TabbarView.vue"
import { onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
let route = useRoute()
const router = useRouter()
let clientWidth = ref<number>(0)

onMounted(() => {
    if (_isMobile()) {
        router.push({ name: "login" })
    } else {
        router.push({ name: "pclogin" })
    }
})

function _isMobile() {
	let flag = navigator.userAgent.match(
		/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
	);
	return flag;
}

function getClientWidth() {
  clientWidth.value = document.documentElement.clientWidth
}
</script>

<template>
	<main>
		<RouterView />
	</main>
	<footer v-if="route.meta.hideTabbar">
		<TabbarView></TabbarView>
	</footer>
</template>

<style scoped>
main {
  	width: 100%;
}
</style>
