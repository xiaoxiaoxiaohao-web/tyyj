<script  lang="ts"  setup>
import service from '../../service/index'
import { useHomeStore } from '../../store/home';
import { reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast, showFailToast, showNotify } from 'vant';

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
    console.log();
    
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