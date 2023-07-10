import Axios from './axios'

const instance = Axios

// const headers = {
//     'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
// }


export default {
    get(url: string, params: any, headers: any) {
        return instance.get(url, {params, headers})
    },
    post(url: string, params: any, headers: { Accept: string }) {
        return instance.post(url, params, {headers})
    },
    // put(url: string, params: any, headers: any) {
    //     return instance.put(url, params, {headers})
    // },
    // delete(url: string, params: any, headers: any) {
    //     return instance.delete(url, {params, headers})
    // }
}