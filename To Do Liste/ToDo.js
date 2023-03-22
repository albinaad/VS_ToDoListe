// Variabeln anlegen
var enterButton = document.getElementById("enter");
var input = document.getElementById("benutzerInput");
var anstehendeToDoListe = document.getElementById("anstehendeToDo");

// EventListener für den Hinzufügen Button
enterButton.addEventListener("click",erstelleToDo);

// Function für EventListener des Hinzufügen-Buttons
function erstelleToDo() {
    var li = document.createElement("li"); // Erstellt neues Element in der Liste
    var checkbox = document.createElement("input"); 
    checkbox.type = "checkbox";
    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(input.value)); // Liest Wert aus Textfeld und gibt es an Li weiter.
    anstehendeToDoListe.appendChild(li); // Neues Listenelement in Ul-Liste wird angelegt
    input.value = ""; // Leert Input Feld  
    
    // Löschen Button zu jedem Element hinzufügen
    var löschenButton = document.createElement("button");
    löschenButton.appendChild(document.createTextNode("Löschen"));
    li.appendChild(löschenButton);

    // Löschfunktion durch EventListener
    löschenButton.addEventListener("click",löschenToDo);

    // Funktion für das Löschen
    function löschenToDo() {
        li.classList.add("delete");
    }
   
   // To-Do als erledigt anzeigen
    li.addEventListener("click",erledigtesToDo);
    function erledigtesToDo() {
        li.classList.toggle("done");
    }
}



