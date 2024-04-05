import { collection, doc, query, where, getDocs, setDoc, deleteDoc, orderBy, Timestamp } from "firebase/firestore";
import { db } from '@/database/firebase';

export function loadEmployees(){
	return new Promise((resolve, reject)=>{
		const salesman = loadEmployeesAsync();
		resolve(salesman);
	})
	
}

async function loadEmployeesAsync(){
	const salesman = [];
	const q = query(collection(db, "employees"),where('deleted_at', '==', null), orderBy('full_name','asc'));
	let result = await Promise.resolve(getDocs(q))
	result.forEach(async doc => {
		const data = doc.data();
		data.employee_id = doc.id;
		salesman.push(data);
	})

	return salesman;

}

export function saveEmployee(employee){
	return new Promise((resolve, reject)=>{
		setDoc(doc(db, "employees/", employee.id), {
			full_name: employee.name,
			email: employee.email,
			phone: employee.phone,
			rg: employee.rg,
			cpf: employee.cpf,
			bank: {
				account: employee.bank.account,
				agency: employee.bank.agency,
				bank: employee.bank.bank,
				digit_account: employee.bank.digitAccount,
				digit_agency: employee.bank.digitAgency,
				operation: employee.bank.operation,
				type: employee.bank.type,
			},
            deleted_at: null,
		}).then(()=>{
			resolve(employee);
		}).catch(()=>{
			reject();
		})
		
	})
}

export function deleteEmployee(employee){
	return new Promise((resolve, reject)=>{
		setDoc(doc(db, "employees/", employee.employee_id), {
			full_name: employee.full_name,
			email: employee.email,
			phone: employee.phone,
			rg: employee.rg,
			cpf: employee.cpf,
			bank: {
				account: employee.bank.account,
				agency: employee.bank.agency,
				bank: employee.bank.bank,
				digit_account: employee.bank.digit_account,
				digit_agency: employee.bank.digit_agency,
				operation: employee.bank.operation,
				type: employee.bank.type,
			},
            deleted_at: Timestamp.fromDate(new Date()),
		}).then(()=>{
			resolve(employee);
		}).catch(()=>{
			reject();
		})
	})
}
function formatToDate(date){
	moment.locale('PT-BR');
	return moment(date).toDate();
}
