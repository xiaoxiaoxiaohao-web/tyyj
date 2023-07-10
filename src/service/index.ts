import axios from "axios";
import service from "./service";

let baseGhURL: string;
let baseHgURL: string;

//配置开发环境
if(process.env.NODE_ENV === 'development') {
    baseGhURL = 'http://10.194.69.22:8520/api/tyyj/',
    baseHgURL = 'http://localhost:5173/hg'
    console.log("1111188888");
    console.log(baseHgURL);
}

//配置生产环境
if(process.env.NODE_ENV === 'production') {
    baseGhURL = 'http://10.194.69.22:8520/api/tyyj/',
    baseHgURL = 'http://10.201.6.88:1234/hg'
    console.log("22222222");
    console.log(baseHgURL);
    
}

//设置请求头
const default_header1 = {
    'Accept': 'application/json;charset=UTF-8',
    'Content-Type': 'application/x-www-form-urlencoded'
}

// const default_header2 = {
//     'Accept': 'application/json;charset=UTF-8',
//     'Content-Type': 'application/json'
// }

//根据自身需求
let gh_service = {
    //登录接口
    // login(data: any) {
    //     let gh_url = baseGhURL + 'login';
    //     return service.post(gh_url, data, default_header1)
    // },
    //获取token
    // token(data: any) {
    //     let gh_url = 'http://10.194.69.22:8520/token/generate?clientId=' + data.clientId + '&secret=' + data.secret
    //     return service.get(gh_url, data, default_header1)       
    // },
    //接口
    axios(url: string, data?: any) {
        let gh_url = baseGhURL + url;
        // Object.assign(default_header1, header)
        return service.post(gh_url, data, default_header1)
    },
}
let  hg_service = {
    axios(data: any) {
        let gh_url = baseHgURL;
        return service.get(gh_url, data, default_header1)
    } 
}

export default {gh_service, hg_service}