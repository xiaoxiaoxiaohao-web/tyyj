<script lang="ts" setup>
import service from '@/service/index'
import { onMounted, reactive, ref, toRaw } from 'vue'
import { showNotify, showFailToast, showToast, showDialog  } from 'vant'
import { useHomeStore } from '@/store/home'
import {Base64} from 'js-base64'


const homeStore = useHomeStore()
let searchValue = ref<string>()
let searchRef = ref<HTMLInputElement|null>(null)
let abNo = ref<string>('')
let fileList = ref<Array<object>>([])

interface cell {
    V_MAILNO: string,
    V_ABNORMALTYPE: string,
    V_OPERATORNAME: string,
    V_ENTNAME: string,
    V_ABINFO: string,
    V_INSTRSTATE: string,
    V_FILENAME: string,
    V_FILEDATA: string
}

let cell:cell = reactive({
    V_MAILNO: '',
    V_ABNORMALTYPE: '',
    V_OPERATORNAME: homeStore.user.PERSON_NAME,
    V_ENTNAME: '中国邮政速递物流股份有限公司广东省分公司',
    V_ABINFO: '',
    V_INSTRSTATE: '',
    V_FILENAME: '',
    V_FILEDATA: ''
})

let showAbinfoPicker = ref<boolean>(false)
let abinfoColumns = [
    { text: '安检拉下', value: '安检拉下' },
    { text: '截留邮件', value: '截留邮件' },
    { text: '放弃包', value: '放弃包' },
    { text: '无邮路', value: '无邮路' },
    { text: '其他', value: '其他' },
]
let showAbnormalTypePicker = ref<boolean>(false)
let abnormalTypeColums = [
    { text: '退运已入库转其他原因出库', value: '1' },
    { text: '退运已装袋转退运已入库', value: '2' },
    { text: '退运已出库转退运已入库', value: '3' },
]

//类型选择确定
function onAbinfoConfirm({selectedOptions} :any ) {
    cell.V_ABINFO = selectedOptions[0].value
    showAbinfoPicker.value = false
}


//类型选择确定
function onAbnormalTypeConfirm({selectedOptions} :any ) {
    cell.V_ABNORMALTYPE = selectedOptions[0].value
    showAbnormalTypePicker.value = false
}

function onSearch(val:string) {
    //邮件号规则
    let pattern = /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/
    //判断是否符合规则
    if(pattern.test(val)) {
        cell.V_MAILNO = val
    }else {
        showFailToast('不符合邮件号规则');
    }
    searchRef.value && searchRef.value.focus()
    searchValue.value = ''
}

//申报
function onSumbitClick() {
    //base64加密
    // let encodeFiledata = Base64.encode(cell.V_FILEDATA)
    
    mailAbnormalDisposeAddReport()
    
}

//异常邮件处置申报
function mailAbnormalDisposeAddReport() {
    let params = []
    for(let key in cell) {
        params.push(cell[key])
    }
    // params[params.length - 1] = encode
    let new_params = (JSON.stringify(params)).replace(/\"/g, "'")
    service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'mailAbnormalDisposeAddReport',
        params: new_params
    }).then((res:any) => {
        let data = res.result.info[0]
        let retArray = data.mailRet.split('-')
        if(retArray[0] == 'success') {
            abNo.value = data.abNo
            update(abNo.value)
            showToast(retArray[1])
        }else {
            showNotify(retArray[1] + ',' + retArray[2])
        }
    }).catch((err:any) => {
        console.log(err);
        showNotify('出现错误，原因：' + err)
    })
}

//插入异常情况编号
function update(abNo:string) {
    service.gh_service.axios('ycyjczcr',
    Object.assign(toRaw(cell), {V_ABNO: abNo})
    ).then((res:any) => {
        console.log(res)
    }).catch((err:any) => {
        console.log(err)
        
    })
}

//图片上传
function afterRead(file:any) {
    let fileObject = toRaw(file)
    cell.V_FILENAME = fileObject.file.name
    let contentArray = fileObject.content.split(',')
    cell.V_FILEDATA = fileObject.content
    
    

    // let temp = fileObject.content.split(',')
    // let mime = temp[0].match(/:(.*?);/)[1]
    // let raw = window.atob(temp[1])
    
    // let rawLength = raw.length

    // let uInt8Array = new Uint8Array(rawLength)
    // console.log(uInt8Array);
    
    // for(let i = 0; i < rawLength; i++) {
    //     uInt8Array[i] = raw.charCodeAt(i)
    // }
    // let blob = new Blob([uInt8Array], {type: mime})
    // console.log(blob);

    // let filenew = new File([blob], '1', {type: mime, lastModified:Date.now()})
    // console.log(filenew);
    
    
    // cell.V_FILENAME = fileObject.file.name
    // let contentArray = fileObject.content.split(",")
    
    // cell.V_FILEDATA = contentArray[1]
    

    
    // let imgBlob = URL.createObjectURL(fileObject.file)
    // console.log(imgBlob);
    
    
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
            <van-form @submit="onSumbitClick">
                <van-cell-group>
                    <van-field v-model="cell.V_MAILNO" label="邮件号" required />
                    <van-field
                        v-model="cell.V_ABNORMALTYPE"
                        readonly
                        is-link
                        name="处置类型"
                        label="处置类型"
                        placeholder="点击选择类型"
                        @click="showAbnormalTypePicker = true"
                        required
                        :rules="[{ required: true, message: '请选择处置类型' }]"
                    />
                        <van-popup v-model:show="showAbnormalTypePicker" position="bottom">
                            <van-picker
                                :columns="abnormalTypeColums"
                                @confirm="onAbnormalTypeConfirm"
                                @cancel="showAbnormalTypePicker = false"
                            />
                        </van-popup>
                    <van-field v-model="cell.V_ENTNAME" label="企业名称" disabled type='textarea'  />
                    <van-field
                        v-model="cell.V_ABINFO"
                        readonly
                        is-link
                        name="情况说明"
                        label="情况说明"
                        placeholder="点击选择情况说明"
                        @click="showAbinfoPicker = true"
                        :rules="[{ required: true, message: '请选择情况说明' }]"
                    />
                        <van-popup v-model:show="showAbinfoPicker" position="bottom">
                            <van-picker
                                :columns="abinfoColumns"
                                @confirm="onAbinfoConfirm"
                                @cancel="showAbinfoPicker = false"
                            />
                        </van-popup>
                    <van-field v-model="cell.V_INSTRSTATE" label="指令状态"   />
                    <van-field v-model="cell.V_FILENAME" label="文件名称" disabled />
                    <!-- <van-field v-model="cell.V_FILEDATA" label="文件内容" type="textarea" maxlength="125" required /> -->
                    <van-field v-model="cell.V_OPERATORNAME" label="申报人" disabled />
                    <van-divider
                    :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }"
                    >
                        上传图片
                    </van-divider>
                    <van-uploader :after-read="afterRead" v-model="fileList" :max-count="1" />
                </van-cell-group>
                <div style="margin: 16px;">
                    <van-button round block type="primary" native-type="submit">
                    申报
                    </van-button>
                </div>
            </van-form>
        </main>
    </div>
</template>

<style scoped>
main {
    padding-bottom: 50px;
}
</style>