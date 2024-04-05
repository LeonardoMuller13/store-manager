<template>
	<Modal ref="Modal">
		<template v-slot:header>
			<span class="modal-title"><strong>{{title}}</strong></span>
		</template>
		<template v-slot:body>
			<DatePicker :title="subtitle" v-model="date" :type="type" :format="format" :valueType="valueType" :range="range"/>
		</template>
		<template v-slot:footer>
			<Button title="Confirmar" color="green" @action="save()" />
		</template>
	</Modal>
</template>
<script>
	import Modal from '@/components/Modal.vue'
	import Button from '@/components/Buttons/Button.vue'
	import DatePicker from '@/components/Form/Datepicker';

	export default {
		name: 'ModalGetDate',
		components: {Modal, Button, DatePicker},

		data(){
			return {
				date: null,
				type: null,
				format: null,
				valueType: null,
				_resolve: null,
				_reject: null,
				title:null,
				subtitle:null,
				range:false,
			}
		},

		methods:{

			showModal(date, type = 'date', format = 'DD/MM/YYYY' , valueType = 'YYYY-MM-DD', title="Selecione uma data/hora",subtitle=null, range=false){
				var self = this;
				if(date == null){
					date = moment().format(valueType);
				}
				this.title = title;
				this.date = date;
				this.type = type;
				this.format = format;
				this.valueType = valueType;
				this.subtitle = subtitle;
				this.range = range;
				return new Promise(function (resolve, reject) {
					self._resolve = resolve;
					self._reject = reject;
					self.$refs.Modal.show();
				})
			},

			save(){
				this._resolve(this.date);
				this.$refs.Modal.hide();
			}
		}


	}
</script>