<script setup lang="ts">
import service from '@/service/index'
import { getCurrentInstance, onMounted, reactive, ref, toRaw } from 'vue'
import { showToast, showFailToast, showNotify, showLoadingToast, closeToast } from 'vant';
import { useHomeStore } from '@/store/home';



const homeStore = useHomeStore()
let instance:any = getCurrentInstance()
let searchValue = ref()
let searchRef = ref<HTMLInputElement|null>(null)
let audioNoResult:any = reactive({
    V_AUDIT_NO: '',
    V_CHECK: '',
    V_PASSDESC: ''
})
const cell:any = reactive([])



onMounted(() => {
    searchRef.value && searchRef.value.focus()
})

//查询
function onSearch(val:any) {
    val = val.trim()
    //两种总包类型
    let pattern1 = /^[0-9]{30}$/
    let pattern2 = /^[A-Z]{15}[0-9]{14}$/

    if(!pattern1.test(val) && !pattern2.test(val)){
        showFailToast('条码不符合规则');
    }else {
        //重置审核结果
        for(let key in audioNoResult) {
            audioNoResult[key] = ''
        }
    
        //清空数组
        cell.length = 0
        let bagNo = searchValue.value
        //数据库查序列号
        getAuditNo().then((res:any) => {
            if(res.data.length == 0) {
                showFailToast('该邮袋未出库申请')
            }else {
                let data = res.data[0]
                audioNoResult.V_AUDIT_NO = data.V_AUDIT_NO
                getAuditResult()
                getAuditNoBagNo(bagNo)
            }
        }).catch((err: any) => {
            showNotify('出现错误，原因：' + err)
            console.log(err);
        })
    }
    searchValue.value = ''
    searchRef.value && searchRef.value.focus()
    closeToast();

}


//根据邮件查序列号
function getAuditNo() {
    return service.gh_service.axios('gjydhcxckxlh', {
        V_BAGNO: searchValue.value
    })
}

//查询序列号审核结果
function getAuditResult() {
    service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'outbandAuditResultReport',
        params: audioNoResult.V_AUDIT_NO
    }).then((res:any) => {
        let data = res.result.info[0]
        if(data.flag == '0') {
            audioNoResult.V_CHECK = ''
            audioNoResult.V_PASSDESC = data.desc
        }else {
            if(data.check == '1') {
                audioNoResult.V_CHECK = '审核成功'
            }else if(data.check == '-1') {
                audioNoResult.V_CHECK = '未进行审核'
                audioNoResult.V_PASSDESC = data.passdesc
            }else {
                audioNoResult.V_CHECK = '审核失败'
                audioNoResult.V_PASSDESC = data.passdesc || data.desc
            }
            //更新数据库 updateauditno
            updateAuditNo(data.check)
        }
    }).catch((err:any) => {
        console.log(err);
        showNotify({message: '海关审核结果查询失败,原因：' + err })
        audioNoResult.V_CHECK = '查询失败'
        audioNoResult.V_PASSDESC = '查询失败'
    })

}

//出库申请审核结果更新
function updateAuditNo(check:string) {
    let new_params = {
        V_AUDIT_NO: audioNoResult.V_AUDIT_NO,
        V_CHECK: check,
        V_PASSDESC: audioNoResult.V_PASSDESC
    }
    service.gh_service.axios('updateauditno', new_params).then((res:any) => {
        console.log(res);
        
    }).catch((err:any) => {
        console.log(err);
        instance.appContext.config.globalProperties.$judgeError(err.message)
    })
}

//查询同序列号邮袋
function getAuditNoBagNo(bagno:any) {
    service.gh_service.axios('gjydhcxtcydqd', {
        V_BAGNO: bagno
    }).then((res:any) => {
        res.data.forEach((item:any) => {
            let object = {V_BAGNO: '', V_CHECK: '', V_PASSDESC: ''}
            object.V_BAGNO = item.V_BAGNO
            object.V_CHECK = item.V_CHECK
            cell.push(object)
        })
    }).catch((err:any) => {
        console.log(err);
        instance.appContext.config.globalProperties.$judgeError(err.message)
        showNotify({message: '查询失败'})
    })
    searchValue.value = ''
    searchRef.value && searchRef.value.focus()
}

//一键绑定
function onSubmit() {
    showLoadingToast({
        duration: 0,
        message: '绑定中...',
        forbidClick: true,
    });
    cell.forEach((e:any) => {
        let params = []
        params.push(audioNoResult.V_AUDIT_NO)
        params.push(e.V_BAGNO)
        params.push(homeStore.user.PERSON_NAME)
        let new_params = (JSON.stringify(params)).replace(/\"/g,"'")
        outbandAuditBindReport(new_params).then((res:any) => {
            let data = res.result.info[0]
            if(data.flag == '0') {  //请求绑定失败
                e.V_CHECK = '-1'
                e.V_PASSDESC = data.desc
            }else { 
                if(data.check == '1') {  //命中核查
                    e.V_CHECK = data.check
                }else {
                    e.V_CHECK = data.check
                }
            }
            //更新数据库
            updateBag(Object.assign(toRaw(e), {V_AUDIT_NO: audioNoResult.V_AUDIT_NO}))
            
        }).catch((err:any) => {
            console.log(err);
            instance.appContext.config.globalProperties.$judgeError(err.message)
            showNotify({message: e.V_BAGNO + '绑定失败'})
        })
    })
    outbandAuditEndBindReport(audioNoResult.V_AUDIT_NO)
    closeToast();
}

//装车出库申请
async function outbandAuditBindReport(params:any) {
    //装车出库申请绑定接口
    return await service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'outbandAuditBindReport',
        params: params
    })
}

//装车出库申请绑定结束接口
function outbandAuditEndBindReport(audioNo:string) {
    let params = [homeStore.user.PERSON_NAME]
    params.unshift(audioNo)
    let new_params = (JSON.stringify(params)).replace(/\"/g, "'")
    service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'outbandAuditEndBindReport',
        params: new_params
    }).then((res:any) => {
        console.log("245645645646");
        
        console.log(res);
        
    }).catch((err:any) => {
        console.log(err);
        instance.appContext.config.globalProperties.$judgeError(err.message)
    })
}


//更新数据库
function updateBag(params:object) {
    service.gh_service.axios('updatebag', params).then((res:any) => {
        console.log(res);
        
    }).catch((err:any) => {
        console.log(err);
        instance.appContext.config.globalProperties.$judgeError(err.message)
    })
}

</script>


<template>
    <div class="Loading">
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
                <van-field v-model="audioNoResult.V_AUDIT_NO" label="序列号" readonly  />
                <van-field v-model="audioNoResult.V_CHECK" label="审核结果" readonly  />
                <van-field v-model="audioNoResult.V_PASSDESC" label="反馈信息" readonly type="textarea" />
            </van-cell-group>
            <van-divider :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }">
                同序列号的邮袋({{cell.length}})
            </van-divider>
            <div class="tips">
                <van-icon name="clear" class="clear" color="#ee0a24" />命中
                <van-icon name="checked" class="checked" color="#07f013" />未命中
                <van-icon name="warning" class="warning" color="#f09e07" />绑定失败
                <van-icon name="question" class="question" color="#1989fa" />未绑定
            </div>
            <div class="all">
                <van-cell v-for="(item, index) in cell" :key="index" :label="item.V_BAGNO" title="">
                    <template #right-icon>
                        <van-icon v-if="item.V_CHECK == '0'" name="checked" class="checked" color="#07f013" />
                        <van-icon v-else-if="item.V_CHECK == '1'" name="clear" class="clear" color="#ee0a24" />
                        <van-icon v-else-if="item.V_CHECK == '-1'" name="warning" class="warning" color="#f09e07" />
                        <van-icon v-else name="question" class="question" color="#1989fa" />
                    </template>
                </van-cell>
            </div>
            <van-button type="primary" block @click="onSubmit" round>一键绑定</van-button>
        </main>
    </div>
</template>

<style scoped>
main {
    padding-bottom: 50px;
}
.all {
    height: 50vh;
    overflow: scroll;
    margin: 0 5px;
    border: 2px dotted #1989fa;
    margin-bottom: 2vh;
}

</style>