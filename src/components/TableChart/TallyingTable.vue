<script lang="ts" setup>
import service from '@/service/index'
import { onMounted, reactive, ref } from 'vue'
import type { TableColumnsType, FormProps  } from 'ant-design-vue';

//表头
let columns = ref<TableColumnsType>([
    {
        title: '邮袋号',
        dataIndex: 'V_BAGNO',
        key: 'V_BAGNO',
        resizable: true,
        width: 150,
    },
    {
        title: '重量(kg)',
        dataIndex: 'N_BAGWEIGHT',
        key: 'N_BAGWEIGHT',
        resizable: true,
        width: 150,
    },
    {
        title: '目的地',
        dataIndex: 'V_DESTINATION',
        key: 'V_DESTINATION',
        resizable: true,
    },
    {
        title: '航班号',
        dataIndex: 'V_HBH',
        key: 'V_HBH',
        resizable: true,
    },
    {
        title: '操作人',
        dataIndex: 'V_OPERATORNAME',
        key: 'V_OPERATORNAME',
        resizable: true,
    },
])
let dataSource =  ref([])
let selectData:any = ref({
    V_BAGNO: '',
    N_BAGWEIGHT: '',
    V_DESTINATION: '',
    V_HBH: ''
})

onMounted(() => {
    getTallyingTableData()
})

//获取表格数据
function getTallyingTableData() {
    service.gh_service.axios('select')
    .then((res:any) => {
        console.log(res);
        dataSource.value = res.data
    }).catch((err:any) => {
        console.log(err);
        
    })
}
function handleResizeColumn(w:any, col:any) {
  col.width = w;
}

const handleFinish: FormProps['onFinish'] = values => {
  console.log(values);
};
const handleFinishFailed: FormProps['onFinishFailed'] = errors => {
  console.log(errors);
};

</script>

<template>
    <div class="tallyingTable">
        <header>
            <a-form
                layout="inline"
                :model="selectData"
                @finish="handleFinish"
                @finishFailed="handleFinishFailed"
            >
                <a-form-item label="邮袋号">
                    <a-input v-model:value="selectData.V_BAGNO" placeholder="Username">
                        <template #prefix><UserOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
                    </a-input>
                </a-form-item>
                <a-form-item>
                    <a-input v-model:value="selectData.V_DESTINATION" type="password" placeholder="Password">
                        <template #prefix><LockOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
                    </a-input>
                </a-form-item>
                <a-form-item>
                    <a-button type="primary" html-type="submit">查询</a-button>
                </a-form-item>
            </a-form>
        </header>
        <main>
            <a-table class="ant-table-striped" bordered size="middle" @resizeColumn="handleResizeColumn"
                :dataSource="dataSource" 
                :columns="columns"
            />
        </main>
    </div>
</template>

<style scoped>
main {
    margin-top: 20px;
}
</style>