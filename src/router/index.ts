import { createRouter, createWebHashHistory } from 'vue-router'
import { useHomeStore } from '../store/home'
import { getCurrentInstance, onMounted } from "vue"
import Login from '@/components/Mobile/Login.vue'

import Home from '@/components/Mobile/Home/index.vue'
import Warehousing from '@/components/Mobile/Home/Warehousing.vue'
import Tallying from '@/components/Mobile/Home/Tallying.vue'
import Outbound from '@/components/Mobile/Home/Outbound.vue'
import Loading from '@/components/Mobile/Home/Loading.vue'
import Confirmation from '@/components/Mobile/Home/Confirmation.vue'
import Abnormal from '@/components/Mobile/Home/Abnormal.vue'

import Filings from '@/components/Mobile/Filings/index.vue'
import AddCar from '@/components/Mobile/Filings/AddCar.vue'
import UpdateCar from '@/components/Mobile/Filings/UpdateCar.vue'

import UserView from '@/components/Mobile/User/index.vue'
import ChangePsw from '@/components/Mobile/User/ChangePsw.vue'
import DetailInfo from '@/components/Mobile/User/DetailInfo.vue'

import PCLogin from '@/components/PC/Login.vue'
import Index from '@/components/PC/index.vue'
import TallyingTable from '@/components/PC/TallyingTable.vue'
import UserTable from '@/components/PC/UserTable.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
        path: '/',
        name: '',
        component: Login,
		meta: {
			isAuth: false
		},
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
		meta: {
			isAuth: false
		},
    },
    {
		path: '/home',
		name: 'home',
		component: Home,
		redirect: {name: "warehousing"}, 
		meta: {
			hideTabbar: true,
			tabbarNum: 0
		},
      	children: [
        {
			path: 'warehousing',
			name: 'warehousing',
			component: Warehousing,
		},
        {
			path: 'tallying',
			name: 'tallying',
			component: Tallying,
        },
        {
			path: 'outbound',
			name: 'outbound',
			component: Outbound,
        },
        {
			path: 'loading',
			name: 'loading',
			component: Loading,
        },
        {
			path: 'confirmation',
			name: 'confirmation',
			component: Confirmation,
        },
        {
			path: 'abnormal',
			name: 'abnormal',
			component: Abnormal,
        },
      ]
    },
    {
		path: '/filings',
		name: 'filings',
		component: Filings,
		meta: {
			hideTabbar: true,
			tabbarNum: 1
		}
    },
    {
		path: '/addcar',
		name: 'addcar',
		component: AddCar,
    },
    {
		path: '/updatecar',
		name: 'updatecar',
		component: UpdateCar,
    },
    {
		path: '/user',
		name: 'user',
		component: UserView,
		meta: {
			hideTabbar: true,
			tabbarNum: 2
		}
    },
    {
		path: '/changepsw',
		name: 'changepsw',
		component: ChangePsw
    },
    {
		path: '/detailinfo',
		name: 'detailinfo',
		component: DetailInfo
    },
	{
		path: '/pclogin',
		name: 'pclogin',
		component: PCLogin,
		meta: {
			isAuth: false
		}
	},
    {
		path: '/index',
		name: 'index',
		component: Index,
		redirect: {name: "tallyingtable"}, 
		children: [
			{
				path: 'tallyingtable',
				name: 'tallyingtable',
				component: TallyingTable
			},
			{
				path: 'tallyingtable',
				name: 'tallyingtable',
				component: TallyingTable
			},
			{
				path: 'usertable',
				name: 'usertable',
				component: UserTable
			}
		]
    }
  ]
})

//路由守卫
router.beforeEach((to, from, next) => {

	if(!to.meta.isAuth)  {
		next()
	}else {
		router.push({name: '/'})
	}
})



export default router
