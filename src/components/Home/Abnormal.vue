<script lang="ts" setup>
import service from '@/service/index'
import { getCurrentInstance, onMounted, reactive, ref } from 'vue'
import { showNotify, showFailToast, showToast, showDialog  } from 'vant'
import { useHomeStore } from '../../store/home';


const homeStore = useHomeStore()
let instance:any = getCurrentInstance()
let searchValue = ref()
let searchRef = ref<HTMLInputElement|null>(null)
let cell:any = reactive({
    V_MAILNO: '',
    MAILTYPE: '',
    D_RETURN_DATE: '',
    V_OPERNAME: homeStore.user.PERSON_NAME,
    V_NOTE: '',
})

function onSearch(val:string) {
    //邮件号规则
    let pattern = /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/
    //判断是否符合规则
    if(pattern.test(val)) {

    }else {
        showFailToast('不符合邮件号规则');
    }
    searchRef.value && searchRef.value.focus()
    searchValue.value = ''
}
</script>

<template>
    <div class="Abnormal">
        <header>
            <van-search
                v-model="searchValue"
                shape="round"
                background="#1989fa"
                placeholder="请扫描邮件号"
                @search="onSearch"
                ref="searchRef"
            />
        </header>
        <main>
            <van-cell-group>
                <van-field v-model="cell.MAILTYPE" label="邮件类型" readonly />
            </van-cell-group>
        </main>
    </div>
</template>

<style scoped>

</style>