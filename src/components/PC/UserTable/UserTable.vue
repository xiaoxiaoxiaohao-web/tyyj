<script lang="ts" setup>
import service from '@/service/index'
import { onMounted, reactive, ref, computed, toRaw, provide } from 'vue'
import type { UnwrapRef } from 'vue'
import { TableColumnsType, FormProps, message } from 'ant-design-vue'
import { cloneDeep } from 'lodash-es'

//表头
let columns = ref<TableColumnsType>([
    {
        title: 'RECID',
        dataIndex: 'RECID',
        key: 'RECID',
    },
    {
        title: '员工名',
        dataIndex: 'PERSON_NAME',
        key: 'PERSON_NAME',
    },
    {
        title: '账号',
        dataIndex: 'PERSON_CODE',
        key: 'PERSON_CODE',
    },
    {
        title: '用户角色',
        dataIndex: 'ROLE_NAME',
        key: 'ROLE_NAME',
    },
    {
        title: '操作',
        dataIndex: 'operation',
    },
])
let selectData = reactive({
    PERSON_NAME: '',
    PERSON_CODE: '',
})

interface DataItem {
    RECID: string,
    PERSON_NAME: string,
    PERSON_CODE: string,
    ROLE_NAME: string
}
let data: DataItem[] = []
let dataSource = ref(data)
let modifyOpen = ref<boolean>(false)
let modifyRecid = ref<string>(null)
provide('modifyOpen', modifyOpen)

const state = reactive({
  selectedRowKeys: [],
  loading: false,
})
const hasSelected = computed(() => state.selectedRowKeys.length > 0);

const start = () => {
  state.loading = true;
  setTimeout(() => {
    state.loading = false;
    state.selectedRowKeys = [];
  }, 1000);
}

let tablePagination = reactive({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showTotal: ((total:number) => {
        return `共 ${total} 条`;
    }),
})

let addAccountOpen = ref<boolean>(false)

onMounted(() => {
    getUserTableData(toRaw(selectData))
})

//获取表格数据
function getUserTableData(data:object) {
    service.gh_service.axios('cxyhlb', data)
    .then((res:any) => {
        dataSource.value = res.data
    }).catch((err:any) => {
        console.log(err);
        
    })
}

function onFinshClick() {
    getUserTableData(toRaw(selectData))
}

//表格改变
function onTableChange(pagination:any) {
    tablePagination.pageSize = pagination.pageSize
    tablePagination.current = pagination.current
}


//重置
function onResetClick() {
    selectData = reactive({
        PERSON_NAME: '',
        PERSON_CODE: '',
    })
    onFinshClick()
}
//修改
function onModifyClick(key: string) {
    modifyRecid.value = key
    modifyOpen.value = true
}

//删除
function onDelete(key: string) {
    //删除接口
    service.gh_service.axios('scyhjs',{
        RECID: key
    }).then((res:any) => {
        if(res.success == true) {
            message.success('删除成功')
            //更新表格数据
            dataSource.value = dataSource.value.filter(item => item.RECID !== key)
        }else {
            message.error('删除失败')
        }
        
    }).catch((err:any) => {
        console.log(err)
        message.error('出现错误')
    })
    
}

//新增账号弹窗
function onAddAccountShow() {
    addAccountOpen.value = true
}

function close(value:boolean) {
    addAccountOpen.value = value
}

function onAddAccountOk() {
    
}

//新增

//新增用户角色弹窗
function onAddRoleShow() {

}


const editableData: UnwrapRef<Record<string, DataItem>> = reactive({});

//修改
function edit(key:string) {
    editableData[key] = cloneDeep(dataSource.value.filter(item => key === item.RECID)[0])
}

//保存修改内容
function save(key:string) {
    Object.assign(dataSource.value.filter(item => key === item.RECID)[0], editableData[key])
    delete editableData[key]
}

//取消保存
function cancel(key:string) {
    delete editableData[key]
}
</script>

<template>
    <div class="UserTable">
        <header>
            <a-form
                layout="inline"
                :model="selectData"
                @finish="onFinshClick"
            >
                <a-form-item label="员工名">
                    <a-input v-model:value="selectData.PERSON_NAME" placeholder="员工名" />
                </a-form-item>
                <a-form-item label="账号">
                    <a-input v-model:value="selectData.PERSON_CODE" placeholder="账号" />
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
                    <a-button type="primary" @click="onAddAccountShow" class="export">新增账号</a-button>
                    <a-button type="primary" @click="onAddRoleShow" class="export">新增用户角色</a-button>
                </a-space>
                <add-account-show :open="addAccountOpen" @close="close"></add-account-show>
            </div>
            <a-table bordered size="middle" 
                :pagination="tablePagination"
                :dataSource="dataSource" 
                :columns="columns"
                :scroll="{ y: 480 }" 
                @change="onTableChange">
                <template #bodyCell="{ column, text, record}">
                    <template v-if="['PERSON_NAME', 'PERSON_CODE'].includes(column.dataIndex)">
                        <div>
                            <a-input
                                v-if="editableData[record.RECID]"
                                v-model:value="editableData[record.RECID][column.dataIndex]"
                                style="margin: -5px 0"
                            />
                            <template v-else>
                                {{ text }}
                            </template>
                        </div>
                    </template>

                    <template  v-else-if="column.dataIndex === 'operation'">
                        <span v-if="editableData[record.RECID]">
                            <a-typography-link @click="save(record.RECID)">保存</a-typography-link>
                            <a-divider type="vertical" />
                            <a  @click="cancel(record.RECID)">取消</a>
                        </span>
                        <span v-else>
                            <a @click="edit(record.RECID)">修改</a>
                            <a-divider type="vertical" />
                            <a-popconfirm
                                v-if="dataSource.length"
                                title="确定删除"
                                @confirm="onDelete(record.RECID)"
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