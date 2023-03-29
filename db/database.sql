-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: meinecooledb
-- Erstellungszeit: 29. Mrz 2023 um 20:55
-- Server-Version: 10.11.2-MariaDB-1:10.11.2+maria~ubu2204
-- PHP-Version: 8.0.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `exampledb`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `table1`
--

CREATE TABLE `table1` (
  `task_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Daten für Tabelle `table1`
--

INSERT INTO `table1` (`task_id`, `title`, `description`, `created_at`) VALUES
(1, 'Super titel', 'langer text', '2020-04-09 12:18:07'),
(2, 'Anderer Titel', 'Super Text', '2020-04-09 12:18:43'),
(3, 'Anderer Titel2', 'noch mehr text', '2020-04-09 12:18:57');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `todoliste`
--

CREATE TABLE `todoliste` (
  `todo_id` int(11) NOT NULL,
  `todo` varchar(255) NOT NULL,
  `datum` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `todoliste`
--

INSERT INTO `todoliste` (`todo_id`, `todo`, `datum`) VALUES
(1, 'Buch lesen.', '2023-03-29'),
(2, 'Projekt programmieren.', '2023-05-07'),
(3, 'Vorlesung besuchen.', '2023-03-30');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `table1`
--
ALTER TABLE `table1`
  ADD PRIMARY KEY (`task_id`);

--
-- Indizes für die Tabelle `todoliste`
--
ALTER TABLE `todoliste`
  ADD PRIMARY KEY (`todo_id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `table1`
--
ALTER TABLE `table1`
  MODIFY `task_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT für Tabelle `todoliste`
--
ALTER TABLE `todoliste`
  MODIFY `todo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
