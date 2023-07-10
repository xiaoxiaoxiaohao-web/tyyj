import { createRouter, createWebHashHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
import Login from '@/components/Login.vue'

import Home from '@/components/Home/index.vue'
import Warehousing from '@/components/Home/Warehousing.vue'
import Tallying from '@/components/Home/Tallying.vue'
import Outbound from '@/components/Home/Outbound.vue'
import Loading from '@/components/Home/Loading.vue'
import Confirmation from '@/components/Home/Confirmation.vue'
import Shipment from '@/components/Home/Shipment.vue'

import Filings from '@/components/Filings/index.vue'
import AddCar from '@/components/Filings/AddCar.vue'
import UpdateCar from '@/components/Filings/UpdateCar.vue'

import UserView from '@/components/User/index.vue'
import ChangePsw from '@/components/User/ChangePsw.vue'
import DetailInfo from '@/components/User/DetailInfo.vue'

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
    }
  ]
})

export default router
