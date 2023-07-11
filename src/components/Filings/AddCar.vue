<script lang="ts" setup>
import service from '../../service/index'
import { useHomeStore } from '../../store/home';
import { ref, reactive, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showNotify } from 'vant';


let router = useRouter()
const instance:any = getCurrentInstance()
const homeStore = useHomeStore()

let carInfo:any = reactive({
    V_CARNO: '',
    V_ENT_TYPE: '',
    V_ENT_NAME: '',
    V_OPERNAME: homeStore.user.PERSON_NAME
})
let showTypePicker = ref(false)
let typeColumns = [
    { text: '转场', value: '1' },
    { text: '转关', value: '2' },
    { text: '转运', value: '3' },
]


//返回
function onClickLeft() {
    router.push({name: 'filings'}) 
}

//类型选择确定
function onTypeConfirm({selectedOptions} :any ) {
    carInfo.V_ENT_TYPE = selectedOptions[0].value
    showTypePicker.value = false
}

//新增
function onAddCarClick() {
    CarAddReport().then((res:any) => {
        let data = res.result.info[0]
        if(data.flag == '1') {
            showToast('录入成功')
            //插入数据库
            insertCarInfo()
            router.push({name: 'filings'})
        }else {
            showNotify({message: '确认失败， 原因：' + data.desc})
        }
        
    }).catch((err:any) => {
        showNotify({message: '海关接口出现错误， 原因：' + err})
    })
}

//车辆信息备案录入
function CarAddReport() {
    let params = []
    for(let key in carInfo) {
        params.push(carInfo[key])
    }
    let new_params = (JSON.stringify(params)).replace(/\"/g,"'")

    return service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'CarAddReport',
        params: new_params
    })
}

//插入数据库
function insertCarInfo() {
    service.gh_service.axios('insertcarinfo',carInfo).then((res:any) => {
        console.log(res);
    }).catch((err:any) => {
        instance.appContext.config.globalProperties.$judgeError(err.message)
    })
}


</script>

<template>
    <div class="AddCar">
        <header>
            <van-nav-bar title="新增车辆" left-text="返回"  left-arrow @click-left="onClickLeft" />
        </header>
        <main>
            <van-form @submit="onAddCarClick">
                <van-cell-group inset>
                    <van-field
                        v-model="carInfo.V_CARNO"
                        name="车牌号"
                        label="车牌号"
                        placeholder="车牌号"
                        required
                        :rules="[{ required: true, message: '请输入车牌号' }]"
                    />
                    <van-field
                        v-model="carInfo.V_ENT_TYPE"
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
                    <van-field
                        v-model="carInfo.V_ENT_NAME"
                        name="企业名称"
                        label="企业名称"
                        placeholder="企业名称"
                        required
                        :rules="[{ required: true, message: '请输入企业名称' }]"
                    />
                    <van-field
                        v-model="carInfo.V_OPERNAME"
                        name="操作人"
                        label="操作人"
                        placeholder="操作人"
                        readonly
                    />
                </van-cell-group>
                <div style="margin: 16px;">
                    <van-button round block type="primary" native-type="submit">
                    新增
                    </van-button>
                </div>
            </van-form>
        </main>
    </div>
</template>

<style scoped>
.AddCar {
    background-color: #F7F8FA;
    width: 100%;
    height: 100%;
}
main {
    padding-top: 2vh;
}
</style>