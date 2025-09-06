import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '',
    redirect: '/home'
  },
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login/Login.vue'),
    meta: {
        title: "Login",
        pid: -1
    }
  },
  {
    path: '/signin',
    name: 'signin',
    component: () => import('../views/SignIn/SignIn.vue'),
    meta: {
        title: "SignIn",
        pid: -1
    }
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/Home/Home.vue'),
    meta: {
        isAuth: true,
        pid: 0
    },
    children: [
      {
        path: 'auction',
        name: 'auction',
        component: () => import('../views/Auction/Auction.vue'),
        meta: {
            title: "Goods List",
            isAuth: true,
            pid: 1
        }
      },
      {
        path: 'detail',
        component: () => import('../views/Detail/Detail.vue'),
        meta: {
            title: "Goods Detail",
            isAuth: true,
            pid: 11
        }
      },
      {
        path: 'details',
        component: () => import('../views/Detail/DetailS.vue'),
        meta: {
            title: "Product Detail",
            isAuth: true,
            pid: 12
        }
      },
      {
        path: 'goodinfo',
        name: 'goodinfo',
        component: () => import('../views/Detail/GoodInfo.vue'),
        meta: {
            title: "Good Info",
            isAuth: true,
            pid: 13
        }
      },
      {
        path: 'mine',
        component: () => import('../views/Mine/Mine.vue'),
        meta: {
            title: "Personal Info",
            isAuth: true,
            pid: 2
        }
      },
      {
        path: 'order',
        component: () => import('../views/Order/Order.vue'),
        meta: {
            title: "Order Management",
            isAuth: true,
            pid: 3
        }
      },
      {
        path: 'orderinfo',
        component: () => import('../views/Order/OrderInfo.vue'),
        meta: {
            title: "Order Info",
            isAuth: true,
            pid: 31
        }
      },
      {
        path: 'orderinfos',
        component: () => import('../views/Order/OrderInfoS.vue'),
        meta: {
            title: "Order Info",
            isAuth: true,
            pid: 32
        }
      },
      {
        path: 'announce',
        component: () => import('../views/Announce/Announce.vue'),
        meta: {
            title: "Announce",
            isAuth: true,
            pid: 4
        }
      },
      {
        path: 'addannounce',
        component: () => import('../views/Announce/AddAnnounce.vue'),
        meta: {
            title: "Announce Management",
            isAuth: true,
            pid: 41
        }
      },
      {
        path: 'search',
        component: () => import('../views/Search/Search.vue'),
        meta: {
            title: "Search",
            isAuth: true,
            pid: 5
        }
      },
      {
        path: 'admins',
        name: 'admins',
        component: () => import('../views/Admin/Admin.vue'),
        meta: {
            title: "Administrator Management",
            isAuth: true,
            pid: 6
        }
      },
      {
        path: 'users',
        component: () => import('../views/Users/Users.vue'),
        meta: {
            title: "Users Management",
            isAuth: true,
            pid: 7
        }
      },
      {
        path: 'sellers',
        component: () => import('../views/Users/Sellers.vue'),
        meta: {
            title: "Sellers Management",
            isAuth: true,
            pid: 8
        }
      }
    ]
  },
  {
    path: '/statistics',
    component: () => import('../views/Statistics/Statistics.vue'),
    meta: {
        title: "Statistics",
        isAuth: true,
        pid: 9
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
