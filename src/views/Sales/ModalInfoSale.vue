<template>
    <Modal ref="Modal">
        <template v-slot:header>
            <strong>Informações da compra</strong>
        </template>
        <template v-slot:body>
            <div v-if="sale">
                <div class="d-flex align-itens-center flex-wrap">
                    <div style="font-size:21px" class="flex-fill mr-auto">
                        <i style="color:var(--orange-store);" class="las la-user"></i>
                        <strong>{{ sale.client_name }}</strong>
                    </div>
                    <div class="font--dark-gray" style="font-size:14px">
                        <i class="las la-calendar mr-1"></i>
                        <span>{{ formatDate(sale.created_at) }}</span>
                    </div>
                </div>
                <div style="font-size:14px" class="d-flex align-items-center">
                    <i style="color:var(--orange-store);" class="las la-user-tie mr-1"></i>
                    <span>{{ sale.salesman.name }}</span>
                    <strong class="ml-1">{{ sale.comission_percent }}%</strong>
                </div>
                <div class="mt-3 d-flex align-items-center font--orange">
                    <i class="las la-dollar-sign fa-lg mr-1"></i>
                    <strong>Pagamento</strong>
                </div>
                <div style="font-size:14px; padding-left: 20px;" class="font--dark-gray">
                    <div>
                        <span>Método de pagamento: <strong>{{ sale.payment_method }}</strong></span>
                    </div>
                    <div class="d-flex justify-content-between mt-1">
                        <div class="d-flex flex-column">
                            <div>
                                <strong>Valor Total</strong>
                            </div>
                            <div class="font--green">
                                <strong>R$ {{ formatMoney(sale.total_value_in_cents / 100) }}</strong>
                            </div>
                        </div>
                        <div class="d-flex flex-column">
                            <div>
                                <strong>Valor já pago</strong>
                            </div>
                            <div class="font--blue">
                                <strong>R$ {{ formatMoney(sale.total_pay_in_cents / 100) }}</strong>
                            </div>
                        </div>
                        <div class="d-flex flex-column">
                            <div>
                                <strong>Valor pendente</strong>
                            </div>
                            <div class="font--red">
                                <strong>R$ {{ formatMoney(sale.still_pay_in_cents / 100) }}</strong>
                            </div>
                        </div>
                        <div class="d-flex flex-column">
                            <div>
                                <strong>Lucro</strong>
                            </div>
                            <div :class="[sale.profit > 0 ? 'font--green' : 'font--red']">
                                <strong>R$ {{ formatMoney(sale.profit / 100) }}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex mt-1">
                        <span>Útimo pagamento: <strong class="font--blue">R$
                                {{ formatMoney(sale.last_pay_in_cents / 100) }}</strong> em
                            <strong>{{ formatDate(sale.last_pay_at) }}</strong></span>
                    </div>
                </div>
                <div class="mt-3 d-flex align-items-center font--orange">
                    <i class="las la-shopping-bag fa-lg mr-1"></i>
                    <strong>Produtos</strong>
                </div>
                <div style="font-size:14px; padding-left: 20px;">
                    <div class="d-flex flex-column font--dark-gray">
                        <div>
                            <div v-for="p in sale.products">
                                <span><strong>{{ p.qty }}</strong> - {{ p.product }} {{ p.category }}</span>
                            </div>
                        </div>
                        <div class="ml-auto">
                            <span>Valor bruto: <strong>R$
                                    {{ formatMoney(sale.value_of_products_in_cents / 100) }}</strong></span>
                        </div>
                    </div>
                </div>
            </div>
            <ModalAddPayment ref="ModalAddPayment" />
        </template>
        <template v-slot:footer>
            <div class="d-flex">
                <Button v-if="sale && sale.still_pay_in_cents != 0" title="Adicionar pagamento" color="blue"
                    @action="addPayment()" class="mr-2" />
                <Button v-if="sale" title="Apagar venda" color="red" @action="deleteSale()" />
            </div>
        </template>
    </Modal>
</template>
<script>
import Modal from "@/components/Modal"
import * as SalesServices from '@/services/SalesServices'
import Button from '@/components/Buttons/Button'
import ModalAddPayment from './ModalAddPayment'

export default {
    name: "ModalInfoSale",
    components: { Modal, Button, ModalAddPayment },

    data() {
        return {
            sale: null,
            _resolve: null,
            _reject: null,
        }
    },

    methods: {
        formatDate(date) {
            moment.locale('PT-BR')
            return moment(date).format('ll')
        },
        formatMoney(value) {
            return Utils.formatMoney(value)
        },
        showModal(saleId) {
            var self = this;
            return new Promise((resolve, reject) => {
                self.sale = null;
                self.loadData(saleId)
                self._resolve = resolve;
                self._reject = reject;
                self.$refs.Modal.show();
            })
        },
        loadData(id) {
            var self = this;
            this.$refs.Modal.showLoading();
            SalesServices.getSale(id)
                .then(function (result) {
                    self.sale = result;
                    self.$refs.Modal.closeLoading();
                })

        },
        addPayment() {
            var self = this;
            this.$refs.ModalAddPayment.showModal(this.sale, this.sale.still_pay_in_cents)
                .then(function () {
                    self.loadData(self.sale.sale_id);
                    self._resolve();
                })
        },
        deleteSale() {
            var self = this;
            Utils.DialogConfirm("Deseja mesmo apagar esta venda?")
                .then(function () {
                    self.$refs.Modal.showLoading();
                    SalesServices.deleteSale(self.sale.sale_id)
                        .then(function (result) {
                            self.$refs.Modal.closeLoading();
                            self.$refs.Modal.hide();
                            self._resolve();
                            Utils.DialogSuccess("Venda apagada com sucesso!");
                        }).catch(function (err) {
                            self.$refs.Modal.closeLoading();
                            Utils.DialogError(err);
                        })
                })
        }
    }
}
</script>