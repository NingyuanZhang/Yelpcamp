var mongoose=require("mongoose")
var Campground=require("./models/campground")
var Comment=require("./models/comment")

var data=[
    {
        name:"Clouds Rest",
        image:"https://pixabay.com/get/e83db50929f0033ed1584d05fb1d4e97e07ee3d21cac104491f7c77ea0e8bcb1_340.jpg",
        description:"Beautiful"
    },
    {
        name:"Clouds Rest",
        image:"https://www.photosforclass.com/download/pixabay-1246045?webUrl=https%3A%2F%2Fpixabay.com%2Fget%2Fe837b50928f0043ed1584d05fb1d4e97e07ee3d21cac104491f7c47ea0eabdb1_960.jpg&user=Free-Photos",
        description:"Beautiful"
    },
    {
        name:"Clouds Rest",
        image:"https://www.photosforclass.com/download/pixabay-1246045?webUrl=https%3A%2F%2Fpixabay.com%2Fget%2Fe837b50928f0043ed1584d05fb1d4e97e07ee3d21cac104491f7c47ea0eabdb1_960.jpg&user=Free-Photos",
        description:"Beautiful"
    }
    ]
    
data=[]

function seedDB()
{
    Campground.remove({},function(err){
    if(err){
        console.log(err)
    }
    else{
        console.log("removed!")
        data.forEach(function(seed){
        Campground.create(seed,function(err,campground){
            if(err){
                console.log(err)
            }
            else {
                console.log("added a campground")
                Comment.create({
                    text:"This place is great.",
                    author:"Homer"
                },function(err,comment){
                    if(err){
                        console.log(err)
                    }
                    else{
                        campground.comments.push(comment)
                        campground.save()
                        console.log("created a new comment")
                    }
                    
                })
            }
        })
    })
    }
    })
    
}

module.exports=seedDB