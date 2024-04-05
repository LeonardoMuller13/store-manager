<template>
	<Modal ref="Modal">
		<template v-slot:header>
			<span class="modal-title">{{modalTitle}}</span>
		</template>
		<template v-slot:body>
			<div class="form-content">
				<Input title="Nome completo" placeholder="Digite um nome" v-model="employee.name" type="text" />
				<div class="d-flex justify-content-between flex-fill mt-3">
					<Input title="E-mail" placeholder="Digite um e-mail para o vendedor" v-model="employee.email" type="text" class="w-100 mr-2"/>
					<Input title="Telefone" placeholder="Digite um telefone para o vendedor" v-model="employee.phone" type="text" :phone="true" class="w-100 ml-2"/>
				</div>
				<div class="d-flex justify-content-between flex-fill mt-3">
					<Input title="RG" placeholder="Digite um RG para o vendedor" v-model="employee.rg" type="text" class="w-100 mr-2"/>
					<Input title="CPF" placeholder="Digite um cpf para o vendedor" v-model="employee.cpf" type="text" :cpf="true" class="w-100 ml-2"/>
				</div>
				<div class="d-flex flex-wrap flex-column mt-3">
					<strong>Informações Bancarias</strong>
					<div class="d-flex flex-wrap mt-2">
						<Input title="Agência" v-model="employee.bank.agency" type="text" class="flex-fill"/>
						<Input title="Digito da Agência" v-model="employee.bank.digitAgency" type="text" class="w-25 ml-1"/>
					</div>
					<div class="d-flex flex-wrap mt-2">
						<Input title="Conta" v-model="employee.bank.account" type="text" class="flex-fill"/>
						<Input title="Digito da Conta" v-model="employee.bank.digitAccount" type="text" class="w-25 ml-1"/>
					</div>
					<div class="d-flex flex-wrap mt-2">
						<Input title="Código do Banco" v-model="employee.bank.bank" type="text" class="flex-fill"/>
						<Input title="Operação" v-model="employee.bank.operation" type="text" class="w-25 ml-3"/>
						<InputRadio title="Tipo de conta" :options="optionsTypeAccountBank" v-model="employee.bank.type" class="flex-fill ml-4" />
					</div>
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
	import * as EmployeesServices from '@/services/EmployeesServices'
	import Input from '@/components/Form/Input'
	import InputRadio from '@/components/Form/InputRadio'
	import Button from '@/components/Buttons/Button'

	export default {
		name: "ModalNewemployee",
		components: { Modal, Input, Button, InputRadio },

		data(){
			return {
				modalTitle: 'Novo Funcionario',
				employee:{
					id:null,
					name:null,
					email:null,
					phone:null,
					rg:null,
					cpf:null,
					bank:{
						account: null,
						agency:null,
						bank:null,
						digitAccount:null,
						digitAgency:null,
						operation:null,
						type:null,
					}
				},
				optionsTypeAccountBank:[
				new Utils.FormSelectOptions("Corrente", "CC"),
				new Utils.FormSelectOptions("Poupança", "CP")],
				_resolve:null,
				_reject:null,
			}
		},

		methods:{

			showModal(employee){
				return new Promise((resolve, reject)=>{
					if(employee != null){
						this.modalTitle = "Editar Funcionário";
						this.employee = {
							id: employee.employee_id,
							name: employee.full_name,
							email: employee.email,
							phone: Utils.formatPhone(employee.phone),
							rg: employee.rg,
							cpf: Utils.formatCpf(employee.cpf),
							bank:{
								account: employee.bank.account,
								agency:employee.bank.agency,
								bank:employee.bank.bank,
								digitAccount:employee.bank.digit_account,
								digitAgency:employee.bank.digit_agency,
								operation:employee.bank.operation,
								type: employee.bank.type
							}
						}
					} else {
						this.modalTitle = "Novo Funcionário";
						this.employee = {
							id:Utils.generateId(),
							name:null,
							email:null,
							phone:null,
							rg:null,
							cpf:null,
							bank:{
								account: null,
								agency:null,
								bank:null,
								digitAccount:null,
								digitAgency:null,
								operation:null,
								type:null,
							}
						};
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
				EmployeesServices.saveEmployee(this.employee)
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