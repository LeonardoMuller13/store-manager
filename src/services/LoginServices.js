import * as FirebaseAuth from "firebase/auth";


export function signIn(email, password) {
	return new Promise((resolve, reject) => {
		FirebaseAuth.signInWithEmailAndPassword(FirebaseAuth.getAuth(), email, password)
		.then(function(userCredential){
			resolve(userCredential.user);
		})
		.catch(reject);
	})
}

export function signOut() {
	return new Promise((resolve, reject) => {
		FirebaseAuth.signOut(FirebaseAuth.getAuth())
		.then(function(userCredential){
			resolve();
		})
		.catch(reject);
	})
}
