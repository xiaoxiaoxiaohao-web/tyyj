import { createRouter, createWebHashHistory } from 'vue-router'
import { useHomeStore } from '../store/home'
import Login from '@/components/Login.vue'

import Home from '@/components/Home/index.vue'
import Warehousing from '@/components/Home/Warehousing.vue'
import Tallying from '@/components/Home/Tallying.vue'
import Outbound from '@/components/Home/Outbound.vue'
import Loading from '@/components/Home/Loading.vue'
import Confirmation from '@/components/Home/Confirmation.vue'
import Abnormal from '@/components/Home/Abnormal.vue'

import Filings from '@/components/Filings/index.vue'
import AddCar from '@/components/Filings/AddCar.vue'
import UpdateCar from '@/components/Filings/UpdateCar.vue'

import UserView from '@/components/User/index.vue'
import ChangePsw from '@/components/User/ChangePsw.vue'
import DetailInfo from '@/components/User/DetailInfo.vue'

import TableChart from '@/components/TableChart/index.vue'
import TallyingTable from '@/components/TableChart/TallyingTable.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
        path: '/',
        name: '',
        component: Login,
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
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
		path: '/tablechart',
		name: 'tablechart',
		component: TableChart,
		redirect: {name: "tallyingtable"}, 
		children: [
			{
				path: 'tallyingtable',
				name: 'tallyingtable',
				component: TallyingTable
			}
		]
    }
  ]
})

//路由守卫
router.beforeEach((to, from, next) => {
	let homeStore = useHomeStore()
	if(to.path == '/login' || to.path  == '/tablechart/tallyingtable')  {
		next()
	}else if(homeStore.user.PERSON_CODE){   //判断是否已经登录
		next()
	}else {
		router.push({name: 'login'})
	}
})

export default router
