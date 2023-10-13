<script setup lang="ts">
import service from '@/service/index'
import qs from 'qs'
import { ref, reactive, onMounted, toRaw, getCurrentInstance} from 'vue'
import { useHomeStore } from '@/store/home'
import { showToast, showFailToast, showNotify, showLoadingToast, closeToast, showDialog } from 'vant'
const homeStore = useHomeStore()

let searchValue = ref<string>('')
let showCenter = ref<boolean>(false)
let mailbagWeight = ref<Array<number>>([])
let showCurrentWeight = ref<number>(0)

let instance:any  = getCurrentInstance()

interface form {
    V_CARNO: string, 
    V_ADDRESS: string, 
    V_MAILBAG_NUM: number,
    V_BAGNO: Array<string>,
    V_MAILBAG_WEIGHT: string,
    V_AUDIT_TYPE: string,
    CUSTOMS_CODE: string,
    V_OPERNAME: string
}


let formData:form = reactive({
    V_CARNO: '', 
    V_ADDRESS: '', 
    V_MAILBAG_NUM: 0,
    V_BAGNO: [],
    V_MAILBAG_WEIGHT: '0',
    V_AUDIT_TYPE: '1',
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
let carNoColumns:Array<object> = []
let searchRef = ref<HTMLInputElement|null>(null)
let modifyValue = ref<boolean>(false)
let showAuditNo = ref<string>()
let deleteBagNo = ref<Array<string>>([])


onMounted(() => {
    searchRef.value && searchRef.value.focus()
    getCarNoList('1')
})

//输入邮袋号
function onSearch(val:string) {
    //两种总包类型
    let pattern1 = /^[0-9]{30}$/
    let pattern2 = /^[A-Z]{15}[0-9]{14}$/
    //去除头尾空格
    val = val.trim()

    if(!pattern1.test(val) && !pattern2.test(val)){
        showFailToast('条码不符合规则')
    }else if(judgeRepeat(val)) {  //判断是否重复
        showFailToast('清单重复总包条码')
    }else {
        //获取邮袋信息
        getBagNoInfo(val)
    }
    searchValue.value = ''
    searchRef.value && searchRef.value.focus()
}


//判断是否重复
function judgeRepeat(val:string) {
    let result:boolean = false
    formData.V_BAGNO.forEach((e:string) => {
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
        let data = res.data[0]
        if(res.data.length == 0) {
            showFailToast('该总包未理货采集')
        }else if(data.V_LHTJFLAG == '0') {
            showFailToast('该总包未推给海关')
        }else if(data.V_AUDIT_NO != null && data.V_CHECK == '1') {
            showDialog({
                title: '提示',
                message: '该总包已经出库申请且审核通过，不允许修改！！',
            })
        }else if(data.V_AUDIT_NO != null){ //申请过
            showDialog({
                title: '提示',
                message: '该总包已经出库申请过，是否进入修改',
                showCancelButton: true
            }).then((res:any) => { //进入修改
                modifyValue.value = true
                //获取修改内容
                getModifyData(data.V_AUDIT_NO)
            }).catch((err:any) => {
                showToast('扫描成功')
                formData.V_BAGNO.unshift(bagno)
                mailbagWeight.value.unshift(data.N_BAGWEIGHT)
                
                //计算总重量、数量
                formData.V_MAILBAG_WEIGHT = (parseFloat(data.N_BAGWEIGHT) + parseFloat(formData.V_MAILBAG_WEIGHT)).toFixed(2) 
                formData.V_MAILBAG_NUM = formData.V_BAGNO.length
                showCurrentWeight.value = data.N_BAGWEIGHT
                
            })
        }else {
            showToast('扫描成功')
            formData.V_BAGNO.unshift(bagno)
            mailbagWeight.value.unshift(data.N_BAGWEIGHT)
            
            //计算总重量、数量
            formData.V_MAILBAG_WEIGHT = (parseFloat(data.N_BAGWEIGHT) + parseFloat(formData.V_MAILBAG_WEIGHT)).toFixed(2) 
            formData.V_MAILBAG_NUM = formData.V_BAGNO.length
            showCurrentWeight.value = data.N_BAGWEIGHT
        }
    }).catch((err:any) => {
        console.log(err)
        // instance.appContext.config.globalProperties.$judgeError(err.message)
        showNotify({message: '出现错误， 原因：' + err})
    })
}

//申请
function onApplyClick() {
    //构建海关接口所需参数
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

//获取修改内容
function getModifyData(auditno:string) {
    service.gh_service.axios('cxxlhxx', {
        V_AUDIT_NO: auditno
    }).then((res:any) => {
        let data = res.data[0]
        showAuditNo.value = data.V_AUDIT_NO 
        formData.V_AUDIT_TYPE = data.V_AUDIT_TYPE
        formData.V_CARNO = data.V_CARNO
        formData.V_ADDRESS = data.V_ADDRESS
        formData.V_MAILBAG_NUM = data.V_MAILBAG_NUM
        formData.V_MAILBAG_WEIGHT = data.V_MAILBAG_WEIGHT
        data.V_BAGNO.split(',').forEach((e:string) => {
            formData.V_BAGNO.push(e)
        })
        data.N_BAGWEIGHT.split(',').forEach((e:number) => {
            mailbagWeight.value.push(e)
        })
        
    }).catch((err:any) => {
        console.log(err)
        showNotify('出现错误' + err) 
    })
}

//修改
function onModifyClick() {
    let params = []
    for(let key in formData) {
        if(key == 'V_BAGNO') {
            params.push(formData.V_BAGNO.join(','))
        }else{
            params.push(formData[key])
        }
    }
    params.unshift(showAuditNo.value)
    let new_params = (JSON.stringify(params)).replace(/\"/g,"'")
    console.log(new_params)
    outbandAuditUpdateReport(new_params)
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
        // instance.appContext.config.globalProperties.$judgeError(err.message)
        showFailToast('获取车牌号列表出现错误')
    })

    
}


//海关装车出库申请录入接口,获取出库申请序列号
async function outbandAuditAddReport(new_params:string) {
    
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
        }else {
            showNotify({message: '申请失败， 原因：' + data.desc})
        }
    }).catch((err:any) => {
        console.log(err);
        // instance.appContext.config.globalProperties.$judgeError(err.message)
        showNotify({message: '出现错误， 原因：' + err})
    })
    closeToast()
}

//插入数据库
function insertAuditNo(auditNo:string) {
    Object.assign(toRaw(formData), {V_AUDIT_NO: auditNo})
    service.gh_service.axios('insertauditno', toRaw(formData)
    ).then((res:any) => {
        console.log(res)
        updateBag(auditNo, formData.V_BAGNO)
    }).catch((err:any) => {
        console.log(err);
        // instance.appContext.config.globalProperties.$judgeError(err.message)
        showNotify({message: '出现错误， 原因：' + err})
    })
}

//更新BAG表
function updateBag(auditNo:string, bagNo:Array<string>) {
    service.gh_service.axios('updatebagauditno', 
        qs.stringify(
        {   V_BAGNO: bagNo,
            V_AUDIT_NO: auditNo
        },
        {indices: false})
    ).then((res:any) => {
        console.log(res)
        //申请成功后清空数据
        formData = reactive({
            V_CARNO: '', 
            V_ADDRESS: '', 
            V_MAILBAG_NUM: 0,
            V_BAGNO: [],
            V_MAILBAG_WEIGHT: '0',
            V_AUDIT_TYPE: '1',
            CUSTOMS_CODE: '5147',
            V_OPERNAME: homeStore.user.PERSON_NAME
        })
    }).catch((err:any) => {
        console.log(err)
        // instance.appContext.config.globalProperties.$judgeError(err.message)
        showNotify({message: '出现错误， 原因：' + err})
    })
}


//更新Auditno表
function updateAuditNo() {
    service.gh_service.axios('zccksqxg',  
        Object.assign(toRaw(formData), {V_AUDIT_NO: showAuditNo.value})
    ).then((res:any) => {
        console.log(res)
        
    }).catch((err:any) => {
        console.log(err)
        showNotify('出现错误，原因：' + err)
    })
}

//海关装车出库申请修改接口
function outbandAuditUpdateReport(new_params:string) {
    service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'outbandAuditUpdateReport',
        params: new_params
    }).then((res:any) => {
        let data = res.result.info[0]
        if(data.flag == 1) { //修改成功
            //把删除的邮袋的序列号设置为空
            updateBag('', [...new Set(deleteBagNo.value)])
            //更新序列号，车辆等其他信息
            updateAuditNo()

        }else {
            showNotify('申请修改失败， 原因：' + data.desc)
        }
        
    }).catch((err:any) => {
        console.log(err)
        
    })
}

//类型选择确定
function onTypeConfirm({selectedOptions} :any ) {
    formData.V_AUDIT_TYPE = selectedOptions[0].value
    showTypePicker.value = false
    getCarNoList(selectedOptions[0].value)
    formData.V_CARNO = ''
}

//车牌号选择确定
function onCarNoConfirm({selectedOptions} :any ) {
    formData.V_CARNO = selectedOptions[0].value
    showCarNoPicker.value = false
}

//清单详细
function onDetailClick() {
    showCenter.value = true  
}

//清单删除
function onDeleteClick(index:number, item?:any) {
    //删除邮袋号
    deleteBagNo.value.push(formData.V_BAGNO[index])
    console.log(toRaw(deleteBagNo.value));
    
    formData.V_BAGNO.splice(index, 1)
    //获取删除邮袋的重量
    let currentWeight = mailbagWeight.value[index]
    //删除邮袋重量
    mailbagWeight.value.splice(index, 1)
    //计算总重量、数量
    formData.V_MAILBAG_WEIGHT = (parseFloat(formData.V_MAILBAG_WEIGHT) - currentWeight).toFixed(2)
    formData.V_MAILBAG_NUM = formData.V_BAGNO.length
    showCurrentWeight.value = 0 - currentWeight
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
            <van-form>
                <van-cell-group>
                    <van-field v-if="modifyValue" v-model="showAuditNo" name="序列号" label="序列号" readonly disabled />
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
                    <van-field v-model="formData.V_MAILBAG_WEIGHT" name="总重量" label="总重量(kg)" disabled> 
                        <template #right-icon>
                            <a> {{showCurrentWeight}}</a>
                        </template>
                    </van-field>
                    <van-field v-model="formData.CUSTOMS_CODE" name="关区号" label="关区号" disabled />
                    <van-field v-model="formData.V_OPERNAME" name="操作人" label="操作人"  disabled />
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
                    <van-button v-if="modifyValue" round block type="primary" @click="onModifyClick">
                    修改
                    </van-button>
                    <van-button v-else round block type="primary" @click="onApplyClick">
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
}
</style>