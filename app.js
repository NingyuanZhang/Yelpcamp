var express=require("express")
var app=express()
var bodyparser=require("body-parser")
var mongoose=require("mongoose")
var Campground=require("./models/campground")
//var seedDB=require("./seeds")
var Comment=require("./models/comment")
var passport=require("passport")
var LocalStrategy=require("passport-local")
var User=require("./models/user")
var methodOverride=require("method-override")
var flash=require("connect-flash")
var session = require('express-session')

//seedDB()
app.use(express.static(__dirname + "/public"))
//mongoose.connect("mongodb://localhost/yelp_camp")
mongoose.connect("mongodb://Mia:miemiemie123@ds161764.mlab.com:61764/yelpcamp")
//mongodb://Mia:miemiemie123@ds161764.mlab.com:61764/yelpcamp
app.set("view engine","ejs")
app.use(bodyparser.urlencoded({extened:true}))
app.use(methodOverride("_method"))
app.use(session({ cookie: { maxAge: 60000 }, 
                  secret: 'woot',
                  resave: false, 
                  saveUninitialized: false}))
app.use(flash())
app.use(function(req,res,next){
    res.locals.currentUser=req.user
    res.locals.error=req.flash("error")
    res.locals.success=req.flash("success")
    next()
})



//==================
//passport configuration
//==================
app.use(require("express-session")({
    secret:"once again",
    resave:false,
    saveUnitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

/*Campground.create({
    name: "Mountain X",
    image: "https://pixabay.com/get/e834b5062cf4033ed1584d05fb1d4e97e07ee3d21cac104491f7c57ea1e5b4b0_340.jpg"
},function(err,campground){
    if(err){
            console.log(err)
        }
    else{
        console.log(campground)
    }
})*/
/*var campgrounds=[
        {name:"salmon creek", image:"https://pixabay.com/get/e834b5062cf4033ed1584d05fb1d4e97e07ee3d21cac104491f7c57ea1e5b4b0_340.jpg"},
        {name:"salmon creek", image:"https://pixabay.com/get/e834b5062cf4033ed1584d05fb1d4e97e07ee3d21cac104491f7c57ea1e5b4b0_340.jpg"},
        {name:"salmon creek", image:"https://pixabay.com/get/e834b5062cf4033ed1584d05fb1d4e97e07ee3d21cac104491f7c57ea1e5b4b0_340.jpg"}
        ]*/
        
        
app.get("/",function(req,res){
    res.render("landing",{currentUser:req.user})
})        


app.get("/campgrounds",function(req,res){
    
    Campground.find({},function(err,allcamp){
        if(err){
            console.log(err)
        }
        else{
            res.render("campgrounds",{campgrounds:allcamp, currentUser:req.user});
        }
    })
    
})

app.post("/campgrounds",function(req,res){
    var name=req.body.name;
    var image=req.body.image;
    var author={
        id:req.user._id,
        username:req.user.username
    }
    var desc=req.body.description
    var newcampground={name: name, image: image, author: author, description: desc}
    Campground.create(newcampground,function(err,newcamp){
        if(err){
            console.log(err)
        }
        else{
            res.redirect("/campgrounds")
        }
    })

    
})
    
app.get("/campgrounds/new",isloggedin,function(req,res){
    res.render("new",{currentUser:req.user})
})

app.get("/campgrounds/:id",function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err,found){
        if(err){
            console.log(err)
        }
        else{
            res.render("show",{campground:found, currentUser:req.user })
        }
    })
    
})
//===========================
//comments routes
//===========================
app.get("/campgrounds/:id/comments/new",isloggedin,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err)
        }
        else{
            res.render("newcomments",{campground:campground, currentUser:req.user})
        }
    })
    
})

app.post("/campgrounds/:id/comments",function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err)
            res.redirect("/campgrounds")
        }
        else{
            Comment.create(req.body.comment,function(err,comment){
                if(err)
                {
                    console.log(err)
                }
                else{
                    comment.author.id=req.user._id
                    comment.author.username=req.user.username
                    comment.save()
                    campground.comments.push(comment)
                    campground.save()
                    res.redirect("/campgrounds/"+campground._id)
                }
            })
        }
    })
})
//====================
//auth route
//====================
app.get("/register",function(req,res){
    res.render("register")
})



app.post("/register",function(req,res){
    var newUser =new User({username: req.body.username})
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            req.flash("error",err.message)
            return res.render("register",{error:req.flash("error")})
        }
        else{
            passport.authenticate("local")(req,res,function(){
                req.flash("success","Welcome to YelpCamp "+user.username)
                res.redirect("/campgrounds")
            })
            
        }
    })
})



app.get("/login",function(req, res) {
    res.render("login")
})
//app.post("/login", middleware, callback)
app.post("/login",passport.authenticate("local",
    {
    
        successRedirect:"/campgrounds",
        failureRedirect:"/login"
    }),function(req,res){
        
    })

//log out
app.get("/logout",function(req, res) {
    req.logout()
    req.flash("success","Logged you out!")
    res.redirect("/campgrounds")
})

function isloggedin(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    req.flash("error","Please log in.")
    res.redirect("/login")
}


app.get("/campgrounds/:id/edit",checkauthor,function(req, res) {
    
    Campground.findById(req.params.id,function(err,found){
        res.render("edit",{campground:found, currentUser:req.user})
            })
       
})
//update
app.put("/campgrounds/:id",checkauthor,function(req,res){
    Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedcamp){
        if(err){
            res.redirect("/campgrounds")
        }
        else{
            res.redirect("/campgrounds/"+req.params.id)
        }
    })
})
//destroy
app.delete("/campgrounds/:id",checkauthor,function(req,res){
    Campground.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/campgrounds")
        }
        else{
            res.redirect("/campgrounds")
        }
    })
})

function checkauthor(req,res,next){
    if (req.isAuthenticated()){
        Campground.findById(req.params.id,function(err,found){
            if(err){
                req.flash("error","Campground not found")
                //console.log(err)
                res.redirect("back")
            }
            else{
                if(found.author.id.equals(req.user._id)){
                   next()
                }
                else{
                    req.flash("error","You don't have permission.")
                    res.redirect("back")
                }
        
            }
            })
    }
    else{
        req.flash("error","Please log in.")
        res.redirect("back")
    }
    
}
//edit the comment
app.get("/campgrounds/:id/comments/:comment_id/edit",checkcomtauthor, function(req, res) {
    Comment.findById(req.params.comment_id,function(err, found) {
        if(err){
            res.redirect("back")
        }
        else{
            res.render("editcomments",{campground_id:req.params.id, comment:found})
        }
    })
    
})
//update
app.put("/campgrounds/:id/comments/:comment_id",checkcomtauthor,function(req,res){
     Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedcomt){
         if(err){
             res.redirect("back")
         }
         else{
              res.redirect("/campgrounds/" + req.params.id)
         }
     })
})
//delete comment
app.delete("/campgrounds/:id/comments/:comment_id",checkcomtauthor,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
            res.redirect("/campgrounds")
        }
        else{
            res.redirect("/campgrounds/"+req.params.id)
        }
    })
})

function checkcomtauthor(req,res,next){
    if (req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(err,found){
            if(err){
                req.flash("error","error")
                //console.log(err)
                res.redirect("back")
            }
            else{
                if(found.author.id.equals(req.user._id)){
                   next()
                }
                else{
                    req.flash("error","You don't have permission.")
                    res.redirect("back")
                }
        
            }
            })
    }
    else{
        req.flash("error","Please log in.")
        res.redirect("back")
    }
    
}
app.listen(process.env.PORT,process.env.IP,function(){
    console.log("yelpcamp server has started.")
})