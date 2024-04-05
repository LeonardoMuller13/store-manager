import { collection, doc, query, where, getDoc, getDocs, setDoc, deleteDoc, orderBy, Timestamp, increment, updateDoc, startAt, startAfter, limit } from "firebase/firestore";
import { db } from '@/database/firebase';
import moment from "moment";

export function loadSales(filter) {
    return new Promise((resolve, reject) => {
        loadSalesAsync(filter).then(function (result) {
            resolve(result);
        })
    })
}

function loadSalesAsync(date) {
    return new Promise((resolve, reject) => {
        const sales = [];
        var orderByQuery = orderBy('created_at', 'desc');
        var filterQuery = [
            where('created_at', '>=', Timestamp.fromDate(moment(date).toDate())),
            where('created_at', '<', Timestamp.fromDate(moment(date).endOf('month').toDate()))
        ];
        const first = query(collection(db, "sales"), orderByQuery, ...filterQuery);
        getDocs(first).then(function (documentSnapshots) {
            var lastVisible = documentSnapshots.docs[0]
            if (lastVisible) {
                var start = startAt(lastVisible);
                filterQuery.push(start)
            }

            const q = query(collection(db, "sales"), orderByQuery, ...filterQuery);
            getDocs(q).then(function (result) {
                var i = 0;
                var salesman = [];
                result.forEach(doc => {
                    salesman[i] = Promise.resolve(loadSalesman(doc.data().salesman));
                    const data = {
                        'sale_id': doc.id,
                        'created_at': doc.data().created_at.toDate(),
                        'total': (doc.data().total_value_in_cents / 100),
                        'products': doc.data().products,
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
function loadSalesman(docSalesman){
	return new Promise((resolve,reject)=>{
		const q = query(docSalesman);
		getDoc(q).then(function(result){
			resolve({id: result.id, name: result.data().full_name})
		})
	})
}