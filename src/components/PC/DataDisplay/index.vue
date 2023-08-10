<script lang="ts" setup>
import * as echarts from 'echarts'
import { onBeforeMount, onMounted, reactive, ref, toRaw } from 'vue'
import service from '@/service/index'


onMounted(() => {

})


</script>

<template>
    <div class="DataDisplay">
        <header>
            <h1>退运邮件系统数据展示</h1>
        </header>
        <main>
            <div class="left">
                <mail-no-roll></mail-no-roll>
                <!-- <mail-no-chart></mail-no-chart> -->
            </div>
            <div class="center">
                <chart></chart>
            </div>
            <div class="right">
                <tallying-roll></tallying-roll>
                <graph></graph>
            </div>
        </main>
        <footer>
            <h3>广东省航空邮件处理中心版权所有©2023</h3>
        </footer>
    </div>
</template>

<style scoped>
.DataDisplay {
    text-align: center;
    /* background: #ececec; */
    color: #1677ff;
}
main {
    display: flex;
}
main > div {
    border-radius: 10px;
    margin: 10px 10px 50px 10px;
}
.left, .right {
    border: 1px solid #ececec;
    width: 25%;
}
.center {
    width: 50%;
}
.left > div, .right > div {
    /* border: 1px solid #ececec; */
    border-radius: 10px;
    margin: 10px 10px 50px 10px;
}

footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 30px;
    line-height: 30px;
    text-align: center;
    color: #1677ff;
    /* background: url('@/assets/images/login-top.png'); */
}
</style>