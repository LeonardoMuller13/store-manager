<template>
	<Modal ref="Modal">
		<template v-slot:header>
			<span v-if="salesmanName" class="modal-title">Despesas - {{salesmanName}}</span>
		</template>
		<template v-slot:body>
			<div class="d-flex">
				<Datepicker v-model="date" type="month" format="MM/YYYY" valueType="YYYY-MM" @updateModel="loadData()" />
				<div class="ml-auto d-flex">
					<div>
						<span><strong>Total: <span class="font--red" style="font-size:1.5rem">R${{formatMoney(totalValue)}}</span></strong></span>
					</div>
				</div>
			</div>
			<div class="mt-3">
				<div v-if="!expenses.length" class="d-flex justify-content-center">
					<span><strong>Não há nenhuma despesa para o mês selecionado</strong></span>
				</div>
				<div v-else class="list-content">
					<div class="d-flex flex-column list-item" v-for="e in expenses">
						<div class="d-flex align-items-center justify-content-between w-100 flex-wrap item-sale">
							<div class="d-flex col-md-3 flex-fill">
								<div style="font-size:1.2rem">
									<strong>{{e.name}}</strong>
								</div>
							</div>
							<div class="font--dark-gray col-md-3 flex-fill">
								<i class="las la-calendar"></i>
								<span>{{formatDate(e.created_at)}}</span>
							</div>
							<div class="d-flex col-md-4 flex-fill">
								<div class="d-flex flex-wrap align-items-center">
									<i class="las la-dollar-sign font--green"></i>
									<strong>Valor:</strong>
									<strong class="font--red ml-1">R$ {{e.value}}</strong>
								</div>
							</div>
							<div class="font--dark-gray col-md-1 flex-fill text-right">
								<Button icon="las la-trash-alt" color="red" @action="deleteExpense(e)"></Button>
							</div>
						</div>
					</div>
				</div>
			</div>
			<ModalNewExpenseSalesman ref="ModalNewExpenseSalesman" />
		</template>
		<template v-slot:footer>
			<Button title="Adicionar despesa" color="green" @action="newExpense()"></Button>
		</template>
	</Modal>
</template>
<script>
	import Modal from '@/components/Modal.vue'
	import Button from '@/components/Buttons/Button'
	import Datepicker from '@/components/Form/Datepicker'
	import Select from '@/components/Form/Select'
	import * as BillingServices from '@/services/BillingServices'
	import ModalNewExpenseSalesman from './ModalNewExpenseSalesman'

	export default {
		name: "ModalConsultExpensesSalesman",
		components: {Modal, Button, Datepicker, Select, ModalNewExpenseSalesman},

		data(){
			return {
				salesmanName:'',
				salesman: null,
				date: moment().format('YYYY-MM'),
				expenses: [],
				totalValue: 0,
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
			showModal(salesman, salesmanName){
				var self = this;
				this.salesmanName = salesmanName;
				this.salesman = salesman;
				this.date = moment().format('YYYY-MM');
				return new Promise((resolve, reject)=>{
					self._resolve = resolve;
					self._reject = reject;
					self.$refs.Modal.show();
					self.loadData(salesman);
				})
			},
			loadData(){
				var self = this;
				this.$refs.Modal.showLoading();
				BillingServices.loadExpensesSalesman(this.date, this.salesman)
				.then(function(result){
					self.totalValue = result.totalValue;
					self.expenses = result.expenses;
					self.$refs.Modal.closeLoading();
				});
			},
			newExpense(){
				var self = this;
				this.$refs.ModalNewExpenseSalesman.showModal(this.salesman, this.salesmanName)
				.then(function(){
					self.loadData();
					self._resolve();
				})
			},
			deleteExpense(expense){
				var self = this;
				Utils.DialogConfirm("Deseja mesmo excluir a despesa <strong>"+expense.name+"</strong")
				.then(function(){
					BillingServices.deleteExpenseSalesman(expense.expense_id)
					.then(function(){
						self.loadData();
						self._resolve();
					})
				})
			}
		}
	}
</script>