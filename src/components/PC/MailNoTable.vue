<script lang="ts" setup>
import service from '@/service/index'
import { onMounted, reactive, ref, toRaw } from 'vue'
import { TableColumnsType, FormProps, message  } from 'ant-design-vue'
import table2excel from 'js-table2excel'

//表头
let columns = ref<TableColumnsType>([
    {
        title: '邮件号',
        dataIndex: 'V_MAILNO',
        key: 'V_MAILNO',
        width: 150
    },
    {
        title: '申报时间',
        dataIndex: 'D_APPTIME',
        key: 'D_APPTIME',
        width: 100
    },
    {
        title: '查询结果',
        dataIndex: 'V_NOTE',
        key: 'V_NOTE',
        width: 80
    },
    {
        title: '退运指令时间',
        dataIndex: 'D_RETURN_DATE',
        key: 'D_RETURN_DATE',
        width: 80
    },
    {
        title: '操作人',
        dataIndex: 'V_OPERNAME',
        key: 'V_OPERNAME',
        width: 80
    },
])

let dataSource =  ref([])
let dateValue = ref()
let selectData = reactive({
    V_MAILNO: '',
    D_APPTIME: '',
    V_OPERNAME: ''
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
    getMailNoTableData(toRaw(selectData))
})

//获取表格数据
//tb_return_mail
function getMailNoTableData(data:object) {
    service.gh_service.axios('cxyjxx', data)
    .then((res:any) => {
        dataSource.value = res.data
    }).catch((err:any) => {
        console.log(err);
        
    })
}

//选择日期
function onChangePicker (value:any, dateString:any) {
    selectData.D_APPTIME = dateString
    
}

//表格改变
function onTableChange(pagination:any) {
    tablePagination.pageSize = pagination.pageSize
    tablePagination.current = pagination.current
}


//查询
function onFinshClick() {
    getMailNoTableData(toRaw(selectData))
    
}   


function handleFinishFailed(val) {
    console.log(val);
    
}

//重置
function onResetClick() {
    selectData = reactive({
        V_MAILNO: '',
        D_APPTIME: '',
        V_OPERNAME: ''
    })
    dateValue.value = ''
    onFinshClick()
}

//导出
function onExportClick() {
    table2excel(columns.value, dataSource.value, '入库邮件数据' + new Date().getTime())
    message.success('导出成功')
}


</script>

<template>
    <div class="MailNoTable">
        <header>
            <a-form
                layout="inline"
                :model="selectData"
                @finish="onFinshClick"
                @finishFailed="handleFinishFailed"
            >
                <a-form-item label="邮件号">
                    <a-input v-model:value="selectData.V_MAILNO" placeholder="邮件号" />
                </a-form-item>
                <a-form-item label="申报时间">
                    <a-date-picker v-model:value="dateValue" @change="onChangePicker" />
                </a-form-item>
                <a-form-item label="操作人">
                    <a-input v-model:value="selectData.V_OPERNAME" placeholder="操作人" />
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
            <div class="btn-group">
                <a-button type="primary" @click="onExportClick" class="export">导出</a-button>
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
.btn-group {
    margin-bottom: 15px;
}

</style>