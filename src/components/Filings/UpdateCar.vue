<script  lang="ts"  setup>
import service from '../../service/index'
import { useHomeStore } from '../../store/home';
import { reactive, toRaw } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast, showFailToast, showNotify } from 'vant';
import axios from 'axios';

let router = useRouter()
let route = useRoute()
const homeStore = useHomeStore()

let form:any = reactive({
    V_CARNO: route.query.V_CARNO,
    V_ENT_TYPE: route.query.V_ENT_TYPE,
    V_ENT_NAME: route.query.V_ENT_NAME,
    V_OPERNAME: route.query.V_OPERNAME
})

//返回
function onClickLeft() {
    router.push({name: 'filings'}) 
}

//修改
function onSubmit() {
    carUpdateReport(form.V_CARNO, form.V_ENT_TYPE, form.V_ENT_NAME).then((res:any) => {
        console.log(res);
        let data = res.result.info[0]
        if(data.flag == '1') {
            showToast('修改成功')
            router.push({name: 'filings'})
            //更新本地数据库
            updateCarInfo()
        }else {
            showFailToast('修改失败' + data.desc)
        }
    }).catch((err:any) => {
        console.log(err)
        showNotify('海关修改结果失败,原因：' + err )
    })
}

//车辆信息备案修改
function carUpdateReport(carNo:string, entType:string, entName:string) {
    let params = [homeStore.user.PERSON_NAME]
    params.unshift(entName)
    params.unshift(entType)
    params.unshift(carNo)
    let new_params = (JSON.stringify(params)).replace(/\"/g, "'")
    return service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'CarUpdateReport',
        params: new_params
    })
}

//车辆信息修改
function updateCarInfo() {
    service.gh_service.axios('clxxxg', toRaw(form)).then((res:any) => {
        console.log(res);
    }).catch((err:any) => {
        console.log(err);
    })
}

</script>

<template>
    <div class="UpdateCar">
        <header>
            <van-nav-bar title="修改车辆信息" left-text="返回"  left-arrow @click-left="onClickLeft" />
        </header>
        <main>
            <van-form @submit="onSubmit">
                <van-cell-group inset>
                    <van-field
                        v-model="form.V_CARNO"
                        name="车牌号"
                        label="车牌号"
                        placeholder="车牌号"
                    />
                    <van-field
                        v-model="form.V_ENT_TYPE"
                        name="类型"
                        label="类型"
                        placeholder="类型"
                    />
                    <van-field
                        v-model="form.V_ENT_NAME"
                        name="企业名称"
                        label="企业名称"
                        placeholder="企业名称"
                    />
                    <van-field
                        v-model="form.V_OPERNAME"
                        name="操作人"
                        label="操作人"
                        readonly
                    />
                </van-cell-group>
                <div style="margin: 16px;">
                    <van-button round block type="primary" native-type="submit">
                    修改
                    </van-button>
                </div>
            </van-form>
        </main>
    </div>
</template>