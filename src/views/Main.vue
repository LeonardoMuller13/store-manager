<template>
    <div>
        <div class="wrapper" style="height:100%">     
            <div class="main-panel d-flex">
                <div class="sidebar desktop-only">
                    <div class="sidebar-wrapper d-flex flex-column h-100">
                        <div class="logo d-flex align-itens-center justify-content-center mb-3">
                            <img class="navbar-brand" style="width: 50px;" :src="logo">
                        </div>
                        <div class="d-flex flex-column nav-menu">
                            <div :class="{'route-active':isActive('dashboard')}">
                                <i class="las la-chart-pie"></i>
                                <router-link :to="{name:'dashboard'}">
                                    <span class="nav-text">Dashboard</span>
                                </router-link>
                            </div>
                            <div :class="{'route-active':isActive('products')}">
                                <i class="las la-shopping-bag"></i>
                                <router-link :to="{name:'products'}">
                                    <span class="nav-text">Produtos</span>
                                </router-link>
                            </div>
                            <div :class="{'route-active':isActive('sales')}">
                                <i class="las la-shopping-cart"></i>
                                <router-link :to="{name:'sales'}">
                                    <span class="nav-text">Vendas</span>
                                </router-link>
                            </div>
                            <div :class="{'route-active':isActive('billing')}">
                                <i class="las la-dollar-sign"></i>
                                <router-link :to="{name:'billing'}">
                                    <span class="nav-text">Financeiro</span>
                                </router-link>
                            </div>
                            <div :class="{'route-active':isActive('employees')}">
                                <i class="las la-user-tie"></i>
                                <router-link :to="{name:'employees'}">
                                    <span class="nav-text">Funcionários</span>
                                </router-link>
                            </div>
                        </div>
                        <div class="d-flex flex-column align-items-center mt-auto">
                            <hr style="width:90%">
                            <div class="mt-2">
                                <span v-if="user" style="font-size: 10px"><strong>{{user.email}}</strong></span>
                            </div>
                            <div class="mt-3">
                                <Button title="Sair" color="logout" @action="logout()"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="content">
                    <transition name="fade">
                        <router-view></router-view>
                    </transition>
                </div>
                <div class="footerbar mobile-only">
                    <div class="d-flex justify-content-between">
                        <div :class="{'route-active':isActive('products')}">
                            <router-link :to="{name:'products'}">
                                <i class="las la-shopping-bag"></i>
                            </router-link>
                        </div>
                        <div :class="{'route-active':isActive('sales')}">
                            <router-link :to="{name:'sales'}">
                                <i class="las la-shopping-cart"></i>
                            </router-link>
                        </div>
                        <div :class="{'route-active':isActive('billing')}">
                            <router-link :to="{name:'billing'}">
                                <i class="las la-dollar-sign"></i>
                            </router-link>
                        </div>
                        <div :class="{'route-active':isActive('employees')}">
                            <router-link :to="{name:'employees'}">
                                <i class="las la-user-tie"></i>
                            </router-link>
                        </div>
                        <div>
                            <Button class="btn-logout" icon="las la-sign-out-alt" @action="logout()"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import * as LoginServices from '../services/LoginServices'
    import * as LoginUtils from '../utils/LoginUtils.js'
    import Button from '@/components/Buttons/Button'
    import logoHeader from '@/assets/logo.png'

    export default {
        name: 'Main',
        components: { Button },
        data(){
            return {
                title: "",
                user: {},
                logo: logoHeader,
            }
        },
        mounted(){
            this.title = document.title;
            this.user = LoginUtils.user;
        },
        watch: {
            $route(to, from){
                this.title = document.title;
            }
        },
        methods: {
            logout(){
                var self= this;
                Utils.showLoading();
                LoginServices.signOut()
                .then(function(){
                    LoginUtils.logout();
                    self.$router.replace({name: 'login'});
                });         
            },

            isActive(route){
                return this.$router.currentRoute.name == route;
            },
        }
    }
</script>

<style>

/**********MAIN PANEL*************/
body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #212529;
    text-align: left;
    background: linear-gradient(rgba(59, 59, 59, 0.8), rgba(255, 233, 201, 0.1));

    height: 100%;
}


.dropdown-divider {
    height: 0;
    margin: 0.5rem 0;
    overflow: hidden;
    border-top: 1px solid #e9ecef;
    width: calc(100% - 30px);
    margin-left: auto;
    margin-right: auto;
}
p {
    display: block;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
}
hr{
    color: black;
}

.navbar{
    background-color: transparent;
    min-height: 80px;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 0px 29px 0px;
    margin-bottom: 20px;
}

.navbar .navbar-nav {
    align-items: center;
}

.navbar-nav .nav-item{
    text-transform: uppercase;
    margin-left: 20px;
    font-weight: 500;
    font-size: 21px;
    transition:color 0.2s, font-size 1s;
}

.wrapper{
    height: 100%;
}
.main-panel{
    padding-top: 30px;
    padding-bottom: 20px;
    height: 100%;
}
.main-panel>.sidebar{
    width: 300px;
    padding: 10px;
    height: 100%;
}
.main-panel>.sidebar>.sidebar-wrapper>.nav-menu{
    overflow-y: auto;
}
.main-panel>.sidebar>.sidebar-wrapper>.nav-menu>div{
    padding: 10px;
    margin: 3px;
    border-radius: 8px;
    display: flex!important;
    align-items: center;
}
.main-panel>.sidebar>.sidebar-wrapper>.nav-menu>div i{
    margin-right: 5px;
    color: var(--black-store);
    font-size: 25px;
    
}
.main-panel>.sidebar>.sidebar-wrapper>.nav-menu>div .nav-text{
    color: var(--black-store);
    font-weight: 600;
    transition:color 0.2s, font-size 1s;
}
.main-panel>.sidebar>.sidebar-wrapper>.nav-menu>div .nav-text:hover{
    color: black;
    font-weight: 600;
    transition:color 0.2s, font-size 1s;
}
.main-panel>.sidebar>.sidebar-wrapper>.nav-menu>div a:hover{
    text-decoration: none;
}
.main-panel>.sidebar>.sidebar-wrapper>.nav-menu>.route-active{
    background-color: rgba(100, 182, 136, 0.789);
    color: black;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
    transition:color 0.2s, font-size 1s, background 0.3s;
}
.main-panel>.sidebar>.sidebar-wrapper>.nav-menu>.route-active .nav-text{
    color: black!important;
    transition:color 0.2s, font-size 1s;
}

.main-panel>.content{
 width: 100%;
 background-color: #FFF;
 border-radius: 18px;
 height: 100%;
 overflow-y: auto;
 padding: 20px;
 margin-right: 20px;
 box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
}

.footerbar{
    position: fixed;
    width: 100%!important;
    bottom: 0;
    padding: 10px;
    background: linear-gradient(rgba(243, 229, 210, 0.8), rgba(255, 233, 201, 0.1));
    background-color: #FFF;
    border-radius: 20px;
}

.footerbar > div i{
    color: #b9780087;
    font-size: 25px;
}

.footerbar >div> .route-active i{
    color: var(--black-store);
    font-size: 25px;
    transition:color 0.2s, font-size 1s,
}

.main-panel>.content> div:nth-child(2){
    padding: 0px 15px;
}

@media only screen and (min-width: 768px){
    .desktop-only{
        display: block;
    }
    .mobile-only{
        display: none;
    }
}

@media (max-width: 768px){
    body{
        font-size: 0.9rem;
    }
    .desktop-only{
        display: none!important;
    }
    .mobile-only{
        display: block;
    }
    .main-panel{
        padding-top: 0;
        padding-bottom: 0;
    }
    .content{
        box-shadow: 0;
        border-radius:18px 18px 0px 0px!important;
        position: relative!important;
        margin-right: 0px!important;
        bottom: 20px!important;
    }
    .navbar{
        position: fixed!important;
        background: #fffaf4!important;
        width: 100%;
        z-index: 999;
    }

    .dropdown-perfil-lg{
        display: none;
    }
    .navbar-nav .nav-item{
        margin-bottom: 5px;
        margin-top: 5px;
    }
    .dropdown-perfil-sm > ul{
        padding-left: 0!important;
    }
    .dropdown-perfil-sm >ul> *{
        margin-top: 10px;
        margin-bottom: 10px;
    }
    .navbar-nav .nav-item{
        text-transform: uppercase;
        font-weight: 500;
        font-size: 16px;
    }
    .btn-logout button {
        padding: 0;
    }
}

/**********MAIN PANEL END*************/
</style>
<style scoped>
.fade-enter-active {
    transition: opacity 1.2s;
}

.fade-enter, .fade-leave-to  {
    opacity: 0;
}
</style>