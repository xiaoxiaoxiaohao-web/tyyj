<script lang="ts" setup>
import service from '@/service/index'
import { onMounted, reactive, ref, toRaw, h } from 'vue'
import { TableColumnsType, FormProps, message, Modal  } from 'ant-design-vue'
import table2excel from 'js-table2excel'

//表头
let columns = ref<TableColumnsType>([
    {
        title: '邮袋号',
        dataIndex: 'V_BAGNO',
        key: 'V_BAGNO',
        width: 120
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
        title: '采集时间',
        dataIndex: 'D_CJSJ',
        key: 'D_CJSJ',
        width: 80
    },
    {
        title: '操作人',
        dataIndex: 'V_OPERATORNAME',
        key: 'V_OPERATORNAME',
        width: 80
    },
    {
        title: '核查命中',
        dataIndex: 'V_CHECK',
        key: 'V_CHECK',
        width: 80,
        customRender:({text, record}) => {
            if(text == 0) {
                return '未命中核查'
            }else if(text == 1) {
                return '命中核查'
            }else if(text == -1){
                return '绑定失败'
            } 
        }
    },
    {
        title: '邮袋当前状态',
        dataIndex: 'V_MAILBAGSTATUS',
        key: 'V_MAILBAGSTATUS',
        width: 80
    },
    {
        title: '邮件',
        dataIndex: 'V_MAIL_NUM',
        key: 'V_MAIL_NUM',
        width: 30
    },
    {
        title: '交航扫描结果',
        dataIndex: 'V_MAILBAGRET',
        key: 'V_MAILBAGRET',
        width: 80
    }
])

let dataSource = ref([])
let dateValue = ref<string>()
let detailOpen = ref<boolean>(false)
let selectData = reactive({
    V_BAGNO: '',
    N_BAGWEIGHT: '',
    V_DESTINATION: '',
    V_HBH: '',
    D_CJSJ: dateValue.value,
    V_MAILNO: ''
})

let pushData = ref(null)
let failReason = ref<Array<string>>([])

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

//查询
function onFinshClick() {
    getTallyingTableData(toRaw(selectData))
}   

//查询详细邮件数据
function onDetailBagNoClick(record:any) {
    detailOpen.value = true
    let mailNoArray = record.V_MAILNO.split(',')
    let contentArray = []
    for(let i = 0; i < mailNoArray.length; i++) {
        if(record.V_MAILRET != null) {
            let mailStatus = record.V_MAILSTATUS.split(',')
            contentArray.push(h('p', mailNoArray[i] + '(' + mailStatus[i] + ')'))
        }else {
            contentArray.push(h('p', mailNoArray[i]))
        }
    }

    Modal.info({
        title: '邮件详细数据(' + record.V_MAIL_NUM  + ')',
        content: h('span', {}, contentArray),
        onOk() {
            console.log('ok')
        },
    })
}

//重置
function onResetClick() {
    dateValue.value = ''
    selectData = reactive({
        V_BAGNO: '',
        N_BAGWEIGHT: '',
        V_DESTINATION: '',
        V_HBH: '',
        D_CJSJ: dateValue.value,
        V_MAILNO: ''
    })
    onFinshClick()
}


//导出
function onExportClick() {
    table2excel(columns.value, dataSource.value, '理货总包数据' + new Date().getTime())
    message.success('导出成功')
}

//获取需要推动数据
async function getPushData() {
    await service.gh_service.axios('lhydts').then((res:any) => {
        message.success('当前需要推送数据为' + res.data.length + '个邮袋')
        pushData = res.data
    }).catch((err:any) => {
        console.log(err)
        message.error('获取数据出现错误')
    })
}

//推送
async function onPushClick() {
    failReason.value.length = 0
    await getPushData()
    for(let i = 0; i < pushData.length; i++) {
        let params = []
        params.push(pushData[i].V_BAGNO)
        params.push(pushData[i].V_MAILNO)
        params.push(pushData[i].N_BAGWEIGHT + 'kg')
        params.push(pushData[i].V_DESTINATION)
        params.push(pushData[i].V_OPERATORNAME)
        let new_params = (JSON.stringify(params)).replace(/\"/g,"'")
        service.hg_service.axios({
            service: 'RetpostMailService',
            method: 'mailbagReport',
            params: new_params
        }).then((res:any) => {
            let data = res.result.info[0]
            let dataArray = data.mailbagRet.split('-')
            if(dataArray[0] == 'success') {
                message.success(dataArray[1])
                updateFlag(pushData[i].V_BAGNO)
            }else {
                let reason = data.failReason
                message.error(pushData[i].V_BAGNO + dataArray[1] + ", 原因：" + reason)
                failReason.value.push(reason[0])
            }
            // if(res)
            // message.success('推送成功')
            // updateFlag(pushData[i].V_BAGNO)
            
        }).catch((err:any) => {
            console.log(err)
            message.error('推送出现错误')
        })
    }

}

//推送后修改标志
function updateFlag(V_BAGNO:string) {
    service.gh_service.axios('tshxgbz', {
        V_BAGNO: V_BAGNO
    }).then((res:any) => {
        console.log(res);
        
    }).catch((err:any) => {
        console.log(err);
        
    })
}

//查询状态
function onStatusClick() {
    dataSource.value.forEach(e => {
        let object = toRaw(e)
        //获取邮袋号
        let mailbagno = object.V_BAGNO
        mailbagQueryReport(mailbagno)
    })
}

//退运邮袋信息查询接口
function mailbagQueryReport(mailbagno:string) {
    let params = [mailbagno]
    let new_params = (JSON.stringify(params)).replace(/\"/g,"'")
    service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'mailbagQueryReport',
        params: new_params
    }).then((res:any) => {
        console.log(res)
        let data = res.result.info[0]
        updateBagStatus(mailbagno, data.mailbagStatus)
    }).catch((err:any) => {
        console.log(err)
        message.error('邮件状态查询出现错误')
    })
}

//更新邮袋状态信息
function updateBagStatus(mailbagno:string, mailbagStatus:string) {
    service.gh_service.axios('updatebagstatus', {
        V_BAGNO: mailbagno,
        V_MAILBAGSTATUS: mailbagStatus
    }).then((res:any) => {
        console.log(res)
    }).catch((err:any) => {
        console.log(err)
    })
}

// const state = reactive<{
//   selectedRowKeys: Array<string|number>;
//   loading: boolean;
// }>({
//   selectedRowKeys: [],
//   loading: false,
// })

// const onSelectChange = (selectedRowKeys: any) => {
//   state.selectedRowKeys = selectedRowKeys;
//     console.log('selectedRowKeys changed: ', selectedRowKeys);
// }

</script>

<template>
    <div class="TallyingTable">
        <header>
            <a-form
                layout="inline"
                :model="selectData"
                @finish="onFinshClick"
            >
                <a-form-item label="邮袋号">
                    <a-input v-model:value="selectData.V_BAGNO" placeholder="邮袋号" />
                </a-form-item>
                <!-- <a-form-item label="目的地">
                    <a-input v-model:value="selectData.V_DESTINATION" placeholder="目的地" />
                </a-form-item>
                <a-form-item label="航班号">
                    <a-input v-model:value="selectData.V_HBH" placeholder="航班号" />
                </a-form-item> -->
                <a-form-item label="出库装车序列号">
                    <a-input v-model:value="selectData.V_AUDIT_NO" placeholder="出库装车序列号" />
                </a-form-item>
                <a-form-item label="采集时间">
                    <a-date-picker v-model:value="dateValue" @change="onChangePicker" />
                </a-form-item>
                <a-form-item label="邮件号">
                    <a-input v-model:value="selectData.V_MAILNO" placeholder="邮件号" />
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
                <a-space>
                    <a-button @click="onPushClick">推送</a-button>
                    <a-button @click="onStatusClick">状态</a-button>
                    <a-button type="primary" @click="onExportClick">导出</a-button>
                </a-space>
            </div>
            <div>
                <span style="color:red">{{failReason}}</span>
            </div>
            <a-table bordered size="middle"
                :dataSource="dataSource" 
                :columns="columns"
                :scroll="{ y: 580 }"
                :pagination="tablePagination"
                @change="onTableChange"
            >
                <template #bodyCell="{ column, text, record }">
                    <template v-if="column.key === 'V_MAIL_NUM'">
                        <a style="color:#1677ff; font-size:20px;" @click="onDetailBagNoClick(record)">
                            {{text}}
                        </a>
                    </template>
                </template>
            </a-table>
            <div>
                <span style="color:red">提示：1.推送是推爬取新一代成功后且邮件数量不为0的数据</span>
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
</style>