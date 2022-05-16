/*
 * SimpleUser-TokenServer
 * v1.0.0_alpha_22051001
 * SimpleAstronaut
 */

var express = require('express');
var app = express();
var crypto = require('crypto');
var mysql = require('mysql');
var md5 = require('md5-node');
const { exit } = require('process');

/* 
 * MySql
 * You need to fill in MySQL related parameters in the following code
 * Including MySQL address, port, account and password
 */
var connection = mysql.createConnection({
    host: '',
    port: '',
    user: '',
    password: '',
    database: ''
});

/*
 * get token interface
 * Upload the user ID and password to generate a token
 * SimpleAstronaut
 */
app.get('/token/get', function (req, res) {
    var r = req.query;
    var userID = r.id;
    var password = r.password;
    var SHAstr = userID + password;
    var PassWordSHA = md5(SHAstr);
    var ret;

    var sql = 'SELECT * FROM PASSWORD';
    connection.query(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        var length = Object.keys(result).length;

        for (var i = 0; i < length; i++) {
            //ret = eval('(' + '{ "status" : 301, "errmsg" : "FALSE" }' + ')');
            var TrueUserID = result[i].USER_ID;
            //TODO 若存在匹配的USER_ID,生成时效性TOKEN
            if (userID == TrueUserID) {
                if (PassWordSHA == result[i].PASSWORD) {
                    var time_now = Date.now();
                    var time_end = time_now + 3600;
                    var token = md5(result[i].USER_ID + result[i].PASSWORD + time_now + time_end);

                    //TODU 拼接token sql语句，后期添加防SQL注入
                    var addtoken = 'INSERT INTO TOKEN(TOKEN_ID,USER_ID,TOKEN,END_TIME) VALUES(0,?,?,?)';
                    var addTokenParams = [userID, token, time_end];
                    connection.query(addtoken, addTokenParams, function (err, result) {
                        if (err) {
                            console.log('[INSERT ERROR] - ', err.message);
                            return;
                        }
                        console.log(Date() + '-User ID:' + userID + ' login successfully from ip:' + req.ip);
                        ret = '{ "status" : 200, "token" : "' + token + '" }';
                        ret = eval('(' + ret + ')');
                        res.send(ret);
                    })
                }
                else {
                    ret = eval('(' + '{ "status" : 301, "errmsg" : "PFALSE" }' + ')');
                    console.log(Date() + '-User ID:' + userID + ' Password false from ip:' + req.ip);
                    res.send(ret);
                }
                break;
            }
            /*else {
                var ret = eval('(' + '{ "status" : 301, "errmsg" : "FALSE" }' + ')');
                console.log(Date()+' No USER_ID from ip:'+req.ip);
                res.send(ret);
            }*/
        }
        //res.send(ret);
    })
})

/*
 * get token id interface
 * Upload the token to return USER_ID
 * SimpleAstronaut
 */
app.get('/token/id', function (req, res) {
    var token = req.query.token;
    var ret;

    var sql = 'SELECT * FROM TOKEN';
    connection.query(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        var length = Object.keys(result).length;
        ret = '{ "status" : 300, "errmsg" : "NoTOKEN" }';
        for (var i = 0; i < length; i++) {
            var TrueToken = result[i].TOKEN;
            if (TrueToken == token) {
                var time = JSON.stringify(result[i].END_TIME);
                var time_now = Date.now();
                ret = JSON.stringify(time_now);
                if (time_now - time > 3600) {
                    ret = '{ "status" : 300, "errmsg" : "TOKEN OUT DATE" }'
                }
                else {
                    var con = Date() + '- Get TOKEN USER_ID from ip' + req.ip;
                    console.log(con);
                    ret = '{ "status" : 200, "USER_ID" : ' + JSON.stringify(result[i].USER_ID) + ' }';
                }
            }
        }
        res.send(ret);
    })
    //ret = eval('(' + ret + ')');
    //res.send(token);
})

var server = app.listen(8081, function () {
    console.log(Date() + "-|-TokenServer Start up on version 1.0.0")
    connection.connect();
    console.log(Date() + "SQL connect succfully");
})