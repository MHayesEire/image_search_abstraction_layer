//Image Search Abstraction Layer
//FCC API Basejump: Image Search Abstraction Layer
'use strict';
var mongo = require('mongodb');

var ejs = require('ejs');

var moment = require('moment');

var express = require('express');

var Search = require('bing.search');
var acBing = process.env.BING;
var search = new Search(acBing);

var app = express();

var urlmLab = process.env.MONGOLAB_URI;

mongo.MongoClient.connect(urlmLab || 'mongodb://localhost:27017/code101', function(err, db) { 
 if (err) { 
     throw new Error('Database failed to connect.'); 
   } else { 
     console.log('Successfully connected to MongoDB.'); 
   } 

db.createCollection("urls", { 
     capped: true, 
     size: 5242880, 
     max: 5000 
   }); 

app.set('view engine', 'ejs');
var bodyParser = require('body-parser');
//var path = require('path');
//require('dotenv').load();

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json()); 
app.use('/', express.static(process.cwd() + '/')); 
      
var port = process.env.PORT || 8080; 


app.get('/:query', function(req, res) {
    //res.sendFile(process.cwd() + '/index.html');

var q1 = req.params.query || "cat";
var size = req.query.offset || 10;
var tagline = "Search Query information: ";

var myTimeStamp = getTimeStamp();

var qTermObj = {};
if (q1) { 
    saveSearchQuery(qTermObj, db,res);
    
    qTermObj = { 
     "term": q1, 
     "when": myTimeStamp
    }; 
       
    getBing(q1,size,res);

      // res.send(urlObj); 


    
       
     } else { 
       qTermObj = { 
         "error": "Term not correct, please check again!" 
       }; 
       //res.send(urlObj); 
        res.render('pages/index', {
        "term": q1, 
        "when": "",            
        "error": "Term not correct, please check again!",
        tagline: tagline
    });
     } 
});


app.post("/", function (req, res) {
    console.log(req.body.query1);
    console.log(req.body.offset);        
var q1 = req.body.query1 || "cat";
var size = req.body.offset || 10;

var myTimeStamp = getTimeStamp();

var tagline = "Search Query information: ";


var qTermObj = {};
if (q1) { 
    
       qTermObj = { 
         "term": q1, 
         "when": myTimeStamp
       }; 
       
        saveSearchQuery(qTermObj, db,res);
        
        getBing(q1,size,res);

      // res.send(urlObj); 
      

      

       
     } else { 
       qTermObj = { 
         "error": "Term not correct, please check again!" 
       }; 
       //res.send(urlObj); 
        res.render('pages/index', {
        "term": q1, 
        "when": "",            
        "error": "Term not correct, please check again!",
        tagline: tagline
    });
     } 
});

app.post('/latest', function(req, res) {
   //console.log(req.body.urlnew);
   console.log("Here"); 
   
   getSearchQuery(res,db, function(result) {
    console.log(result);
    ///res.send(result);
      var tagline = "Search Query information: ";
     res.render('pages/latest', {
                term: result,
                 error: "",
                tagline: tagline
            });
  });

 // var myRes = getSearchQuery(res,db);
   
   //console.log("Here2" + myRes); 
   
});


app.listen(port,  function () 
{
	
console.log('Node.js ... HERE ... listening on port ' + port + '...');

});

function getTimeStamp (){
    var now = Math.floor(Date.now() / 1000);
    console.log(now);
    var myDate = moment.unix(now);
    myDate = myDate.format("YYYY-MM-DTh:mm:ss.s"); 
    console.log("mydate: ");
    console.log (myDate);
    return myDate;
}
  
function saveSearchQuery(q1, db,res) { 
      // save search term and date into db collection
     var squery= db.collection('searchTerms'); 
     squery.save(q1, function(err, result) { 
       if (err) throw err; 
       console.log('Saved ' + result); 
       

     //  var tagline = "Search Query information: ";
    
   /*     res.render('pages/index', {
            "term": result,
             "when": "date",
             "error": "",
            tagline: tagline
        });
        */
     }); 
   } 

function getSearchQuery(res,db, callback) {
  getData(res,db, function(data) {
    callback(data);
  });
}

function getData(res,db, callback) { 
        var cursor = db.collection('searchTerms').find().sort({ when: -1 });
        cursor.limit(10);
        cursor.skip(0);
        
        var tagline = "Search Query information: ";
         var result = [];
         var resultWhen = [];

          cursor.each(function(err, item) {
             if(item == null) {
                //db.close();
                  callback(result);
                return;
            }
        console.log(err);
          console.log(item);

              result.push({term: item["term"], when: item["when"]});
              console.log(JSON.stringify(result));
    });
   }    
   
function getBing(q1,size, res)
{
  search.images(q1,
  {top: size},
  function(err, results) {
            
    console.log(err);
   // console.log(results);
    
    var tagline = "Search Query Information: ";
    
    
    res.render('pages/index', {
        "term": results,
         "when": "date",
         "error": "",
        tagline: tagline
    });
    
    
  }
 
);
}
   
  // end  
});