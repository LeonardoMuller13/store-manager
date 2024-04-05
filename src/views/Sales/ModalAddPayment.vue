<template>
    <Modal ref="Modal">
        <template v-slot:header>
            <strong>Adicionar pagamento</strong>
        </template>
        <template v-slot:body>
            <Input title="Digite o valor que deseja acrescentar" v-model="newPayment" prefix="R$" :money="true"
                :maxValue="maxValue" />
            <Datepicker title="Data do pagamento" v-model="dateNewPayment" format="DD/MM/YYYY" valueType="YYYY-MM-DD"
                class="mt-2" />
            <Select title="Método de pagamento" :options="paymentOptions" v-model="paymentMethod" class="mt-2" />
        </template>
        <template v-slot:footer>
            <Button title="Adicionar" color="green" @action="save()" />
        </template>
    </Modal>
</template>
<script>
import Modal from "@/components/Modal"
import * as SalesServices from '@/services/SalesServices'
import Input from '@/components/Form/Input'
import Button from '@/components/Buttons/Button'
import Datepicker from '@/components/Form/Datepicker'
import Select from '@/components/Form/Select'

export default {
    name: "ModalAddPayment",
    components: { Modal, Input, Button, Datepicker, Select },

    data() {
        return {
            sale: null,
            newPayment: Utils.formatMoney(0),
            maxValue: null,
            dateNewPayment: moment().format('YYYY-MM-DD'),
            paymentMethod: null,
            paymentOptions: [
                new Utils.FormSelectOptions("Escolha um método de pagamento", null),
                new Utils.FormSelectOptions("Dinheiro", "Dinheiro"),
                new Utils.FormSelectOptions("Cartão", "Cartão"),
                new Utils.FormSelectOptions("Boleto", "Boleto"),
                new Utils.FormSelectOptions("Conta", "Conta"),
                new Utils.FormSelectOptions("Cheque", "Cheque"),
            ],
            _resolve: null,
            _reject: null,
        }
    },

    methods: {

        showModal(sale, maxValue) {
            var self = this;
            this.sale = sale;
            this.maxValue = maxValue / 100;
            this.newPayment = Utils.formatMoney(0);
            this.paymentMethod = null;
            return new Promise((resolve, reject) => {
                self._resolve = resolve;
                self._reject = reject;
                self.$refs.Modal.show();
            })
        },
        save() {
            var self = this;
            this.$refs.Modal.showLoading();
            SalesServices.addPayment(this.sale, this.newPayment, this.dateNewPayment, this.paymentMethod)
                .then(function (result) {
                    self.$refs.Modal.closeLoading();
                    self.$refs.Modal.hide();
                    self._resolve()
                }).catch(function (err) {
                    Utils.DialogError(err);
                    self.$refs.Modal.closeLoading();
                })
        }
    }
}
</script>