var express = require('express');
const GoogleImages = require('google-images');
var cseId = process.env.cseId;
var apiKey = process.env.apiKey;
var mongo = require("mongodb").MongoClient;
var app = express();

const client = new GoogleImages(cseId, apiKey);
// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/api/imgSearch/:name', function (req, res) {
  var page = req.query.offset ? req.query.offset : 1;
  var imgName = req.params.name;
  var date = new Date().toISOString();
  client.search(imgName, {page: page}).then(function(images) {
    mongo.connect(process.env.MONGOLAB_URI, function(err, db) {
      if (err) throw err;
      db.collection('searchList').insert({
        term: imgName,
        when: date
      }, function(){
        db.close();
        res.json(images);
      });
    });
  });
});

app.get('/api/latest/imgsearch', function(req,res){
  mongo.connect(process.env.MONGOLAB_URI, function(err, db) {
    db.collection('searchList').find({}, { _id: 0 }).sort({ _id: 1 }).toArray(function(err, docs) {
      if (err) throw err;
      db.close();
      res.json(docs);
    });
  });
});

app.listen(process.env.PORT);