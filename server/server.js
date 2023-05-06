'use strict';

// Express Framework anlegen
const express = require('express');
// Express Session verwenden um Sitzungen zu verwalten
const session = require('express-session');
// Sitzung in der Datenbank speichern durch MySQL Session
const MySQLStore = require('express-mysql-session')(session);

// Datenbank
const mysql = require('mysql');
// Datenbank Connection Info 
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
    if (error) throw error; // Fehler, verlässt normal
    // Überprüfen, Ergebnis sollte 2 sein
    if (results[0].solution == 2) {
        // Alles in Ordnung
        console.log("Database connected and works");
    } else {
        // Connection ist nicht in Ordnung
        console.error("There is something wrong with your database connection! Please check");
        process.exit(5); 
    }
});

// Konstanten
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

// App
const app = module.exports = express();

// Features für JSON Body
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

// Session Konstante und Session anlegen
const sessionStore = new MySQLStore(options);

app.use(session({
	key: 'session_cookie_name',
	secret: 'session_cookie_secret',
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}));

// Einstiegspunkt 
app.get('/', (req, res) => {
    console.log("Got a request and redirect it to the static page");
    // Redirect sendet den Client auf einen anderen Pfad / eine andere Route. In diesem Fall auf die statische Route.
    res.redirect('/static');
});

// GET-Methode für den Pfad /todoliste - anzeigen der vorhandenen Liste
app.get('/todoliste', function(req, res) {
    // Userid aus der Session erhalten
    const userId = req.session.userId;
    // Anfrage mit der User ID ausführen. Listen ID mit die mit der User ID hinterleget sind werden gelesen.
    connection.query("SELECT listeId FROM `user_liste` WHERE userId = ?", [userId], function(error, results, fields) {
        // Fehler behandeln
        if (error) {
            res.status(500).json(error);
            return;
        } else {
          // Kein Fehler aufgetaucht
          console.log('Success answer from DB: ', results); 
          // Listen ID's werden in einer Map hinterlegt
          const listeIds = results.map(result => result.listeId);
          // Sollte keine Listen ID's gefunden werden, so wird ein leerer Array zurückgegeben
          if (listeIds.length === 0) {
            res.status(200).json([]);
            return;
        }
          // Anfrage um alle To-Do Listen mit der Listen ID' aus der vorherigen Anfrage zu erhalten
          connection.query("SELECT * FROM `todoliste` WHERE listeId IN (?)", [listeIds], function(error, results, fields) {
            // Fehler behandeln
            if (error) {
              res.status(500).json(error);
              return;
            } else {
              // Ergebnis an den Client senden 
              console.log('Success answer from DB: ', results); 
              res.status(200).json(results); 
            }
          });
        }
    });
});

// DELETE-Methode für den Pfad /todoliste und der id die mitgegeben wurde - löschen einer Liste
app.delete('/todoliste/:id', (req, res) => {
    // Löschend der Liste mit der jeweiligen ID
    // ID erhalten 
    let id = req.params.id;
    console.log("Request to delete Item: " + id); 
    // Anfrage zum löschen der Liste in der Datenbank
    connection.query("DELETE FROM `todoliste` WHERE `todoliste`.`listeId` = " + id + ";", function (error, results, fields) {
        // Fehler behandeln 
        if (error) {
            console.error(error); 
            res.status(500).json(error); 
        } else {
            // Alles in Ordnung
            console.log('Success answer: ', results); 
            
            // Anfrage um die Listen ID auch aus der user_liste Datenbank zu löschen
            connection.query("DELETE FROM `user_liste` WHERE `user_liste`.`listeId` = " + id + ";", function (error, results, fields) {
                // Fehler behandeln
                if (error) {
                    console.error(error); 
                    res.status(500).json(error); 
                } else {
                    // Alles in Ordnung
                    console.log('Success answer: ', results); 
                    res.status(200).json(results); 
                }
            });
        }
    });
});

// POST-Methode für den Pfad /todoliste - Neue Liste kann angelegt werden
app.post('/todoliste', (req, res) => {
    if (typeof req.body !== "undefined" && typeof req.body.liste_title !== "undefined") {
      // Erhalten der Variabeln aus der Session und aus dem Eingabefeld (title)
      const userId = req.session.userId;
      const liste_title = req.body.liste_title;
      console.log("Client sent database insert request with 'liste_title': " + liste_title);
      // Anfrage um die eine neue Liste mit der ID und dem Title anzulegen 
      connection.query("INSERT INTO `todoliste` (`listeId`,  `liste_title`) VALUES (NULL, ?)", [liste_title], function (error, results, fields) {
          // Fehler behandeln
          if (error) {
            console.error(error); 
            res.status(500).json(error); 
          } else {
            // Alles in Ordnung
            console.log('Success answer: ', results); 
            const listeId = results.insertId;
            // Anfrage um einen neuen Eintrag in der user_liste vorzunehmen und die listeId und userId hinzuzufügen
            connection.query("INSERT INTO `user_liste` (`listeId`, `userId`) VALUES (?, ?)", [listeId, userId], function (error, results, fields) {
                // Fehler behandeln
                if (error) {
                  console.error(error); 
                  res.status(500).json(error); 
                } else {
                  // Alles in Ordnung
                  console.log('Success answer: ', results); 
                  res.status(200).json(results); 
                }
              }
            );
          }
        }
      );
    } else {
      // Kein Title vorhanden
      console.error("Client sent no correct data!")
      // Fehler mit der Meldung, dass ein title benötigt wird 
      res.status(400).json({ message: 'This function requires a body with "liste_title" ' });
    }
  });

// POST-Methode für den Pfad /invite - weiter User können zu Listen eingeladen werden
app.post('/invite', function(req, res) {
    // Erhalten der Variabeln aus der Http-Antrage
    var email = req.body.userEmail;
    var listeId = req.body.listSelect;

     // Abfrage der Email in userId Relation um userId zu erlangen
     connection.query("SELECT userId FROM `user` WHERE email = ?", [email], function(error, results, fields) {
        //Fehler behandeln
        if (error) {
          res.status(500).json(error);
          return;
                } else if (results.length === 0) {
                    // Kein User unter der Email gefunden
                    res.status(404).json({ message: 'User not found' });
                    return;
                } else {
                    // User gefunden - userId speichern 
                    var userId = results[0].userId;

                    // Anfrage um die userId und listeId in der user_liste Relation zu speichern - der eingeladene User sollte nun die Liste sehen können
                    connection.query("INSERT INTO `user_liste` (userId, listeId) VALUES (?, ?)", [userId, listeId], function(error, results, fields) {
                        // Fehler behandeln 
                        if (error) {
                            res.status(500).json(error);
                            return;
                        } else {
                            // Alles in Ordnung
                            console.log('Success answer: ', results); 
                            res.status(200).json(results); 
                        }
                    });
                }
            });
        }
);
  
// GET-Methode für den Pfad /eintraege und der mitgegebenen listeId - anzeigen der Einträge der Liste
app.get('/eintraege/:listeId', function(req, res) {
    // Erhalten der userId aus der Session 
    const userId = req.session.userId;
    // Erhalten der listeId aus der Session
    const listeId = req.params.listeId;
    // Schauen ob die listeID definiert ist 
    if (typeof listeId === 'undefined') {
        res.status(400).json({ message: 'listeId is not defined.' });
        return;
    }
    // Anfrage um die Einträge der Liste anzuzeigen, dazu die listeId vergleichen
    connection.query("SELECT * FROM `eintraege` WHERE todoliste_listeId = ?", [listeId], function(error, results, fields) {
        // Fehler behandeln
        if (error) {
            res.status(500).json(error);
            return;
        } else {
          // Alles in Ordnung
          console.log('Success answer from DB: ', results);
          res.status(200).json(results); 
        }
    });
});

// DELETE-Methode für den Pfad /eintraege und der mitgegebenen ID - löschen einzelner Einträge
app.delete('/eintraege/:id', (req, res) => {
    // Erhalten der ID 
    let id = req.params.id; 
    console.log("Request to delete Item: " + id); 

    // Anfrage um die Einträge aus der Relation zu löschen wenn die ID übereinstimmt
    connection.query("DELETE FROM `eintraege` WHERE `eintraege`.`eintraegeId` = " + id + ";", function (error, results, fields) {
        if (error) {
            // Fehler behandlen
            console.error(error); 
            res.status(500).json(error); 
        } else {
            // Alles in Ordnung 
            console.log('Success answer: ', results); 
            res.status(200).json(results); 
        }
    });
});

// POST-Methode für den Pfad /eintraege mit der mitgegbenen listeId - Hinzufügen einzelner Einträge 
app.post('/eintraege/:listeId', (req, res) => {
    if (typeof req.body !== "undefined" && typeof req.body.eintraege_title !== "undefined" && typeof req.body.eintraege_description !== "undefined") {
        // Inhalt der Variablen erhalten
        var todoliste_listeId = req.params.listeId;
        var eintraege_title = req.body.eintraege_title;
        var eintraege_description = req.body.eintraege_description;
        console.log("Client send database insert request with 'eintraege_title': " + eintraege_title + " ; eintraege_description: " + eintraege_description); // <- log to server
        // Anfrage um einen neune Eintrag in der Realtion zu speichern mit allen Variablen, die ID's und der Zeitstempel werden von der DB hinzugefügt
        connection.query("INSERT INTO `eintraege` (`eintraegeId`, `todoliste_listeId`, `eintraege_title`, `eintraege_description`, `created_at`) VALUES (NULL, '" + todoliste_listeId +"', '" + eintraege_title + "', '" + eintraege_description + "', current_timestamp());", function (error, results, fields) {
            if (error) {
                // Fehler behandlen
                console.error(error); 
                res.status(500).json(error); 
            } else {
                // Alles in Orndung
                console.log('Success answer: ', results);
                res.status(200).json(results); 
            }
        });
    }
    else {
        // Fehler: Kein Title 
        console.error("Client send no correct data!")
        res.status(400).json({ message: 'This function requries a body with "title"' });
    }
});

// GET-Methode für den Pfad /registrierung
app.get('/registrierung', (req, res) => {
    console.log("Request to load User with userId" + req.params.userId);
    
    // Anfrage um die Daten der User Relation zu erhalten
    connection.query("SELECT userId, benutzername, email FROM `user`;", function (error, results, fields) {
        if (error) {
            // Fehler behandlen
            console.error(error); 
            res.status(500).json(error); 
        } else {
            // Alles in Ordnung
            console.log('Success answer from DB: ', results); 
            res.status(200).json(results); 
        }
    });
});

// Email sollte im Email-Format sein
function isEmailValid(email) {
    // Regulärer Ausdruck für E-Mail-Format-Validierung
    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegEx.test(email);
}

// POST-Methode für den Pfad /registierung  - Neuen User anlegen
app.post('/registrierung', (req, res) => {

    if (typeof req.body !== "undefined" && typeof req.body.benutzername !== "undefined" && typeof req.body.email !== "undefined" && isEmailValid(req.body.email) &&typeof req.body.password !== "undefined" && typeof req.body.passwordWiederholen) {
        var benutzername = req.body.benutzername;
        var email = req.body.email;
        var password = req.body.password;
        var passwordWiederholen = req.body.passwordWiederholen;

        if (password != passwordWiederholen) {
            // Überprüfen das die beiden Passwortfelder übereinstimmen - wenn nicht wird der Fehler angezeigt
            console.error('Passwörter stimmen nicht überein.');
            res.redirect("/static/registrierung.html");
            return;
        }

        // saltRounds und passwordHash anlegen - damit das Passwort in der Datenbank verschlüsselt hinterlegt wird
        const saltRounds = bcrypt.genSaltSync(10);
        var passwordHash = bcrypt.hashSync(password, saltRounds);
        // Anfrage um einen neuen User in der user Realtion anzulegen, mit den benötigten Variabeln aus dem Formular        
        connection.query("INSERT INTO `user` (`userId`, `benutzername`, `email`, `password`) VALUES (NULL, '" + benutzername + "', '" + email + "', '" + passwordHash + "');", function (error, results, fields) {
            if (error) {
                // Fehler behandlen
                console.error(error); 
                res.status(500).json(error); 
            } else {
                // Alles in Ordnung
                console.log('Success answer: ', results); 
            }
            // Den User zur Anmeldung weiterleiten nach einer erfolgreichen Registrierung
            res.redirect("/static/anmeldung.html"); 
        }); 
    } 
    
    else {
        console.error("Client send no correct data!")
        res.status(400).json({ message: 'Alle Felder müssen korrekt ausgefüllt werden!' });
    } 

}); 

// POST-Methode für den Pfad /anmeldung - User kann sich einloggen
app.post('/anmeldung', (req, res) => {

    if (typeof req.body !== "undefined" && typeof req.body.email !== "undefined" && typeof req.body.password !== "undefined") {
        var email = req.body.email;
        var password = req.body.password;
        // Anfrage üm alle Daten der Relation user zu laden 
        connection.query("SELECT * FROM user WHERE email = ?", [email], (error, result) => {
            if (error) {
                // Fehler behandeln
                console.error(error);
                res.status(500).json(error); 
                return;
            } 

            // Ist der Benutzer vorhanden? Wenn nein, dann wird der JSON angezeigt
            if (result.length === 0) {
                res.status(401).json('Ungültige Email oder Passwort.');
                return;
            }

            //Vergleiche Password und HashPassword
            bcrypt.compare(password, result[0].password, (error, match) => {
                if (error) {
                    // Fehler behandlen
                    console.error(error); 
                    res.status(500).json(error); 
                    return;
                } 

                if(!match) {
                    // Wenn Password und Email nicht übereinstimmen wird Fehler JSON angezeigt
                    res.status(401).json('Ungültige Email oder Passwort.');
                    return;
                }

                //Benutzer angemeldet - speichern der email und userId in der Session
                req.session.loggedin = true;
                req.session.email = email;
                req.session.userId = result[0].userId;
                // User an die todoliste.html weiterleiten
                res.redirect("/static/todoliste.html");
            });


        });
    }

    else {
        // Fehler wenn die Felder nicht korrekt ausgefüllt wurden 
        console.error("Client send no correct data!")
        res.status(400).json({ message: 'Alle Felder müssen korrekt ausgefüllt werden!' });
    } 

});

// Überprüfen ob User eingeloggt (Datenbank) - wenn nicht wird er zu Anmeldung weitergeleitet 
app.get('/database', (req, res) => {
    if (!req.session.loggedin) {
      res.redirect('/anmeldung.html');
      return;
    }
});

// Überprüfen ob User eingeloggt (Todoliste) - wenn nicht wird er zu Anmeldung weitergeleitet 
app.get('/todoliste', (req, res) => {
    if (!req.session.loggedin) {
      res.redirect('/anmeldung.html');
      return;
    }
});

// Überprüfen ob User eingeloggt (Einträge) - wenn nicht wird er zu Anmeldung weitergeleitet 
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
        res.status(500).json(error); 
        return;
      }
      // Weiterleitung zur Startseite / index.html 
      res.redirect('/');
    });
  });


// Alle Anfragen an /static/... werden auf statische Dateien im Ordner "public" umgeleitet
app.use('/static', express.static('public'))

// Server starten
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

// Starten der Datenbank Connection
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}