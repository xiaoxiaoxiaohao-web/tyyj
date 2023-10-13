import axios from 'axios'

const initAxios = axios.create({
    timeout: 10000,
    // withCredentials:true  //异步请求携带cookie
})

//请求拦截器
initAxios.interceptors.request.use(
    (config: any) => {
        // 如果你要去localStor获取token,(如果你有)
        // let token = localStorage.getItem("x-auth-token");
        // if (token) {
                //添加请求头
                //config.headers["Authorization"]="Bearer "+ token
        // }
        return config
    },
    (error: any) => {
        return Promise.reject(error)
    }
)

//响应拦截器
initAxios.interceptors.response.use(
    (response: any) => {
        const res = response.data
        if (res.code !== 1 || res.code !== 200) {
            return response.data
        } else {
            return response.data
        }
    },
    (error: any) => {
        if (error.response) {
            return Promise.reject(error)
        }
    }
    
)

export default initAxios