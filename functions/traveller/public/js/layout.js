var auth = catalyst.auth.isUserAuthenticated()
var user;
auth.then(res => {
    user = res.content
    document.getElementById("logout").style.display = 'block'
    document.getElementById("cart").style.display = 'block'
}).catch(err => {
    document.getElementById("signup").style.display = 'block'
    document.getElementById("login_").style.display = 'block'
})

$(document).ready(function () {
    function logout(){
        catalyst.auth.signOut(document.URL)
        .catch(err => console.log(err))
    }
    $("[logout]").click(logout)
});