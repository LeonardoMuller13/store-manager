<template>
	<div>
		<div class="w-100 d-flex mt-2 mb-3">
			<span class="page-title">Produtos</span>
			<div class="ml-auto">
				<Button title="Nova categoria" :outline="true" icon="las la-plus fa-lg" color="green" @action="newCategory()"></Button>
			</div>
			
		</div>
		<div class="card card-store mb-3" v-for="(category, indexCategory) in categories">
			<div class="card-header">
				<div class="d-flex align-itens-center">
					<div>
						<span><h4>{{category.name}}</h4></span>
						<span style="font-size: 12px">
							Quantidade total de produtos em estoque: {{qtyProducts(category)}}
						</span>
					</div>
					<div class="d-flex column-icons align-ite	start ml-auto">
						<button class="btn" v-on:click="newProduct(category.category_id)"><i class="las la-plus fa-lg"></i></button>
						<button class="btn" v-on:click="newCategory(category)"><i class="las la-edit fa-lg"></i></button>
						<button class="btn" v-on:click="deleteCategory(category)"><i class="las la-trash-alt fa-lg"></i></button>
					</div>
				</div>
				<hr>
			</div>
			<div class="card-body">
				<div>
					<div v-for="(product, indexProduct) in category.products" class="d-flex flex-column list-item">
						<div class="d-flex align-itens-center w-100">
							<div>
								<strong>{{product.name}}</strong>
							</div>
							<div class="ml-auto column-icons">
								<button class="btn" v-on:click="newProduct(category.category_id, product)"><i class="las la-edit fa-lg"></i></button>
								<button class="btn" v-on:click="deleteProduct(category, product)"><i class="las la-trash-alt fa-lg"></i></button>
							</div>
						</div>
						<div class="d-flex flex-fill align-items-end justify-content-between mt-2">
							<div class="d-flex flex-wrap">
								<div>Estoque: </div><div class="ml-1"><strong>{{product.qty}}</strong></div>
							</div>
							<div class="d-flex flex-wrap">
								<div>Valor bruto: </div><div class="ml-1 font--blue"><strong>{{formatMoneyCoin(product.gross_value/100.00)}}</strong></div>
							</div>
							<div class="d-flex flex-wrap">
								<div>Valor p/ venda: </div><div class="ml-1 font--green"><strong>{{formatMoneyCoin(product.price_shop/100.00)}}</strong></div>
							</div>
						</div>
					</div>
				</div>

			</div>
		</div>
		<ModalNewCategory ref="ModalNewCategory" />
		<ModalNewProduct ref="ModalNewProduct" />
	</div>
</template>
<script>
	import * as ProductsServices from '../../services/ProductsServices.js'
	import ModalNewCategory from './ModalNewCategory.vue'
	import ModalNewProduct from './ModalNewProduct.vue'
	import Button from '@/components/Buttons/Button'
	export default {
		name: "Products",
		components: { ModalNewCategory, ModalNewProduct, Button },

		data(){
			return {
				categories: [],
			}
		},


		mounted(){
			this.loadProducts();
		},

		methods: {
			formatMoneyCoin(value){
				return 'R$ '+ Utils.formatMoney(value);
			},
			loadProducts(){
				var self = this;
				Utils.showLoading();
				ProductsServices.loadCategories()
				.then(function(result){
					self.categories = result;
					Utils.closeLoading();
				});
			},

			qtyProducts(category){
				var qty = 0;
				for (var i = 0; i < category.products.length; i++) {
					qty += parseInt(category.products[i].qty);
				}
				return qty;
			},

			newCategory(category){
				var self = this;
				this.$refs.ModalNewCategory.showModal(category)
				.then(function(){
					Utils.DialogSuccess("Categoria criada com sucesso!")
					self.loadProducts();
				});
			},
			newProduct(categoryId, product){
				var self = this;
				this.$refs.ModalNewProduct.showModal(categoryId, product)
				.then(function(){
					Utils.DialogSuccess("Produto criado com sucesso!")
					self.loadProducts();
				});
			},
			deleteCategory(category){
				var self = this;
				Utils.DialogConfirm("Deseja mesmo excluir a categoria <strong>"+category.name+"</strong>?")
				.then(()=>{
					Utils.showLoading();
					ProductsServices.deleteCategory(category.category_id)
					.then(function(){
						Utils.closeLoading();
						self.loadProducts();
					});
				})
			},
			deleteProduct(category, product){
				var self = this;
				Utils.DialogConfirm("Deseja mesmo excluir o produto <strong>"+category.name+" - "+product.name+"</strong>?")
				.then(()=>{
					Utils.showLoading();
					ProductsServices.deleteProduct(category.category_id, product.product_id)
					.then(function(){
						Utils.closeLoading();
						self.loadProducts();
					});
				})
				
			}
		},
	}
</script>
<style>
	
</style>