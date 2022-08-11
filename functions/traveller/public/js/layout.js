var auth = catalyst.auth.isUserAuthenticated()
auth.then(res => {
    document.getElementById("logout").style.display = 'block'
    document.getElementById("cart").style.display = 'block'
})