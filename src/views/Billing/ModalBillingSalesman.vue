<template>
	<Modal ref="Modal">
		<template v-slot:header>
			<span class="modal-title">Consultar vendedor</span>
		</template>
		<template v-slot:body>
			<div>
				<Select title="Vendedor" :options="salesmanOptions" v-model="salesman" />
				<Datepicker title="Data" :range="true" v-model="date" format="DD/MM/YYYY" valueType="YYYY-MM-DD" class="mt-2" />
				<div class="mt-3 d-flex flex-wrap" v-if="salesman">
					<Button title="Consultar" color="green" @action="consult()" class="mr-2"></Button>
					<Button title="Consultar despesas" color="blue" class="mr-2" @action="showModalExpensesSalesman()"></Button>
					<Button title="Consultar descontos" color="blue" @action="showModalDiscountSalesman()"></Button>
				</div>				
			</div>
			<div class="mt-3">
				<div class="d-flex justify-content-between">
					<div class="font--red">
						<span><strong>Despesas: <span style="font-size:1.5rem">R${{formatMoney(totalExpenses)}}</span></strong></span>
					</div>
					<div class="font--blue">
						<span><strong>Descontos: <span style="font-size:1.5rem">R${{formatMoney(totalDiscounts)}}</span></strong></span>
					</div>
					<div class="font--green">
						<span><strong>Vendas: <span style="font-size:1.5rem">R${{formatMoney(totalValue)}}</span></strong></span>
					</div>
				</div>
				<div class="ml-auto">
					<div class="font--dark-gray">
						<span><strong>Comissão final: <span style="font-size:1.5rem">R${{formatMoney(totalForPay)}}</span></strong></span>
					</div>
				</div>
				<div class="list-content" style="font-size: 0.8rem">
					<div class="d-flex flex-column list-item" v-for="b in billing">
						<div class="d-flex align-items-center justify-content-between w-100 flex-wrap item-sale" v-on:click="showInfoSale(b.sale_id)">
							<div class="d-flex col-md-3 flex-fill">
								<div style="font-size:1rem">
									<i style="color:var(--orange-store);" class="las la-user"></i>
									<strong>{{b.client_name}}</strong>
									<strong style="font-size:0.6rem" class="font--dark-gray ml-1">{{b.comission}}%</strong>
								</div>
							</div>
							<div class="font--dark-gray col-md-3 flex-fill">
								<i class="las la-calendar"></i>
								<span>{{formatDate(b.created_at)}}</span>
							</div>
							<div class="d-flex col-md-3 flex-fill">
								<div class="d-flex flex-column flex-wrap align-items-center">
									<div>
										<i class="las la-dollar-sign font--green"></i>
										<strong>Valor:</strong>
									</div>
									<div>
										<strong class="font--green ml-1">R$ {{b.payment_value}}</strong>
									</div>
									<div v-if="b.payment_method">
										<i class="las la-credit-card font--purple"></i>
										<strong>Pagamento:</strong>
									</div>
									<div v-if="b.payment_method">
										<strong class="font--purple ml-1">{{b.payment_method}}</strong>
									</div>
								</div>
							</div>
							<div class="d-flex col-md-3 flex-fill">
								<div class="d-flex flex-column flex-wrap align-items-center">
									<div>
										<i class="las la-hand-holding-usd font--dark-gray"></i>
										<strong>Comissão:</strong>
									</div>
									<div>
										<strong class="font--dark-gray ml-1">R$ {{b.payment_comission}}</strong>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<ModalInfoSale ref="ModalInfoSale" />
			<ModalConsultExpensesSalesman ref="ModalConsultExpensesSalesman" />
			<ModalConsultDiscountsSalesman ref="ModalConsultDiscountsSalesman" />
		</template>
		<template v-slot:footer v-if="billing.length">
			<div class="d-flex flex-wrap">
				<Button title="Pagar comissão" color="green" @action="payComission()" class="mr-2"></Button>
				<Button title="Exportar PDF" color="blue" @action="printComission()"></Button>
			</div>
		</template>
	</Modal>
</template>
<script>
	import Modal from '@/components/Modal.vue'
	import Button from '@/components/Buttons/Button'
	import Datepicker from '@/components/Form/Datepicker'
	import Select from '@/components/Form/Select'
	import * as BillingServices from '@/services/BillingServices'
	import ModalInfoSale from '@/views/Sales/ModalInfoSale'
	import ModalConsultExpensesSalesman from '@/views/Billing/ModalConsultExpensesSalesman'
	import ModalConsultDiscountsSalesman from '@/views/Billing/ModalConsultDiscountSalesman'

	export default {
		name: "ModalBillingSalesman",
		components: {Modal, Button, Datepicker, Select, ModalInfoSale, ModalConsultExpensesSalesman, ModalConsultDiscountsSalesman},

		data(){
			return {
				salesman:null,
				salesmanOptions:[new Utils.FormSelectOptions("Escolha um vendedor", null)],
				date: [],
				billing: [],
				expenses: [],
				discounts: [],
				totalValue: 0,
				totalExpenses: 0,
				totalDiscounts: 0,
			}
		},

		mounted(){
			this.loadSalesman();
		},
		computed:{
			salesmanName:function(){
				for (var i = 0; i < this.salesmanOptions.length; i++) {
					if(this.salesmanOptions[i].value == this.salesman){
						return this.salesmanOptions[i].label;
					}
				}
			},
			totalForPay:function(){
				return this.totalValue + this.totalExpenses - this.totalDiscounts;
			}
		},
		methods:{
			formatDate(date){
				moment.locale('PT-BR');
				return moment(date).format('ll')
			},
			formatMoney(value){
				return Utils.formatMoney(value)
			},
			showModal(){
				this.salesman = null;
				this.date = [];
				this.billing = [];
				this.expenses = [];
				this.discounts = [];
				this.totalValue = 0;
				this.totalExpenses = 0;
				return new Promise((resolve, reject)=>{
					this._resolve = resolve;
					this._reject = reject;
					this.$refs.Modal.show();
				})
			},

			loadSalesman(){
				var self = this;
				BillingServices.getSalesman()
				.then(function(result){
					for (var i = 0; i < result.length; i++) {
						self.salesmanOptions.push(new Utils.FormSelectOptions(result[i].name, result[i].id));
					}
					self.$refs.Modal.closeLoading();
				})
			},
			consult(){
				var self = this;
				this.$refs.Modal.showLoading();
				BillingServices.loadBillingSalesman(this.salesman, this.date)
				.then(function(result){
					self.totalValue = result.totalValue;
					self.billing = result.billing;
					BillingServices.loadExpensesSalesman(self.date, self.salesman, true)
					.then(function(result){
						self.totalExpenses = result.totalValue;
						self.expenses = result.expenses;
						BillingServices.loadDiscountsSalesman(self.date, self.salesman, true)
						.then(function(result){
							self.totalDiscounts = result.totalValue;
							self.discounts = result.discounts;
						})
					})
					self.$refs.Modal.closeLoading();
				})
				.catch(function(err){
					Utils.DialogError(err);
					self.$refs.Modal.closeLoading();
				});
			},
			showInfoSale(id){
				var self = this;
				this.$refs.ModalInfoSale.showModal(id)
				.then(function(){
					self.consult();
				})
			},

			payComission(){
				var self = this;
				var value = this.formatMoney(this.totalForPay);
				Utils.DialogConfirm("Deseja pagar a comissão para <strong>"+ this.salesmanName +"</strong> referente à <strong>"+ moment(this.date[0]).format('DD/MM/YYYY') + " ~ " + moment(this.date[1]).format('DD/MM/YYYY') + "</strong> de <strong>R$ " + value +"</strong> ?")
				.then(function(){
					self.$refs.Modal.showLoading();
					BillingServices.payComissionSalesman(self.salesmanName, value)
					.then(function(){
						self.$refs.Modal.closeLoading();
						Utils.DialogConfirm("Comissão registrada!");
						self._resolve();
					})
					.catch(function(err){
						self.$refs.Modal.closeLoading();
						Utils.DialogError(err);
					})
				})
			},
			printComission(){
				var value = this.formatMoney(this.totalForPay);
				BillingServices.printComissionSalesman(this.billing, this.expenses, this.discounts, this.date, this.salesmanName, value);
			},
			showModalExpensesSalesman(){
				this.$refs.ModalConsultExpensesSalesman.showModal(this.salesman, this.salesmanName);
			},
			showModalDiscountSalesman(){
				this.$refs.ModalConsultDiscountsSalesman.showModal(this.salesman, this.salesmanName);
			}
		}
	}
</script>