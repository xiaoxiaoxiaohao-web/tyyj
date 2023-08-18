import { defineStore } from 'pinia'

export const useHomeStore = defineStore('home', {
    state:() => {
        return {
            token: '',
            user: {
                PERSON_NAME: '',
                PERSON_CODE: '',
                RECID: '',
                ROLE_ID: '',
                ROLE_NAME: '',
                STATUS: '' // 0正常
            }
        }
    },
    actions: {
    },
    getters: {
    }
})