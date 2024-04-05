<template>
	<Modal ref="Modal">
		<template v-slot:header>
			<strong>Adicionar pagamento de salão</strong>
		</template>
		<template v-slot:body>
			<Input title="Nome" v-model="name"/>
			<Input title="Digite o valor" v-model="newPayment" prefix="R$" :money="true"/>
			<Datepicker title="Data do pagamento" v-model="dateNewPayment" format="DD/MM/YYYY" valueType="YYYY-MM-DD" class="mt-2" />
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
		name: "ModalAddPaymentBeautySalon",
		components: { Modal, Input, Button, Datepicker },

		data(){
			return {
				name:null,
				newPayment:Utils.formatMoney(0),
				dateNewPayment: moment().format('YYYY-MM-DD'),
				_resolve: null,
				_reject: null,
			}
		},

		methods:{

			showModal(){
				var self = this;
				this.name = '';
				this.newPayment = Utils.formatMoney(0);
				this.dateNewPayment= moment().format('YYYY-MM-DD');
				return new Promise((resolve, reject)=>{
					self._resolve = resolve;
					self._reject = reject;
					self.$refs.Modal.show();
				})
			},
			save(){
				var self = this;
				this.$refs.Modal.showLoading();
				BillingServices.addPaymentBeautySalon(this.name, this.newPayment, this.dateNewPayment)
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