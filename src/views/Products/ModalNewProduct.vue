<template>
	<Modal ref="Modal">
		<template v-slot:header>
			<span class="modal-title">Novo produto</span>
		</template>
		<template v-slot:body>
			<div class="form-content">
				<Input title="Nome do produto" placeholder="Digite um nome para o produto" v-model="product.name" type="text" />
				<div class="d-flex justify-content-between mt-2">
					<Input title="Valor bruto" v-model="product.gross_value" :money="true" prefix="R$" />
					<Input title="Valor p/ venda" v-model="product.price_shop" :money="true" prefix="R$" />
                    <Input title="Estoque" v-model="product.qty" type="number" class="w-25" :minNumber="0" />
				</div>
			</div>		
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
		name: "ModalNewProduct",
		components: { Modal, Input, Button },

		data(){
			return {
				product:{
					name:null,
					gross_value:null,
					price_shop:null,
					qty:0,
					product_id:null,
				},
				category_id:null,
				_resolve:null,
				_reject:null,
			}
		},

		methods:{
			formatMoney(value){
				return Utils.formatMoney(value)
			},

			showModal(category_id, product){
				return new Promise((resolve, reject)=>{
					this.category_id = category_id;
					if(product != null){
						this.product = {
							name: product.name,
							gross_value: Utils.formatMoney(parseFloat(product.gross_value)/100),
							price_shop: Utils.formatMoney(parseFloat(product.price_shop)/100),
							qty: product.qty,
							product_id: product.product_id
						}
					} else {
						this.product = {
							name: null,
							gross_value:Utils.formatMoney(0.00),
							price_shop:Utils.formatMoney(0.00),
							qty:0,
							product_id:Utils.generateId(),
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
				ProductsServices.saveProduct(this.category_id, this.product)
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