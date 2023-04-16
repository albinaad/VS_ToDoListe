'use strict';

const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

// Database
const mysql = require('mysql');
// Database connection info - used from environment variables
var dbInfo = {
    connectionLimit : 10,
    host: process.env.MYSQL_HOSTNAME,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
};

var connection = mysql.createPool(dbInfo);
console.log("Conecting to database...");

// Connection überprüfen
connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error; // <- this will throw the error and exit normally
    // check the solution - should be 2
    if (results[0].solution == 2) {
        // everything is fine with the database
        console.log("Database connected and works");
    } else {
        // connection is not fine - please check
        console.error("There is something wrong with your database connection! Please check");
        process.exit(5); // <- exit application with error code e.g. 5
    }
});

// Constants
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

// App
const app = module.exports = express();

// Features for JSON Body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Bcrypt anlegen
const bcrypt = require('bcryptjs');

// Konfiguration Express Session Middleware
const options = {
    host: 'meinecooledb',
    port: 3306,
    user: 'exampleuser',
    password: 'examplepass',
    database: 'exampledb',
    clearExpired: true,
    checkExpirationInterval: 900000, // 15 Minuten
    expiration: 86400000 // 1 Tag
};

const sessionStore = new MySQLStore(options);

app.use(session({
	key: 'session_cookie_name',
	secret: 'session_cookie_secret',
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}));

// Entrypoint 
app.get('/', (req, res) => {
    console.log("Got a request and redirect it to the static page");
    // redirect will send the client to another path / route. In this case to the static route.
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

// ###################### BUTTON EXAMPLE ######################
// POST path for Button 1
app.post('/button1_name', (req, res) => {
    // Load the name from the formular. This is the ID of the input:
    const name = req.body.name
    // Print it out in console:
    console.log("Client send the following name: " + name + " | Button1")
    // Send JSON message back - this could be also HTML instead.
    res.status(200).json({ message: 'I got your message - Name is: ' + name });
    // More information here: https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms
})

// GET path for Button 2
app.get('/button2', (req, res) => {
    // This will generate a random number and send it back:
    const random_number = Math.random();
    // Print it out in console:
    console.log("Send the following random number to the client: " + random_number + " | Button2")
    // Send it to the client / webbrowser:
    res.send("Antwort: " + random_number);
    // Instead of plain TXT - the answer could be a JSON
    // More information here: https://www.w3schools.com/xml/ajax_intro.asp
});
// ###################### BUTTON EXAMPLE END ######################


// ###################### DATABASE PART ######################
// GET path for database
//app.get('/database', (req, res) => {
 //   console.log("Request to load all entries from table1");
    // Prepare the get query
  //  connection.query("SELECT * FROM `table1`;", function (error, results, fields) {
  //      if (error) {
            // we got an errror - inform the client
    //        console.error(error); // <- log error in server
     //       res.status(500).json(error); // <- send to client
     //   } else {
      //      // we got no error - send it to the client
      //      console.log('Success answer from DB: ', results); // <- log results in console
            // INFO: Here could be some code to modify the result
       //     res.status(200).json(results); // <- send it to client
      //  }
   // });
//});

app.get('/database', function(req, res) {
    // get the userid parameter from the session
    const userId = req.session.userId;
    // execute the query with the userid parameter
    connection.query("SELECT * FROM `table1` WHERE user_userId = ?", [userId], function(error, results, fields) {
        // handle the error, if any
        if (error) {
            res.status(500).json(error);
            return;
        } else {
          // we got no error - send it to the client
          console.log('Success answer from DB: ', results); // <- log results in console
          // INFO: Here could be some code to modify the result
          res.status(200).json(results); // <- send it to client
        }
    });
});

// DELETE path for database
app.delete('/database/:id', (req, res) => {
    // This path will delete an entry. For example the path would look like DELETE '/database/5' -> This will delete number 5
    let id = req.params.id; // <- load the ID from the path
    console.log("Request to delete Item: " + id); // <- log for debugging

    // Actual executing the query to delete it from the server
    // Please keep in mind to secure this for SQL injection!
    connection.query("DELETE FROM `table1` WHERE `table1`.`task_id` = " + id + ";", function (error, results, fields) {
        if (error) {
            // we got an errror - inform the client
            console.error(error); // <- log error in server
            res.status(500).json(error); // <- send to client
        } else {
            // Everything is fine with the query
            console.log('Success answer: ', results); // <- log results in console
            // INFO: Here can be some checks of modification of the result
            res.status(200).json(results); // <- send it to client
        }
    });
});

// POST path for database
app.post('/database', (req, res) => {
    // This will add a new row. So we're getting a JSON from the webbrowser which needs to be checked for correctness and later
    // it will be added to the database with a query.
    if (typeof req.body !== "undefined" && typeof req.body.title !== "undefined" && typeof req.body.description !== "undefined") {
        // The content looks good, so move on
        // Get the content to local variables:
        var user_userId = req.session.userId;
        var title = req.body.title;
        var description = req.body.description;
        console.log("Client send database insert request with 'title': " + title + " ; description: " + description); // <- log to server
        // Actual executing the query. Please keep in mind that this is for learning and education.
        // In real production environment, this has to be secure for SQL injection!
        connection.query("INSERT INTO `table1` (`task_id`, `user_userId`, `title`, `description`, `created_at`) VALUES (NULL, '" + user_userId +"', '" + title + "', '" + description + "', current_timestamp());", function (error, results, fields) {
            if (error) {
                // we got an errror - inform the client
                console.error(error); // <- log error in server
                res.status(500).json(error); // <- send to client
            } else {
                // Everything is fine with the query
                console.log('Success answer: ', results); // <- log results in console
                // INFO: Here can be some checks of modification of the result
                res.status(200).json(results); // <- send it to client
            }
        });
    }
    else {
        // There is nobody with a title nor description
        console.error("Client send no correct data!")
        // Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'This function requries a body with "title" and "description' });
    }
});


app.get('/todoliste', function(req, res) {
    // get the userid parameter from the session
    const userId = req.session.userId;
    // execute the query with the userid parameter
    connection.query("SELECT * FROM `todoliste` WHERE user_userId = ?", [userId], function(error, results, fields) {
        // handle the error, if any
        if (error) {
            res.status(500).json(error);
            return;
        } else {
          // we got no error - send it to the client
          console.log('Success answer from DB: ', results); // <- log results in console
          // INFO: Here could be some code to modify the result
          res.status(200).json(results); // <- send it to client
        }
    });
});

// DELETE path for todoliste
app.delete('/todoliste/:id', (req, res) => {
    // This path will delete an entry. For example the path would look like DELETE '/database/5' -> This will delete number 5
    let id = req.params.id; // <- load the ID from the path
    console.log("Request to delete Item: " + id); // <- log for debugging

    // Actual executing the query to delete it from the server
    // Please keep in mind to secure this for SQL injection!
    connection.query("DELETE FROM `todoliste` WHERE `todoliste`.`listeId` = " + id + ";", function (error, results, fields) {
        if (error) {
            // we got an errror - inform the client
            console.error(error); // <- log error in server
            res.status(500).json(error); // <- send to client
        } else {
            // Everything is fine with the query
            console.log('Success answer: ', results); // <- log results in console
            // INFO: Here can be some checks of modification of the result
            res.status(200).json(results); // <- send it to client
        }
    });
});

// POST path for todoliste
app.post('/todoliste', (req, res) => {
    // This will add a new row. So we're getting a JSON from the webbrowser which needs to be checked for correctness and later
    // it will be added to the database with a query.
    if (typeof req.body !== "undefined" && typeof req.body.liste_title !== "undefined") {
        // The content looks good, so move on
        // Get the content to local variables:
        var user_userId = req.session.userId;
        var liste_title = req.body.liste_title;
        console.log("Client send database insert request with 'liste_title': " + liste_title ); // <- log to server
        // Actual executing the query. Please keep in mind that this is for learning and education.
        // In real production environment, this has to be secure for SQL injection!
        connection.query("INSERT INTO `todoliste` (`listeId`, `user_userId`, `liste_title`) VALUES (NULL, '" + user_userId +"', '" + liste_title + "');", function (error, results, fields) {
            if (error) {
                // we got an errror - inform the client
                console.error(error); // <- log error in server
                res.status(500).json(error); // <- send to client
            } else {
                // Everything is fine with the query
                console.log('Success answer: ', results); // <- log results in console
                // INFO: Here can be some checks of modification of the result
                res.status(200).json(results); // <- send it to client
            }
        });
    }
    else {
        // There is nobody with a title nor description
        console.error("Client send no correct data!")
        // Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'This function requries a body with "liste_title" ' });
    }
});

app.get('/eintraege/:listeId', function(req, res) {
    // get the userid parameter from the session
    const userId = req.session.userId;
    // get the listeId parameter from session
    const listeId = req.params.listeId;
    // Check if listeId is defined
    if (typeof listeId === 'undefined') {
        res.status(400).json({ message: 'listeId is not defined.' });
        return;
    }
    // execute the query with the listeId parameter
    connection.query("SELECT * FROM `eintraege` WHERE todoliste_listeId = ?", [listeId], function(error, results, fields) {
        // handle the error, if any
        if (error) {
            res.status(500).json(error);
            return;
        } else {
          // we got no error - send it to the client
          console.log('Success answer from DB: ', results); // <- log results in console
          // INFO: Here could be some code to modify the result
          res.status(200).json(results); // <- send it to client
        }
    });
});

// DELETE path for einträge
app.delete('/eintraege/:id', (req, res) => {
    // This path will delete an entry. For example the path would look like DELETE '/database/5' -> This will delete number 5
    let id = req.params.id; // <- load the ID from the path
    console.log("Request to delete Item: " + id); // <- log for debugging

    // Actual executing the query to delete it from the server
    // Please keep in mind to secure this for SQL injection!
    connection.query("DELETE FROM `eintraege` WHERE `eintraege`.`eintraegeId` = " + id + ";", function (error, results, fields) {
        if (error) {
            // we got an errror - inform the client
            console.error(error); // <- log error in server
            res.status(500).json(error); // <- send to client
        } else {
            // Everything is fine with the query
            console.log('Success answer: ', results); // <- log results in console
            // INFO: Here can be some checks of modification of the result
            res.status(200).json(results); // <- send it to client
        }
    });
});

// POST path for einträge
app.post('/eintraege', (req, res) => {
    // This will add a new row. So we're getting a JSON from the webbrowser which needs to be checked for correctness and later
    // it will be added to the database with a query.
    if (typeof req.body !== "undefined" && typeof req.body.eintraege_title !== "undefined" && typeof req.body.eintraege_description !== "undefined") {
        // The content looks good, so move on
        // Get the content to local variables:
        var todoliste_listeId = req.session.listeId;
        var eintraege_title = req.body.eintraege_title;
        var eintraege_description = req.body.eintraege_description;
        console.log("Client send database insert request with 'eintraege_title': " + eintraege_title + " ; eintraege_description: " + eintraege_description); // <- log to server
        // Actual executing the query. Please keep in mind that this is for learning and education.
        // In real production environment, this has to be secure for SQL injection!
        connection.query("INSERT INTO `eintraege` (`eintraegeId`, `todoliste_listeId`, `eintraege_title`, `eintraege_description`, `created_at`) VALUES (NULL, '" + todoliste_listeId +"', '" + eintraege_title + "', '" + eintraege_description + "', current_timestamp());", function (error, results, fields) {
            if (error) {
                // we got an errror - inform the client
                console.error(error); // <- log error in server
                res.status(500).json(error); // <- send to client
            } else {
                // Everything is fine with the query
                console.log('Success answer: ', results); // <- log results in console
                // INFO: Here can be some checks of modification of the result
                res.status(200).json(results); // <- send it to client
            }
        });
    }
    else {
        // There is nobody with a title nor description
        console.error("Client send no correct data!")
        // Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'This function requries a body with "title" and "description' });
    }
});
// ###################### DATABASE PART END ######################

// Datenbankteil für die Registrierung 
// GET User Datenbank
app.get('/registrierung', (req, res) => {
    console.log("Request to load User with userId" + req.params.userId);
    
    // Prepare the get query
    connection.query("SELECT userId, benutzername, email FROM `user`;", function (error, results, fields) {
        if (error) {
            // we got an errror - inform the client
            console.error(error); // <- log error in server
            res.status(500).json(error); // <- send to client
        } else {
            // we got no error - send it to the client
            console.log('Success answer from DB: ', results); // <- log results in console
            // INFO: Here could be some code to modify the result
            res.status(200).json(results); // <- send it to client
        }
    });
});

// Email sollte im Email-Format sein
function isEmailValid(email) {
    // Regulärer Ausdruck für E-Mail-Format-Validierung
    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegEx.test(email);
}

// POST User Datenbank
app.post('/registrierung', (req, res) => {

    if (typeof req.body !== "undefined" && typeof req.body.benutzername !== "undefined" && typeof req.body.email !== "undefined" && isEmailValid(req.body.email) &&typeof req.body.password !== "undefined" && typeof req.body.passwordWiederholen) {
        var benutzername = req.body.benutzername;
        var email = req.body.email;
        var password = req.body.password;
        var passwordWiederholen = req.body.passwordWiederholen;

        if (password != passwordWiederholen) {
            console.error('Passwörter stimmen nicht überein.');
            res.redirect("/static/registrierung.html");
            return;
        }

        // saltRounds und passwordHash anlegen
        const saltRounds = bcrypt.genSaltSync(10);
        var passwordHash = bcrypt.hashSync(password, saltRounds);
                
        connection.query("INSERT INTO `user` (`userId`, `benutzername`, `email`, `password`) VALUES (NULL, '" + benutzername + "', '" + email + "', '" + passwordHash + "');", function (error, results, fields) {
            if (error) {
                // we got an errror - inform the client
                console.error(error); // <- log error in server
                res.status(500).json(error); // <- send to client
            } else {
                // Everything is fine with the query
                console.log('Success answer: ', results); // <- log results in console
                // INFO: Here can be some checks of modification of the result
            }
            res.redirect("/static/anmeldung.html"); 
        }); 
    } 
    
    else {
        console.error("Client send no correct data!")
        // Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'Alle Felder müssen korrekt ausgefüllt werden!' });
    } 

}); 


// LOGIN
// POST für Login
app.post('/anmeldung', (req, res) => {

    if (typeof req.body !== "undefined" && typeof req.body.email !== "undefined" && typeof req.body.password !== "undefined") {
        var email = req.body.email;
        var password = req.body.password;

        connection.query("SELECT * FROM user WHERE email = ?", [email], (error, result) => {
            if (error) {
                // we got an errror - inform the client
                console.error(error); // <- log error in server
                res.status(500).json(error); // <- send to client
                return;
            } 

            // Benutzer vorhanden?
            if (result.length === 0) {
                res.status(401).json('Ungültige Email oder Passwort.');
                return;
            }

            //Vergleiche Password und HashPassword
            bcrypt.compare(password, result[0].password, (error, match) => {
                if (error) {
                    // we got an errror - inform the client
                    console.error(error); // <- log error in server
                    res.status(500).json(error); // <- send to client
                    return;
                } 

                if(!match) {
                    res.status(401).json('Ungültige Email oder Passwort.');
                    return;
                }

                //Benutzer angemeldet
                req.session.loggedin = true;
                req.session.email = email;
                req.session.userId = result[0].userId;

                res.redirect("/static/todoliste.html");
            });


        });
    }

    else {
        console.error("Client send no correct data!")
        // Set HTTP Status -> 400 is client error -> and send message
        res.status(400).json({ message: 'Alle Felder müssen korrekt ausgefüllt werden!' });
    } 

});

// Überprüfen ob User eingeloggt (Database)
app.get('/database', (req, res) => {
    if (!req.session.loggedin) {
      res.redirect('/anmeldung.html');
      return;
    }
});

// Überprüfen ob User eingeloggt (Todoliste)
app.get('/todoliste', (req, res) => {
    if (!req.session.loggedin) {
      res.redirect('/anmeldung.html');
      return;
    }
});

// Überprüfen ob User eingeloggt (Einträge)
app.get('/einträge', (req, res) => {
    if (!req.session.loggedin) {
      res.redirect('/anmeldung.html');
      return;
    }
});

//Ausloggen und Session beenden
app.get('/logout', (req, res) => {
    req.session.destroy((error) => {
      if (error) {
        console.error(error);
        res.status(500).json(error); // <- send to client
        return;
      }
  
      res.redirect('/');
    });
  });


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









