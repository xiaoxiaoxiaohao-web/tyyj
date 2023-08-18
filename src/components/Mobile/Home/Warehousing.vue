<script setup lang="ts">
import service from '@/service/index'
import { reactive, toRaw, ref, onMounted, getCurrentInstance } from 'vue'
import { useHomeStore } from '@/store/home';
import { showNotify, showFailToast, showToast, showDialog, showConfirmDialog  } from 'vant';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';

const homeStore = useHomeStore()
let router = useRouter()
// let instance:any = getCurrentInstance()


let searchRef = ref<HTMLInputElement|null>(null)
let search = reactive({value: ''})
let showHgResult = ref<boolean>(false)

function cellList() {
    return {
        V_MAILNO: '',
        MAILTYPE: '',
        D_RETURN_DATE: '',
        V_OPERNAME: homeStore.user.PERSON_NAME,
        V_NOTE: '',
    }
} 
let cell = reactive(cellList())

onMounted(() => {
    searchRef.value && searchRef.value.focus()
})


//查询
function onSearch(val:string) {
    val = val.trim()
    Object.assign(cell, cellList())
    //邮件号规则
    let pattern = /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/
    //判断是否符合规则
    if(pattern.test(val)) {
        cell.V_MAILNO = val
        //先判断截留情况
        judgeZl(val)
    }else {
        showFailToast('不符合邮件号规则');
    }
    searchRef.value && searchRef.value.focus()
    search.value = ''
}

//判断截留
function judgeZl(mailNo:string) {
    let result = false
    service.gh_service.axios('cxjlyj', {
        V_MAILNO: mailNo
    }).then((res:any) => {
        if(res.success == true) {
            if(res.data.length > 0) {
                showHgResult.value = false 
                result = true
                showToast({
                    message: '该邮件截留',
                    position: 'top'
                })
                cell.MAILTYPE = '截留'
                cell.D_RETURN_DATE = res.data[0].D_DATE
            }else {  //是不截留，判断本转关
                judgeBz(mailNo)
            }
        }
    }).catch((err:any) => {
        console.log(err);
        showNotify('出现错误，原因：' + err)
    })
    return result
}

//判断本转关
function judgeBz(mailNo:string) {
    service.gh_service.axios('pdbz', {
        V_MAILNO: mailNo
    }).then((res:any) => { 
        if(res.success == true) {
            if(res.data[0].NUM > 0) {  //转关
                showToast({
                    message: '该邮件转关',
                    position: 'top'
                })
                cell.MAILTYPE = '转关'
                mainReport(mailNo, '2')
            }else {  //本关，判断是不是退运邮件
                cell.MAILTYPE = '本关'
                judgeTy(mailNo)
            }
        }else {
            showNotify({message: '查询失败'})
        }
    }).catch((err:any) => {
        console.log(err)
        showNotify('出现错误，原因：' + err)
    }) 
}

//判断退运
function judgeTy(mailNo:string) {
    service.gh_service.axios('pdty', {
        V_MAILNO: mailNo
    }).then((res: any) => {
        if(res.success == true) {
            if(res.data[0].TIME != null) { //退运给海关审查
                cell.D_RETURN_DATE = res.data[0].TIME
                cell.MAILTYPE = '本关兼退运'
                //海关审查
                mainReport(mailNo, '1')
            }else {
                showToast({
                    message: '该邮件不是退运',
                    position: 'top'
                })
                cell.MAILTYPE = '本关非退运'
            }
        }
    }).catch((err: any) => {
        console.log(err)
        showNotify('出现错误，原因：' + err)
    })
}


//判断是否存在邮件号
async function judgeExist(mailNo:string) {
    await service.gh_service.axios('cxyjxx', {
        V_MAILNO: mailNo
    }).then((res:any) => {
        if(res.data.length > 1) {
            return true
        }
    }).catch((err:any) => {
        console.log(err);
        
    })
    return false
}


//海关审查
function mainReport(mailNo:string, mailType:string) {
    showHgResult.value = true
    let params = [homeStore.user.PERSON_NAME]
    params.unshift(mailType)
    params.unshift(mailNo)
    let new_params = (JSON.stringify(params)).replace(/\"/g, "'")
    service.hg_service.axios(
        {
            service: 'RetpostMailService',
            method: 'mailReport',
            params: new_params
        }
    ).then((res:any) => {
        cell.V_NOTE = res.result.info[0].mailRet
        if(judgeExist(mailNo)){ //存在，更新数据库
            update()
        }else {//插入数据
            insert()
        }
        
    }).catch((err:any) => {
        console.log(err);
        cell.V_NOTE = '海关审查失败!!'
    })
}

//插入数据
function insert() {
    service.gh_service.axios('tyrkdj', toRaw(cell)).then((res:any) => {
        if(res.success == false) {
            showDialog({ message: '入库失败' });
        }
        
    }).catch((err:any) => {
        console.log(err);
        showNotify('出现错误， 原因：' + err)
    })
}

//更新数据库
function update() {
    service.gh_service.axios('gxyjxx', toRaw(cell)).then((res:any) => {
        if(res.success == false) {
            showDialog({ message: '入库失败' });
        }
    }).catch((err:any) => {
        console.log(err);
    })
}


</script>

<template>
    <div class="Warehousing">
        <header>
            <van-search
                v-model="search.value"
                shape="round"
                background="#1989fa"
                placeholder="请输入邮件号"
                @search="onSearch"
                ref="searchRef"
            />
        </header>
        <main>
            <van-cell-group>
                <van-field v-model="cell.V_MAILNO" label="邮件号" readonly  />
                <van-field v-model="cell.MAILTYPE" label="邮件类型" readonly />
                <van-field v-model="cell.D_RETURN_DATE" label="时间" readonly/>
                <van-field v-model="cell.V_OPERNAME" label="操作人" readonly  />
            </van-cell-group>
            <van-cell-group v-show="showHgResult">
                <van-divider :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }">
                海关反馈信息
                </van-divider>
                <van-field v-model="cell.V_NOTE" label="反馈结果" readonly type="textarea" />
            </van-cell-group>
        </main>
    </div>
</template>