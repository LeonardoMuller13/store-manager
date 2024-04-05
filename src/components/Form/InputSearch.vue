<template>
	<div>
		<strong class="form-title" v-if="title">{{title}}</strong>
		<div class="store-input-icon store-input-icon--left form-group-search input-group">
			<input type="text" class="form-control form-control-store form-control-store-search" :value="value" @input="handleInput" :placeholder="placeholder" @keyup.enter="updateModel()" :disabled="disable" style="height:auto">
			<div class="input-group-append">
				<button class="btn btn-search" @click="updateModel()" :disabled="disable"><i class="las la-search"></i></button>
			</div>
			<span v-if="value == null || value == ''" class="store-input-icon__icon store-input-icon__icon--left">
				<span>
					<i class="las la-search"></i>
				</span>
			</span>
			<span v-else class="store-input-icon__icon store-input-icon__icon--left">
				<span @click="erase" class="button--erase" v-if="!disable">
					<i class="las la-times"></i>
				</span>
			</span>
		</div>	
	</div>
</template>
<script>
	export default {
		name: 'FormInputSearch',
		props:{
			value: '',
			placeholder:'',
			title:'',
			disable: {
				default: false,
				type : Boolean
			},
			autoSearch: {
				default: true,
				type: Boolean
			}
		},
		data() {
			return {
				currentTimeout:null,
			}
		},
		watch: {
			value: function(old, newValue) {
				if(old == newValue)
					return;
				if(!this.value || this.value == '') {
					this.erase();
				} else {
					this.runTimeout();
				}
			},
		},
		methods:{
			runTimeout() {
				if(!this.autoSearch)
					return;
				if(this.currentTimeout) {
					clearTimeout(this.currentTimeout);
					this.currentTimeout = null;
				}
				this.currentTimeout = setTimeout(this.updateModel,500);
			},
			handleInput(event) {
				this.$emit('input', event.target.value);
			},
			updateModel(){
				if(this.currentTimeout) {
					clearTimeout(this.currentTimeout);
					this.currentTimeout = null;
				}
				this.$emit('updateModel');
			},
			erase(event){
				if(this.currentTimeout) {
					clearTimeout(this.currentTimeout);
					this.currentTimeout = null;
				}
				this.$emit('input','');
				this.updateModel();
			}
		}

	}
</script>
<style type="text/css">

	.form-group-search{
	}

	.form-control-store-search{
		padding-left: 2.8rem!important;
	}
	.form-control-store-search-sm {
		max-width: 180px;
		margin-right: 0px;
	}
	.store-input-icon {
		position: relative!important;
		width: 100%!important;

	}
	.store-input-icon>.store-input-icon__icon>span {
		display: table;
		height: 100%;
		width: 100%;
		color:#808080;
		font-size: 18px;
	}
	.store-input-icon>.store-input-icon__icon>span>i {
		display: table-cell;
		vertical-align: middle;
		text-align: center;

	}
	.store-input-icon>.store-input-icon__icon {
		position: absolute;
		height: 100%;
		display: inline-block;
		text-align: center;
		top: 0;
		width: 3.2rem;
	}
	.store-input-icon>.store-input-icon__icon.store-input-icon__icon--left {
		left: 0;
		z-index: 4;
	}
	.input-group:not(.has-validation) > .input-group-append:not(:last-child) > .btn{
		border-top-right-radius: 15px!important;
		border-bottom-right-radius: 15px!important;
		border-top-left-radius: 0!important;
		border-bottom-left-radius: 0!important;
		width: 50px;
	}
	.btn.btn-search{
		color: #fff;
		background: #0E78F9;
	}
	.btn.btn-search:hover{
		color: #fff;
		background: #0762d1;
	}
	.button--erase{
		cursor: pointer;
	}
</style>