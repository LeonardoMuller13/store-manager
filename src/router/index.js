import Vue from 'vue'
import VueRouter from 'vue-router'
import Main from '../views/Main.vue'
import Login from '../views/Login/Login.vue'
import Dashboard from '../views/Dashboard/Dashboard.vue'
import Products from '../views/Products/Products.vue'
import Sales from '@/views/Sales/Sales.vue'
import Billing from '@/views/Billing/Billing.vue'
import Clients from '@/views/Clients/Clients.vue'
import Employees from '@/views/Employees/Employees.vue'

Vue.use(VueRouter)

const routes = [
{
    path: '/',
    name: 'main',
    redirect: '/dashboard',
    component: Main,

    children: [
    {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: { title: 'Desempenho'},
    },
    {
        path: '/products',
        name: 'products',
        component: Products,
        meta: { title: 'Produtos'},
    },
    {
        path: '/sales',
        name: 'sales',
        component: Sales,
        meta: { title: 'Vendas'},
    },
    {
        path: '/billing',
        name: 'billing',
        component: Billing,
        meta: { title: 'Financeiro'},
    },
    {
        path: '/clients',
        name: 'clients',
        component: Clients,
        meta: { title: 'Clientes'},
    },
    {
        path: '/employees',
        name: 'employees',
        component: Employees,
        meta: { title: 'Funcionários'},
    }
    ],
    meta: {
        requiresAuth: true,
        metaTags: [
        {
            name: 'X-UA-Compatible',
            content: 'ie=edge'
        },
        {
            property: 'viewport',
            content: 'width=1024'
        }]
    }
},
{
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
        title: 'Login',
        metaTags: [
        {
            name: 'X-UA-Compatible',
            content: 'ie=edge'
        },
        {
            property: 'viewport',
            content: 'width=1024'
        }]}
}
]

const router = new VueRouter({
    mode: 'history',
    routes: routes,
});

import * as LoginUtils from '../utils/LoginUtils.js'

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record=> record.meta.requiresAuth);
    if(to.meta.title)
        document.title = to.meta.title;
    else
        document.title = 'Claudia Charbell';
    if(requiresAuth) {
        if (!LoginUtils.isLogedIn()) {
            next({name: 'login'});

        } else {
            next();
        }
    } else {
        next();
    }

});


export default router
