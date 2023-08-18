<script lang="ts" setup>
import * as echarts from 'echarts'
import { onBeforeMount, onMounted, reactive, ref, toRaw } from 'vue'
import service from '@/service/index'



</script>

<template>
    <div class="DataDisplay">
        <header>
            <h1>退运邮件系统数据展示</h1>
        </header>
        <main>
            <div class="left">
                <roll></roll>
                <graph></graph>
            </div>
            <div class="right">
                <chart></chart>
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
    color: #1677ff;
}
main {
    display: flex;
}
main > div {
    border-radius: 10px;
    margin: 10px 10px 50px 10px;
}
.left{
    border: 1px solid #ececec;
    width: 25%;
    min-width: 340px;
}
.right {
    width: 70%;
}
.left > div, .right > div {
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
}
</style>