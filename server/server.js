'use strict';

const express = require('express');

// DB
const mysql = require('mysql');
// DB connection Info
var dbInfo = {
    connectionLimit : 10,
    host: process.env.MYSQL_HOSTNAME,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
};

var connection = mysql.createPool(dbInfo);
console.log("Conecting to database...");

// Schauen ob Connection aufgebaut ist
connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error; 
    if (results[0].solution == 2) {
        console.log("Database connected and works");
    } else {
        console.error("There is something wrong with your database connection! Please check");
        process.exit(5); 
    }
});

// Constants
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

// App
const app = express();

// Features for JSON Body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Entrypoint 
app.get('/', (req, res) => {
    console.log("Got a request and redirect it to the static page");
    res.redirect('/static');
});

// Another GET Path - call it with: http://localhost:8080/special_path
app.get('/special_path', (req, res) => {
    res.send('This is another path');
});

// Another GET Path that shows the actual Request (req) Headers - call it with: http://localhost:8080/request_info
app.get('/request_info', (req, res) => {
    console.log("Request content:", req)
    res.send('This is all I got from the request:' + JSON.stringify(req.headers));
});

// POST Path - call it with: POST http://localhost:8080/client_post
app.post('/client_post', (req, res) => {
    if (typeof req.body !== "undefined" && typeof req.body.post_content !== "undefined") {
        var post_content = req.body.post_content;
        console.log("Client send 'post_content' with content:", post_content)
        // Set HTTP Status -> 200 is okay -> and send message
        res.status(200).json({ message: 'I got your message: ' + post_content });
    }
    else {
        // There is no body and post_contend
        console.error("Client send no 'post_content'")
        // Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'This function requries a body with "post_content"' });
    }
});

// ###################### To-Do-Liste PART ######################
// GET path for database
app.get('/todoliste', (req, res) => {
    console.log("Request to load all entries from table1");
    connection.query("SELECT * FROM `todoliste`;", function (error, results, fields) {
        if (error) {
            console.error(error); 
            res.status(500).json(error); 
        } else {
            console.log('Success answer from DB: ', results); 
            res.status(200).json(results); 
        }
    });
});

// DELETE path for database
app.delete('/todoliste/:id', (req, res) => {
    let id = req.params.id; 
    console.log("Request to delete Item: " + id); 
    connection.query("DELETE FROM `todoliste` WHERE `todoliste`.`id` = " + id + ";", function (error, results, fields) {
        if (error) {
            console.error(error); 
            res.status(500).json(error); 
        } else {
            console.log('Success answer: ', results); 
            res.status(200).json(results); 
        }
    });
});

// POST path for database
app.post('/todoliste', (req, res) => {
    if (typeof req.body !== "undefined" && typeof req.body.title !== "undefined" && typeof req.body.description !== "undefined") {
        var todo = req.body.todo;
        var datum = req.body.datum;
        console.log("Client send database insert request with 'todo': " + todo + " ; datum: " + datum); // <- log to server
        connection.query("INSERT INTO `table1` (`id`, `todo`, `datum`) VALUES (NULL, '" + id + "' ,'" + todo + "', '" + datum + "' ", function (error, results, fields) {
            if (error) {
                console.error(error); 
                res.status(500).json(error); 
            } else {
                console.log('Success answer: ', results); 
                res.status(200).json(results); 
            }
        });
    }
    else {
        console.error("Client send no correct data!")
        res.status(400).json({ message: 'This function requries a body with "todo" and "datum' });
    }
});
// ###################### DATABASE PART END ######################




// All requests to /static/... will be redirected to static files in the folder "public"
// call it with: http://localhost:8080/static
app.use('/static', express.static('public'))

// Start the actual server
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

// Start database connection
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}