<script lang="ts" setup>
import service from '@/service/index'
import { onMounted, reactive, ref, toRaw, h, provide } from 'vue'
import type { UnwrapRef } from 'vue'
import { TableColumnsType, FormProps, message, Modal  } from 'ant-design-vue'
import { cloneDeep } from 'lodash-es'
import table2excel from 'js-table2excel'
import { useHomeStore } from '@/store/home'

const homeStore = useHomeStore()

//表头
let columns = ref<TableColumnsType>([
    {
        title: '出库序列号',
        dataIndex: 'V_AUDIT_NO',
        key: 'V_AUDIT_NO',
        width: 80
    },
    {
        title: '申报时间',
        dataIndex: 'D_OPER_DATE',
        key: 'D_OPER_DATE',
        width: 60
    },
    {
        title: '运输类型',
        dataIndex: 'V_AUDIT_TYPE',
        key: 'V_AUDIT_TYPE',
        width: 30,
        customRender:({text, record}) => {
            if(text == 1) {
                return '转场'
            }else if(text == 2) {
                return '转关'
            }else {
                return '转运'
            }
            
        }
    },
    {
        title: '目的地',
        dataIndex: 'V_ADDRESS',
        key: 'V_ADDRESS',
        width: 80
    },
    {
        title: '车牌号',
        dataIndex: 'V_CARNO',
        key: 'V_CARNO',
        width: 40
    },
    {
        title: '总数量',
        dataIndex: 'V_MAILBAG_NUM',
        key: 'V_MAILBAG_NUM',
        width: 30
    },
    {
        title: '总重量(kg)',
        dataIndex: 'V_MAILBAG_WEIGHT',
        key: 'V_MAILBAG_WEIGHT',
        width: 30
    },
    {
        title: '出库审核结果',
        dataIndex: 'V_CHECK',
        key: 'V_CHECK',
        width: 50,
        customRender:({text, record}) => {
            if(text == 0) {
                return '审核未通过'
            }else if(text == 1) {
                return '审核通过'
            }else if(text == -1){
                return '未进行审核'
            } 
        }
    },
    {
        title: '原因',
        dataIndex: 'V_PASSDESC',
        key: 'V_PASSDESC',
        width: 50
    },
    {
        title: '关锁号',
        dataIndex: 'V_LOCK_NO',
        key: 'V_LOCK_NO',
        width: 30
    },
    {
        title: '司机纸号',
        dataIndex: 'V_DRIVER_NO',
        key: 'V_DRIVER_NO',
        width: 30
    },
    {
        title: '操作人',
        dataIndex: 'V_OPERNAME',
        key: 'V_OPERNAME',
        width: 60
    },
    {
        title: '装车确认结果',
        dataIndex: 'V_FLAG',
        key: 'V_FLAG',
        width: 50,
        customRender:({text, record}) => {
            if(text == 1) {
                return '成功'
            }else if(text == 0) {
                return '失败'
            }
        }
    },
    {
        title: '操作',
        dataIndex: 'operation',
        width: 50
    }
])

interface DataItem {
    V_AUDIT_NO: string,
    D_OPER_DATE: string,
    V_AUDIT_TYPE: string,
    V_ADDRESS: string,
    V_CARNO: string,
    V_LOCK_NO: string,
    V_DRIVER_NO: string,
    V_MAILBAG_NUM: string,
    V_MAILBAG_WEIGHT: string,
    V_OPERNAME: string,
    V_CHECK: string,
    V_FLAG: string,
    V_BAGNO: string
}
let data: DataItem[] = []
let dataSource = ref(data)
let dateValue = ref<string>()
let detailOpen = ref<boolean>(false)
let modifyData = reactive({
    open: false,
    data: {}
})
provide('modifyData', modifyData)
let selectRow:object = reactive({})

interface select {
    V_AUDIT_NO: string,
    D_OPER_DATE: string,
    V_OPERNAME: string,
    V_BAGNO: string
}

let selectData:select = reactive({
    V_AUDIT_NO: '',
    D_OPER_DATE: '',
    V_OPERNAME: '',
    V_BAGNO: ''
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
    getAuditNoTableData(toRaw(selectData))
})

//获取表格数据
function getAuditNoTableData(data:object) {
    service.gh_service.axios('cxxlhxx', data)
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
    getAuditNoTableData(toRaw(selectData))
    
}   

//重置
function onResetClick() {
    selectData = reactive({
        V_AUDIT_NO: '',
        D_OPER_DATE: '',
        V_OPERNAME: '',
        V_BAGNO: ''
    })
    dateValue.value = ''
    onFinshClick()
}

//查询详细邮袋数据
function onDetailBagNoClick(record:any) {
    detailOpen.value = true
    let bagNoArray = record.V_BAGNO.split(',')
    let contentArray = []
    bagNoArray.forEach((e:string, i: number) => {
        if(record.BAG_V_CHECK != null) {
            let bagCheck = record.BAG_V_CHECK.split(',')
            let bagResult = bagCheck[i] == 1? '命中核查': (bagCheck[i] == 0? '未命中核查': '绑定失败')
            contentArray.push(h('p', e + '(' + bagResult + ')'))
        }else {
            contentArray.push(h('p', e))
        }
    })

    Modal.info({
        title: '邮袋详细数据',
        content: h('div', {}, contentArray),
        onOk() {
            console.log('ok');
        },
    })
}

//装车出库申请修改
function onModifyClick(record:object) {
    modifyData.data = record
    modifyData.open = true
}

//删除
//outbandAuditDelecteReport
function onDelete(auditNo:string) {
    //海关装车出库申请删除接口
    let operator = homeStore.user.PERSON_NAME
    let params = [auditNo, operator]
    let new_params = (JSON.stringify(params)).replace(/\"/g,"'")
    service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'outbandAuditDelecteReport',
        params: new_params
    }).then((res:any) => {
        console.log(res)
        let data = res.result.info[0]
        if(data.flag == '1') {
            message.success('删除成功')
            dataSource.value = dataSource.value.filter(item => item.V_AUDIT_NO !== auditNo)
            delauditno(auditNo, operator)
        }else {
            message.error(data.desc)
        }
    }).catch((err:any) => {
        console.log(err)
        
    })
}

//数据库删除
function delauditno(auditNo:string, operator:string) {
    service.gh_service.axios('delauditno', {
        V_AUDIT_NO: auditNo,
        V_OPERNAME: operator
    }).then((res:any) => {
        console.log(res)
        
    }).catch((err:any) => {
        console.log(err)
        
    })
}

//关闭弹窗
function closeModal(value:boolean) {
	modifyData.open = false
}

//审核结果查询
function onExamineResultClick() {
    dataSource.value.forEach((e:DataItem) => {
        if(e.V_CHECK != '1') { //审核不通过或者未进行审核
            outbandAuditResultReport(e.V_AUDIT_NO)
        }
        // getAuditNoTableData(toRaw(selectData))
    })
}

//出库申请审核结果查询接口
function outbandAuditResultReport(auditNo:string) {
    service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'outbandAuditResultReport',
        params: auditNo
    }).then((res:any) => {
        let data = res.result.info[0]
        if(data.flag == '0') {
            message.error(data.desc)
        }else {
            let check = data.check
            let passdesc = data.passdesc || data.desc
            updateAuditNo(auditNo, check, passdesc)
        }
        message.success(auditNo + '审核查询成功')
    }).catch((err:any) => {
        console.log(err)
        message.error(auditNo + '查询出现错误')
    })
}

//出库申请审核结果更新
function updateAuditNo(adudioNo:string, check:string, passdesc:string) {
    service.gh_service.axios('updateauditno', {
        V_AUDIT_NO: adudioNo,
        V_CHECK: check,
        V_PASSDESC: passdesc
    }).then((res:any) => {
        console.log(res)
    }).catch((err:any) => {
        console.log(err)
    })
}


//导出表格
function onExportClick() {
    table2excel(columns.value, dataSource.value, '出库序列号' + new Date().getTime())
    message.success('导出成功')
}

</script>

<template>
    <div class="AuditNoTable">
         <header>
            <a-form
                layout="inline"
                :model="selectData"
                @finish="onFinshClick"
            >
                <a-form-item label="出库序列号">
                    <a-input v-model:value="selectData.V_AUDIT_NO" placeholder="出库序列号" />
                </a-form-item>
                <a-form-item label="申报时间">
                    <a-date-picker v-model:value="dateValue" @change="onChangePicker" />
                </a-form-item>
                <a-form-item label="操作人">
                    <a-input v-model:value="selectData.V_OPERNAME" placeholder="操作人" />
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
                    <a-button @click="onExamineResultClick">审核查询</a-button>
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
                <template #bodyCell="{ column, text, record }">
                    <template v-if="column.key === 'V_MAILBAG_NUM'">
                        <a style="color:#1677ff; font-size:20px;" @click="onDetailBagNoClick(record)">
                            {{text}}
                        </a>
                    </template>

                    <template  v-else-if="column.dataIndex === 'operation'">
                        <span>
                            <!-- <a @click="onModifyClick(record)">修改</a>
                            <a-divider type="vertical" /> -->
                            <a-popconfirm
                                v-if="dataSource.length"
                                title="确定删除"
                                @confirm="onDelete(record.V_AUDIT_NO)"
                            >
                                <a style="color:red">删除</a>
                            </a-popconfirm>
                        </span>
                    </template>
                </template>
            </a-table>
            <!-- <a-modal v-model:open="detailOpen" title="详细数据" :key="index">
                <p v-for="(item, index) in selectRow.V_BAGNO.split(',')" :key="index">
                    {{item}}
                </p>
            </a-modal> -->
            <show-modify :modifyData="modifyData" @closeModal="closeModal"></show-modify>
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