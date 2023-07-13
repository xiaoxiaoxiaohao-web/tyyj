<script setup lang="ts">
import service from '@/service/index'
import qs from 'qs'
import { ref, reactive, onMounted, toRaw, getCurrentInstance} from 'vue'
import { useHomeStore } from '../../store/home'
import { showToast, showFailToast, showNotify, showLoadingToast, closeToast } from 'vant'
const homeStore = useHomeStore()

let searchValue = ref('')
let showCenter = ref(false)
let mailbagWeight:any = []

let instance:any  = getCurrentInstance()

let formData:any = reactive({
    V_CARNO: '', 
    V_ADDRESS: '', 
    V_MAILBAG_NUM: '0',
    V_BAGNO: [],
    V_MAILBAG_WEIGHT: 0,
    V_AUDIT_TYPE: '',
    CUSTOMS_CODE: '5147',
    V_OPERNAME: homeStore.user.PERSON_NAME
})

let showTypePicker = ref(false)
let showCarNoPicker = ref(false)
let typeColumns = [
    { text: '转场', value: '1' },
    { text: '转关', value: '2' },
    { text: '转运', value: '3' },
]
let carNoColumns:any = []

let searchRef = ref<HTMLInputElement|null>(null)


onMounted(() => {
    searchRef.value && searchRef.value.focus()
    getCarNoList('1')
})

//申请
function onSubmit() {
    let params = []
    for(let key in formData) {
        if(key == 'V_BAGNO') {
            params.push(formData.V_BAGNO.join(','))

        }else{
            params.push(formData[key])
        }
    }
    let new_params = (JSON.stringify(params)).replace(/\"/g,"'")
    outbandAuditAddReport(new_params)
}


//获取车牌号列表
function getCarNoList(type:string) {
     service.gh_service.axios('clxxcx',{
        V_CARNO: '',
        V_ENT_TYPE: type
    }).then((res:any) => {
        carNoColumns = []
        res.data.forEach((element:any) => {
            if(element.V_CHECK == '1') {
                let object = {text: element.V_CARNO, value: element.V_CARNO}
                carNoColumns.push(object)
            }
        });
    }).catch((err:any) => {
        console.log(err);
        instance.appContext.config.globalProperties.$judgeError(err.message)
    })

    
}


//海关装车出库申请录入接口,获取出库申请序列号
async function outbandAuditAddReport(new_params:any) {
    showLoadingToast({
        message: '申请中...',
        forbidClick: true,
        duration: 0,
    })

    await service.hg_service.axios(
        {
            service: 'RetpostMailService',
            method: 'outbandAuditAddReport',
            params: new_params
        }
    ).then((res:any) => {
        let data = res.result.info[0]
        if(data.desc == '录入成功' ) {
            showToast('海关申请录入成功')
            insertAuditNo(data.auditNo)
            updateBagAuditNo(data.auditNo)
        }else {
            showNotify({message: '申请失败， 原因：' + data.desc})
        }
        
    }).catch((err:any) => {

        console.log(err);
        instance.appContext.config.globalProperties.$judgeError(err.message)
        showNotify({message: '出现错误， 原因：' + err})
    })
    closeToast()
}

//插入数据库
function insertAuditNo(auditNo:string) {
    Object.assign(toRaw(formData), {V_AUDIT_NO: auditNo})
    service.gh_service.axios('insertauditno', toRaw(formData)
    ).then((res:any) => {
        console.log(res);
        
    }).catch((err:any) => {
        console.log(err);
        instance.appContext.config.globalProperties.$judgeError(err.message)
        showNotify({message: '出现错误， 原因：' + err})
    })
}

//更新BAG表
function updateBagAuditNo(auditNo:string) {
    service.gh_service.axios('updatebagauditno', 
        qs.stringify(
        {   V_BAGNO: formData.V_BAGNO,
            V_AUDIT_NO: auditNo
        },
        {indices: false})
    ).then((res:any) => {
        console.log(res);
        
    }).catch((err:any) => {
        console.log(err);
        instance.appContext.config.globalProperties.$judgeError(err.message)
        showNotify({message: '出现错误， 原因：' + err})
    })
}


//类型选择确定
function onTypeConfirm({selectedOptions} :any ) {
    formData.V_AUDIT_TYPE = selectedOptions[0].value
    showTypePicker.value = false
    getCarNoList(selectedOptions[0].value)
}

//车牌号选择确定
function onCarNoConfirm({selectedOptions} :any ) {
    formData.V_CARNO = selectedOptions[0].value
    showCarNoPicker.value = false
}

function onSearch(val:any) {
    //两种总包类型
    let pattern1 = /^[0-9]{30}$/
    let pattern2 = /^[A-Z]{15}[0-9]{14}$/

    if(!pattern1.test(val) && !pattern2.test(val)){
        showFailToast('条码不符合规则');
    }else if(judgeRepeat(val)) {
        showFailToast('重复总包条码');
    }else {
        //获取信息
        getBagNoInfo(val)
    }
    searchValue.value = ''
    searchRef.value && searchRef.value.focus()
}


//判断是否重复
function judgeRepeat(val:string) {
    let result:boolean = false
    formData.V_BAGNO.forEach((e:any) => {
        if(e === val) {
            result = true
        }
    })
    return result;
}

//获取邮袋信息
function getBagNoInfo(bagno:any) {
    service.gh_service.axios('gjydhcxxx', {
        V_BAGNO: bagno
    }).then((res:any) => {
        if(res.data.length == 0) {
            showFailToast('该总包未采集');
        }else {
            showToast('扫描成功')
            let data = res.data[0]
            formData.V_BAGNO.unshift(bagno)
            mailbagWeight.unshift(data.N_BAGWEIGHT)
            
            //计算总重量
            formData.V_MAILBAG_WEIGHT = parseFloat(data.N_BAGWEIGHT) + parseFloat(formData.V_MAILBAG_WEIGHT) 
            formData.V_MAILBAG_NUM = formData.V_BAGNO.length
        }
    }).catch((err:any) => {
        console.log(err)
        instance.appContext.config.globalProperties.$judgeError(err.message)
    })
}

//清单详细
function onDetailClick() {
    showCenter.value = true  
}

//清单删除
function onDeleteClick(index:number, item?:any) {
    formData.V_BAGNO.splice(index, 1)
    formData.V_MAILBAG_NUM = formData.V_BAGNO.length
    let currentWeight = mailbagWeight[index]
    console.log(currentWeight);
    
    formData.V_MAILBAG_WEIGHT = (formData.V_MAILBAG_WEIGHT - currentWeight).toFixed(3)
    showToast('删除成功')
}


</script>

<template>
    <div class="Outbound">
        <header>
            <van-search
                v-model="searchValue"
                shape="round"
                background="#1989fa"
                placeholder="请扫描清单号"
                @search="onSearch"
                ref="searchRef"
            />
        </header>
        <main>
            <van-form @submit="onSubmit">
                <van-cell-group>
                    <van-field
                        :modelValue="formData.V_AUDIT_TYPE == '3'? '转运': (formData.V_AUDIT_TYPE == '2'?'转关' : '转场')"
                        readonly
                        is-link
                        name="类型"
                        label="类型"
                        placeholder="点击选择类型"
                        @click="showTypePicker = true"
                        required
                        :rules="[{ required: true, message: '请选择类型' }]"
                    />
                    <van-popup v-model:show="showTypePicker" position="bottom">
                        <van-picker
                            :columns="typeColumns"
                            @confirm="onTypeConfirm"
                            @cancel="showTypePicker = false"
                        />
                    </van-popup>
                    <van-field v-model="formData.V_CARNO" readonly
                        is-link name="车牌号" label="车牌号"  
                        placeholder="点击选择车牌号" required
                        @click="showCarNoPicker = true"
                        :rules="[{ required: true, message: '请选择车牌号' }]"
                        />
                    <van-popup v-model:show="showCarNoPicker" position="bottom">
                        <van-picker
                            :columns="carNoColumns"
                            @confirm="onCarNoConfirm"
                            @cancel="showCarNoPicker = false"
                        />
                    </van-popup>
                    <van-field v-model="formData.V_ADDRESS" name="目的地" label="目的地" required :rules="[{ required: true, message: '请输入目的地' }]" />
                    <van-field v-model="formData.V_MAILBAG_NUM" name="数量" label="数量" is-link @click="onDetailClick" readonly />
                    <van-field v-model="formData.V_MAILBAG_WEIGHT" name="总重量" label="总重量(kg)" readonly/>
                    <van-field v-model="formData.CUSTOMS_CODE" name="关区号" label="关区号" />
                    <van-field v-model="formData.V_OPERNAME" name="操作人" label="操作人" readonly />
                </van-cell-group>
                <!--详细清单弹出框-->
                <van-popup v-model:show="showCenter"  position="left" round :style="{ width: '80%', height: '100%' }"> 
                    <van-cell title="邮袋清单"></van-cell>
                    <van-cell v-for="(item, index) in formData.V_BAGNO" :key="index" :title="item" :style="{padding: '10px 5px'}">
                        <template #right-icon>
                            <van-icon name="close" class="close" color="#ee0a24" @click="onDeleteClick(index, item)" />
                        </template>
                    </van-cell>
                </van-popup>
                <div style="margin: 16px;">
                    <van-button round block type="primary" native-type="submit">
                    申请
                    </van-button>
                </div>
            </van-form>
        </main>
    </div>
</template>

<style scoped>
main {
    padding-top: 2vh;
    padding-bottom: 50px;
    /* background-color: #F7F8FA; */
}
</style>