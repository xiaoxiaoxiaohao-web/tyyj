<script setup lang="ts">
import md5 from 'js-md5'
import service from '@/service/index'
import { getCurrentInstance, reactive, toRaw } from 'vue';
import { useRouter } from 'vue-router';
import { useHomeStore } from '@/store/home';
import { showToast, showNotify, showFailToast } from 'vant';

const router = useRouter()
const homeStore = useHomeStore()
let instance:any = getCurrentInstance()
let form = reactive({
    account: homeStore.user.PERSON_CODE,
    old_password: '',
    new_password: '',
    repeat_password: '',
})

//返回
function onClickLeft() {
    router.push({name: 'user'}) 
}

//修改
function onSubmit() {

    if(form.new_password == '' || form.repeat_password == '') {
        showFailToast('新密码不能为空')
    }else if(!judgeSamePassword(form.new_password, form.repeat_password)) {
        showFailToast('两次新密码输入不一致')
        form.new_password = ''
        form.repeat_password = ''
    }else{
        //先判断原密码是否正确
        login(form.old_password).then((res:any) => {
            if(res.data.length == 0) { 
                showNotify('原密码不正确，修改失败')
            }else {
                updatePassword(form.new_password, form.repeat_password, form.old_password)
            }
        }).catch((err:any) => {
            console.log(err);
        })
    }
    
}

//判断新密码和重复新密码
function judgeSamePassword(new_password:string, repeat_password:string) {
    if(new_password == repeat_password) {
        return true
    }
    return false
}
//用登录判断原密码对不对
function login(psw:string) {
    return service.gh_service.axios('login', {
        account: homeStore.user.PERSON_CODE,
        password: md5(psw).toUpperCase()
    })
}

//修改密码
function updatePassword(nPsw:string, rPsw:string, oPsw:string) {
    service.gh_service.axios('xgmm', {
            account: homeStore.user.PERSON_CODE,
            old_password: md5(oPsw).toUpperCase(),
            new_password: md5(nPsw).toUpperCase(),
            repeat_password: md5(rPsw).toUpperCase(),
        }).then((res:any) => {
            console.log(res);
            if(res.success == true) {
                showToast('修改成功')
                router.push({name: 'login'}) 
            }else {
                showNotify({message: '修改失败'})
            }
        }).catch((err:any) => {
            console.log(err);
            instance.appContext.config.globalProperties.$judgeError(err.message)
            showNotify({message: '出现错误，原因：' + err})
        })
}
</script>

<template>
    <div class="ChangePsw">
        <header>
            <van-nav-bar title="修改密码" left-text="返回"  left-arrow @click-left="onClickLeft" />
        </header>
        <main>
            <van-form @submit="onSubmit">
                <van-cell-group inset>
                    <van-field
                        v-model="form.account"
                        name="账号"
                        label="账号"
                        readonly
                    />
                    <van-field
                        v-model="form.old_password"
                        type="password"
                        name="原密码"
                        label="原密码"
                        placeholder="原密码"
                        required
                    />
                    <van-field
                        v-model="form.new_password"
                        type="password"
                        name="新密码"
                        label="新密码"
                        placeholder="新密码"
                        required
                    />
                    <van-field
                        v-model="form.repeat_password"
                        type="password"
                        name="重复新密码"
                        label="重复新密码"
                        placeholder="重复新密码"
                        required
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

<style scoped>
main {
    margin-top: 3vh;
}
</style>