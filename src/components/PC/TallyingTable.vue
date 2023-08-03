<script lang="ts" setup>
import service from '@/service/index'
import { onMounted, reactive, ref, toRaw } from 'vue'
import type { TableColumnsType, FormProps  } from 'ant-design-vue'

//表头
let columns:any = ref<TableColumnsType>([
    {
        title: '邮袋号',
        dataIndex: 'V_BAGNO',
        key: 'V_BAGNO',
        width: 150
    },
    {
        title: '重量(kg)',
        dataIndex: 'N_BAGWEIGHT',
        key: 'N_BAGWEIGHT',
        width: 30
    },
    {
        title: '目的地',
        dataIndex: 'V_DESTINATION',
        key: 'V_DESTINATION',
        width: 100
    },
    {
        title: '航班号',
        dataIndex: 'V_HBH',
        key: 'V_HBH',
        width: 80
    },
    {
        title: '封发时间',
        dataIndex: 'D_DESPTIME',
        key: 'D_DESPTIME',
        width: 80
    },
    {
        title: '出库装车序列号',
        dataIndex: 'V_AUDIT_NO',
        key: 'V_AUDIT_NO',
        width: 80
    },
    {
        title: '操作人',
        dataIndex: 'V_OPERATORNAME',
        key: 'V_OPERATORNAME',
        width: 80
    },
])

let dataSource =  ref([])
let dateValue = ref()
let selectData = reactive({
    V_BAGNO: '',
    N_BAGWEIGHT: '',
    V_DESTINATION: '',
    V_HBH: '',
    D_DESPTIME: dateValue.value
})

// let tablePagination = reactive({
//     current: 1,
//     pageSize: 10,
//     showSizeChanger: true
// })

onMounted(() => {
    getTallyingTableData(toRaw(selectData))
})

//获取表格数据
function getTallyingTableData(data:object) {
    service.gh_service.axios('select', data)
    .then((res:any) => {
        dataSource.value = res.data
    }).catch((err:any) => {
        console.log(err);
        
    })
}

function onChangePicker (value:any, dateString:any) {
    selectData.D_DESPTIME = dateString
    
}

// function handleResizeColumn(w:any, col:any) {
//   col.width = w;
// }

//表格改变
// function onChange(pagination:any) {
//     tablePagination.pageSize = pagination.pageSize
//     tablePagination.current = pagination.current
// }

function onFinish() {
    console.log(toRaw(selectData));
    getTallyingTableData(toRaw(selectData))
    
}   

function handleFinishFailed() {

}

</script>

<template>
    <div class="tallyingTable">
        <header>
            <a-form
                layout="inline"
                :model="selectData"
                @finish="onFinish"
                @finishFailed="handleFinishFailed"
            >
                <a-form-item label="邮袋号">
                    <a-input v-model:value="selectData.V_BAGNO" placeholder="邮袋号" />
                </a-form-item>
                <a-form-item label="目的地">
                    <a-input v-model:value="selectData.V_DESTINATION" placeholder="目的地" />
                </a-form-item>
                <a-form-item label="航班号">
                    <a-input v-model:value="selectData.V_HBH" placeholder="航班号" />
                </a-form-item>
                <a-form-item label="出库装车序列号">
                    <a-input v-model:value="selectData.V_AUDIT_NO" placeholder="出库装车序列号" />
                </a-form-item>
                <a-form-item label="封发时间">
                    <a-date-picker v-model:value="dateValue" @change="onChangePicker" />
                </a-form-item>
                <a-form-item>
                    <a-button type="primary" html-type="submit">查询</a-button>
                </a-form-item>
            </a-form>
        </header>
        <main>
            <a-table bordered size="middle"
                :dataSource="dataSource" 
                :columns="columns"
                :scroll="{ y: 480 }"
            />
        </main>
    </div>
</template>

<style scoped>
header {
    margin-top: 10px;
}
main {
    margin-top: 20px;
}
</style>