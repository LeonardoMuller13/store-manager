<template>
	<Modal ref="Modal">
		<template v-slot:header>
			<span class="modal-title">Nova categoria</span>
		</template>
		<template v-slot:body>
			<Input type="text" v-model="category.name" placeholder="Digite um nome para nova categoria" />
		</template>
		<template v-slot:footer>
			<Button title="Salvar" color="green" @action="save()"/>
		</template>
	</Modal>
</template>
<script>
	import Modal from '@/components/Modal.vue'
	import * as ProductsServices from '@/services/ProductsServices.js'
	import Input from '@/components/Form/Input'
	import Button from '@/components/Buttons/Button'


	export default {
		name: "ModalNewCategory",
		components: { Modal, Input, Button },

		data(){
			return {
				category:{
					name:null,
					category_id:null,
				},
				_resolve:null,
				_reject:null,
			}
		},

		methods:{
			showModal(category){
				return new Promise((resolve, reject)=>{
					if(category != null)
						this.category = JSON.parse(JSON.stringify(category));
					else {
						this.category = {
							name: null,
							category_id:Utils.generateId(),
						}
					}
					this._resolve = resolve;
					this._reject = reject;
					this.$refs.Modal.show();
				})
			},
			closeModal(){
				this.$refs.Modal.hide();
			},

			save(){
				var self = this;
				this.$refs.Modal.showLoading();
				ProductsServices.saveCategory(this.category)
				.then(function(result){
					self.$refs.Modal.closeLoading();
					self.closeModal();
					if(self._resolve)
						self._resolve(result);
				})
			}
		}
	}
</script>