var auth = catalyst.auth.isUserAuthenticated()
auth.then(res => {
    document.getElementById("logout").style.display = 'block'
    document.getElementById("cart").style.display = 'block'
}).catch(err => {
    document.getElementById("signup").style.display = 'block'
    document.getElementById("login_").style.display = 'block'
})

$(document).ready(function () {
    async function logout(){
        await catalyst.auth.signOut(document.URL)
        .catch(err => console.log(err))
    }
    $("[logout]").click(logout)
});