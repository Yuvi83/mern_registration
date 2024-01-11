require('dotenv').config();

const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../src/middleware/auth")
const cookieParser = require("cookie-parser")

require("./db/conn");
const Register = require("./models/registers");
const { json } = require("express");
const { log } = require("console");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public" );
const template_path = path.join(__dirname, "../templates/views" );
const partials_path = path.join(__dirname, "../templates/partials" );

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser())

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

// console.log(process.env.SECRET_KEY);

app.get("/", (req, res) => {
    res.render("index")
});

app.get("/secret",auth, (req, res) => {
    // console.log(` this is the awesome cookie ${req.cookies.jwt}`);
    res.render("secret");
});

app.get("/register", (req, res) =>{
    res.render("register");
})

app.get("/login", (req, res) =>{
    res.render("login");
})


app.get("/logout",auth,async (req, res) =>{
    try {
        // res.render("logout");
        console.log(req.user);

// to logout only current device we use filter method
//filter method element,index,aray,this method use here only token use  
//for single logout comment remove
      /*      req.user.tokens = req.user.tokens.filter((currElement)=>{
                return currElement.token!=req.token;
            })

*/
//logout from all device

            req.user.tokens=[];
        //with the help of clear cookie we can logout the user 
        res.clearCookie("jwt")
        console.log("logout successfully");
        req.user.save();
        res.render("login");
    } catch (error) {
        res.status(500).send(error);
    }
})

// create a new user in our database
app.post("/register", async (req, res) =>{
    try {
        
      const password = req.body.password;
      const cpassword = req.body.confirmpassword;

      if(password === cpassword){
        
        const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                gender:req.body.gender,
                phone:req.body.phone,
                age:req.body.age,
                password:req.body.password,
                confirmpassword:req.body.confirmpassword    
        })

        console.log("the success part" + registerEmployee);

        const token = await registerEmployee.generateAuthToken();
        console.log("the token part" + token);

        //the res.cookie() function is used to set the cookie name to value .the value parameter may be a string or object converted to json.
    //   res.cookie(name,value,[options]);
    //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTlmNzg2ZmY1OGNjZjFiZjgwMTNkMzEiLCJpYXQiOjE3MDQ5NDk4NzF9.YeLTH8U-iLgBdLrSGIDU0_ME0mdX0Y_jsghZ_UuIBkw


        res.cookie("jwt",token,{
            expires:new Date(Date.now()+30000),
            httpOnly:true
        });
        // console.log(`the cookie register is :${cookie}`);

        const registered = await registerEmployee.save();
        console.log("the page part" + registered);
        res.status(201).render("index");

      }else{
          res.send("password are not matching")
      }
        
    } catch (error) {
        res.status(400).send(error);
        console.log("the error part page ");
    }
})


// login check

app.post("/login", async(req, res) =>{
   try {
    
        const email = req.body.email;
        const password = req.body.password;
        const useremail = await Register.findOne({email:email});
        const isMatch = await bcrypt.compare(password, useremail.password);

        const token = await useremail.generateAuthToken();
        console.log("the token part" + token);
        res.cookie("jwt",token,{
            expires:new Date(Date.now()+300000),
            httpOnly:true
            // secure:true -->https server work
        });
        // console.log(` this is the awesome cookie ${req.cookies.jwt}`);
        if(isMatch){
            res.status(201).render("index");
        }else{
           res.send("invalid Password Details"); 
        }
    
   } catch (error) {
       res.status(400).send("invalid login Details")
   }
})


//here we can becrypt data 
// const bcrypt = require("bcryptjs");

// const securePassword = async (password) =>{

//     const passwordHash = await bcrypt.hash(password, 10);
//     console.log(passwordHash);

//     const passwordmatch = await bcrypt.compare("thapa@123", passwordHash);
//     console.log(passwordmatch);

// }

// securePassword("thapa@123");


// const jwt = require("jsonwebtoken");

// const createToken = async() => {
//     const token = await jwt.sign({_id:"659ecddb86a845498005cae0"}, "mynameisvinodbahadurthapayoutuber", {
//         expiresIn:"2 seconds"
//     });
//     console.log(token);

//     const userVer = await jwt.verify(token, process.env.SECRET_KEY);
//     console.log(userVer);
// }


// createToken();


app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
})



//encryption are today days not use because this is very easy to hack

//hash ->one way communication

//cookie-parser -->parse cookie header and populate req.cookies with an object keyed by the cookie names. optionally you may enable signed cookie support by passing a secret string. which assign req.secret so it may be used by other middleware.





