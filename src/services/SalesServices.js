import { collection, doc, query, where, getDoc, getDocs, setDoc, deleteDoc, orderBy, Timestamp, increment, updateDoc, startAt, startAfter, limit } from "firebase/firestore";
import { db } from '@/database/firebase';
import { jsPDF } from "jspdf";
import logo from '@/assets/logo.png'
import autoTable from 'jspdf-autotable';
import FontQuicksand from '@/assets/fonts/Quicksand/Quicksand-Medium.ttf'


export function loadSales(page = 1, pageSize = 10, filter) {
    return new Promise((resolve, reject) => {
        loadSalesAsync(page, pageSize, filter).then(function (result) {
            resolve(result);
        })
    })
}

function loadSalesAsync(page, pageSize, filter) {
    return new Promise((resolve, reject) => {
        const sales = [];
        const limitFirst = page == 1 ? pageSize : (page - 1) * pageSize;
        var filterQuery = [where('created_at', '!=', null)];
        var orderByQuery = orderBy('created_at', 'desc');
        if (filter.date && filter.date.length != 0 && filter.date[0] != null) {
            if (filter.date[0] == filter.date[1]) {
                filterQuery = [where('created_at', '==', Timestamp.fromDate(formatToDate(filter.date[0])))];
                orderByQuery = orderBy('client', 'asc');
            } else {
                filterQuery = [
                    where('created_at', '>=', Timestamp.fromDate(formatToDate(filter.date[0]))),
                    where('created_at', '<', Timestamp.fromDate(formatToDate(filter.date[1])))
                ];
            }
        }
        if (filter.client != null && filter.client != '' && filter.client != ' ') {
            filterQuery.push(where('client', '==', filter.client));
            if (filter.date && filter.date.length != 0 && filter.date[0] != null) {
                if (filter.date[0] == filter.date[1]) {
                    orderByQuery = orderBy('total_value_in_cents', 'desc');
                }
            }
        }
        const first = query(collection(db, "sales"), orderByQuery, limit(limitFirst), ...filterQuery);
        getDocs(first).then(function (documentSnapshots) {
            var lastVisible = documentSnapshots.docs[0]
            if (lastVisible) {
                var start = startAt(lastVisible);
                if (page != 1) {
                    lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
                    start = startAfter(lastVisible);
                }
                filterQuery.push(start)
            }

            const q = query(collection(db, "sales"), orderByQuery, limit(pageSize), ...filterQuery);
            getDocs(q).then(function (result) {
                var i = 0;
                var salesman = [];
                result.forEach(doc => {
                    salesman[i] = Promise.resolve(loadSalesman(doc.data().salesman));
                    const data = {
                        'sale_id': doc.id,
                        'client_name': doc.data().client,
                        'created_at': doc.data().created_at.toDate(),
                        'total': Utils.formatMoney(doc.data().total_value_in_cents / 100),
                        'still_pay': doc.data().still_pay_in_cents > 0 ? true : false,
                        'payment_method': doc.data().payment_method,
                    }
                    sales.push(data);
                    i++;
                })
                Promise.all(salesman).then(function (values) {
                    for (var i = 0; i < sales.length; i++) {
                        sales[i].salesman = values[i];
                    }
                    resolve(sales);
                })
            });
        })
    })
}

export function getSale(id) {
    return new Promise((resolve, reject) => {
        const sales = loadSaleAsync(id);
        resolve(sales);
    })

}

async function loadSaleAsync(id) {
    const docRef = doc(db, "sales", id);
    let result = await Promise.resolve(getDoc(docRef))
    const sale = {
        'sale_id': result.id,
        'client_name': result.data().client,
        'created_at': result.data().created_at.toDate(),
        'update_at': result.data().update_at.toDate(),
        'total_value_in_cents': result.data().total_value_in_cents,
        'salesman': await loadSalesmanAsync(result.data().salesman),
        'still_pay_in_cents': result.data().still_pay_in_cents,
        'total_pay_in_cents': result.data().total_pay_in_cents,
        'value_of_products_in_cents': result.data().value_of_products_in_cents,
        'last_pay_at': result.data().last_pay_at.toDate(),
        'last_pay_in_cents': result.data().last_pay_in_cents,
        'products': result.data().products,
        'payment_method': result.data().payment_method,
        'comission_percent': result.data().comission_percent,
        'profit': result.data().comission_percent == 100 ? result.data().total_pay_in_cents - result.data().value_of_products_in_cents : ((result.data().total_pay_in_cents) - (result.data().total_pay_in_cents * (result.data().comission_percent / 100)) - result.data().value_of_products_in_cents),
    }

    return sale;
}

function loadSalesman(docSalesman) {
    return new Promise((resolve, reject) => {
        const q = query(docSalesman);
        getDoc(q).then(function (result) {
            resolve({ id: result.id, name: result.data().full_name })
        })
    })
}
async function loadSalesmanAsync(docSalesman) {
    var salesman = null;
    const q = query(docSalesman);
    let result = await (getDoc(q))
    return { id: result.id, name: result.data().full_name };
}

export function getSalesman() {
    return new Promise((resolve, reject) => {
        const salesman = getSalesmanAsync();
        resolve(salesman);
    })

}

async function getSalesmanAsync() {
    const salesman = [];
    const q = query(collection(db, "employees"), where('deleted_at', '==', null), orderBy('full_name', 'asc'));
    let result = await Promise.resolve(getDocs(q))
    result.forEach(async doc => {
        const data = {
            id: doc.id,
            name: doc.data().full_name
        };
        salesman.push(data);
    })

    return salesman;

}

export function getProducts() {
    return new Promise((resolve, reject) => {
        const categories = loadCategoriesAsync();
        resolve(categories);
    })

}

async function loadCategoriesAsync() {
    const categories = [];
    const q = query(collection(db, "categories"));
    let result = await Promise.resolve(getDocs(q))
    result.forEach(async doc => {
        const data = {
            'category_id': doc.id,
            'name': doc.data().name,
            'products': await loadProducts(doc.id),
        }
        categories.push(data);
    })
    return categories;

}

async function loadProducts(category_id) {
    var products = [];
    var q = query(collection(db, "categories/" + category_id + "/products"));
    var result = await getDocs(q)
    result.forEach(doc => {
        var data = {
            'product_id': doc.id,
            'name': doc.data().name,
            'qty': doc.data().qty,
            'price': doc.data().price_shop,
            'gross_value': doc.data().gross_value
        }
        products.push(data);
    })
    return products;
}

export function saveSale(sale) {
    return new Promise((resolve, reject) => {
        const id = Utils.generateId();
        setDoc(doc(db, "sales", id), {
            client: sale.client,
            created_at: Timestamp.fromDate(formatToDate(sale.created)),
            update_at: Timestamp.fromDate(formatToDate()),
            total_value_in_cents: formatToCents(sale.totalValue),
            salesman: doc(db, "employees", sale.salesman),
            still_pay_in_cents: formatToCents(sale.totalValue) - formatToCents(sale.totalPayed),
            total_pay_in_cents: formatToCents(sale.totalPayed),
            value_of_products_in_cents: formatToCents(sale.productsValue),
            last_pay_at: Timestamp.fromDate(formatToDate(sale.created)),
            last_pay_in_cents: formatToCents(sale.totalPayed),
            products: sale.products,
            payment_method: sale.paymentMethod,
            comission_percent: parseInt(sale.salesmanPercent),
        }).then(() => {
            sale.sale_id = id;
            if (formatToCents(sale.totalPayed) > 0) {
                addToBilling(sale, sale.created, sale.totalPayed, sale.paymentMethod)
                    .then(function () {
                        resolve(sale);
                    });
            } else {
                resolve(sale);
            }

        })
            .catch((err) => {
                reject(err);
            });

    })
}

export function addPayment(sale, value, date, paymentMethod) {
    return new Promise((resolve, reject) => {
        updateDoc(doc(db, "sales", sale.sale_id), {
            update_at: Timestamp.fromDate(formatToDate(date)),
            still_pay_in_cents: increment(-formatToCents(value)),
            total_pay_in_cents: increment(formatToCents(value)),
            last_pay_at: Timestamp.fromDate(formatToDate(date)),
            last_pay_in_cents: formatToCents(value),
        }).then(() => {
            sale.salesman = sale.salesman.id;
            sale.client = sale.client_name;
            sale.salesmanPercent = sale.comission_percent;
            addToBilling(sale, date, value, paymentMethod)
                .then(function () {
                    resolve();
                });

        })
            .catch(() => {
                reject(err);
            });
    })
}
function addToBilling(sale, date, paymentValue, paymentMethod) {
    return new Promise((resolve, reject) => {
        const id = Utils.generateId();
        setDoc(doc(db, "billing", id), {
            client: sale.client,
            created_at: Timestamp.fromDate(formatToDate(date)),
            payment_value_in_cents: formatToCents(paymentValue),
            salesman: doc(db, "employees", sale.salesman),
            comission_percent: parseInt(sale.salesmanPercent),
            sale: doc(db, "sales", sale.sale_id),
            payment_method: paymentMethod,
            is_salon: false,
        }).then(() => {
            resolve();
        })
            .catch(() => {
                reject(err);
            });

    })
}

export function deleteSale(id) {
    return new Promise((resolve, reject) => {
        verifyHasBilling(id).then(function (result) {
            deleteDoc(doc(db, "billing", result))
                .then(() => {
                    deleteDoc(doc(db, "sales", id))
                        .then(() => {
                            resolve();
                        });
                });
        }).catch(function (billings) {
            if (billings > 1) {
                reject("Essa venda não pode ser apagada, devido ao número de pagamentos");
                return '';
            } else {
                deleteDoc(doc(db, "sales", id))
                    .then(() => {
                        resolve();
                    });
            }

        })
    })
}

function verifyHasBilling(saleId) {
    return new Promise((resolve, reject) => {
        const billing = [];
        const q = query(collection(db, "billing"), where('sale', '==', doc(db, 'sales/' + saleId)));
        getDocs(q).then(function (result) {
            result.forEach(doc => {
                billing.push(doc.id)
            })
            if (billing.length != 1) {
                reject(billing.length);
            } else {
                resolve(billing[0]);
            }
        }).catch(function (err) {
            console.log(err);
            return false;
        });
    })
}

function formatToCents(value) {
    return parseInt(value.replace(/[^0-9]/g, ''));
}

function formatToDate(date) {
    moment.locale('PT-BR');
    return moment(date).toDate();
}

export function exportSales(date) {
    const sales = [];
    var filterQuery = [where('created_at', '!=', null)];
    var orderByQuery = orderBy('created_at', 'asc');
    if (date && date.length != 0 && date[0] != null) {
        if (date[0] == date[1]) {
            filterQuery = [where('created_at', '==', Timestamp.fromDate(formatToDate(date[0])))];
            orderByQuery = orderBy('client', 'asc');
        } else {
            filterQuery = [
                where('created_at', '>=', Timestamp.fromDate(formatToDate(date[0]))),
                where('created_at', '<', Timestamp.fromDate(formatToDate(date[1])))
            ];
        }
    }
    const q = query(collection(db, "sales"), orderByQuery, ...filterQuery);
    getDocs(q).then(function (result) {
        var i = 0;
        var salesman = [];
        var totalPayed = 0;
        var totalStill = 0;
        var totalValue = 0;
        var totalValueProducts = 0;
        result.forEach(doc => {
            salesman[i] = Promise.resolve(loadSalesman(doc.data().salesman));
            const data = {
                'sale_id': doc.id,
                'client_name': doc.data().client,
                'created_at': doc.data().created_at.toDate(),
                'total': Utils.formatMoney(doc.data().total_value_in_cents / 100),
                'total_pay': Utils.formatMoney(doc.data().total_pay_in_cents / 100),
                'still_pay': Utils.formatMoney(doc.data().still_pay_in_cents / 100),
                'payment_method': doc.data().payment_method,
                'products': doc.data().products,
                'value_of_products': Utils.formatMoney(doc.data().value_of_products_in_cents / 100),
                'comission_percent': doc.data().comission_percent,
            }
            sales.push(data);
            i++;
            totalPayed += doc.data().total_pay_in_cents;
            totalStill += doc.data().still_pay_in_cents;
            totalValue += doc.data().total_value_in_cents;
            totalValueProducts += doc.data().value_of_products_in_cents;
        })
        Promise.all(salesman).then(function (values) {
            for (var i = 0; i < sales.length; i++) {
                sales[i].salesman = values[i];
            }
            printSales(sales, date, totalPayed / 100, totalStill / 100, totalValue / 100, totalValueProducts / 100);
        })
    });
}

function printSales(sales, date, totalPayed, totalStill, totalValue, totalProducts) {
    var doc = new jsPDF('l', 'mm', [210, 350]);
    var img = new Image();
    var titlePage = 'Vendas - ' + moment(date[0]).format('DD/MM/YYYY') + ' ~ ' + moment(date[1]).format('DD/MM/YYYY');
    img.src = logo;
    doc.addImage(img, 'png', 10, 10, 72, 42);
    doc.text(titlePage, 80, 10);
    const headers = ['Cliente', 'Data', 'Produtos', 'Pagamento', 'Vendedor', 'Comissão', 'Valor pago', 'Valor pendente', 'Valor bruto', 'Valor total'];
    var body = [];
    var products = '';
    for (var i = 0; i < sales.length; i++) {
        products = '';
        for (var j = 0; j < sales[i].products.length; j++) {
            products += sales[i].products[j].qty + ' - ' + sales[i].products[j].product + ' / ' + sales[i].products[j].category;
            if (j < sales[i].products.length - 1) {
                products += '\n';
            }
        }
        body.push([
            sales[i].client_name,
            moment(sales[i].created_at).format('DD/MM/YYYY'),
            products,
            sales[i].payment_method ? sales[i].payment_method : '-',
            sales[i].salesman.name,
            sales[i].comission_percent + '%',
            'R$ ' + sales[i].total_pay,
            'R$ ' + sales[i].still_pay,
            'R$ ' + sales[i].value_of_products,
            'R$ ' + sales[i].total,
        ])
    }
    var footer = ['Total',
        '',
        '',
        '',
        '',
        '',
        'R$ ' + Utils.formatMoney(totalPayed),
        'R$ ' + Utils.formatMoney(totalStill),
        'R$ ' + Utils.formatMoney(totalProducts),
        'R$ ' + Utils.formatMoney(totalValue)
    ];

    autoTable(doc, {
        styles: { fillColor: [255, 233, 201] },
        headStyles: { halign: 'center', valign: 'middle', textColor: [0, 0, 0] },
        footStyles: { halign: 'center', valign: 'middle', textColor: [0, 0, 0] },
        columnStyles: {
            0: { valign: 'middle', minCellWidth: 30 },
            1: { halign: 'center', valign: 'middle', },
            2: { halign: 'left', valign: 'middle', cellPadding: 5 },
            3: { halign: 'center', valign: 'middle', },
            4: { halign: 'center', valign: 'middle', },
            5: { halign: 'center', valign: 'middle', },
            6: { halign: 'center', valign: 'middle', minCellWidth: 30 },
            7: { halign: 'center', valign: 'middle', minCellWidth: 30 },
            8: { halign: 'center', valign: 'middle', minCellWidth: 30 },
            9: { halign: 'center', valign: 'middle', minCellWidth: 30 }
        },
        head: [headers],
        body: body,
        foot: [footer],
        startY: 60,
        showFoot: 'lastPage',
    })
    doc.save('Relatorio_de_Vendas_' + moment(date[0]).format('DD-MM-YYYY') + '_' + moment(date[0]).format('DD-MM-YYYY'));
}
