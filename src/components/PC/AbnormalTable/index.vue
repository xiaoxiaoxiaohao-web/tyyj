<script lang="ts" setup>
import service from '@/service/index'
import { onMounted, reactive, ref, toRaw } from 'vue'
import { TableColumnsType, FormProps, message  } from 'ant-design-vue'
import type { SelectProps } from 'ant-design-vue'
import table2excel from 'js-table2excel'
import { it } from 'node:test'

//表头
let columns = ref<TableColumnsType>([
    {
        title: '企业名称',
        dataIndex: 'V_ENTNAME',
        key: 'V_ENTNAME',
        width: 80
    },
    {
        title: '异常情况编号',
        dataIndex: 'V_ABNO',
        key: 'V_ABNO',
        width: 100
    },
    {
        title: '邮件号',
        dataIndex: 'V_MAILNO',
        key: 'V_MAILNO',
        width: 80
    },
    {
        title: '处置类型',
        dataIndex: 'V_ABNORMALTYPE',
        key: 'V_ABNORMALTYPE',
        width: 100,
        customRender:({text, record}) => {
            if(text == 1) {
                return '退运已入库转其他原因出库'
            }else if(text == 2) {
                return '退运已装袋转退运已入库'
            }else {
                return '退运已出库转退运已入库'
            }
            
        }
    },
    {
        title: '相关情况说明',
        dataIndex: 'V_ABINFO',
        key: 'V_ABINFO',
        width: 50
    },
    {
        title: '指令状态',
        dataIndex: 'V_INSTRSTATE',
        key: 'V_INSTRSTATE',
        width: 60
    },
    {
        title: '文件名称',
        dataIndex: 'V_FILENAME',
        key: 'V_FILENAME',
        width: 120
    },
    {
        title: '申报人',
        dataIndex: 'V_OPERATORNAME',
        key: 'V_OPERATORNAME',
        width: 60
    },
    {
        title: '申报时间',
        dataIndex: 'D_OPER_DATE',
        key: 'D_OPER_DATE',
        width: 80
    },
    {
        title: '审核意见',
        dataIndex: 'V_MAILRET',
        key: 'V_MAILRET',
        width: 100
    },
    {
        title: '操作',
        dataIndex: 'operation',
        width: 50
    }
    // {
    //     title: '出库装车序列号',
    //     dataIndex: 'V_AUDIT_NO',
    //     key: 'V_AUDIT_NO',
    //     width: 80
    // },
])

interface DataItem {
    RECID: string,
    PERSON_NAME: string,
    PERSON_CODE: string,
    ROLE_NAME: string
}

let dataSource = ref([])
let dateValue = ref<string>()

interface select {
    V_MAILNO: string,
    D_OPER_DATE: string,
    V_OPERNAME: string,
    V_ABNORMALTYPE: string
}

let selectData:select = reactive({
    V_MAILNO: '',
    D_OPER_DATE: '',
    V_OPERNAME: '',
    V_ABNORMALTYPE: ''
})

let tablePagination = reactive({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showTotal: ((total:number) => {
        return `共 ${total} 条`;
    }),
})

let typeOptions = ref<SelectProps['options']>([
    {
        value: '1',
        label: '退运已入库转其他原因出库'
    },
    {
        value: '2',
        label: '退运已装袋转退运已入库'
    },
    {
        value: '3',
        label: '退运已出库转退运已入库'
    }
])

onMounted(() => {
    getAbnormalTableData(toRaw(selectData))
})

//获取表格数据
function getAbnormalTableData(data:object) {
    service.gh_service.axios('cxycyj', data)
    .then((res:any) => {
        dataSource.value = res.data
    }).catch((err:any) => {
        console.log(err)
        message.error('获取表格数据出现错误')
    })
}

//选择日期
function onChangePicker (value:any, dateString:any) {
    selectData.D_OPER_DATE = dateString
    
}

//表格改变
function onTableChange(pagination:any) {
    tablePagination.pageSize = pagination.pageSize
    tablePagination.current = pagination.current
}


//查询
function onFinshClick() {
    getAbnormalTableData(toRaw(selectData))
    
}   

//重置
function onResetClick() {
    selectData = reactive({
        V_MAILNO: '',
        D_OPER_DATE: '',
        V_OPERNAME: '',
        V_ABNORMALTYPE: ''
    })
    dateValue.value = ''
    onFinshClick()
}

//导出
function onExportClick() {
    table2excel(columns.value, dataSource.value, '入库邮件数据' + new Date().getTime())
    message.success('导出成功')
}

//结果查询
function onResultClick() {
    
    dataSource.value.forEach(e => {
        let object = toRaw(e)
        //获取邮件号
        let mailno = object.V_MAILNO
        mailAbnormalDisposeQueryReport(mailno)
    }) 
}

//异常邮件处置查询接口
function mailAbnormalDisposeQueryReport(mailno:string) {
    let params = [mailno]
    let new_params = (JSON.stringify(params)).replace(/\"/g,"'")
    service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'mailAbnormalDisposeQueryReport',
        params: new_params
    }).then((res:any) => {
        if(res.succeeded == true) {
            let data = res.result.info[0]
            let mailNo = data.mailNo
            let mailRet = data.mailRet
            //更新查验结果
            updateAbnormalMailRet(mailNo, mailRet)
            message.success(mailno + '审核意见查询成功')
        }else {
            message.error(mailno + '审核意见查询失败')
        }
    }).catch((err:any) => {
        console.log(err)
        message.error('审核意见查询出现错误' + err)
    })
}

//更新异常邮件审核意见
function updateAbnormalMailRet(mailNo:string, mailRet:string) {
    service.gh_service.axios('ycyjshyjgx', {
        V_MAILNO: mailNo,
        V_MAILRET: mailRet
    }).then((res:any) => {
        console.log(res)
        
    }).catch((err:any) => {
        console.log(err)
        
    })
}

//删除
function onDelete(mailNo:string, abNo:string) {
    //异常邮件处置删除接口
    let params = [mailNo, abNo]
    let new_params = (JSON.stringify(params)).replace(/\"/g,"'")
    service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'mailAbnormalDisposeDelReport',
        params: new_params
    }).then((res:any) => {
        console.log(res)
        let data = res.result.info[0]
        let dataArray = data.mailRet.split('-')
        if(dataArray[0] == 'success') {
            message.success(dataArray[1])
            //更新表格数据
            dataSource.value = dataSource.value.filter((item) => toRaw(item).V_ABNO !== abNo)
            deleteAbnormal(mailNo, abNo)
        }else {
            message.error(dataArray[1])
        }
    }).catch((err:any) => {
        console.log(err)
        message.error('出现错误' + err)
    })
}

function deleteAbnormal(mailNo:string, abNo:string) {
    service.gh_service.axios('ycyjsc', {
        V_MAILNO: mailNo,
        V_ABNO: abNo
    }).then((res:any) => {
        console.log(res)
    }).catch((err:any) => {
        console.log(err)
    })
}

</script>

<template>
    <div class="MailNoTable">
        <header>
            <a-form
                layout="inline"
                :model="selectData"
                @finish="onFinshClick"
            >
                <a-form-item label="邮件号">
                    <a-input v-model:value="selectData.V_MAILNO" placeholder="邮件号" />
                </a-form-item>
                <a-form-item label="处置类型">
                    <a-select v-model:value="selectData.V_ABNORMALTYPE" :options="typeOptions" style="width: 200px">
                    </a-select>
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
                <a-space>
                    <a-button @click="onResultClick">审核查询</a-button>
                    <a-button type="primary" @click="onExportClick" class="export">导出</a-button>
                </a-space>
            </div>
            <a-table bordered size="middle" 
                :dataSource="dataSource" 
                :columns="columns" 
                :scroll="{ y: 480 }"
                :pagination="tablePagination"
                @change="onTableChange"
            >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'operation'">
                        <span>
                            <a-popconfirm
                                v-if="dataSource.length"
                                title="确定删除"
                                @confirm="onDelete(record.V_MAILNO, record.V_ABNO)"
                            >
                            <a style="color:red">删除</a>
                            </a-popconfirm>
                        </span>
                    </template>
                </template>
            </a-table>
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