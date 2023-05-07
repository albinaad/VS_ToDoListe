# VS_ToDoListe
Verteile Systeme - Projekt - To Do Liste

Anleitung zum Starten der To-Do Listen Webapplication

Hinweis: Die Befehle können abweichen, da diese hier beim MacBook verwendet werden!

Nach dem Sie VS-Code und das Programm VS_ToDoListe geöffnet haben, müssen Sie das Terminal öffnen und einige Befehle durchführen.

1. Zum Server navigieren durch den Befehl ‚cd server‘.
2. Dann einen ‚npm install‘ durchführen.
3. Um Express zu installieren wird der Befehl ‚npm install express‘ durchgeführt.
4. Zusätzlich wollen wir eine Session konfigurieren durch den Befehl ‚npm install express- session‘.
5. Damit diese Session in der DB gespeichert wird führen wir den Befehl ‚npm install express- mysql-session --save‘ aus.
6. Zuletzt benötigen wir noch Bcrypt und führen dafür den Befehl ‚npm install bcrypt‘ aus.

Sobald diese Schritte durchgeführt wurden, kann das Programm gestartet werden. Dazu sollte der Docker Desktop geöffnet sein.
Nun kann im Terminal (immer noch unter Server) der Befehl ‚docker-compose up –build‘ durchgeführt werden. Es werden die Container nun aufgebaut und sobald diese fertig sind sollte ‚Conecting to database... | Running on http://0.0.0.0:8080 | Database connected and works’ für die 3 Server im Terminal erscheinen.

Nun kann im Webbrowser die URL ‘localhost:8080‘ eingegeben werden, um zur Starseite zu gelangen.

Mit ‚localhost:8085‘ gelangt man zu PhpMyAdmin und kann sich die Datenbank anschauen. User: exampleuser
Password: examplepass
Die Daten wurden der Einfachheit halber so übernommen und nicht geändert.

Zum Beenden der Container kann im Terminal ‚Control + c‘ gedrückt werden und dann der Befehl ‚docker-compose down‘ ausgeführt werden.

Die ‚database.sql‘ liegt ebenfalls im Ordner vor sollte es zu Problemen kommen. 

Viel Spaß beim Ausprobieren!
