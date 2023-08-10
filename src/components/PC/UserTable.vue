<script lang="ts" setup>
import service from '@/service/index'
import { onMounted, reactive, ref, computed, toRaw } from 'vue'
import type { TableColumnsType, FormProps  } from 'ant-design-vue';
import type { UnwrapRef } from 'vue';
// import { cloneDeep } from 'lodash-es';

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
        width: 150,
    },
    {
        title: '账号',
        dataIndex: 'PERSON_CODE',
        key: 'PERSON_CODE',
        width: 150,
    },
    {
        title: '用户角色',
        dataIndex: 'ROLE_NAME',
        key: 'ROLE_NAME',
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
};

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

function onFinishFailed() {

}

//重置
function onResetClick() {
    selectData = reactive({
        PERSON_NAME: '',
        PERSON_CODE: '',
    })
    onFinshClick()
}

const onSelectChange = (selectedRowKeys: []) => {
  console.log('selectedRowKeys changed: ', selectedRowKeys);
  state.selectedRowKeys = selectedRowKeys;
};
</script>

<template>
    <div class="UserTable">
        <header>
            <a-form
                layout="inline"
                :model="selectData"
                @finish="onFinshClick"
                @finishFailed="onFinishFailed"
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
            <!-- <div style="margin-bottom: 16px">
                <a-button type="primary" :loading="state.loading" @click="start">
                    Reload
                </a-button>
                <span style="margin-left: 8px">
                    <template v-if="hasSelected">
                    {{ `Selected ${state.selectedRowKeys.length} items` }}
                    </template>
                </span>
            </div> -->
            <a-table bordered size="middle" 
                :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }"
                :dataSource="dataSource" 
                :columns="columns"
                :scroll="{ y: 480 }" />
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