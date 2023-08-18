<script lang="ts" setup>
import * as echarts from 'echarts'
import { onMounted, reactive, ref, toRaw } from 'vue'

let graph = ref<HTMLInputElement|null>(null)
let graphOption = {
    title: {
        text: '退运流程图',
        left: 'center'
    },
    tooltip: {},
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
    {
        type: 'graph',
        layout: 'none',
        symbolSize: 30,
        roam: true,
        label: {
            show: true
        },
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [4, 10],
        itemStyle: {
            color: '#1677ff',
        },
        data: [
            {
                name: '邮件入库',
                x: 100,
                y: 130,
            },
            {
                name: '理货采集',
                x: 150,
                y: 100,
            },
            {
                name: '出库申请',
                x: 200,
                y: 130,
            },
            {
                name: '装车绑定',
                x: 250,
                y: 100,
            },
            {
                name: '装车确认',
                x: 300,
                y: 130,
            },
            {
                name: '异常邮件',
                x: 380,
                y: 130,
            },
            {
                name: '车辆备案',
                x: 200,
                y: 180,
                symbolSize: 30,
            }
        ],
        links: [
            {
                source: '邮件入库',
                target: '理货采集'
            },
            {
                source: '理货采集',
                target: '出库申请'
            },
            {
                source: '出库申请',
                target: '装车绑定'
            },
            {
                source: '装车绑定',
                target: '装车确认'
            },
            {
                source: '车辆备案',
                target: '出库申请',
                symbol: 'circle',
                lineStyle: {
                    type: 'dotted'
                }
            }
        ],
        lineStyle: {
            color: '#91caff',
            opacity: 0.9,
            width: 2,
            curveness: 0
        }
    }
  ]
}
let myGraph:any

onMounted(() => {
    createGraph()
    window.addEventListener('resize', () => {
        myGraph.resize()
        graphOption && myGraph.setOption(graphOption)
    })
})

function createGraph() {
    let chartDom = graph.value
    myGraph = echarts.init(chartDom)
    graphOption && myGraph.setOption(graphOption)
}





</script>

<template> 
    <div class="graph" ref="graph"></div>
</template>

<style scoped>
.graph{
    width: 100%;
    height: 300px;
}
</style>