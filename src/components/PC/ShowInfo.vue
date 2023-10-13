<script lang="ts" setup>
import { useHomeStore } from '@/store/home'
import { onMounted, reactive, ref, toRaw, inject } from 'vue'

const Props = defineProps({
    modifyOpen: {
        type: Boolean,
        defalut: false
    }
})
const emit = defineEmits(["getOpen"])
const homeStore = useHomeStore()

interface form {
    username: string,

}
let formState:form = reactive({
    username: ''
})
let componentDisabled = ref<boolean>(true)

onMounted(() => {

})

//关闭
function onClose() {
    emit( "getOpen", false)   
}
</script>

<template>
    <div class="ShowInfo">
       <a-drawer :width="400" 
        :title="'个人信息(' + homeStore.user.PERSON_NAME + ')'"
        :open="Props.modifyOpen" @close="onClose">
           <a-form
                :model="formState"
                name="basic"
                autocomplete="off"
                :disabled="componentDisabled"
            >
                <a-form-item
                    label="用户名"
                    name="username"
                >
                    <a-input v-model:value="formState.username" />
                </a-form-item>
            </a-form>
            <a-button type="primary" @click="on">修改</a-button>
        </a-drawer>
    </div>
</template>

<style scoped>

</style>