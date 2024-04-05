<template>
	<div style="height:100%;overflow-y:auto">
		<div class="d-flex align-items-center mt-2">
			<span class="page-title">Vendas</span>
			<div class="ml-auto d-flex align-items-end">
				<Button title="Cadastrar venda" icon="las la-plus fa-lg" :outline="true" color="green" @action="newSale()" class="mr-2"></Button>
			</div>
		</div>
		<div class="desktop-only filter-bar">
			<InputSearch v-model="filter.client" @updateModel="filterData()" />
			<Datepicker title="Data da venda" class="mr-1" :range="true" v-model="filter.date" format="DD/MM/YYYY" valueType="YYYY-MM-DD" @updateModel="filterData()" />
		</div>
		<div class="mobile-only mt-2">
			<Button title="Filtrar" icon="las la-filter" color="blue" @action="openModalFilter()"></Button>
			<div class="filter-bar">
				<div v-if="filter.client && filter.client != ''" v-on:click="cleanFilterClient()">
					<span class="badge badge-pill badge-primary d-flex align-items-center">
						<i class="fa-solid fa-xmark mr-1"></i>
						{{filter.client}}
					</span>
				</div>
				<div v-if="filter.date && filter.date.length" v-on:click="cleanFilterDate()">	
					<span class="badge badge-pill badge-primary d-flex align-items-center">
						<i class="fa-solid fa-xmark mr-1"></i>
						{{formatDate(filter.date[0])}} ~ {{formatDate(filter.date[1])}}
					</span>
				</div>
			</div>
		</div>
		<div class="desktop-only mb-2 ml-2">
			<Button title="Relatório de vendas" :outline="true" color="blue" @action="exportSales()"></Button>
		</div>
		<div class="list-content">
			<div class="d-flex flex-column list-item" v-for="sale in sales">
				<div class="d-flex align-items-center justify-content-between w-100 flex-wrap item-sale" v-on:click="showInfo(sale.sale_id)">
					<div class="d-flex col-md-4 flex-column">
						<div style="font-size:21px">
							<i style="color:var(--orange-store);" class="las la-user"></i>
							<strong>{{sale.client_name}}</strong>
							<span class="font--dark-gray" style="font-size:14px"> - {{sale.salesman.name}}</span>
						</div>
						<div class="font--dark-gray">
							<i class="las la-calendar"></i>
							<span>{{formatDate(sale.created_at)}}</span>
						</div>
					</div>
					<div class="d-flex col-md-4 flex-column">
						<div class="d-flex flex-wrap align-items-center">
							<i class="las la-dollar-sign font--green"></i>
							<strong>Valor total:</strong>
							<strong class="font--green ml-1">R$ {{sale.total}}</strong>
						</div>
						<div class="d-flex flex-wrap align-items-center">
							<i class="las la-credit-card font--purple"></i>
							<strong>Método de pagamento:</strong>
							<strong class="font--purple ml-1">{{sale.payment_method}}</strong>
						</div>
					</div>
					<div class="d-flex col-md-4 flex-column">
						<div>
							<i class="las la-hand-holding-usd font--blue"></i>
							<strong>Status de pagamento:</strong>
						</div>
						<div class="ml-4">
							<strong v-if="!sale.still_pay" class="font--green"> Concluído</strong>
							<strong v-else="!sale.still_pay" class="font--red"> Pendente</strong>
						</div>
					</div>
				</div>
			</div>
			<infinite-loading @infinite="loadData" :identifier="infiniteId" class="infinite-loading">
				<div slot="spinner">
					<div style="color:var(--orange-store)"><i class="fa-solid fa-2x fa-circle-notch fa-spin" style="--fa-animation-duration: 1s;"></i></div>
				</div>
				<div slot="no-more"><span class="font--dark-gray-store mb-4" style="font-size:14px">Não há mais vendas</span></div>
				<div slot="no-results"><span class="font--dark-gray-store mb-4" style="font-size:14px">Não foi encontrada nenhum venda</span></div>
			</infinite-loading>
		</div>
		<ModalInfoSale ref="ModalInfoSale" />
		<ModalNewSale ref="ModalNewSale" />
		<ModalFilterSales ref="ModalFilterSales" />
		<ModalGetDate ref="ModalGetDate" />
	</div>
</template>
<script>
	import * as SalesServices from '@/services/SalesServices'
	import Button from '@/components/Buttons/Button'
	import ModalInfoSale from './ModalInfoSale'
	import ModalNewSale from './ModalNewSale'
	import InfiniteLoading from 'vue-infinite-loading';
	import Datepicker from '@/components/Form/Datepicker';
	import InputSearch from '@/components/Form/InputSearch';
	import ModalFilterSales from './ModalFilterSales'
	import ModalGetDate from '@/components/ModalGetDate'

	export default {
		name: "Sales",
		components: {Button, ModalInfoSale, ModalNewSale, InfiniteLoading, Datepicker, InputSearch, ModalFilterSales, ModalGetDate},

		data(){
			return {
				sales: [],
				page: 1,
				perPage: 10,
				filter:{
					date:null,
					client: '',
				},
				infiniteId: +new Date(),
				_state:null,
			}
		},
		methods:{
			formatDate(date){
				moment.locale('PT-BR')
				return moment(date).format('ll')
			},
			formatMoneyFromCents(value){
				return Utils.formatMoney(value)
			},
			loadData($state){
				var self = this;
				if(this.page == 1){
					self.sales = [];
				}
				SalesServices.loadSales(this.page, this.perPage, this.filter)
				.then(function(result){
					if(result.length){
						self.page += 1;
						self.sales.push(...result)
						if($state){
							$state.loaded();
						}
					} else if(self.sales.length != 0) {
						if($state){
							$state.loaded();
							$state.complete();
						}                      
					} else {
						if($state)
							$state.complete();
					}
				});
			},
			showInfo(id){
				var self = this;
				this.$refs.ModalInfoSale.showModal(id)
				.then(function(){
					self.filterData();
				})
			},

			newSale(){
				var self = this;
				this.$refs.ModalNewSale.showModal()
				.then(function(result){
					self.filterData();
				})
			},
			filterData(){
				this.page = 1;
				this.sales = [];
				this.infiniteId += 1;
			},
			openModalFilter(){
				var self = this;
				this.$refs.ModalFilterSales.showModal(this.filter)
				.then(function(result){
					self.filter = result;
					self.filterData(); 
				})
			},
			cleanFilterClient(){
				this.filter.client = '';
				this.filterData();
			},
			cleanFilterDate(){
				this.filter.date = null;
				this.filterData();
			},
			exportSales(){
				var self = this;
				this.$refs.ModalGetDate.showModal(
					null, 
					'date', 
					'DD/MM/YYYY',
					'YYYY-MM-DD',
					"Selecione uma data",
					null,
					true)
				.then(function(result){
					SalesServices.exportSales(result);
				})
			},
		}
	}
</script>

<style>
	.item-sale >div>div>i{
		margin-right: 5px;
	}
	.list-content{
		overflow-y: revert;
		margin: 10px;
		border-radius: 15px;
		box-shadow: rgb(0 0 0 / 24%) 0px 3px 8px;
	}
	.infinite-loading{
		padding: 10px;
	}
</style>