<script lang="ts" setup>
import service from '@/service/index'
import { message } from 'ant-design-vue'
import { onMounted, reactive, ref } from "vue"

const Props = defineProps({
    modifyData: {
        type: Object,
        default: {
            open: false,
            data: {}
        }
    }
})
const emit = defineEmits(["closeModal"])
let formState = reactive({})
let carNoList:Array<object> = []

onMounted(() => {
})


//关闭
function onCancelClick() {
    emit("closeModal", false)   
}

//确认修改
function onOkClick() {
    emit("closeModal", false)   
}

//选择运输类型
function onAuditTypeChange(val:string) {
    //根据类型，提供车牌号选择
    getCarNoList(val)
}

//获取车牌号列表
function getCarNoList(type:string) {
    service.gh_service.axios('clxxcx',{
        V_ENT_TYPE: type
    }).then((res:any) => {
        carNoList.length = 0
        res.data.forEach((e:any) => {
            if(e.V_CHECK == '1') {
                let object = {text: e.V_CARNO, value: e.V_CARNO}
                carNoList.push(object)
            }
        })
    }).catch((err:any) => {
        console.log(err);
        message.error('获取车牌号列表出现错误')
    })
}

function onCarNoChange() {

}
</script>

<template>
    <div class="showModify">
        <a-modal v-model:open="Props.modifyData.open" title="装车出库申请修改"
        @ok="onOkClick" @cancel="onCancelClick"
        ok-text="修改">
            <a-form
                ref="formRef"
                :model="Props.modifyData.data"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 13 }"
            >
                <a-form-item label="出库序列号" name="V_AUDIT_NO">
                    <a-input v-model:value="Props.modifyData.data.V_AUDIT_NO" disabled />
                </a-form-item>
                <a-form-item label="运输类型" name="V_AUDIT_TYPE">
                    <a-select v-model:value="Props.modifyData.data.V_AUDIT_TYPE" @change="onAuditTypeChange">
                        <a-select-option value="1">转场</a-select-option>
                        <a-select-option value="2">转关</a-select-option>
                        <a-select-option value="3">转运</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="目的地" name="V_ADDRESS">
                    <a-input v-model:value="Props.modifyData.data.V_ADDRESS" />
                </a-form-item>
                <a-form-item label="车牌号" name="V_CARNO">
                     <a-select v-model:value="Props.modifyData.data.V_CARNO" @change="onCarNoChange">
                        <a-select-option v-for="(item, index) in carNoList" :value="item" :key="index">{{item}}</a-select-option>
                    </a-select>
                </a-form-item>
                <!-- <a-form-item label="邮袋清单" name="V_BAGNO">
                    <a-checkbox-group v-model:value="Props.modifyData.data.V_BAGNO">
                        <a-row>
                            <a-col v-for="(item, index) in Props.modifyData.data.V_BAGNO.split(',')" :key="index">
                                <a-checkbox :value="item" style="line-height: 32px">{{item}}</a-checkbox>
                            </a-col>
                        </a-row>
                    </a-checkbox-group>
                </a-form-item> -->
            </a-form>
        </a-modal>
    </div>
</template>

<style scoped>

</style>