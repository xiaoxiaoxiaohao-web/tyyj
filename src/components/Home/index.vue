<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router';

let sidebar = reactive({active: 0})
let router = useRouter()
let onSidebarChange = (index: any) => {
    switch(index){
        case 0: 
            router.push({name: 'warehousing'}) 
            break;
        case 1: 
            router.push({name: 'tallying'})
            break;
        case 2: 
            router.push({name: 'outbound'})
            break;
        case 3: 
            router.push({name: 'loading'})
            break;
        case 4: 
            router.push({name: 'confirmation'})
            break;
        case 5: 
            router.push({name: 'abnormal'})
            break;
        default: 
            router.push({name: 'warehousing'})
    }
}
</script>

<template>
    <div class="Home">
        <header>
            <van-nav-bar title="首页" />
        </header>
        <main>
            <nav>
                <van-sidebar v-model="sidebar.active" @change="onSidebarChange">
                    <van-sidebar-item title="邮件入库" />
                    <van-sidebar-item title="理货采集" />
                    <van-sidebar-item title="出库申请" />
                    <van-sidebar-item title="装车绑定" />
                    <van-sidebar-item title="装车确认" />
                    <van-sidebar-item title="异常邮件" />
                </van-sidebar>
            </nav>
            <article>
                <router-view></router-view>
            </article>
        </main>
    </div>
</template>

<style scoped>
header {
    position: fixed;
    width: 100%;
    height: 46px;
    top: 0;
    z-index: 1;
}
.van-sidebar, .van-sidebar-item {
    width: 60px;
}
main {
    display: flex;
    padding-top: 46px;
    width: 100%;
    overflow: hidden;
}
nav {
    position: fixed;
    height: 100%;
    background-color: #f7f8fa;
}
article {
    width: calc(100% - 60px);
    margin-left: 60px;
}
</style>