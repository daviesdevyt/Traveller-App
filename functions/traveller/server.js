const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const expressLayouts = require("express-ejs-layouts")
app.use(express.json());
app.use(cookieParser('NotSoSecret'));
app.use(session({
	secret: 'something',
	cookie: { maxAge: 60000 },
	resave: true,
	saveUninitialized: true
}));
app.use(flash());
var catalyst = require('zcatalyst-sdk-node');

app.engine('.html', require('ejs').__express);
app.set("view engine", "html")
app.set("views", "client")
app.set("layout", "layouts/layout")
app.use(expressLayouts)
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

app.get("/", (req, res) => {
	res.render("index")
})

app.get("/service", (req, res) => {
	res.render("service")
})

app.get("/sign-up", (req, res) => {
	var message = req.flash("msg")
	res.render("signup", { message })
})

app.post("/sign-up", async (req, res) => {
	var c = catalyst.initialize(req)
	let userManagement = c.userManagement();
	var signupConfig = {
		platform_type: 'web',
		zaid: 10046576346
	};
	var userConfig = {
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		email_id: req.body.email,
		role_id: '7304000000004182'
	};

	let registerPromise = userManagement.registerUser(signupConfig, userConfig);
	await registerPromise.then(userDetails => {
		req.flash("msg", "Check your email for confirmation")
		res.redirect(req.get("referrer"))
	});
	req.flash("msg", "Request could not be completed")
	res.redirect(req.get("referrer"))
})

app.get("/sign-in", (req, res) => {
	res.render("signin")
})

app.get("/packages", (req, res) => {
	res.render("package")
})

app.get("/contact", (req, res) => {
	let message = req.flash("msg")
	res.render("contact", { message })
})

app.post("/contact", (req, res) => {
	
	res.redirect("contact")
})

module.exports = app;
// app.listen(3000)