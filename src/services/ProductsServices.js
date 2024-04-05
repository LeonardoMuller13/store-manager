import { collection, doc, query, where, getDocs, setDoc, deleteDoc, orderBy } from "firebase/firestore";
import { db } from '../database/firebase';

export function loadCategories(){
	return new Promise((resolve, reject)=>{
		const salesman = loadCategoriesAsync();
		resolve(salesman);
	})
	
}

async function loadCategoriesAsync(){
	const salesman = [];
	const q = query(collection(db, "categories"), orderBy('name', 'asc'));
	let result = await Promise.resolve(getDocs(q))
	result.forEach(async doc => {
		const data = {
			'category_id': doc.id,
			'name': doc.data().name,
			'products': await loadProducts(doc.id),
		}
		salesman.push(data);
	})
	return salesman;

}

async function loadProducts(category_id){
	var products = [];
	var q = query(collection(db, "categories/"+category_id+"/products"),  orderBy('name', 'asc'));
	var result = await getDocs(q)
	result.forEach(doc => {
		var data = {
			'product_id': doc.id,
			'name': doc.data().name,
			'gross_value': doc.data().gross_value,
			'price_shop': doc.data().price_shop,
			'qty': doc.data().qty,
		}
		products.push(data);
	})
	return products;
}

export function saveCategory(category){
	return new Promise((resolve, reject)=>{
		setDoc(doc(db, "categories", category.category_id), {
			name: category.name,
		}).then(()=>{
			resolve(category);
		});
		
	})
}

export function saveProduct(category_id, product){
	return new Promise((resolve, reject)=>{
		setDoc(doc(db, "categories/"+category_id+"/products", product.product_id), {
			name: product.name,
			gross_value: parseInt(product.gross_value.replace(/[^0-9]/g,'')),
			price_shop: parseInt(product.price_shop.replace(/[^0-9]/g,'')),
			qty: parseInt(product.qty)
		}).then(()=>{
			resolve(product);
		});
		
	})
}

export function deleteCategory(category_id){
	return new Promise((resolve, reject)=>{
		deleteDoc(doc(db, "categories", category_id))
		.then(()=>{
			resolve();
		});
		
	})
}

export function deleteProduct(category_id, product_id){
	return new Promise((resolve, reject)=>{
		deleteDoc(doc(db, "categories/"+category_id+"/products", product_id))
		.then(()=>{
			resolve();
		});
	})
}




