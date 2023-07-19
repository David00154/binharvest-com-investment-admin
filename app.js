const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser")
const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const SQLiteStore = require('connect-sqlite3')(session);

const app = express()

passport.use(new LocalStrategy({ usernameField: "email" }, function (email, password, cb) {
    // if (!email || !password) {
    //     console.log("error")
    //     return cb(null, false, { message: "Email and password arre both required" })
    // }
    const Email = "admin7654@binharvest.com"
    const Password = "5243a{"
    if (email != Email || password != Password) {
        console.log("error")
        return cb(null, false, { message: "Incorrect credentials" })
    }
    console.log("Success")
    return cb(null, { id: 1, email: Email })
}))
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, email: user.email });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

// middlewares;
app.use(cors());
// EJS
app.use(express.static(path.join(__dirname, "public")));
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())

app.use((session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: 'sessions.db', dir: './data' })
})))
app.use(passport.initialize())
app.use(passport.authenticate('session'));

// app.use(passport.session())
app.use(flash());

// Global variables
app.use(function (req, res, next) {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.all("/", (req, res) => res.redirect(302, "/investments"))

const requireLogin = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Authentication required");
    res.redirect("/login");
}

app.get("/investments", requireLogin, (req, res) => {
    res.render("investments", {
        layout: "layouts/base",
        title: "Admin | Investments",
        data: require("./data/investments.json").table
    })
})

app.get("/login", (req, res) => {
    // res.cookie("auth", undefined, { maxAge: 900000, httpOnly: true })
    res.render("login", {
        layout: "layouts/auth",
        title: "Admin | Login",
    })
})
app.post("/login", passport.authenticate("local", {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))
app.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});
const port = process.env.PORT || 8081;

app.listen(port, () => {
    console.log(`> Server started on port ${port}`);
});


module.exports = app;