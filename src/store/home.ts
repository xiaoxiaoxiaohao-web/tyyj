import { defineStore } from 'pinia'

export const useHomeStore = defineStore('home', {
    state:() => {
        return {
            token: '',
            user: {
                PERSON_NAME: '用户未登录',
                PERSON_CODE: '',
                RECID: '000',
                ROLE_ID: '',
                ROLE_NAME: '',
                STATUS: '' // 0正常
            }
        }
    },
    actions: {
        changeNum() {
            
        }
    },
    getters: {
        getNum: state => state
    }
})