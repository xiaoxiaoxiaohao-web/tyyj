<script lang="ts" setup>
import service from '@/service/index'
import { onMounted, reactive, ref, toRaw } from 'vue'
import { TableColumnsType, FormProps, message  } from 'ant-design-vue'
import table2excel from 'js-table2excel'

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
    {
        title: '采集时间',
        dataIndex: 'D_CJSJ',
        key: 'D_CJSJ',
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
    D_CJSJ: dateValue.value
})

let tablePagination = reactive({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showTotal: ((total:number) => {
        return `共 ${total} 条`;
    }),
})

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

//选择日期
function onChangePicker (value:any, dateString:any) {
    selectData.D_CJSJ = dateString
    
}

//表格改变
function onTableChange(pagination:any) {
    tablePagination.pageSize = pagination.pageSize
    tablePagination.current = pagination.current
}

function onFinshClick() {
    getTallyingTableData(toRaw(selectData))
}   

function handleFinishFailed() {

}

//重置
function onResetClick() {
    dateValue.value = ''
    selectData = reactive({
        V_BAGNO: '',
        N_BAGWEIGHT: '',
        V_DESTINATION: '',
        V_HBH: '',
        D_CJSJ: dateValue.value
    })
    onFinshClick()
}


//导出
function onExportClick() {
    table2excel(columns.value, dataSource.value, '理货总包数据' + new Date().getTime())
    message.success('导出成功')
}

</script>

<template>
    <div class="TallyingTable">
        <header>
            <a-form
                layout="inline"
                :model="selectData"
                @finish="onFinshClick"
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
                <a-form-item label="采集时间">
                    <a-date-picker v-model:value="dateValue" @change="onChangePicker" />
                </a-form-item>
                <a-form-item>
                    <a-space>
                        <a-button type="primary" html-type="submit">查询</a-button>
                        <a-button type="primary" primary ghost @click="onResetClick">重置</a-button>
                    </a-space>
                </a-form-item>
            </a-form>
        </header>
        <main>
            <div class="btn-group" style="margin-bottom: 15px;">
                <a-button type="primary" @click="onExportClick">导出</a-button>
            </div>
            <a-table bordered size="middle"
                :dataSource="dataSource" 
                :columns="columns"
                :scroll="{ y: 480 }"
                :pagination="tablePagination"
                @change="onTableChange"
            />
        </main>
    </div>
</template>

<style scoped>
header {
    margin: 10px 30px;
}
main {
    margin: 20px 30px;
}
</style>