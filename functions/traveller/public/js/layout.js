var auth = catalyst.auth.isUserAuthenticated()
auth.then(res => {
    document.getElementById("logout").style.display = 'block'
    document.getElementById("cart").style.display = 'block'
}).catch(err => {
    document.getElementById("signin").style.display = 'block'
    document.getElementById("login").style.display = 'block'
})