<template>
    <Modal ref="Modal" :hideCallback="hideCallback">
        <template v-slot:header>
            <strong>Cadastro de venda</strong>
        </template>
        <template v-slot:body>
            <div class="form-content">
                <Input title="Nome do cliente" placeholder="Digite o nome do cliente" v-model="sale.client" type="text" />
                <Datepicker title="Data da venda" v-model="sale.created" format="DD/MM/YYYY" valueType="YYYY-MM-DD"
                    class="mt-2" />
                <div class="d-flex justify-content-left align-items-end flex-fill mt-3">
                    <Select title="Vendedor" :options="salesmanOptions" v-model="sale.salesman" />
                    <Input title="Porcentagem do vendedor" v-model="sale.salesmanPercent" prefix="%" type="number"
                        class="ml-2" />
                </div>
                <div class="d-flex flex-wrap flex-column mt-3">
                    <div class="d-flex flex-wrap mb-2">
                        <strong>Produtos</strong>
                        <Button icon="las la-plus" :outline="true" color="green" @action="addProduct()" class="ml-1" />
                    </div>
                    <div v-for="(product, p) in sale.products" class="ml-3">
                        <div class="d-flex flex-wrap align-items-end">
                            <Select title="Categoria" :options="categoriesOptions" v-model="product.category" />
                            <Select v-if="product.category" title="Produto" :options="productOptions(p)"
                                v-model="product.product" class="ml-2" />
                            <Input v-if="product.product" type="number" title="Qtd" v-model="product.qty" class="ml-2"
                                :minNumber="1" :maxNumber="productMaxQty(p)" />
                            <Input v-if="product.qty" prefix="R$" :money="true" title="Valor" v-model="product.value" class="ml-2" disable  />
                            <div>
                                <Button icon="las la-times" color="red" :outline="true" @action="removeProduct(p)"
                                    class="ml-1" />
                            </div>

                        </div>
                        <hr>
                    </div>
                </div>
                <div class="d-flex flex-wrap flex-column mt-3" v-if="sale.products.length">
                    <strong>Pagamento</strong>
                    <div class="ml-3 mt-1">
                        <Select title="Método de pagamento" :options="paymentOptions" v-model="sale.paymentMethod" />
                    </div>
                    <div class="d-flex flex-wrap mt-2 ml-3">
                        <Input title="Valor total" v-model="sale.totalValue" prefix="R$" :money="true" class="mr-1" />
                        <Input title="Valor pago" v-model="sale.totalPayed" prefix="R$" :money="true" class="ml-1" />
                    </div>
                </div>
            </div>
        </template>
        <template v-slot:footer>
            <Button title="Salvar" color="green" @action="save()" />
        </template>
    </Modal>
</template>
<script>
import Modal from "@/components/Modal"
import * as SalesServices from '@/services/SalesServices'
import Input from '@/components/Form/Input'
import Select from '@/components/Form/Select'
import Button from '@/components/Buttons/Button'
import Datepicker from '@/components/Form/Datepicker'

export default {
    name: "ModalNewSale",
    components: { Modal, Input, Select, Button, Datepicker },

    data() {
        return {
            sale: {
                client: null,
                cratead: moment().format('YYYY-MM-DD'),
                salesman: null,
                salesmanPercent: 0,
                paymentMethod: null,
                totalValue: this.totalValue,
                totalPayed: Utils.formatMoney(0),
                products: [],
                productsValue: Utils.formatMoney(0),
            },
            salesmanOptions: [new Utils.FormSelectOptions("Escolha um vendedor", null)],
            paymentOptions: [
                new Utils.FormSelectOptions("Escolha um método de pagamento", null),
                new Utils.FormSelectOptions("Dinheiro", "Dinheiro"),
                new Utils.FormSelectOptions("Cartão", "Cartão"),
                new Utils.FormSelectOptions("Boleto", "Boleto"),
                new Utils.FormSelectOptions("Conta", "Conta"),
                new Utils.FormSelectOptions("Cheque", "Cheque"),
            ],
            _categoriesOptions: [],
            _resolve: null,
            _reject: null,
            edited: false,
        }
    },

    mounted() {
        this.loadSalesman();
        this.loadCategories();
    },
    watch:{
        sale: {
            deep: true,
            handler: () => {
                
            }
        }
    },
    computed: {
        categoriesOptions: function () {
            var categories = [new Utils.FormSelectOptions("Selecione uma categoria", '')];
            for (var i = 0; i < this._categoriesOptions.length; i++) {
                categories.push(new Utils.FormSelectOptions(this._categoriesOptions[i].name, this._categoriesOptions[i].name));
            }
            return categories;
        },
        totalValue: function () {
            var value = 0;
            this.products.forEach((product) => {
                value += product.value;
            })
            return Utils.formatMoney(value);
        }
    },
    watch: {
        sale: {
            handler: function () {
                this.edited = true;
            },
            deep: true
        },
    },

    methods: {
        formatDate(date) {
            moment.locale('PT-BR');
            return moment(date).format('ll')
        },
        formatMoney(value) {
            return Utils.formatMoney(value)
        },
        showModal() {
            this.clear();
            return new Promise((resolve, reject) => {
                this._resolve = resolve;
                this._reject = reject;
                this.$refs.Modal.show();
            })
        },

        loadSalesman() {
            var self = this;
            SalesServices.getSalesman()
                .then(function (result) {
                    for (var i = 0; i < result.length; i++) {
                        self.salesmanOptions.push(new Utils.FormSelectOptions(result[i].name, result[i].id));
                    }
                    self.$refs.Modal.closeLoading();
                })
        },
        loadCategories() {
            var self = this;
            SalesServices.getProducts()
                .then(function (result) {
                    self._categoriesOptions = result;
                    self.$refs.Modal.closeLoading();
                })
        },
        addProduct() {
            this.sale.products.push({
                "category": '',
                "product": '',
                "qty": null
            });
        },
        removeProduct(index) {
            this.sale.products.splice(index, 1);
        },
        productOptions(index) {
            var productOptions = [];
            var indexCategory = null;
            for (var i = 0; i < this.categoriesOptions.length; i++) {
                if (this.categoriesOptions[i].value == this.sale.products[index].category)
                    indexCategory = i - 1;
            }
            for (var i = 0; i < this._categoriesOptions[indexCategory].products.length; i++) {
                var product = this._categoriesOptions[indexCategory].products[i];
                productOptions.push(new Utils.FormSelectOptions(product.name, product.name));
            }
            if (productOptions.length == 0) {
                return [new Utils.FormSelectOptions('Nenhum produto encontrado', '')];
            } else {
                productOptions.unshift(new Utils.FormSelectOptions('Selecione um produto', ''))
            }
            return productOptions;
        },
        productMaxQty(index) {
            const product = this.searchProductByIndex(index);
            return product.qty;
        },
        searchProductByIndex(index) {
            var indexCategory = null;
            for (var i = 0; i < this.categoriesOptions.length; i++) {
                if (this.categoriesOptions[i].value == this.sale.products[index].category)
                    indexCategory = i - 1;
            }
            for (var i = 0; i < this._categoriesOptions[indexCategory].products.length; i++) {
                var product = this._categoriesOptions[indexCategory].products[i];
                return product;
            }
        },
        save() {
            var self = this;
            this.$refs.Modal.showLoading();
            SalesServices.saveSale(this.sale)
                .then(function (result) {
                    self.$refs.Modal.closeLoading();
                    self.edited = false;
                    self.$refs.Modal.hide();
                    self._resolve()
                })
                .catch(function (err) {
                    Utils.DialogError(err);
                    self.$refs.Modal.closeLoading();
                })
        },
        clear() {
            var self = this;
            this.sale = {
                client: null,
                created: moment().format('YYYY-MM-DD'),
                salesman: null,
                salesmanPercent: 0,
                paymentMethod: null,
                totalValue: Utils.formatMoney(0),
                totalPayed: Utils.formatMoney(0),
                products: [],
                productsValue: Utils.formatMoney(0),
            };
            this.$nextTick(() => {
                self.edited = false;
            });
        },
        hideCallback() {
            var self = this;
            return new Promise((resolve, reject) => {
                if (self.edited) {
                    Utils.DialogConfirm('Você não salvou suas alterações, deseja sair sem salvar?').then(function () {
                        resolve();
                    })
                } else {
                    resolve();
                }
            });
        },
    }
}
</script>