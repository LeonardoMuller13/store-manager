<template>
    <div class="form-input-store">
        <strong class="form-title" v-if="title">{{ title }}</strong>
        <div class="form-group input-group emoji-picker-container">
            <div v-if="prefix" class="prefix">
                <span>{{ prefix }}</span>
            </div>
            <input :disabled="disable" :type="type" class="form-control form-control-store" :value="value"
                @input="handleInput" :placeholder="placeholder" @keyup.enter="updateModel()"
                :min="type == 'number' ? minNumber : false" :max="type == 'number' ? maxNumber : false">
            <div v-if="sufix" class="sufix">
                <span>{{ sufixData }}</span>
            </div>
        </div>
        <div v-if="info"><small v-bind:style="infoStyle()" v-on:click="infoPressed">{{ info }}</small></div>
    </div>
</div></template>
<script>
export default {
    name: 'FormInput',
    props: {
        value: '',
        placeholder: '',
        title: '',
        type: '',
        value: '',
        money: false,
        phone: false,
        cnpj: {
            default: false,
            type: Boolean,
        },
        cpf: {
            default: false,
            type: Boolean,
        },
        prefix: null,
        sufix: null,
        maxValue: null,
        minValue: null,
        disable: {
            default: false,
            type: Boolean
        },
        info: null,
        infoClick: {
            default: null,
            type: Function
        },
        minNumber: false,
        maxNumber: false,

    },
    data() {
        return {
            sufixData: null,
        }
    },
    mounted() {
        this.sufixData = this.sufix;
    },

    watch: {
        value: function () {
            this.changed();
        },
    },

    methods: {
        infoPressed() {
            if (this.infoClick != null)
                this.infoClick();
        },
        infoStyle() {
            if (this.infoClick != null) {
                return {
                    'cursor': 'pointer',
                    'color': 'var(--blue-robin)'
                }
            }
            return {};
        },
        handleInput(event) {
            if (this.money) {
                var value = Utils.formatMoney(event.target.value);
                if (this.maxValue != null && Utils.amountFromMoney(value) > this.maxValue) {
                    if (this.maxValue > 0)
                        value = Utils.formatMoney(this.maxValue);
                    else
                        value = Utils.formatMoney(0);
                }
                if (this.minValue != null && Utils.amountFromMoney(value) < this.minValue) {
                    if (this.minValue > 0)
                        value = Utils.formatMoney(this.minValue);
                    else
                        value = Utils.formatMoney(0);
                }
                this.$emit('input', value);
                $(event.target).val(value);
            } else if (this.phone) {
                var phone = Utils.formatPhone(event.target.value)
                this.$emit('input', phone);
                $(event.target).val(phone);
            }
            else if (this.cnpj && !this.cpf) {
                var cnpj = Utils.formatCnpj(event.target.value)
                this.$emit('input', cnpj);
                $(event.target).val(cnpj);
            }
            else if (this.cpf && !this.cnpj) {
                var cpf = Utils.formatCpf(event.target.value)
                this.$emit('input', cpf);
                $(event.target).val(cpf);
            }
            else if (this.cpf && this.cnpj) {
                var cpf = Utils.formatCnpjOrCpf(event.target.value)
                this.$emit('input', cpf);
                $(event.target).val(cpf);
            }
            else {
                this.$emit('input', event.target.value);
            }
        },
        updateModel() {
            this.$emit('updateModel');
        },
        changed() {
            this.$emit('changed');
        }
    },
}
</script>
<style>
.prefix {
    background-color: var(--gray-store);
    padding: 0.375rem 0.75rem;
    border-top-left-radius: 0.75rem;
    border-bottom-left-radius: 0.75rem;
    color: #fff;
    font-size: 0.8rem;
}

.sufix {
    background-color: var(--gray-store);
    padding: 0.375rem 0.75rem;
    border-top-right-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
    color: #fff;
    font-size: 0.8rem;
}

.form-input-store .form-group {
    margin-bottom: 0;
}</style>