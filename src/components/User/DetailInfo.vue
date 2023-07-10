<script setup lang="ts">
import { reactive, toRef, toRaw } from 'vue';
import { useRouter } from 'vue-router';
import { useHomeStore } from '../../store/home'

const homeStore = useHomeStore()
let router = useRouter()
let form = reactive({
    RECID: homeStore.user.RECID,
    PERSON_NAME: homeStore.user.PERSON_NAME,
    ROLE_NAME: homeStore.user.ROLE_NAME,
})

//返回
function onClickLeft() {
    router.push({name: 'user'}) 
}

//修改
function onSubmit() {
    console.log(toRaw(form));  
}
</script>

<template>
    <div class="DetailInfo">
        <header>
            <van-nav-bar title="详细信息" left-text="返回"  left-arrow @click-left="onClickLeft" />
        </header>
        <main>
            <van-form @submit="onSubmit">
                <van-cell-group inset>
                    <van-field
                        v-model="form.RECID"
                        name="RECID"
                        label="RECID"
                        placeholder="RECID"
                        readonly
                    />
                    <van-field
                        v-model="form.PERSON_NAME"
                        name="用户名"
                        label="用户名"
                        placeholder="用户名"
                    />
                    <van-field
                        v-model="form.ROLE_NAME"
                        name="角色"
                        label="角色"
                        placeholder="角色"
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

<style scoped>
main {
    margin-top: 3vh;
}
</style>