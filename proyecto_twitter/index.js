var express = require("express");

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var mysql = require('mysql2');

var responseTime = require('response-time');

const NodeCache = require( "node-cache" );
const myCache = new NodeCache({stdTTL: 60, checkperiod: 120 });

var app = express();
var port = 3000;

//Headers
app.use((responseTime()),(req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET');
        res.status(200).json({});
    }
    next();
});

//Database Conection
var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    port: 3306,
    database: "Twitter"
});

conn.connect(
    function (err) {
        if (err) {
            console.log("Error, fix it ASAP with DBB!");
            throw err;
        }
        console.log("¡Database Connected!");
    }
);

//Invoke servidor
app.get("/", (req, res, next) => {
    res.send("Servidor is running");
});

//Get Timeline by user's following
app.get("/timeline/:id", (req, res) => {    
    var userId = parseInt(req.params.id);
    const sql = ("SELECT id_tweet, user_id, tweet_text FROM tweet t, follow f WHERE f.user_a = '"+ userId +"' AND t.user_id=f.user_b OR t.user_id= '"+ userId +"' GROUP BY t.id_tweet ORDER BY id_tweet DESC");
    
    console.log(myCache.keys());

    if(myCache.has('Timeline '+userId)){
        res.send(myCache.mget(['Timeline '+userId]));
        value = myCache.mget(['Timeline '+userId]);
        console.log(value)
    }else{
        conn.query( sql, 
            function (err, result) { 
                if (err) {
                    console.log("Error, fix it ASAP!");
                }else{
                    myCache.set('Timeline '+userId, result);
                    res.json(result);
                }
            }
        );
    }
});

//Create Tweet
app.post("/tweet", jsonParser, (req, res, next) => {
    const tweetData = req.body;
    const sql = ("INSERT INTO tweet VALUES (NULL, "+ tweetData.user_id +",'" +tweetData.tweet_text + "')");
    
    conn.query( sql, 
        function (err, result) { 
            if (err) {
                console.log("Error, fix it ASAP!", err);
                res.json({
                    message:"Error",
                });
            }else{
                res.json({
                    message:"Tweet created Successfuly",
                });
            }   
        }
    );
});

//Follow
app.post("/follow", jsonParser, (req, res, next) => {
    const followData = req.body;
    const sql = ("INSERT INTO follow VALUES (NULL, "+ followData.user_a +"," + followData.user_b  + ")");
    
    conn.query( sql, 
        function (err, result) { 
            if (err) {
                console.log("Error, fix it ASAP!", err);
                res.json({
                    message:"Error",
                });
            }else{
                res.json({
                    message:"Successful Follow",
                });
            }   
        }
    );
});

//Get Followers by user
app.get("/followers/:id", (req, res, next) => {
    var userId = parseInt(req.params.id);
    const sql = ("SELECT sum(user_a) AS SEGUIDOS FROM follow WHERE user_a='"+ userId +"'");
    conn.query( sql, 
        function (err, result) { 
            if (err) {
                console.log("Error, fix it ASAP!");
            }
            res.json({followers: result});
        }
    );
});

//Get Following by user
app.get("/following/:id", (req, res, next) => {
    var userId = parseInt(req.params.id);
    const sql = ("SELECT sum(user_b) AS SEGUIDORES FROM follow WHERE user_b='"+ userId +"'");
    conn.query( sql, 
        function (err, result) { 
            if (err) {
                console.log("Error, fix it ASAP!");
            }
            res.json({following: result});
        }
    );
});

//Servidor Listening
app.listen(port, () => {
    console.log("HTTP Servidor is check at port", port);
});