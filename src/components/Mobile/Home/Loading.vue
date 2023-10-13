<script setup lang="ts">
import service from '@/service/index'
import { getCurrentInstance, onMounted, reactive, ref, toRaw } from 'vue'
import { showToast, showFailToast, showNotify, showLoadingToast, closeToast } from 'vant';
import { useHomeStore } from '@/store/home';



const homeStore = useHomeStore()
let instance:any = getCurrentInstance()
let searchValue = ref<string>()
let searchRef = ref<HTMLInputElement|null>(null)
let showButton = ref<boolean>(true)

interface adudioNo {
    V_AUDIT_NO: string,
    V_CHECK: string,
    V_PASSDESC: string
}


let auditNoResult:adudioNo = reactive({
    V_AUDIT_NO: '',
    V_CHECK: '',
    V_PASSDESC: ''
})
const cell:Array<any> = reactive([])
let endBind = ref<boolean>(true)



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
        for(let key in auditNoResult) {
            auditNoResult[key] = ''
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
                auditNoResult.V_AUDIT_NO = data.V_AUDIT_NO
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
        params: auditNoResult.V_AUDIT_NO
    }).then((res:any) => {
        let data = res.result.info[0]
        if(data.flag == '0') {
            auditNoResult.V_CHECK = ''
            auditNoResult.V_PASSDESC = data.desc
            showButton.value = false
        }else {
            if(data.check == '1') {
                auditNoResult.V_CHECK = '审核通过'
                showButton.value = true
            }else if(data.check == '-1') {
                auditNoResult.V_CHECK = '未进行审核'
                auditNoResult.V_PASSDESC = data.passdesc
                showButton.value = false
            }else {
                auditNoResult.V_CHECK = '审核失败'
                auditNoResult.V_PASSDESC = data.passdesc || data.desc
                showButton.value = false
            }
            //更新数据库 updateauditno
            updateAuditNo(data.check)
        }
    }).catch((err:any) => {
        console.log(err)
        showNotify({message: '海关审核结果查询失败,原因：' + err })
        auditNoResult.V_CHECK = '查询失败'
        auditNoResult.V_PASSDESC = '查询失败'
    })

}

//出库申请审核结果更新
function updateAuditNo(check:string) {
    let new_params = {
        V_AUDIT_NO: auditNoResult.V_AUDIT_NO,
        V_CHECK: check,
        V_PASSDESC: auditNoResult.V_PASSDESC
    }
    service.gh_service.axios('updateauditno', new_params).then((res:any) => {
        console.log(res)
        
    }).catch((err:any) => {
        console.log(err)
    })
}

//查询同序列号邮袋
function getAuditNoBagNo(bagno:string) {
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
        console.log(err)
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
        params.push(auditNoResult.V_AUDIT_NO)
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
            updateBag(Object.assign(toRaw(e), {V_AUDIT_NO: auditNoResult.V_AUDIT_NO}))
            
        }).catch((err:any) => {
            console.log(err)
            showNotify({message: e.V_BAGNO + '绑定失败'})
        })
    })
    endBind.value = false
    //outbandAuditEndBindReport(auditNoResult.V_AUDIT_NO)
    closeToast()
}

//装车出库申请绑定接口
async function outbandAuditBindReport(params:string) {
    //装车出库申请绑定接口
    return await service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'outbandAuditBindReport',
        params: params
    })
}

//装车出库申请绑定结束接口
function outbandAuditEndBindReport() {
    let params = [auditNoResult.V_AUDIT_NO, homeStore.user.PERSON_NAME]
    let new_params = (JSON.stringify(params)).replace(/\"/g, "'")
    service.hg_service.axios({
        service: 'RetpostMailService',
        method: 'outbandAuditEndBindReport',
        params: new_params
    }).then((res:any) => {
        let data = res.result.info[0]
        if(data.flag == 1) {  //补录的核查命中邮袋号列表
            data.mailbags.forEach((e:string) => {
                let object = {
                    V_BAGNO: e,
                    V_CHECK: 1,
                    V_PASSDESC: '',
                    V_AUDIT_NO: auditNoResult.V_AUDIT_NO
                }
                updateBag(object)
            })
            endBind.value = true
            showButton.value = false
            showToast('绑定结束成功')
        }else {
            showNotify('绑定结束失败')
        }
        
    }).catch((err:any) => {
        console.log(err)
        showNotify('出现错误， 原因：' + err)
    })
}


//更新数据库
function updateBag(params:object) {
    service.gh_service.axios('updatebag', params).then((res:any) => {
        console.log(res)
    }).catch((err:any) => {
        console.log(err)
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
                <van-field v-model="auditNoResult.V_AUDIT_NO" label="序列号" readonly  />
                <van-field v-model="auditNoResult.V_CHECK" label="审核结果" readonly  />
                <van-field v-model="auditNoResult.V_PASSDESC" label="反馈信息" readonly type="textarea" />
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
                <van-cell v-for="(item, index) in cell" :key="index" :label="item.V_PASSDESC" :title="item.V_BAGNO">
                    <template #right-icon>
                        <van-icon v-if="item.V_CHECK == '0'" name="checked" class="checked" color="#07f013" />
                        <van-icon v-else-if="item.V_CHECK == '1'" name="clear" class="clear" color="#ee0a24" />
                        <van-icon v-else-if="item.V_CHECK == '-1'" name="warning" class="warning" color="#f09e07" />
                        <van-icon v-else name="question" class="question" color="#1989fa" />
                    </template>
                </van-cell>
            </div>
            <div style="margin: 16px;" v-show="showButton">
                <van-button type="primary" block @click="onSubmit" round v-if="endBind">一键绑定</van-button>
                <van-button type="primary" block @click="outbandAuditEndBindReport" round v-else>结束绑定</van-button>
            </div>
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