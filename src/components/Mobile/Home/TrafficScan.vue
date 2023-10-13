<script setup lang="ts">
import service from '@/service/index'
import { onMounted, reactive, ref, toRaw, getCurrentInstance } from 'vue'
import { useHomeStore } from '@/store/home';
import { showToast, showFailToast, showNotify } from 'vant';

const homeStore = useHomeStore()
let instance = getCurrentInstance()
let searchValue = ref<string>()
let searchRef = ref<HTMLInputElement|null>(null)
let show = ref<boolean>(true)


interface form {
    V_BAGNO: string, 
    V_OPERNAME: string
}

let formData:any = reactive({
    V_BAGNO: '', 
    V_OPERNAME: homeStore.user.PERSON_NAME
})


onMounted(() => {
    searchRef.value && searchRef.value.focus()
})

function onSearch(val:string) {
    //两种总包类型
    let pattern1 = /^[0-9]{30}$/
    let pattern2 = /^[A-Z]{15}[0-9]{14}$/
    //判断是否符合规则
    if(pattern1.test(val) || pattern2.test(val)) {
       formData.V_BAGNO = val
    }else {
        showFailToast('不符合邮件号规则');
    }
    searchRef.value && searchRef.value.focus()
    searchValue.value = ''
}

function onSubmit() {
    mailTrafficScanReport()
}

//退运邮件交航扫描申报接口
function mailTrafficScanReport() {
    let params = []
    for(let key in formData) {
        params.push(formData[key])
    }
    let new_params = (JSON.stringify(params)).replace(/\"/g, "'")
    service.hg_service.axios(
        {
            service: 'RetpostMailService',
            method: 'mailTrafficScanReport',
            params: new_params
        }
    ).then((res:any) => {
        console.log(res)
        let data = res.result.info[0]
        let retArray = data.mailbagRet
        if(retArray[0] == 'success') {
            update(data.info[0])
            showToast(retArray[1])
        }else {
            showNotify(retArray[1] + ',' + retArray[2])
        }
    }).catch((err:any) => {
        console.log(err)
        showNotify('出现错误' + err)
    })
}

//更新交航邮袋信息
function update(params:any) {
    service.gh_service.axios('jhgx', {
        V_BAGNO: params.mailbagNo,
        V_MAILBAGRET: params.mailbagRet
    }).then((res:any) => {
        console.log(res)
        
    }).catch((err:any) => {
        console.log(err)
        
    })
}



</script>

<template>
    <div class="TrafficScan">
        <header>
            <van-search
                v-model="searchValue"
                shape="round"
                background="#1989fa"
                placeholder="请扫描邮袋号"
                @search="onSearch"
                ref="searchRef"
            />
        </header>
        <main>
            <van-cell-group>
                <van-field v-model="formData.V_BAGNO" label="邮袋号" type="textarea"  />
                <van-field v-model="formData.V_OPERNAME" name="操作人" label="操作人" disabled />
            </van-cell-group>
        </main>
        <div style="margin: 16px;">
            <van-button type="primary" block @click="onSubmit" round>交航扫描</van-button>
        </div>
    </div>
</template>

<style scoped>
main {
    padding-bottom: 50px;
}
</style>