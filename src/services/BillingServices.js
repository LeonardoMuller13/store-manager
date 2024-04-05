import { collection, doc, query, where, getDoc, getDocs, setDoc, deleteDoc, orderBy, Timestamp, increment, updateDoc, startAt, startAfter, limit } from "firebase/firestore";
import { db } from '@/database/firebase';
import { jsPDF } from "jspdf";
import logo from '@/assets/logo.png'
import autoTable from 'jspdf-autotable';
import FontQuicksand from '@/assets/fonts/Quicksand/Quicksand-Medium.ttf'

export function loadBilling(page = 1, pageSize = 10, date){
	return new Promise((resolve, reject)=>{
		loadBillingAsync(page, pageSize, date).then(function(result){
			resolve(result);
		})
	})
}

function loadBillingAsync(page, pageSize, date){
	return new Promise((resolve, reject)=>{
		const billing = [];
		const limitFirst = page == 1 ? pageSize : (page -1) * pageSize;
		var addMonth = moment(date).add(1, 'month').format('YYYY-MM');
		var filterQuery = [
		where('created_at', '>=', Timestamp.fromDate(formatToDate(date))),
		where('created_at', '<', Timestamp.fromDate(formatToDate(addMonth)))
		];
		var startQuery = [];
		var orderQuery = orderBy('created_at','desc');
		const first = query(collection(db, "billing"), orderBy('created_at','desc'), limit(limitFirst), ...filterQuery);
		getDocs(first).then(function(documentSnapshots){
			var lastVisible = documentSnapshots.docs[0]
			if(lastVisible){
				var start = startAt(lastVisible);
				if(page != 1){
					lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
					start = startAfter(lastVisible);
				}
				startQuery.push(start)
			}
			const q = query(collection(db, "billing"), orderQuery,limit(pageSize), ...filterQuery, ...startQuery);
			getDocs(q).then(function(result){
				var i = 0;
				var salesman = [];
				var sale = [];
				result.forEach(doc => {
					salesman[i] = Promise.resolve(loadSalesman(doc.data().salesman));
					sale[i] = Promise.resolve(loadSale(doc.data().sale ? doc.data().sale : doc.data().salon));
					const data = {
						'billing_id': doc.id,
						'client_name': doc.data().client,
						'created_at': doc.data().created_at.toDate(),
						'payment_value': Utils.formatMoney(doc.data().payment_value_in_cents/100),
						'comission': doc.data().comission_percent,
						'payment_method':doc.data().payment_method,
					}
					billing.push(data);
					i++;
				})
				Promise.all(salesman).then(function(values){
					for (var i = 0; i < billing.length; i++) {
						billing[i].salesman = values[i];
					}
					Promise.all(sale).then(function(values){
						for (var i = 0; i < billing.length; i++) {
							billing[i].sale_id = values[i] ? values[i].id : '';
						}
						sumValueTotal(filterQuery, orderQuery).then(function(total){
							sumValueTotalProducts(filterQuery, orderQuery).then(function(totalProducts){
								sumValueTotalExpenses(filterQuery, orderQuery).then(function(totalExpenses){
									sumValueTotalExpensesSalesman(filterQuery, orderQuery).then(function(totalExpensesSalesman){
										sumValueTotalDiscountsSalesman(filterQuery, orderQuery).then(function(totalDiscountsSalesman){
											resolve({
												'billing':billing, 
												'totalValue': total, 
												'totalProducts': totalProducts,
												'totalExpenses': totalExpenses + totalExpensesSalesman - totalDiscountsSalesman,
											})
										});
									});
								})
							})
						})
					})
					
				})			
			});	
		})
	})
}

function loadSalesman(docSalesman){
	return new Promise((resolve,reject)=>{
		if(!docSalesman){
			resolve();
		}
		const q = query(docSalesman);
		getDoc(q).then(function(result){
			resolve({id: result.id, name: result.data().full_name})
		})
	})
}
function loadSale(docSale){
	return new Promise((resolve,reject)=>{
		if(!docSale){
			resolve();
		}
		const q = query(docSale);
		getDoc(q).then(function(result){
			resolve({id: result.id})
		})
	})
}

function sumValueTotal(filterQuery, orderQuery){
	return new Promise((resolve, reject)=>{
		const q = query(collection(db, "billing"), orderQuery, ...filterQuery);
		getDocs(q).then(function(result){
			var total = 0;
			result.forEach(doc => {
				total += doc.data().payment_value_in_cents;
			})
			resolve(total/100);			
		});	
	})
}

function sumValueSalesmanTotal(filterQuery, orderQuery){
	return new Promise((resolve, reject)=>{
		const q = query(collection(db, "billing"), orderQuery, ...filterQuery);
		getDocs(q).then(function(result){
			var total = 0;
			result.forEach(doc => {
				total += (doc.data().payment_value_in_cents * doc.data().comission_percent)/100;
			})
			resolve(total/100);			
		});	
	})
}

function sumValueTotalProducts(filterQuery, orderQuery){
	return new Promise((resolve, reject)=>{
		const q = query(collection(db, "sales"), orderQuery, ...filterQuery);
		getDocs(q).then(function(result){
			var total = 0;
			result.forEach(doc => {
				total += doc.data().value_of_products_in_cents;
			})
			resolve(total/100);			
		});	
	})
}

function sumValueTotalExpenses(filterQuery, orderQuery){
	return new Promise((resolve, reject)=>{
		const q = query(collection(db, "expenses"), orderQuery, ...filterQuery);
		getDocs(q).then(function(result){
			var total = 0;
			result.forEach(doc => {
				total += doc.data().value_in_cents;
			})
			resolve(total/100);			
		});	
	})
}
function sumValueTotalExpensesSalesman(filterQuery, orderQuery){
	return new Promise((resolve, reject)=>{
		const q = query(collection(db, "expensesSalesman"), orderQuery, ...filterQuery);
		getDocs(q).then(function(result){
			var total = 0;
			result.forEach(doc => {
				total += doc.data().value_in_cents;
			})
			resolve(total/100);			
		});	
	})
}
function sumValueTotalDiscountsSalesman(filterQuery, orderQuery){
	return new Promise((resolve, reject)=>{
		const q = query(collection(db, "discountsSalesman"), orderQuery, ...filterQuery);
		getDocs(q).then(function(result){
			var total = 0;
			result.forEach(doc => {
				total += doc.data().value_in_cents;
			})
			resolve(total/100);			
		});	
	})
}

export function getSalesman(){
	return new Promise((resolve, reject)=>{
		const salesman = getSalesmanAsync();
		resolve(salesman);
	})

}

async function getSalesmanAsync(){
	const salesman = [];
	const q = query(collection(db, "employees"), orderBy('full_name','asc'));
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

export function loadBillingSalesman(salesman, date){
	return new Promise((resolve, reject)=>{
		loadBillingSalesmanAsync(salesman, date).then(function(result){
			resolve(result);
		}).catch(function(error){
			reject(error)
		})
	})
}

function loadBillingSalesmanAsync(salesman, date){
	return new Promise((resolve, reject)=>{
		const billing = [];
		if(salesman == null){
			reject("Por favor, selecione um vendedor");
			return;
		}
		if(date.length == 0){
			reject("Por favor, selecione uma data");
			return;
		}
		var filterQuery = [
		where('created_at', '>=', Timestamp.fromDate(formatToDate(date[0]))),
		where('created_at', '<', Timestamp.fromDate(formatToDate(date[1]))),
		where('salesman','==', doc(db,'employees/'+salesman))
		];
		var orderQuery = orderBy('created_at','desc');
		if(date[0] == date[1]){
			filterQuery = [
			where('created_at', '==', Timestamp.fromDate(formatToDate(date[0]))),
			where('salesman','==', doc(db,'employees/'+salesman))
			];
			orderQuery = orderBy('client','asc');
		}
		const q = query(collection(db, "billing"), orderQuery, ...filterQuery);
		getDocs(q).then(function(result){
			var i = 0;
			var sale = [];
			result.forEach(doc => {
				sale[i] = Promise.resolve(loadSale(doc.data().sale));
				const data = {
					'billing_id': doc.id,
					'client_name': doc.data().client,
					'created_at': doc.data().created_at.toDate(),
					'payment_value': Utils.formatMoney(doc.data().payment_value_in_cents/100),
					'comission': doc.data().comission_percent,
					'payment_comission': Utils.formatMoney((doc.data().payment_value_in_cents * doc.data().comission_percent/100)/100),
					'payment_method': doc.data().payment_method,
				}
				billing.push(data);
				i++;
			})
			Promise.all(sale).then(function(values){
				for (var i = 0; i < billing.length; i++) {
					billing[i].sale_id = values[i].id;
				}
				sumValueSalesmanTotal(filterQuery, orderQuery).then(function(total){
					resolve({
						'billing':billing, 
						'totalValue': total,
					});
				})	
			})

		});
	})
}

export function loadExpenses(date){
	return new Promise((resolve, reject)=>{
		loadExpensesAsync(date).then(function(result){
			resolve(result);
		})
	})
}

function loadExpensesAsync(date){
	return new Promise((resolve, reject)=>{
		const expenses = [];
		var addMonth = moment(date).add(1, 'month').format('YYYY-MM');
		var filterQuery = [
		where('created_at', '>=', Timestamp.fromDate(formatToDate(date))),
		where('created_at', '<=', Timestamp.fromDate(formatToDate(addMonth)))
		];
		const q = query(collection(db, "expenses"), orderBy('created_at','desc'), ...filterQuery);
		getDocs(q).then(function(result){
			result.forEach(doc => {
				const data = {
					'expense_id': doc.id,
					'name': doc.data().name,
					'created_at': doc.data().created_at.toDate(),
					'value': Utils.formatMoney(doc.data().value_in_cents/100),
				}
				expenses.push(data);
			})
			sumValueTotalExpenses(filterQuery, orderBy('created_at','desc')).then(function(total){
				resolve({'expenses':expenses, 'totalValue': total});
			})		
		});
	})
}

export function loadExpensesSalesman(date, salesman, fromBilling = false){
	return new Promise((resolve, reject)=>{
		loadExpensesSalesmanAsync(date, salesman, fromBilling).then(function(result){
			resolve(result);
		})
	})
}

function loadExpensesSalesmanAsync(date, salesman, fromBilling){
	return new Promise((resolve, reject)=>{
		const expenses = [];
		var orderQuery = orderBy('created_at','desc');
		if(!fromBilling){
			var addMonth = moment(date).add(1, 'month').format('YYYY-MM');
			var filterQuery = [
			where('created_at', '>=', Timestamp.fromDate(formatToDate(date))),
			where('created_at', '<', Timestamp.fromDate(formatToDate(addMonth))),
			where('salesman','==', doc(db,'employees/'+salesman))
			];
		} else {
			var filterQuery = [
			where('created_at', '>=', Timestamp.fromDate(formatToDate(date[0]))),
			where('created_at', '<', Timestamp.fromDate(formatToDate(date[1]))),
			where('salesman','==', doc(db,'employees/'+salesman))
			];
			if(date[0] == date[1]){
				filterQuery = [
				where('created_at', '==', Timestamp.fromDate(formatToDate(date[0]))),
				where('salesman','==', doc(db,'employees/'+salesman))
				];
				orderQuery = orderBy('client','asc');
			}
		}
		const q = query(collection(db, "expensesSalesman"), orderQuery, ...filterQuery);
		getDocs(q).then(function(result){
			result.forEach(doc => {
				const data = {
					'expense_id': doc.id,
					'name': doc.data().name,
					'created_at': doc.data().created_at.toDate(),
					'value': Utils.formatMoney(doc.data().value_in_cents/100),
				}
				expenses.push(data);
			})
			sumValueTotalExpensesSalesman(filterQuery, orderBy('created_at','desc')).then(function(total){
				resolve({'expenses':expenses, 'totalValue': total});
			})		
		});
	})
}

export function loadDiscountsSalesman(date, salesman, fromBilling = false){
	return new Promise((resolve, reject)=>{
		loadDiscountsSalesmanAsync(date, salesman, fromBilling).then(function(result){
			resolve(result);
		})
	})
}

function loadDiscountsSalesmanAsync(date, salesman, fromBilling){
	return new Promise((resolve, reject)=>{
		const discounts = [];
		var orderQuery = orderBy('created_at','desc');
		if(!fromBilling){
			var addMonth = moment(date).add(1, 'month').format('YYYY-MM');
			var filterQuery = [
			where('created_at', '>=', Timestamp.fromDate(formatToDate(date))),
			where('created_at', '<', Timestamp.fromDate(formatToDate(addMonth))),
			where('salesman','==', doc(db,'employees/'+salesman))
			];
		} else {
			var filterQuery = [
			where('created_at', '>=', Timestamp.fromDate(formatToDate(date[0]))),
			where('created_at', '<', Timestamp.fromDate(formatToDate(date[1]))),
			where('salesman','==', doc(db,'employees/'+salesman))
			];
			if(date[0] == date[1]){
				filterQuery = [
				where('created_at', '==', Timestamp.fromDate(formatToDate(date[0]))),
				where('salesman','==', doc(db,'employees/'+salesman))
				];
				orderQuery = orderBy('client','asc');
			}
		}
		const q = query(collection(db, "discountsSalesman"), orderQuery, ...filterQuery);
		getDocs(q).then(function(result){
			result.forEach(doc => {
				const data = {
					'discount_id': doc.id,
					'name': doc.data().name,
					'created_at': doc.data().created_at.toDate(),
					'value': Utils.formatMoney(doc.data().value_in_cents/100),
				}
				discounts.push(data);
			})
			sumValueTotalDiscountsSalesman(filterQuery, orderBy('created_at','desc')).then(function(total){
				resolve({'discounts':discounts, 'totalValue': total});
			})		
		});
	})
}

export function saveExpense(expense, value, date){
	return new Promise((resolve, reject)=>{
		const id = Utils.generateId();
		setDoc(doc(db, "expenses",id), {
			name: expense,
			created_at: Timestamp.fromDate(formatToDate(date)),
			value_in_cents: formatToCents(value),
		}).then(()=>{
			resolve();
		})
		.catch(()=>{
			console.log('Erro');
		});

	})
}
export function saveExpenseSalesman(salesman, expense, value, date){
	return new Promise((resolve, reject)=>{
		const id = Utils.generateId();
		setDoc(doc(db, "expensesSalesman",id), {
			name: expense,
			created_at: Timestamp.fromDate(formatToDate(date)),
			value_in_cents: formatToCents(value),
			salesman: doc(db,'employees/'+salesman),
		}).then(()=>{
			resolve();
		})
		.catch(()=>{
			console.log('Erro');
		});

	})
}
export function saveDiscountSalesman(salesman, discount, value, date){
	return new Promise((resolve, reject)=>{
		const id = Utils.generateId();
		setDoc(doc(db, "discountsSalesman",id), {
			name: discount,
			created_at: Timestamp.fromDate(formatToDate(date)),
			value_in_cents: formatToCents(value),
			salesman: doc(db,'employees/'+salesman),
		}).then(()=>{
			resolve();
		})
		.catch(()=>{
			console.log('Erro');
		});

	})
}
export function addPaymentBeautySalon(name, value, date){
	return new Promise((resolve, reject)=>{
		const id = Utils.generateId();
		setDoc(doc(db, "billing",id), {
			client: name,
			created_at: Timestamp.fromDate(formatToDate(date)),
			payment_value_in_cents: formatToCents(value),
			comission_percent: 100,
		}).then(()=>{
			resolve();
		})
		.catch(()=>{
			console.log('Erro');
		});

	})
}
export function payComissionSalesman(salesmanName, value){
	return new Promise((resolve, reject)=>{
		const id = Utils.generateId();
		setDoc(doc(db, "expenses",id), {
			name: "Comissão - "+salesmanName,
			created_at: Timestamp.fromDate(formatToDate()),
			value_in_cents: formatToCents(value),
		}).then(()=>{
			resolve();
		})
		.catch(()=>{
			console.log('Erro');
		});

	})
}

function formatToCents(value){
	return parseInt(value.replace(/[^0-9]/g,''));
}

function formatToDate(date){
	moment.locale('PT-BR');
	return moment(date).toDate();
}

export function printComissionSalesman(sales, expenses, discounts, date, salesman, value){
	var doc = new jsPDF();
	var img = new Image();
	var titlePage = 'Comissão - '+moment(date[0]).format('DD/MM/YYYY')+' ~ '+moment(date[1]).format('DD/MM/YYYY');
	img.src = logo;
	doc.addImage(img, 'png', 10, 10, 72, 42);
	doc.text(titlePage, 80, 10);
	doc.text('Vendedor: '+ salesman, 80, 20);
	const headers = ['Cliente', 'Data', 'Tipo', '%', 'Valor pago', 'Comissão'];
	var body = [];
	for (var i = 0; i < sales.length; i++) {
		body.push([ 
			sales[i].client_name,
			moment(sales[i].created_at).format('DD/MM/YYYY'),
			sales[i].payment_method ? sales[i].payment_method : '-',
			sales[i].comission,
			'R$ ' + sales[i].payment_value,
			'R$ ' + sales[i].payment_comission
			])
	}
	for (var i = 0; i < expenses.length; i++) {
		body.push([ 
			{content: expenses[i].name, styles: {textColor: [33,199,122], fontStyle: 'bold'}},
			{content: moment(expenses[i].created_at).format('DD/MM/YYYY')},
			{content: '-'},
			{content: '-'},
			{content: 'R$ ' + expenses[i].value, styles: {textColor: [33,199,122], fontStyle: 'bold'}},
			{content: '-'}
			])
	}
	for (var i = 0; i < discounts.length; i++) {
		body.push([ 
			{content: discounts[i].name, styles: {textColor: [219,35,86], fontStyle: 'bold'}},
			{content: moment(discounts[i].created_at).format('DD/MM/YYYY')},
			{content: '-'},
			{content: '-'},
			{content: 'R$ -' + discounts[i].value, styles: {textColor: [219,35,86], fontStyle: 'bold'}},
			{content: '-'}
			])
	}
	var footer = ['Total', '', '', '', '', 'R$ ' + value];
	autoTable(doc, {
		styles: { fillColor: [255, 233, 201] },
		headStyles: {halign: 'center', valign: 'middle', textColor: [0, 0, 0]},
		footStyles: {halign: 'center', valign: 'middle', textColor: [0, 0, 0]},
		columnStyles: { 
			1: { halign: 'center', valign: 'middle', }, 
			2: { halign: 'center', valign: 'middle', }, 
			3: { halign: 'center', valign: 'middle', }, 
			4: { halign: 'center', valign: 'middle', },
			5: { halign: 'center', valign: 'middle', }
		},
		head:[headers],
		body:body,
		foot:[footer],
		startY: 60,
		showFoot: 'lastPage'
	})
	doc.save('Comissão_'+salesman+'_'+moment(date[0]).format('DD-MM-YYYY')+'_'+moment(date[0]).format('DD-MM-YYYY'));
}

export function deleteExpense(id){
	return new Promise((resolve, reject)=>{
		deleteDoc(doc(db, "expenses",id))
		.then(()=>{
			resolve();
		});
	})
}

export function deleteExpenseSalesman(id){
	return new Promise((resolve, reject)=>{
		deleteDoc(doc(db, "expensesSalesman",id))
		.then(()=>{
			resolve();
		});
	})
}

export function deleteDiscountSalesman(id){
	return new Promise((resolve, reject)=>{
		deleteDoc(doc(db, "discountsSalesman",id))
		.then(()=>{
			resolve();
		});
	})
}