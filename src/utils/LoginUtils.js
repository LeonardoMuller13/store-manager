
function getUser() {
    let credentials = localStorage.getItem('credentials');
    if(credentials != null) {
        credentials = JSON.parse(credentials);
        return {
            'name' : credentials['name'],
            'email' : credentials['email'],
        };
    }
    return null;
}

export var user = getUser()

export function login($credentials) {
    localStorage.setItem('credentials',JSON.stringify($credentials));
    user = getUser();
}

export function logout() {
    localStorage.removeItem('credentials');
    user = null;
}

export function isLogedIn() {
    return user != null;
}