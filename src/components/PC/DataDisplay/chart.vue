<script lang="ts" setup>
import * as echarts from 'echarts'
import service from '@/service/index'
import { onMounted, reactive, ref, toRaw, watch } from 'vue'

let bar = ref<HTMLInputElement|null>(null)
let barOption:any = {
    title: {
        text: '退运数据整体情况',
        left: 'center'
    },
    grid: {
        left: '10%',
        right: '10%'
    },
    toolbox: {
        id: 'chart',
        show: true,
        orient: 'vertical',
        feature: {
            dataView: {
                readOnly: true,
                title: '数据视图',
                lang: ['数据视图', '关闭', '刷新']
            },
            magicType: {
                type: ["line", "bar"],
                title: {line: '折线图', bar: '条形图'}
            },
            restore: {
                title: '还原'
            },
            saveAsImage: {
                title: '保存为图片'
            }
        }
    },
    xAxis: [{
        type: 'category',
        name: '日期',
        data: [],
        axisLabel: {  //文字倾斜
        　　interval:0,
        　　rotate:60
        },
    }],
    yAxis: [{
        type: 'value',
        minInterval: 1,
    }],
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
    },
    legend: {
        data: ['总包', '邮件'],
        left: 'left'
    },
    series: [
        {
            name: '总包',
            data: [],
            type: 'bar',
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#FC8452' },
                    { offset: 1, color: '#F5804E' }
                ])
            },
            emphasis: {
                focus: 'series'
            },
        },
        {
            name: '邮件',
            data: [],
            type: 'bar',
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#83bff6' },
                    { offset: 1, color: '#1677ff' }
                ])
            },
            emphasis: {
                focus: 'series'
            }
        }
    ],
    dataZoom:[
        {
            type: 'inside',//内置于坐标系中的滑动条
            start: 60, //数据窗口范围的起始百分比0-100
            end: 100, //数据窗口范围的结束百分比0-100
            xAxisIndex: [0],
        },
    ]
}

let clientWidth = ref<number>(document.body.clientWidth)
let myChart:any

onMounted(() => {
    getTallyingGroupData()
    window.addEventListener('resize', () => {
        myChart.resize()
        barOption && myChart.setOption(barOption)
    })
})


//获取总包数据
function getTallyingGroupData() {
    service.gh_service.axios('ydxxqk').then((res:any) => {
        if(res.success == true) {
            barOption.xAxis[0].data = []
            let data = res.data
            data.forEach((e:any) => {
                barOption.xAxis[0].data.push(e.D_CJSJ)
                barOption.series[0].data.push(e.NUM)
            })
            
            //根据数据变动，尽可能显示8条数据
            if(data.length > 8) {
                barOption.dataZoom[0].start = (8/data.length) * 100
            }
           getMailNoGroupData()
        }
    }).catch((err:any) => {
        console.log(err);
        
    })
}

//获取邮件数据
function getMailNoGroupData() {
    service.gh_service.axios('yjxxqk').then((res:any) => {
        if(res.success == true) {
            barOption.series[1].data = []
            let data = res.data
            data.forEach((e:any) => {
                barOption.series[1].data.push(e.NUM)
            })
            createBarChart()
        }
    }).catch((err:any) => {
        console.log(err);
        
    })
}

//构建条形图
function createBarChart() {
    let chartDom = bar.value
    myChart = echarts.init(chartDom)
    barOption && myChart.setOption(barOption)
}

</script>

<template>
    <div class="chart">
        <main>
            <div class="bar" ref="bar">

            </div>
        </main>
    </div>
</template>

<style scoped>
.bar{
    width: 100%;
    height: 600px;
}
</style>