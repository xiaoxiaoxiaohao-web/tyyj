<script lang="ts" setup>
import md5 from 'js-md5'
import service from '@/service/index'
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'

const Props = defineProps({
    open: {
        type: Boolean,
        default: false
    }
})
const emit = defineEmits(["close"])


let addForm = reactive({
    PERSON_NAME: '',
    PERSON_CODE: '',
    LOGIN_PWD: '',
    REPEAT_PWD: ''
})

function onCancel() {
    emit("close", false)
}

//新增
function onAddAccountOk() {

    if(!judgeSamePassword(addForm.LOGIN_PWD, addForm.REPEAT_PWD)) {
        message.error('重复密码不一致')
    }else {
        service.gh_service.axios('xzyhzh', {
            PERSON_NAME: addForm.PERSON_NAME,
            PERSON_CODE: addForm.PERSON_CODE,
            LOGIN_PWD: md5(addForm.LOGIN_PWD).toUpperCase()
        }).then((res:any) => {
            if(res.success == true) {
                message.success('新增成功')
                onCancel()
            }else{
                message.error('新增失败')
            }
        }).catch((err:any) => {
            console.log(err)
            message.error('出现错误')
        })
    }
}


//判断密码和重复新密码
function judgeSamePassword(password:string, repeat_password:string) {
    if(password == repeat_password) {
        return true
    }
    return false
}
</script>

<template>
    <div class="addAccountShow">
        <a-modal v-model:open="Props.open" title="新增账号" @ok="onAddAccountOk" @cancel="onCancel">
            <a-form
                :model="addForm"
                name="basic"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 16 }"
                autocomplete="off"
            >

                <a-form-item
                label="用户姓名"
                name="name"
                >
                    <a-input v-model:value="addForm.PERSON_NAME" />
                </a-form-item>

                <a-form-item
                label="账号"
                name="code"
                >
                    <a-input v-model:value="addForm.PERSON_CODE" />
                </a-form-item>

                <a-form-item
                label="密码"
                name="pwd"
                >
                    <a-input-password v-model:value="addForm.LOGIN_PWD"/>
                </a-form-item>

                <a-form-item
                label="重复密码"
                name="repeat_pwd"
                >
                    <a-input-password v-model:value="addForm.REPEAT_PWD" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>