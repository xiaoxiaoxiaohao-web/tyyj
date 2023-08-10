<script lang="ts" setup>
import * as echarts from 'echarts'
import service from '@/service/index'
import { onMounted, reactive, ref, toRaw } from 'vue'

let line = ref<HTMLInputElement|null>(null)
let option = {
    title: {
        text: '入库邮件情况',
        left: 'center'
    },
    grid: {
        left: '10%',
        right: '20%'
    },
    xAxis: {
        type: 'category',
        name: '入库日期',
        data: [],
        axisLabel: {  //文字倾斜
        　　interval:0,
        　　rotate:60
        },
    },
    yAxis: {
        type: 'value',
        minInterval: 1,
        // axisLine: {  
        //     show: true  //显示坐标轴轴线
        // }
    },
    tooltip: {
        show: true
    },
    toolbox: {
        id: 'mailnoline',
        show: 'true'
    },
    series: [
        {
            data: [],
            type: 'line',
            smooth: true
        }
    ],
    dataZoom:[
        {
            type: 'inside',//内置于坐标系中的滑动条
            start: 0, //数据窗口范围的起始百分比0-100
            end: 100, //数据窗口范围的结束百分比0-100
            xAxisIndex: [0], // 此处表示控制第一个xAxis
        },
    ]
}

onMounted(() => {
    getMailNoGroupData()
})

//获取折线图数据
function getMailNoGroupData() {
    service.gh_service.axios('yjxxqk').then((res:any) => {
        if(res.success == true) {
            let data = res.data
            data.forEach((e:any) => {
                option.xAxis.data.push(e.D_APPTIME)
                option.dataZoom[0].xAxisIndex.push(e.D_APPTIME)
                option.series[0].data.push(e.NUM)
            })
            //根据数据变动，尽可能显示8条数据
            if(data.length > 8) {
                option.dataZoom[0].start = (8/data.length) * 100
            }
            createLineChart()
        }
    }).catch((err:any) => {
        console.log(err);
        
    })
}

//构建折线图
function createLineChart() {
    let chartDom = line.value
    let myChart = echarts.init(chartDom)
    option && myChart.setOption(option)
}

</script>

<template>
    <div class="MailNoChart">
        <main>
            <div class="line" ref="line">

            </div>
        </main>
    </div>
</template>

<style scoped>
.line{
    width: 400px;
    height: 300px;
    /* border: 2px solid #fff; */
}
</style>