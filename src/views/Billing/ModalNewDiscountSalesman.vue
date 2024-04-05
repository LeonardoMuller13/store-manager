<template>
	<Modal ref="Modal">
		<template v-slot:header>
			<strong>Adicionar desconto - {{salesmanName}}</strong>
		</template>
		<template v-slot:body>
			<Input title="Desconto" v-model="discount"/>
			<Input title="Valor" v-model="value" prefix="R$" :money="true"/>
			<Datepicker title="Data do pagamento" v-model="date" format="DD/MM/YYYY" valueType="YYYY-MM-DD" class="mt-2" />
		</template>
		<template v-slot:footer>
			<Button title="Adicionar" color="green" @action="save()"/>
		</template>
	</Modal>
</template>
<script>
	import Modal from "@/components/Modal"
	import * as BillingServices from '@/services/BillingServices'
	import Input from '@/components/Form/Input'
	import Button from '@/components/Buttons/Button'
	import Datepicker from '@/components/Form/Datepicker'

	export default{
		name: "ModalNewExpenseSalesman",
		components: { Modal, Input, Button, Datepicker },

		data(){
			return {
				salesman:'',
				salesmanName:'',
				discount:null,
				value:Utils.formatMoney(0),
				date: moment().format('YYYY-MM-DD'),
				_resolve: null,
				_reject: null,
			}
		},

		methods:{

			showModal(salesman, salesmanName){
				var self = this;
				this.salesman = salesman;
				this.salesmanName = salesmanName;
				this.discount = null;
				this.value = Utils.formatMoney(0);
				this.date = moment().format('YYYY-MM-DD');
				return new Promise((resolve, reject)=>{
					self._resolve = resolve;
					self._reject = reject;
					self.$refs.Modal.show();
				})
			},
			save(){
				var self = this;
				this.$refs.Modal.showLoading();
				BillingServices.saveDiscountSalesman(this.salesman, this.discount, this.value, this.date)
				.then(function(result){
					self.$refs.Modal.closeLoading();
					self.$refs.Modal.hide();
					self._resolve()
				})
				.catch(function(err){
					Utils.DialogError(err);
					self.$refs.Modal.closeLoading();
				})
			}
		}
	}
</script>