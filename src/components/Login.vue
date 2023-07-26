<script setup lang="ts">
import md5 from 'js-md5'
import service from '@/service/index'
import {  reactive, getCurrentInstance, toRefs } from "vue";
import { useRouter } from 'vue-router';
import { useHomeStore } from '../store/home';
import { showNotify, showToast  } from 'vant';

const homeStore = useHomeStore()

let form = reactive({
    account: '',
    password: ''
})
let router = useRouter()

const {user} = toRefs(homeStore)



//登录提交
function onSubmit() {
    //提交用户名密码
    service.gh_service.axios('login', {
        account: form.account,
        password: md5(form.password).toUpperCase()
    }).then((res:any) => {
        if(res.data.length > 0) { //登录成功
            router.push({name: 'home'}) 
            //保存登录信息
            homeStore.user = res.data[0]
            showToast('登录成功')
        }else {
            showNotify({message: '账号或密码错误'})
            form.password = ''
        }
    }).catch((err:any) => {
        console.log(err)
        showNotify('登录失败' )
    })
}


</script>

<template>
    <div class="Login">
        <main>
            <div class="title">
                <img src="@/assets/images/logo.png" alt="logo">
                <h2>国际退运邮件系统</h2>
            </div>
            <van-form @submit="onSubmit">
                <van-cell-group inset>
                    <van-field v-model="form.account" name="账号" label="账号" placeholder="账号"
                    />
                    <van-field v-model="form.password" type="password" name="密码" label="密码" placeholder="密码"
                    />
                </van-cell-group>
                <div style="margin: 16px;">
                    <van-button round block type="primary" native-type="submit">
                    登录
                    </van-button>
                </div>
            </van-form>
        </main>
    </div>
</template>



<style scoped>
.Login {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0px;
    bottom: 0px;
    /* background-color: #e6e6e6; */
    text-align: center;
    background: url('../assets/images/bg-image.jpg');
    background-size: cover;
}
.title {
    margin-bottom: 3vh;
}
.title > img{
    width: 188px;
    height: 60px;
    transform: scale(0.7);
}
.title > h2 {
    color: #FFF;
}

main {
    margin-top: 40%;   
}
</style>