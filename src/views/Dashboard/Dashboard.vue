<template>
    <div>
        <span class="page-title">Dashboard</span>
        <Datepicker v-model="date" value-type="YYYY-MM-DD HH:mm:ss" lang="pt-br" format="MMM/YYYY" type="month"
            @updateModel="loadData()" />
        <div class="mb-5">
            <ChartBar title="Comparação dos vendedores" chart_id="salesmanChartDashboard" ref="ChartConsultBars"
                style="width: 100%; max-height: 400px" class="mt-2" :money="true" />
        </div>
        <div>
            <div class="d-flex mb-4 justify-content-center align-items-center" style="font-size: 28px;">
                <i class="las la-trophy fa-2x font--yellow"></i>
                <strong class="font--dark-gray">Top 3 produtos mais vendidos</strong>
            </div>
            <div>
                <transition-group tag="div" name="slide-fade" mode="out-in">
                    <div :key="index" v-for="(product, index) in mostPopularProducts" class="card card-store mx-auto my-2 w-50">
                        <div class="card-body">
                            <div class="d-flex justify-content-center align-items-center">
                                <div class="col-2 d-flex">
                                    <strong class="mx-auto font--dark-gray" style="font-size: 24px">{{ index + 1 }} º
                                    </strong>
                                </div>
                                <div class="col-10 d-flex align-items-center">
                                    <div class="col-6">
                                        <strong class="font--orange" style="font-size: 24px">{{ product.title }}</strong>
                                    </div>
                                    <div class="col-6 text-right">
                                        <strong class="font--gray ml-4">{{ product.qty }} vendidos</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </transition-group>
            </div>
        </div>
    </div>
</template>
<script>
import Datepicker from '@/components/Form/Datepicker.vue';
import * as DashboardServices from '@/services/DashboardServices'
import moment from 'moment';
import ChartBar from '@/components/ChartBar.vue'

export default {
    name: "Dashboard",
    components: { Datepicker, ChartBar },

    data() {
        return {
            date: moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
            mostPopularProducts: [],
        };
    },
    mounted() {
        this.loadData();
        moment.locale("PT-BR");
    },
    methods: {
        loadData() {
            var self = this;
            var data = []
            Utils.showLoading();
            DashboardServices.loadSales(this.date).then((result) => {
                var salesman = self.getGroupBySalesman(result);
                // dataChart.labels.push(`Vendas ${moment(self.date).format('MMM/YYYY')}`);
                var index = 0;
                for (const _salesman in salesman) {
                    const color = Utils.randomColor(index);
                    const _data = [];
                    const total = self.getTotalValue(salesman[_salesman]);
                    _data[moment(self.date).format('MMM/YYYY')] = total;
                    data.push({
                        'data': _data,
                        'name': _salesman,
                        'color': color,
                        'tooltip': `Total de vendas: R$${Utils.formatMoney(total)}`
                    })
                    index++;
                }
                Utils.closeLoading();
                self.setMostPopularProduct(result);
                self.$nextTick(function () {
                    self.$refs.ChartConsultBars.renderChart(data);
                })

            });
        },
        getGroupBySalesman(sales) {
            var result = sales.reduce((x, y) => {
                (x[y.salesman.name] = x[y.salesman.name] || []).push(y);
                return x;
            }, {});
            return result;

        },
        getTotalValue(sales) {
            var result = sales.reduce((x, y) => {
                return x + parseFloat(y.total);
            }, 0);
            return result;
        },
        setMostPopularProduct(sales) {
            this.mostPopularProducts = [];
            var products = [];
            sales.forEach(sale => {
                sale.products.forEach(product => {
                    const title = `${product.product} ${product.category}`;
                    if (products[title] !== undefined) {
                        products[title] = products[title] + parseInt(product.qty);
                    } else {
                        products[title] = parseInt(product.qty);
                    }
                })
            });
            if (Object.entries(products).length > 0) {
                const productsSortable = Object.entries(products).sort(([, a], [, b]) => b - a);
                for (let index = 0; index < 3; index++) {
                    const element = productsSortable[index];
                    this.mostPopularProducts.push({
                        title: productsSortable[index][0],
                        qty: productsSortable[index][1]
                    });
                }
            }
        }
    },
}
</script>