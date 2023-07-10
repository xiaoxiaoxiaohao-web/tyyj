<script setup lang="ts">
import service from '@/service/index'
import { onMounted, reactive, ref, toRaw, getCurrentInstance } from 'vue'
import { useHomeStore } from '../../store/home';
import { useRouter } from 'vue-router';
import { showToast, showFailToast, showNotify, showLoadingToast, closeToast } from 'vant';

const homeStore = useHomeStore()
let instance = getCurrentInstance()
let searchValue = ref('')
type car = {
    V_CARNO : string,
    V_ENT_TYPE: string,
    V_ENT_NAME: string,
    V_OPERNAME: string,
    V_CHECK: string
}
const carList: Array<car> = reactive([])
let router = useRouter()

let show = ref(false)
let chooseList:any = reactive({})

const actions = [
    { name: '修改' },
    // { name: '禁用' },
    { name: '删除' },
];
const onSelect = (item:any, index:any) => {
    // 默认情况下点击选项时不会自动收起
    // 可以通过 close-on-click-action 属性开启自动收起
    show.value = false;
    if(item.name == '修改') {
        router.push({path: '/updatecar', query: chooseList})
    }else if(item.name == '禁用') {

    }else if(item.name == '删除') {
        CarDeleteReport(chooseList.V_CARNO, index)
    }else {

    }

};

onMounted(() => {
    getCarInfo(searchValue.value)
})


//新增车辆
function onAddCar() {
    router.push({name: 'addcar'}) 
}

//展示动作面板
function onShowActionSheet(item: any) {
    show.value = true
    chooseList = toRaw(item)
    
}

//查询
function onSearch(val:any) {
    getCarInfo(val)
}



//查询车辆信息
function getCarInfo(carno:any) {
    service.gh_service.axios('clxxcx',{
        V_CARNO: carno
    }).then((res:any) => {
        carList.length = 0
        res.data.forEach((element:any) => {
            carList.push(element)
            CarResultReport(element.V_CARNO)
        });
    }).catch((err:any) => {
        instance.appContext.config.globalProperties.$judgeError(err.message, err.response)
    })
}

//车辆海关审核结果查询
function CarResultReport(carNo:string) {
    let params = []
    params.push(carNo)
    let new_params = (JSON.stringify(params)).replace(/\"/g,"'")
    service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'CarResultReport',
        params: new_params
    }).then((res:any) => {
        let data = res.result.info[0]
        updateCarCheck(carNo, data)
        // if(data.check == '1') { //审查通过

        // }else if(data.check == '0') { //未审核通过

        // }else { // -1 未进行审核

        // }
        
        
    }).catch((err:any) => {
        showNotify({message: '海关审核结果查询失败,原因：' + err })
    })
}

//审核结果更新数据库
function updateCarCheck(carNo:string, checkInfo:any) {

    service.gh_service.axios('clxxbashjggx', {
        V_CARNO: carNo,
        V_CHECK: checkInfo.check,
        V_PASSDESC: checkInfo.passdesc
    }).then((res:any) => {
    //    console.log(res);
       
    }).catch((err:any) => {
        instance.appContext.config.globalProperties.$judgeError(err.message, err.response)
    })
}

//海关车辆信息备案删除
function CarDeleteReport(carNo:string, index:number) {
    let params = [homeStore.user.PERSON_NAME]
    params.unshift(carNo)
    let new_params = (JSON.stringify(params)).replace(/\"/g, "'")
    service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'CarDeleteReport',
        params: new_params
    }).then((res:any) => {
        let data = res.result.info[0]
        console.log(data)
        if(data.flag == '1') {
            carList.splice(index, 1)
            deleteCarNo(carNo)
            showToast('删除成功')
        }
    }).catch((err:any) => {
        console.log(err);
        showNotify({message: '海关审核结果查询失败,原因：' + err })
    })
}

//数据库删除车辆
function deleteCarNo(carNo:string) {
    service.gh_service.axios('clxxsc',{
        V_CARNO: carNo
    }).then((res:any) => {
        console.log(res);
        
    }).catch((err:any) => {
        console.log(err);
        
    })
}


</script>

<template>
    <div class="Filings">
        <header>
            <van-nav-bar title="车辆备案"  />
            <van-search
                v-model="searchValue"
                shape="round"
                background="#1989fa"
                placeholder="请输入车牌号"
                @search="onSearch"
            />
        </header>
        <main>
            <div class="operate">
                <van-divider :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }">操作</van-divider>
                <van-button type="primary" @click="onAddCar">新增车辆</van-button>
            </div>
            <van-divider 
            :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }">当前备案车辆</van-divider>
            <van-cell-group>
                <van-cell v-for="(item, index) in carList" icon="logistics" :key="index" 
                :value="item.V_ENT_TYPE" :label="item.V_ENT_NAME" 
                @click="onShowActionSheet(item)" >
                    <template #title>
                        <span class="custom-title">{{item.V_CARNO}}&nbsp;&nbsp;</span>
                        <van-tag type="primary" v-if="item.V_CHECK == '1'">审核通过</van-tag>
                        <van-tag type="danger" v-else-if="item.V_CHECK == '0'">审核未通过</van-tag>
                        <van-tag type="warning" v-else>未进行审核</van-tag>
                    </template>
                </van-cell>
            </van-cell-group>
            <van-action-sheet v-model:show="show" title="选项" :actions="actions" @select="onSelect"></van-action-sheet>
        </main>
    </div>
</template>

<style scoped>
header {
    position: fixed;
    width: 100%;
    height: 46px;
    top: 0;
    z-index: 1;
}
main {
    padding: 90px 10px 50px 10px;
    width: 100%;
}
.van-button {
    margin: 0px 5px;
}
</style>