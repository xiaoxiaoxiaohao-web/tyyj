<script setup lang="ts">
import service from '@/service/index'
import { onMounted, reactive, ref, toRaw, getCurrentInstance } from 'vue'
import { useHomeStore } from '@/store/home';
import { showToast, showFailToast, showNotify } from 'vant';

const homeStore = useHomeStore()
let instance = getCurrentInstance()
let searchValue = ref<string>()
let searchRef = ref<HTMLInputElement|null>(null)
let V_AUDIT_TYPE = ref<string>()
let show = ref<boolean>(true)


interface form {
    V_AUDIT_NO: string, 
    V_LOCK_NO: string 
    V_DRIVER_NO: string
    V_OPERNAME: string
}

let formData:any = reactive({
    V_AUDIT_NO: '', 
    V_LOCK_NO: '', 
    V_DRIVER_NO: '',
    V_OPERNAME: homeStore.user.PERSON_NAME
})


onMounted(() => {
    searchRef.value && searchRef.value.focus()
})


function onSubmit() {
    outbandLiveReport()
}

//装车确认接口
function outbandLiveReport() {
    let params = []
    for(let key in formData) {
        params.push(formData[key])
    }
    let new_params = (JSON.stringify(params)).replace(/\"/g,"'")

    service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'outbandLiveReport',
        params: new_params
    }).then((res:any) => {
        let data = res.result.info[0]
        if(data.flag == '1') {
            showToast('确认成功')
        }else {
            showNotify('海关确认失败， 原因：' + data.desc)
        }
        updateflag(data.flag)
    }).catch((err:any) => {
        console.log(err);
        showNotify('出现错误， 原因：' + err)
    })
}

//插入数据
function updateflag(flag:string) {
    let newObject = {...formData}
    Object.assign(newObject, {V_FLAG: flag})
    service.gh_service.axios('updateflag', 
    toRaw(newObject)
    ).then((res:any) => {
        console.log(res);
    }).catch((err:any) => {
        console.log(err);
        showNotify('出现错误， 原因：' + err)
    })
}


//扫描邮袋号
function onSearch(val:any) {
    val = val.trim()
    //两种总包类型
    let pattern1 = /^[0-9]{30}$/
    let pattern2 = /^[A-Z]{15}[0-9]{14}$/

    if(!pattern1.test(val) && !pattern2.test(val)){
        showFailToast('条码不符合规则');
    }else{
        //获取序列号
        service.gh_service.axios('gjydhcxckxlh', {
            V_BAGNO: searchValue.value
        }).then((res:any) => {

            if(res.data.length == 0) {
                showFailToast('该邮袋未出库申请')
            }else {
                let data = res.data[0];
                formData.V_AUDIT_NO = data.V_AUDIT_NO
            
                //判断类型
                if(data.V_AUDIT_TYPE == '1') {
                    V_AUDIT_TYPE.value = '转场'
                }else if(data.V_AUDIT_TYPE == '2') {
                    V_AUDIT_TYPE.value = '转关'
                }else {
                    V_AUDIT_TYPE.value = '转运'
                    show.value = false
                }
            }
            
        }).catch((err:any) => {
            console.log(err);
            showNotify('出现错误， 原因：' + err)
        })
    }
    searchValue.value = ''
    searchRef.value && searchRef.value.focus() 
}
</script>

<template>
    <div class="Confirmation">
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
                <van-field v-model="formData.V_AUDIT_NO" label="序列号" disabled  />
                <van-field v-model="V_AUDIT_TYPE" label="类型" disabled  />
                <van-field v-model="formData.V_LOCK_NO" label="关锁号" required v-show="show" />
                <van-field v-model="formData.V_DRIVER_NO" label="司机纸号" required v-show="show" />
                <van-field v-model="formData.V_OPERNAME" name="操作人" label="操作人" disabled />
            </van-cell-group>
        </main>
        <div style="margin: 16px;">
            <van-button type="primary" block @click="onSubmit" round>装车确认</van-button>
        </div>
    </div>
</template>

<style scoped>
main {
    padding-top: 2vh;
    padding-bottom: 50px;
}
</style>