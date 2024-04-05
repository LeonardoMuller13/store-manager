<template>
    <Bar ref="canvas" :data="chartData" :options="chartOptions" :chart-id="chart_id" />
</template>
  
<script>
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
    name: 'BarChart',
    components: { Bar },
    props: {
        chart_id: {
            type: String,
            default: "",
        },
        title: {
            type: String,
            default: "",
        },
        money: {
            type: Boolean,
            default: false,
        }
    },
    data() {
        return {
            chartData: {
                labels: [],
                datasets: [
                ]
            },
            chartOptions: {},
            tooltips: [],
        }
    },

    methods: {
        renderChart(areas = []) {
            var self = this;
            var _datasets = [];
            var values;
            var keys;
            var dataset;
            var labels = {};
            var gradient;
            var y;
            this.tooltips = [];

            for (var i = 0; i < areas.length; i++) {
                const color = areas[i].color;
                dataset = {
                    label: areas[i].name,
                    borderColor: color,
                    borderWidth: 2,
                    pointBackgroundColor: "white",
                    pointBorderColor: "white",
                    backgroundColor: (ctx) => {
                        const canvas = ctx.chart.ctx;
                        const gradient = canvas.createLinearGradient(0, 0, 0, 450);
                        gradient.addColorStop(0, color);
                        gradient.addColorStop(0.5, color + "88");
                        return gradient;
                    },
                };

                values = areas[i].data;
                keys = Object.keys(values);
                y = [];
                for (var j = 0; j < keys.length; j++) {
                    labels[keys[j]] = 0;
                    y.push(values[keys[j]]);
                }

                dataset['data'] = y;

                _datasets.push(dataset);

                this.tooltips.push(areas[i].tooltip);
            }

            this.chartData = {
                labels: Object.keys(labels),
                datasets: _datasets
            };

            this.chartOptions =
            {
                responsive: true,
                layout: {
                    padding: {
                        left: 50,
                        right: 50,
                        top: 0,
                        bottom: 0,
                    },
                },
                maintainAspectRatio: true,
                scales: {
                    y: {
                        ticks: {
                            callback: (value, index, values) => {
                                if (self.money) {
                                    return `${value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
                                } else {
                                    return value;
                                }

                            },
                            font: {
                                family: 'Quicksand'
                            },
                            color: '#7A7C85',
                            min: 0,
                        },
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Quicksand'
                            },
                            color: '#7A7C85'
                        },
                    },
                },
                plugins: {
                    title: {
                        text: this.title,
                        display: true,
                        font: {
                            weight: 'bold',
                            family: 'Quicksand',
                            size: 28
                        },
                        position: 'top',
                        color: '#7A7C85'
                    },
                    legend: {
                        display: true,
                        align: 'center',
                        labels: {
                            font: {
                                family: 'Quicksand',
                                weight: 'bold',
                                size: 14
                            },
                            color: '#7A7C85'
                        },
                    },
                    tooltip: {
                        callbacks: {
                            title: function (context) {
                                return context[0].dataset.label;
                            },
                            afterTitle: function (context) {
                                if (self.tooltips.length > 1) {
                                    const label = context[0].label;
                                    return label;
                                } else {
                                    return '';
                                }

                            },
                            label: function (context) {
                                return `${self.tooltips[context.datasetIndex]}`;

                            },
                            labelTextColor: function (context) {
                                return '#8C34EA';
                            }
                        },
                        backgroundColor: "#FFF",
                        borderWidth: 3,
                        borderColor: '#ffa6022e',
                        titleFont: {
                            weight: 'bold',
                            family: 'Quicksand',
                            size: 16
                        },
                        titleColor: '#7A7C85',
                        displayColors: false,
                        bodyColor: "#7A7C85",
                        bodyFont: {
                            size: 21,
                            family: 'Quicksand',
                            weight: 'bold',
                        },
                    },
                }
            };
        },
    }
}
</script>