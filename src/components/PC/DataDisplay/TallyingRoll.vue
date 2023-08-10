<script lang="ts" setup>
import service from '@/service/index'
import { onMounted, reactive, ref, toRaw } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
let list = reactive({
    data: [],
    modules: [Autoplay]
})

onMounted(() => {
    getMailNoTableData()
})

function getMailNoTableData() {
    service.gh_service.axios('select', {
        D_APPTIME: ''
    })
    .then((res:any) => {
        console.log(res);
        res.data.forEach((e:any) => {
            list.data.push(e.V_BAGNO)
        })
        // list.data = res.data
    }).catch((err:any) => {
        console.log(err);
        
    })
}
//获取当前年月日
function getCurrentDate() {
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()

    let current = year + '-' + month + '-' + day
    return current
}
</script>

<template>
    <div class="TallyingRoll">
        <header>
            <h3>今天理货邮袋({{getCurrentDate()}})</h3>
        </header>
        <main>
            <swiper :slides-per-view="5"
            :autoplay="{ delay: 2000, disableOnInteraction: false }" :speed="500" :space-between="0" :direction="'vertical'"
            :scrollbar="{ draggable: false }" :loop="true"  :modules="list.modules" style="height: 240px;"
            >
                <swiper-slide v-for="(item, index) in list.data" :key="index">
                    <a-alert :message="item" type="info" />
                </swiper-slide>
            </swiper>
        </main>
    </div>
</template>

<style scoped>
/* main {
    height: 300px;
} */
/* main li {
    background: #ececec;
    color: #1677ff;
} */
</style>