<?php

/** Validation of Data before data is saved  */

/** Name validation  */
if (empty($_POST["name"])) {
    die("Name is required");
}


/** email validation  */
/** filtervar function check if email is valid -> output: T/F  */
if ( ! filter_var($_POST["email"], FILTER_VALIDATE_EMAIL)) {
    die("Valid email is required");
}


/** password max length with strlen function */
if (strlen($_POST["password"]) < 8) {
    die("Password min 8 characters");
}


/** password min length with pregmatch function */
if ( ! preg_match("/[a-z]/i", $_POST["password"])) {
    die("Password must have min one letter");
}


/** password min length with pregmatch function */
if ( ! preg_match("/[0-9]/", $_POST["password"])) {
    die("Password must have min one number");
}

/** Check if letter contain  */
if ($_POST["password"] !== $_POST["password_confirmation"]) {
    die("Password and Password confirmation are not the same");
}


/** Passwort saving as hash  */
$password_hash = password_hash($_POST["password"], PASSWORD_DEFAULT);

$mysqli = require __DIR__ . "/database.php";

$sql = "INSERT INTO user (name, email, password_hash)
        VALUES (?, ?, ?)";
        
$stmt = $mysqli->stmt_init();

if ( ! $stmt->prepare($sql)) {
    die("SQL error: " . $mysqli->error);
}

$stmt->bind_param("sss",
                  $_POST["name"],
                  $_POST["email"],
                  $password_hash);
                  
if ($stmt->execute()) {

    header("Location: signup-success.html");
    exit;
    
} else {
    
    if ($mysqli->errno === 1062) {
        die("email already taken");
    } else {
        die($mysqli->error . " " . $mysqli->errno);
    }
}






