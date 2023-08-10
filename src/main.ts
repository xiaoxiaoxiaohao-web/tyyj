import 'babel-polyfill'
import promise from 'es6-promise'
import './assets/main.css'
import { createApp, getCurrentInstance } from 'vue'
import App from './App.vue'
import router from './router'
import 'vant/lib/index.css';
import { createPinia } from 'pinia'
import { showNotify } from 'vant'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

promise.polyfill()


const app = createApp(App)
const pinia = createPinia()

/** 
 * 定义全局函数
 * */

//对接口请求出现错误进行判断
function judgeError(err:any, res?:any) {
    console.log(err);
    let reason = "其他原因"
    if(err.includes("500")) {
        reason =  '接口出现错误'
        if(res.data.msg.includes("00001")) {
            showNotify('数据已经插入过' )
        }
    }else if(err.includes("401")) {
        reason = '用户登录失效'
        router.push({name: 'login'})
    }else {
        console.log(err);
    }
    return reason;
}
app.config.globalProperties.$judgeError = judgeError


app.use(pinia).use(router).use(Antd)
app.mount('#app')




