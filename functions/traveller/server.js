const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const expressLayouts = require("express-ejs-layouts")
const utils = require("./utils.js")
const catalyst = require('zcatalyst-sdk-node');
const axios = require('axios');
require("dotenv").config()


app.use(express.json());
app.use(cookieParser('NotSoSecret'));
app.use(session({
	secret: 'something',
	cookie: { maxAge: 60000 },
	resave: true,
	saveUninitialized: true
}));
app.use(flash());

app.engine('.html', require('ejs').__express);
app.set("view engine", "html")
app.set("views", "client")
app.set("layout", "layouts/layout")
app.use(expressLayouts)
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(express.static("../../uploads"))

async function login_required(req, res, next) {
	var c = catalyst.initialize(req)
	let userManagement = c.userManagement();
	let userPromise = await userManagement.getCurrentUser();
	if (userPromise != null) {
		req['user'] = userPromise
		next()
	}
	else {
		res.redirect("signup")
	}
}

app.get("/", async (req, res) => {
	utils.initialize(req, true)
	var packages = await utils.queryTable(`select * from Package`)
	res.render("index", { packages })
})

app.get("/service", (req, res) => {
	res.render("service")
})

app.get("/deletebooking", login_required, async (req, res) => {
	var pckge_id = req.query.id
	if (pckge_id === undefined) return res.redirect(req.get("referrer"))
	utils.initialize(req, true)
	await utils.queryTable(`DELETE FROM Cart WHERE user_id=${req.user.user_id} AND package_id=${req.query.id}`)
	res.redirect(req.get("referrer"))
})
app.get("/deleteorder", login_required, async (req, res) => {
	var pckge_id = req.query.id
	if (pckge_id === undefined) return res.redirect(req.get("referrer"))
	utils.initialize(req, true)
	await utils.queryTable(`DELETE FROM Orders WHERE user_id=${req.user.user_id} AND package_id=${req.query.id}`)
	res.redirect(req.get("referrer"))
})

app.get("/cart", login_required, async (req, res) => {
	utils.initialize(req)
	var bookings = await utils.queryTable(`select package_id from Cart where user_id=${req.user.user_id}`)
	var query = ""
	if (bookings.length > 0) {
		query = " WHERE "
		for (let i = 0; i < bookings.length; i++) {
			let item = bookings[i].Cart
			let and = i == bookings.length - 1 ? "" : " OR "
			query += "ROWID=" + item.package_id + and
		}
		bookings = await utils.queryTable(`select * from Package${query}`)
	}
	else {
		bookings = []
	}
	res.render("cart", { bookings })
})

app.get("/orders", login_required, async (req, res) => {
	utils.initialize(req)
	var bookings = await utils.queryTable(`select package_id from Orders where user_id=${req.user.user_id}`)
	var query = ""
	console.log(bookings)
	if (bookings.length > 0) {
		query = " WHERE "
		for (let i = 0; i < bookings.length; i++) {
			let item = bookings[i].Orders
			let and = i == bookings.length - 1 ? "" : " OR "
			query += "ROWID=" + item.package_id + and
		}
		bookings = await utils.queryTable(`select * from Package${query}`)
	}
	else {
		bookings = []
	}
	res.render("orders", { bookings })
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
		req.flash("msg", ["Check your email for confirmation", "success"])
		res.redirect(req.get("referrer"))
	});
	req.flash("msg", ["Request could not be completed", "danger"])
	res.redirect(req.get("referrer"))
})

app.get("/login", (req, res) => {
	res.render("login")
})

app.get("/packages", async (req, res) => {
	utils.initialize(req, true)
	var packages = await utils.queryTable(`select * from Package`)
	res.render("package", { packages })
})

app.get("/contact", (req, res) => {
	let message = req.flash("msg")
	res.render("contact", { message })
})

app.get("/single/:prod_id", async (req, res) => {
	message = req.flash('msg')
	utils.initialize(req, true)
	var package = await utils.queryTable(`select * from Package where ROWID=${req.params.prod_id}`)
	res.render("single", { package: package[0].Package, message })
})


app.get("/bookpackage", login_required, async (req, res) => {
	var pckge_id = req.query.id
	if (pckge_id === undefined) return res.redirect(req.get("referrer"))
	utils.initialize(req, true)
	var booking = await utils.queryTable(`select ROWID from Cart where user_id=${req.user.user_id} and package_id=${pckge_id}`)
	if (booking.length < 1) {
		await utils.addRowInTable("Cart", { user_id: req.user.user_id, package_id: pckge_id })
			.then(row => req.flash("msg", ["Added to cart!", "success"]))
			.catch(err => req.flash("msg", ["Wasn't able to be added to cart", "danger"]))
	}
	else req.flash("msg", ["Item is already in cart", "danger"])
	res.redirect(req.get("referrer"))
})


app.post("/contact", async (req, res) => {
	utils.initialize(req, true)
	await utils.addRowInTable("ContactMessage", { name: req.body.name, email: req.body.email, subject: req.body.subject, message: req.body.message })
		.then((row) => {
			req.flash("msg", ["Message sent!", "success"])
		}).catch(err => {
			req.flash("msg", ["Message was not sent :(", "danger"])
			console.log("rowData insertion failed " + err);
		});
	res.redirect("contact")
})

app.get('/verify_transaction', login_required, async (req, res) => {
	axios({
	  method: "GET",
	  url: 'https://api.paystack.co/transaction/verify/'+req.query.reference,
	  headers: {
		Authorization: 'Bearer '+process.env.PAYSTACK_PRIVATE_KEY
	  }
	}).then(async resp => {
	  utils.initialize(req)
	  packages = await utils.queryTable(`select package_id from Cart where user_id=${req.user.user_id}`)
	  var values = ""
	  for (let i=0;i<packages.length;i++){
		  values += `(${req.user.user_id}, ${packages[i].Cart.package_id})`
		  if (i != packages.length-1) values += ","
	  }
	  utils.queryTable(`insert into Orders (user_id, package_id) values ${values}`)
	  .then(async row => {
		await utils.queryTable(`delete from Cart where user_id=${req.user.user_id}`)
	  })
	  res.json({})
	})
})

module.exports = app;