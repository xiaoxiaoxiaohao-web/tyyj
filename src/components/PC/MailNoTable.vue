<script lang="ts" setup>
import service from '@/service/index'
import { onMounted, reactive, ref, toRaw } from 'vue'
import { TableColumnsType, FormProps, message  } from 'ant-design-vue'
import table2excel from 'js-table2excel'
import func from '../../../vue-temp/vue-editor-bridge'

//表头
let columns = ref<TableColumnsType>([
    {
        title: '邮件号',
        dataIndex: 'V_MAILNO',
        key: 'V_MAILNO',
        width: 80
    },
    // {
    //     title: '查询结果',
    //     dataIndex: 'V_NOTE',
    //     key: 'V_NOTE',
    //     width: 60
    // },
    {
        title: '退运指令时间',
        dataIndex: 'D_RETURN_DATE',
        key: 'D_RETURN_DATE',
        width: 60
    },
    {
        title: '申报时间',
        dataIndex: 'D_APPTIME',
        key: 'D_APPTIME',
        width: 60
    },
    {
        title: '操作人',
        dataIndex: 'V_OPERNAME',
        key: 'V_OPERNAME',
        width: 60
    },
    {
        title: '查验结果',
        dataIndex: 'V_MAILRET',
        key: 'V_MAILRET',
        width: 100
    },
    {
        title: '邮件当前状态',
        dataIndex: 'V_MAILSTATUS',
        key: 'V_MAILSTATUS',
        width: 100
    },
    {
        title: '邮袋号',
        dataIndex: 'V_BAGNO',
        key: 'V_BAGNO',
        width: 100
    }
])

let dataSource = ref([])
let dateValue = ref<string>()

interface select {
    V_MAILNO: string,
    D_APPTIME: string,
    V_OPERNAME: string
}

let selectData:select = reactive({
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
        console.log(err)
        message.error('获取表格数据出现错误')
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

//推送
function onPushClick() {
    dataSource.value.forEach(e => {
        let object = toRaw(e)
        //获取序列号,邮件号
        let auditno = object.V_AUDIT_NO
        let mailno = object.V_MAILNO
        if(auditno != null) {  //序列号不为空的
            mailbagCheckReport(auditno, mailno)
        } 
    }) 
}

//退运邮件查验结果查询
function mailbagCheckReport(auditno:string, mailno:string) {
    let params = [auditno, mailno]
    let new_params = (JSON.stringify(params)).replace(/\"/g,"'")
    service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'mailbagCheckReport',
        params: new_params
    }).then((res:any) => {
        if(res.succeeded == true) {
            let data = res.result.info[0]
            let mailNo = data.mailNo
            let mailRet = data.mailRet
            //更新查验结果
            updateMailnoNote(mailNo, mailRet)
            message.success(mailno + '查验成功')
        }else {
            message.error(mailno + '查验失败')
        }
    }).catch((err:any) => {
        console.log(err)
        message.error('邮件查验出现错误')
    })
}

//更新邮件查验结果
function updateMailnoNote(mailNo:string, mailRet:string) {
    service.gh_service.axios('updatemailnote', {
        V_MAILNO: mailNo,
        V_MAILRET: mailRet
    })
}

//查询状态
function onStatusClick () {
     dataSource.value.forEach(e => {
        let object = toRaw(e)
        //获取序列号,邮件号
        let mailno = object.V_MAILNO
        mailQueryReport(mailno)
        
    }) 
}



//退运邮件信息查询
function mailQueryReport(mailno:string) {
    let params = [mailno]
    let new_params = (JSON.stringify(params)).replace(/\"/g,"'")
    service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'mailQueryReport',
        params: new_params
    }).then((res:any) => {
        let data = res.result.info[0]
        updateMailStatus(mailno, data.mailStatus)
    }).catch((err:any) => {
        console.log(err)
        message.error('邮件状态查询出现错误')
    })
}

//更新邮件状态信息
function updateMailStatus(mailno:string, status:string) {
    service.gh_service.axios('updatemailstatus', {
        V_MAILNO: mailno,
        V_MAILSTATUS: status
    }).then((res:any) => {
        getMailNoTableData(toRaw(selectData))
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
                <a-form-item label="申报时间">
                    <a-date-picker v-model:value="dateValue" @change="onChangePicker" />
                </a-form-item>
                <a-form-item label="操作人">
                    <a-input v-model:value="selectData.V_OPERNAME" placeholder="操作人" />
                </a-form-item>
                <a-form-item label="查验结果">
                    <a-select v-model:value="selectData.V_MAILRET" placeholder="请选择" style="width: 190px">
                         <a-select-option value="">全部</a-select-option>
                        <a-select-option value="邮件未见异常">邮件未见异常</a-select-option>
                        <a-select-option value="邮件发现异常">邮件发现异常</a-select-option>
                        <a-select-option value="邮件号或者序列号异常">邮件号或者序列号异常</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="邮袋号">
                    <a-input v-model:value="selectData.V_BAGNO" placeholder="邮袋号" />
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
                    <a-button @click="onPushClick">查验</a-button>
                    <a-button @click="onStatusClick">状态</a-button>
                    <a-button type="primary" @click="onExportClick" class="export">导出</a-button>
                </a-space>
            </div>
            <a-table bordered size="middle" 
                :dataSource="dataSource" 
                :columns="columns" 
                :scroll="{ y: 480 }"
                :pagination="tablePagination"
                @change="onTableChange"
            />
            <div>
                <span style="color:red">提示：1.查验会查所有数据，请筛选后使用</span>
            </div>
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