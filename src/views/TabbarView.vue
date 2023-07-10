<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router';
const route = useRoute()

let router = useRouter()
let active = ref();

onMounted(() => {
    active.value = route.meta.tabbarNum
})


let onChange = (index:any) => {
    if(index == 0) {
        router.push('/home')
    }else if(index == 1) {
        router.push('/filings')
    }else if(index == 2) {
        router.push('/user')
    }
}
</script>

<template>
    <div class="Tabbar" >
        <van-tabbar v-model="active" @change="onChange">
            <van-tabbar-item icon="home-o">首页</van-tabbar-item>
            <van-tabbar-item icon="logistics">备案</van-tabbar-item>
            <van-tabbar-item icon="user-o">我的</van-tabbar-item>
        </van-tabbar>
    </div>
</template>