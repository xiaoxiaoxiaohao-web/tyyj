<script setup lang="ts">
import service from '@/service/index'
import { getCurrentInstance, onMounted, ref} from 'vue'
import { useHomeStore } from '@/store/home';
import { showToast, showFailToast, showNotify } from 'vant';


let searchValue = ref<string>()
const cellList = ref<Array<any>>([])
const homeStore = useHomeStore()
let instance:any = getCurrentInstance()

let searchRef = ref<HTMLInputElement|null>(null)

onMounted(() => {
    searchRef.value && searchRef.value.focus()
})

//采集条码
function onSearch(val:string) {
    val = val.trim()
    //两种总包类型
    let pattern1 = /^[0-9]{30}$/
    let pattern2 = /^[A-Z]{15}[0-9]{14}$/

    if(!pattern1.test(val) && !pattern2.test(val)){
        showFailToast('条码不符合规则');
    }else if(judgeRepeat(val)) {
        showFailToast('重复总包条码');
    }else {
        autoSubmit(val)
    }
    searchValue.value = ''
    searchRef.value && searchRef.value.focus()
}


//判断是否重复
function judgeRepeat(val:string) {
    let result:boolean = false
    cellList.value.forEach((e:any) => {
        if(e === val) {
            result = true
        }
    })
    return result;
}
//自动提交，插入数据库
function autoSubmit(bagno:string) {
    service.gh_service.axios('cjzbtm', {
        V_BAGNO: bagno,
        V_OPERATORNAME: homeStore.user.PERSON_NAME
    } ).then((res:any) => {
        if(res.success = true) {
            cellList.value.unshift(bagno)
            searchRef.value && searchRef.value.focus()
            showToast('采集成功')
        }else {
            showNotify('采集失败')
        }
    }) .catch((err:any) => {
        instance.appContext.config.globalProperties.$judgeError(err.message, err.response)
    })
}

</script>

<template>
    <div class="Tallying">
        <header>
            <van-search
                v-model="searchValue"
                shape="round"
                background="#1989fa"
                placeholder="请输入总包条码"
                @search="onSearch"
                ref="searchRef"
            />
        </header>
        <main>
            <van-divider :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }">
                成功采集的总包条码({{cellList.length}})
            </van-divider>
            <div class="all">
                <van-cell-group>
                    <van-cell v-for="(item, index) in cellList" :key="index" :title="item">
                    </van-cell>
                </van-cell-group>
            </div>
        </main>
    </div>
</template>

<style scoped>
main {
    margin-top: 2vh;
}
.all {
    height: 50vh;
    overflow: scroll;
    border: 2px dotted #1989fa;
    margin-bottom: 2vh;
}
.van-cell {
    padding: 4px 0;
}
</style>