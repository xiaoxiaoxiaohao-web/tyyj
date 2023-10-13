<script lang="ts" setup>
import md5 from 'js-md5'
import service from '@/service/index'
import { reactive } from "vue"
import { message } from 'ant-design-vue';
import { useHomeStore } from '@/store/home'
import { useRouter } from 'vue-router'

interface FormState {
  account: string
  password: string
}

const form = reactive<FormState>({
  account: '',
  password: '',
})
const homeStore = useHomeStore()
let router = useRouter()


function onFinish() {
    service.gh_service.axios('login', {
        account: form.account,
        password: md5(form.password).toUpperCase()
    }).then((res:any) => {
        if(res.data.length > 0) {
            router.push({name: 'mailnotable'})
            homeStore.user = res.data[0]
            message.success('登录成功')
        }else {
            message.error('账号或密码错误')
        }
    }).catch((err:any) => {
        console.log(err)
        message.error('登录失败');
    })

}

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
}
</script>

<template>
    <div class="Login">
        <header>
            <h2>欢迎登录国际退运邮件处理管理系统</h2>
        </header>
        <main>
            <div class="title">
                <img src="@/assets/images/logo.png" alt="logo">
                <h1>国际退运邮件处理管理系统</h1>
            </div>
            <div class="form">
                <a-form
                    :model="form"
                    name="basic"
                    autocomplete="off"
                    @finish="onFinish"
                    @finishFailed="onFinishFailed"
                >
                    <a-form-item
                        label="用户名"
                        name="account"
                        :rules="[{ required: true, message: '请输入您的用户名！' }]"
                        :label-col="{ span:  6}"
                        :wrapper-col="{ span: 18 }"
                        >
                        <a-input v-model:value="form.account" />
                    </a-form-item>

                    <a-form-item
                        label="密码"
                        name="password"
                        :rules="[{ required: true, message: '请输入您的密码！' }]"
                        :label-col="{ span: 6 }"
                        :wrapper-col="{ span: 18 }"
                        >
                        <a-input-password v-model:value="form.password" />
                    </a-form-item>

                    <a-form-item>
                        <a-button type="primary" html-type="submit">登录</a-button>
                    </a-form-item>
                </a-form>
            </div>
        </main>
        <footer>
            <h3>广东省航空邮件处理中心版权所有©2023</h3>
        </footer>
    </div>
</template>

<style scoped>
.Login {
    height: 100%;
    width: 100%;
    background: url('@/assets/images/bg-image-pc.jpeg') no-repeat;
    background-position: center;
    background-size: cover;
    position: absolute;
    overflow: hidden;
}
header {
    height: 50px;
    line-height: 50px;
    color: #1677ff;
    background: url('@/assets/images/login-top.png');
    padding: 0 10px;
}
main {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40%;
    transform: translate(-50%, -50%);
    text-align: center;
    background: rgba(124, 202, 238, 0.466);
    padding: 30px 0;
}
.title > h1{
    color: #fff;
}
.form {
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    width: 50%;
}
footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 30px;
    line-height: 30px;
    text-align: center;
    color: #fff;
    background: url('@/assets/images/login-top.png');
}
</style>