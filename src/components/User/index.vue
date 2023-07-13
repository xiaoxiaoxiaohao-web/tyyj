<script setup lang="ts">
import { showDialog } from 'vant';
import { useHomeStore } from '../../store/home'
import img from '../../assets/images/cat.jpg'

const homeStore = useHomeStore()

//版本信息
function onVersionClick() {
    showDialog({
        title: '版本信息',
        message: '2.1.0'
    })
}

</script>

<template>
    <div class="User">
        <header>
            <van-nav-bar title="我的" />
        </header>
        <main>
            <div class="info">
                <div class="header-img">
                    <van-image
                        round
                        width="5rem"
                        height="5rem"
                        :src=img
                    />
                </div>
                <div class="detail-info">
                    <h2>{{ homeStore.user.PERSON_NAME }}</h2>
                    <p style="color: #cf0000; font-weight: bolder;">{{ homeStore.user.RECID }}</p>
                    <p>{{homeStore.user.ROLE_NAME }}</p>
                </div>
            </div>
            <div>
                <div class="cell">
                    <van-cell title="详细信息" icon="orders-o" is-link to="DetailInfo" />
                    <van-cell title="修改密码" icon="eye-o" is-link to="ChangePsw" />
                    <van-cell title="当前版本" icon="cluster-o" is-link @click="onVersionClick" />
                    <van-cell title="退出登录" icon="revoke" is-link to="login" />
                </div>
            </div>
        </main>
    </div>
</template>


<style scoped>
.info {
    width: 100%;
    height: 20vh;
    background-image: linear-gradient(#077ff8, #80e2c5);
    display: flex;
    align-items: center;
    padding-left: 6vh;
}
.header-img {
    width: 30%;
}
.detail-info {
    margin-left: 3vh;
    color: #fff;
}
</style>