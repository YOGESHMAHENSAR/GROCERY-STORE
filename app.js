if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo").default; // for storing the session info. of the user
const flash = require("connect-flash");
const passport = require("passport");
const User = require("./models/user.js");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const initData = require("./init/data.js");
let app = express();
// app.use(cookieParser(";098___)()__++==9$%^&*("));
app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const dbUrl = process.env.ATLASDB_URL;

//mongoose connection
main().then((res)=>{
    console.log("connection successful");
})
.catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(dbUrl);
    console.log("Database Host:", mongoose.connection.host); 
    console.log("Database Name:", mongoose.connection.name);
}

const store = MongoStore.create({
    crypto:{
        secret: process.env.SECRET
    },
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600 // to store the session related information even after the refresh of the page
})

store.on("error", (err)=>{
    console.log("ERROR: MONGO STORE SESSION : " ,err);
})

const sessionOptions = {
    store: store,
    secret: process.env.SECRET ,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true
    }
}
// // ROOT ROUTE
// app.get("/",(req,res)=>{
//     res.send("Hi, I'm Root!");
// })

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/auth/google/callback",
        passReqToCallback: true
    },
        async (req, accessTokens, refreshTokens, profile, done) => {
            try{
                const intent = req.query.state;
                let user = await User.findOne({
                    $or: [
                        {googleId: profile.id},
                        {email: profile.emails[0].value}
                    ]
                });
                //if user exists
                if(user){
                    return done(null, user);
                }
                //login but acc not found
                if(intent === "login"){
                    return done(null, false,{message: "Account not found. Please sign up first!"});
                }
                // if tyr to signup
                if(intent === "signup"){
                    console.log("entered in the acc create");
                    let usernameCheck = await User.findOne({username: profile.displayName});
                    if(usernameCheck){
                        return done(null, false,{message: "User already Taken Try with different account"});
                    }
                    const newUser = await User.create({
                        googleId: profile.id,
                        username: profile.displayName,
                        email: profile.emails && profile.emails[0] && profile.emails[0].value
                    });
                    return done(null, newUser);
                }
            }catch(err){
                return done(err,null);
            }
        }
    ));
    console.log("GoogleStrategy registered");
} else {
    console.warn("GoogleStrategy not registered: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
}

passport.serializeUser(User.serializeUser()); // to save the data of user in session
passport.deserializeUser(User.deserializeUser()); // to remove the data of user from the session

//middleware for the flash-connect
app.use((req,res,next) =>{
    res.locals.editMsg = req.flash("edit");
    res.locals.addNewMsg = req.flash("new");
    res.locals.deleteMsg = req.flash("delete");
    res.locals.reviewAddMsg = req.flash("addReview");
    res.locals.reviewDelMsg = req.flash("deleteReview");
    res.locals.errorDel = req.flash("error");
    res.locals.signup = req.flash("signup");
    res.locals.login = req.flash("login");
    res.locals.signupErr = req.flash("err");
    res.locals.currUser = req.user;
    
    res.locals.ownerId = (process.env.OWNER_IDS||"").split(",").map(id => id.trim()).filter(Boolean); // Set the owner ID in res.locals
    next();
})

// app.get("/demouser",async (req,res)=>{
//     let fakeUser = new User({
//         email: "student@123.com",
//         username: "okaysirji"
//     })
//     let registeredUser = await User.register(fakeUser, "student-1234@123ewq");
//     res.send(registeredUser);
// })

app.get("/",(req,res)=>{
    res.redirect("/listings");
})

//all listing routes
app.use("/listings", listingsRouter);

//all review routes
app.use("/listings/:id/reviews", reviewsRouter);

//all user routes
app.use("/", userRouter);

//not existing routes
app.all("*",(req,res,next)=>{
    next(new ExpressError(404, " Page Not Found! You made a request of which page doesn't exist yet."));
})

//for error handling
app.use((err,req,res,next)=>{
    let{status = 400,message = "Random ERRROR"} = err;
    console.log(err);
    res.status(status).render("error.ejs",{status,message});
    // res.status(status).send(message);
    // res.send("Something went wrong!!");
})

//SERVER STARTING
let port = process.env.PORT || 8080;
app.listen(port,"0.0.0.0",()=>{
    console.log(`Listening to server ${port}`)
})
