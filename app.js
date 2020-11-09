var express     = require('express');
var mongoose    = require('mongoose');
var multer      = require('multer');
var path        = require('path');
var csvModel    = require('./models/csv');
var socialCircle = require('./models/socialcircle')
var csv         = require('csvtojson');
var bodyParser  = require('body-parser');

var storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./public/uploads');
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    }
});

var uploads = multer({storage:storage});
//connect to db
var url =   'mongodb+srv://Admin:admin@cluster0.zoibg.mongodb.net/COVID-App?retryWrites=true&w=majority'

mongoose.connect(url,{useNewUrlParser:true})
.then(()=>console.log('connected to db'))
.catch((err)=>console.log(err))


//init app
var app = express();

//set the template engine
app.set('view engine','ejs');

//fetch data from the request
app.use(bodyParser.urlencoded({extended:false}));

//static folder
app.use(express.static(path.resolve(__dirname,'public')));

//default pageload
app.get('/',(req,res)=>{
    
    csvModel.find((err,data)=>{
         if(err){
             console.log(err);
         }else{
              if(data!=''){
                  res.render('demo',{data:data});
              }else{
                  res.render('demo',{data:''});
              }
         }
    });
});

// csv upload from website
app.post('/',uploads.single('csv'),(req,res)=>{
csv()
.fromFile(req.file.path)      
.then((jsonObj)=>{
    console.log(jsonObj);
     csvModel.insertMany(jsonObj,(err,data)=>{
            if(err){
                console.log(err);
            }else{
                res.redirect('/');
            }
     });
   });
});

// test post request, used for pinging, only test
app.post('/postdata',(req,res)=> {
    var data = req.body.data;
    res.status(200).json({
        message: "Data recieved sucessfully."
    });
});

app.post('/getSocialCircle',(req,res)=> {
    var command = req.body
    var query = socialCircle.findOne({StudentGmail: command})
    query.exec(function(err,results){
        if(results == null){
            res.status(200).json({
                message: 'Null'
            })
        }else {
            var searchForSocialCircle = socialCircle.find({StudentGmail: command}).select('-StudentGmail')
            res.status(200).json(JSON.stringify(searchForSocialCircle))
        }
    })
    //res.status(200).json({
    //    message: "Data recieved suscessfully"
    //});
});

//assign port
var port = process.env.PORT || 3000;
app.listen(port,()=>console.log('server run at port '+ port));