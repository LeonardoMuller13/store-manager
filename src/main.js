import Vue from 'vue'
import router from './router'
import App from './App'
import { Bootstrap } from 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css'
import './database/firebase'

import "./assets/css/style.css"
import 'line-awesome/dist/font-awesome-line-awesome/css/all.css'
import 'line-awesome/dist/line-awesome/css/line-awesome.css'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'

import jquery from 'jquery'
window.$ = jquery;

import * as Utils from './utils/Utils.js'
window.Utils = Utils;

import * as bootbox from 'bootbox'
window.bootbox = bootbox;

import * as moment from 'moment'
window.moment = moment;

Vue.config.productionTip = false

new Vue({
  router,
  render: function (h) { return h(App) }
}).$mount('#app')

