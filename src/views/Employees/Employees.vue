<template>
    <div>
        <div class="d-flex align-items-center">
            <span class="page-title">Funcionários</span>
            <div class="ml-auto">
                <Button title="Novo funcionário" :outline="true" icon="las la-plus fa-lg" :typeNew="true" color="green"
                    @action="newEmployee()"></Button>
            </div>
        </div>
        <div class="mt-3" style="box-shadow: rgb(0 0 0 / 24%) 0px 3px 8px;border-radius: 15px;">
            <div class="d-flex flex-column list-item" v-for="s in employees">
                <div class="d-flex align-itens-center w-100">
                    <div class="d-flex align-items-center flex-wrap">
                        <div style="font-size:21px">
                            <strong>{{ s.full_name }}</strong>
                        </div>
                        <div class="ml-3">
                            <span>{{ s.email }}</span>
                        </div>
                        <div class="ml-3">
                            <span>{{ s.phone }}</span>
                        </div>
                    </div>
                    <div class="ml-auto column-icons">
                        <button class="btn" v-on:click="newEmployee(s)"><i class="las la-edit fa-lg"></i></button>
                        <button class="btn" v-on:click="deleteEmployee(s)"><i class="las la-trash-alt fa-lg"></i></button>
                    </div>
                </div>
                <div class="d-flex mt-2 flex-wrap">
                    <div class="d-flex flex-wrap mr-3">
                        <div>RG: </div>
                        <div class="ml-1">{{ s.rg }}</div>
                    </div>
                    <div class="d-flex flex-wrap ml-3">
                        <div>CPF: </div>
                        <div class="ml-1">{{ s.cpf }}</div>
                    </div>
                </div>
                <div class="d-flex flex-fill align-items-end justify-content-between mt-2 mr-3 ml-3 flex-wrap">
                    <div class="d-flex flex-wrap">
                        <div>Banco: </div>
                        <div class="ml-1">{{ s.bank.bank }}</div>
                    </div>
                    <div class="d-flex flex-wrap">
                        <div>Operação: </div>
                        <div class="ml-1">{{ s.bank.operation }}</div>
                    </div>
                    <div class="d-flex flex-wrap">
                        <div>Agencia: </div>
                        <div class="ml-1"><span v-if="s.bank.agency">{{ s.bank.agency }} - {{ s.bank.digit_agency }}</span>
                        </div>
                    </div>
                    <div class="d-flex flex-wrap">
                        <div>Conta: </div>
                        <div class="ml-1"><span v-if="s.bank.account">{{ s.bank.account }} - {{ s.bank.digit_account }}</span>
                        </div>
                    </div>
                    <div class="d-flex flex-wrap">
                        <div>Tipo de conta: </div>
                        <div class="ml-1">
                            <span v-if="s.bank.type == 'CC'">Conta Corrente</span>
                            <span v-else-if="s.bank.type == 'CP'">Conta Poupança</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <ModalNewEmployee ref="ModalNewEmployee" />
    </div>
</template>
<script>
import * as EmployeesServices from '@/services/EmployeesServices'
import Button from '@/components/Buttons/Button'
import ModalNewEmployee from '@/views/Employees/ModalNewEmployee'

export default {
    name: "Employees",
    components: { Button, ModalNewEmployee },

    data() {
        return {
            employees: null,
        }
    },

    mounted() {
        this.loadData();
    },

    methods: {
        loadData() {
            var self = this;
            Utils.showLoading();
            EmployeesServices.loadEmployees()
                .then(function (result) {
                    self.employees = result;
                    Utils.closeLoading();
                });
        },

        newEmployee(employee = null) {
            var self = this;
            this.$refs.ModalNewEmployee.showModal(employee)
                .then(function () {
                    if (employee) {
                        Utils.DialogSuccess("Funcionário editado com sucesso!");
                    } else {
                        Utils.DialogSuccess("Funcionário criado com sucesso!");
                    }
                    self.loadData();
                });
        },

        deleteEmployee(employee) {
            var self = this;
            Utils.DialogConfirm("Deseja mesmo excluir o funcionário <strong>" + employee.full_name + "</strong>?")
                .then(() => {
                    Utils.showLoading();
                    EmployeesServices.deleteEmployee(employee)
                        .then(function () {
                            Utils.closeLoading();
                            Utils.DialogSuccess("Funcionário excluído com sucesso!");
                            self.loadData();
                        });
                })

        }
    }
}
</script>