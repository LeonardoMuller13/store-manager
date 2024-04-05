<template>
	<Modal ref="Modal">
		<template v-slot:header>
			<strong>Filtros</strong>
		</template>
		<template v-slot:body>
			<Input title="Digite o nome do cliente" v-model="client"/>
			<Datepicker title="Data da venda" :range="true" v-model="dateSale" format="DD/MM/YYYY" valueType="YYYY-MM-DD" />
		</template>
		<template v-slot:footer>
			<Button title="Filtrar" color="blue" @action="filter()"/>
		</template>
	</Modal>
</template>
<script>
	import Modal from "@/components/Modal"
	import Input from '@/components/Form/Input'
	import Button from '@/components/Buttons/Button'
	import Datepicker from '@/components/Form/Datepicker'

	export default{
		name: "ModalFilterSales",
		components: { Modal, Input, Button, Datepicker },

		data(){
			return {
				client:'',
				dateSale: null,
				_resolve: null,
				_reject: null,
			}
		},

		methods:{

			showModal(filter){
				var self = this;
				if(filter){
					this.client = filter.client;
					this.dateSale = filter.date;
				}
				return new Promise((resolve, reject)=>{
					self._resolve = resolve;
					self._reject = reject;
					self.$refs.Modal.show();
				})
			},
			filter(){
				var self = this;
				self.$refs.Modal.hide();
				self._resolve({'client': this.client, 'date': this.dateSale})
			}
		}
	}
</script>