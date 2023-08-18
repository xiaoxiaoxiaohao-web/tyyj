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
let title = ref("入库邮件")
let radioValue = ref("邮件")

onMounted(() => {
    getMailNoData()
})

//获取邮件数据
function getMailNoData() {
    title.value = '入库邮件'
    service.gh_service.axios('cxyjxx', {
        D_APPTIME: ''
    }).then((res:any) => {
        list.data = []
        res.data.forEach((e:any) => {
            list.data.push(e.V_MAILNO)
        })
    }).catch((err:any) => {
        console.log(err);
        
    })
}

// 获取总包数据
function getTallyingData() {
    title.value = '理货总包'
    service.gh_service.axios('select', {
        D_APPTIME: ''
    }).then((res:any) => {
        list.data = []
        res.data.forEach((e:any) => {
            list.data.push(e.V_BAGNO)
        })
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

//设置定时切换
// function rollChange() {
//     setInterval(getTallyingData, 12000)
// }

// function onRadioChange() {
//     let val = radioValue.value
//     if(val == '总包') {
//         title.value = '理货总包'
//         getTallyingData()
//     }else {
//         title.value = '入库邮件'
//         getMailNoData()
//     }
    
// }
</script>

<template>
    <div class="roll">
        <header>
            <h3>{{title}}({{getCurrentDate()}})</h3>
        </header>
        <main>
            <swiper :slides-per-view="5"
            :autoplay="{ delay: 2000, disableOnInteraction: false }" :speed="5000" :space-between="0" :direction="'vertical'"
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
header {
    position: relative;
    width: 100%;
    transform: translateX(-50%);
    left: 50%;
}
</style>