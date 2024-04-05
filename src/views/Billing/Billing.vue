<template>
	<div style="height:100%;overflow-y:auto;padding: 5px;">
		<div class="d-flex flex-wrap align-items-start">
			<Datepicker v-model="date" type="month" format="MM/YYYY" valueType="YYYY-MM" @updateModel="filterData()" />
			<div class="mt-3 d-flex w-100" style="margin:10px">
				<div class="card card-store value-total-card flex-fill ml-auto">
					<div class="card-body">
						<div class="d-flex flex-column">
							<div class="value-title">
								<span>Balanço do mês</span>
							</div>
							<div class="d-flex align-items-center">
								<div style="font-size:2rem; text-align: center;">
									<i class="las la-balance-scale-left"></i>
								</div>
								<div class="ml-auto" >
									<div class="value-total" v-bind:class="[billingFinal >= 0 ? 'font--green' : 'font--red']">
										<transition name="slide-fade" mode="out-in">
											<div :key="billingFinal">
												<span>R$ {{formatMoney(billingFinal)}}</span>
											</div>
										</transition>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="mt-3 d-flex align-items-end flex-wrap w-100 justify-content-between" style="margin:10px">
				<div class="card card-store flex-fill value-total-card">
					<div class="card-body">
						<div class="d-flex flex-column">
							<div class="value-title">
								<span>Total bruto de produtos no mês</span>
							</div>
							<div class="d-flex align-items-center">
								<div style="font-size:2rem; text-align: center;">
									<i class="las la-shopping-bag"></i>
								</div>
								<div class="ml-auto" >
									<div class="value-total font--purple">
										<transition name="slide-fade" mode="out-in">
											<div :key="totalValueProducts">
												<span>R$ {{formatMoney(totalValueProducts)}}</span>
											</div>
										</transition>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="card card-store flex-fill value-total-card">
					<div class="card-body">
						<div class="d-flex flex-column">
							<div class="value-title">
								<span>Total de despesas no mês</span>
							</div>
							<div class="d-flex align-items-center">
								<div style="font-size:2rem; text-align: center;">
									<i class="las la-file-invoice-dollar"></i>
								</div>
								<div class="ml-auto" >
									<div class="value-total font--red">
										<transition name="slide-fade" mode="out-in">
											<div :key="totalValueExpenses">
												<span>R$ -{{formatMoney(totalValueExpenses)}}</span>
											</div>
										</transition>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="card card-store flex-fill value-total-card">
					<div class="card-body">
						<div class="d-flex flex-column">
							<div class="value-title">
								<span>Total recebido no mês</span>
							</div>
							<div class="d-flex align-items-center">
								<div style="font-size:2rem; text-align: center;">
									<i class="las la-piggy-bank"></i>
								</div>
								<div class="ml-auto" >
									<div class="value-total font--green">
										<transition name="slide-fade" mode="out-in">
											<div :key="totalValue">
												<span>R$ {{formatMoney(totalValue)}}</span>
											</div>
										</transition>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="mt-2 d-flex flex-wrap" style="margin:10px">
				<Button title="Consultar vendedor" :outline="true" color="blue" @action="consultSalesman()" class="mr-2"></Button>
				<Button title="Consultar despesas" :outline="true" color="blue" @action="consultExpenses()" class="mr-2"></Button>
			</div>
		</div>
		<div class="list-content mt-3">
			<div class="d-flex flex-column list-item" v-for="b in billing">
				<div class="d-flex align-items-center justify-content-between w-100 flex-wrap item-sale" v-on:click="showInfoSale(b.sale_id)">
					<div class="d-flex col-md-4 flex-column">
						<div style="font-size:21px">
							<i style="color:var(--orange-store);" class="las la-user"></i>
							<strong>{{b.client_name}}</strong>
							<span v-if="b.salesman" class="font--dark-gray" style="font-size:14px"> - {{b.salesman.name}} <strong>{{b.comission}}%</strong></span>
							<span v-else class="font--dark-gray" style="font-size:14px"> - Salão<strong></strong></span>
						</div>
						<div class="font--dark-gray">
							<i class="las la-calendar"></i>
							<span>{{formatDate(b.created_at)}}</span>
						</div>
					</div>
					<div class="d-flex col-md-4 flex-column">
						<div class="d-flex flex-wrap align-items-center">
							<i class="las la-dollar-sign font--green"></i>
							<strong>Valor:</strong>
							<strong class="font--green ml-1">R$ {{b.payment_value}}</strong>
						</div>
						<div class="d-flex flex-wrap align-items-center" v-if="b.payment_method">
							<i class="las la-credit-card font--purple"></i>
							<strong>Método de pagamento:</strong>
							<strong class="font--purple ml-1">{{b.payment_method}}</strong>
						</div>
					</div>
				</div>
			</div>
			<infinite-loading @infinite="loadData" :identifier="infiniteId" class="infinite-loading">
				<div slot="spinner">
					<div style="color:var(--orange-store)"><i class="fa-solid fa-2x fa-circle-notch fa-spin" style="--fa-animation-duration: 1s;"></i></div>
				</div>
				<div slot="no-more"><span class="font--dark-gray-store mb-4" style="font-size:14px">Não há mais dados</span></div>
				<div slot="no-results"><span class="font--dark-gray-store mb-4" style="font-size:14px">Não foi encontrado nenhum dado</span></div>
			</infinite-loading>
		</div>
		<ModalBillingSalesman ref="ModalBillingSalesman" />
		<ModalExpenses ref="ModalExpenses" />
		<ModalInfoSale ref="ModalInfoSale" />
	</div>
</template>
<script>
	import * as BillingServices from '@/services/BillingServices'
	import Button from '@/components/Buttons/Button'
	import Datepicker from '@/components/Form/Datepicker';
	import InfiniteLoading from 'vue-infinite-loading';
	import ModalBillingSalesman from './ModalBillingSalesman'
	import ModalExpenses from './ModalExpenses'
	import ModalInfoSale from '@/views/Sales/ModalInfoSale'
	import ModalAddPaymentBeautySalon from './ModalAddPaymentBeautySalon'

	export default {
		name: "Billing",
		components: {Button, InfiniteLoading, Datepicker, ModalBillingSalesman, ModalExpenses, ModalInfoSale},

		data(){
			return{
				date: moment().format('YYYY-MM'),
				infiniteId: +new Date(),
				_state:null,
				billing: [],
				page: 1,
				perPage: 10,
				totalValue: 0,
				totalValueProducts: 0,
				totalValueExpenses: 0,
			}
		},

		computed:{
			billingFinal:function(){
				return this.totalValue - this.totalValueProducts - this.totalValueExpenses;
			}
		},

		methods:{
			formatDate(date){
				moment.locale('PT-BR')
				return moment(date).format('ll')
			},
			formatMoney(value){
				return Utils.formatMoney(value)
			},
			loadData($state){
				Utils.showLoading();
				var self = this;
				if(this.page == 1){
					self.billing = [];
				}
				BillingServices.loadBilling(this.page, this.perPage, this.date)
				.then(function(result){
					self.totalValue = result.totalValue;
					self.totalValueProducts = result.totalProducts;
					self.totalValueExpenses = result.totalExpenses;
					if(result.billing.length){
						self.page ++;
						self.billing.push(...result.billing)
						if($state){
							$state.loaded();
						}
					} else if(self.billing.length != 0) {
						if($state){
							$state.loaded();
							$state.complete();
						}                      
					} else {
						if($state)
							$state.complete();
					}
					Utils.closeLoading();
				});
			},
			filterData(){
				this.page = 1;
				this.billing = [];
				this.infiniteId += 1;
			},
			consultSalesman(){
				var self = this;
				this.$refs.ModalBillingSalesman.showModal()
				.then(function(){
					self.filterData();
				});
			},
			consultExpenses(){
				var self = this;
				this.$refs.ModalExpenses.showModal()
				.then(function(){
					self.filterData();
				});
			},

			showInfoSale(id){
				var self = this;
				if(id){
					this.$refs.ModalInfoSale.showModal(id)
					.then(function(){
						self.filterData();
					})
				}
				
			},
			addPaymentBeautySalon(){
				var self = this;
				this.$refs.ModalAddPaymentBeautySalon.showModal()
				.then(function(){
					self.filterData();
				})
			}
		}
	}
</script>
<style>
	.value-total-card .value-title{
		font-weight: bolder;
		font-size: 1.2rem;
	}
	.value-total-card .value-total{
		font-weight: bolder;
		font-size: 2rem;
	}
	.slide-fade-enter-active {
		transition: all .3s ease;
	}
	.slide-fade-leave-active {
		transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0);
	}
	.slide-fade-enter, .slide-fade-leave-to{
		transform: translateX(10px);
		opacity: 0;
	}
	.value-total-card{
		max-width: 50%;
		margin-right: 1.5rem;
		margin-left: 1.5rem;
	}
	.value-total-card:first-child{
		margin-left: 0;
	}
	.value-total-card:last-child{
		margin-right: 0;
	}
	@media (max-width: 768px){
		.value-total-card{
			width: 100%!important;
			margin-left: 0px!important;
			margin-top: 1rem;
			margin-right: 0px!important;
			max-width: 100%;
		}
	}
</style>