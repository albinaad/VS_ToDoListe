-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: meinecooledb
-- Erstellungszeit: 13. Apr 2023 um 20:28
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
-- Tabellenstruktur für Tabelle `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `table1`
--

CREATE TABLE `table1` (
  `task_id` int(11) NOT NULL,
  `user_userId` int(11) NOT NULL,
  `title` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `description` text CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `table1`
--

INSERT INTO `table1` (`task_id`, `user_userId`, `title`, `description`, `created_at`) VALUES
(1, 1, 'Buch lesen', 'Seite 200', '2023-04-02 23:36:22');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `todoliste`
--

CREATE TABLE `todoliste` (
  `listeId` int(11) NOT NULL,
  `user_userId` int(11) NOT NULL,
  `liste_title` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user`
--

CREATE TABLE `user` (
  `userId` int(11) NOT NULL,
  `benutzername` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `user`
--

INSERT INTO `user` (`userId`, `benutzername`, `email`, `password`) VALUES
(1, 'Albina', 'albina@test.de', '$2a$10$kd28.QRz4a34Bs9oeIGZ0.krGVCsCw5XcnWZswARt1HvDrzTTyYkm');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indizes für die Tabelle `table1`
--
ALTER TABLE `table1`
  ADD PRIMARY KEY (`task_id`),
  ADD KEY `user_userId` (`user_userId`);

--
-- Indizes für die Tabelle `todoliste`
--
ALTER TABLE `todoliste`
  ADD PRIMARY KEY (`listeId`),
  ADD KEY `user_userId` (`user_userId`);

--
-- Indizes für die Tabelle `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `table1`
--
ALTER TABLE `table1`
  MODIFY `task_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT für Tabelle `todoliste`
--
ALTER TABLE `todoliste`
  MODIFY `listeId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `user`
--
ALTER TABLE `user`
  MODIFY `userId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `table1`
--
ALTER TABLE `table1`
  ADD CONSTRAINT `table1_ibfk_1` FOREIGN KEY (`user_userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `todoliste`
--
ALTER TABLE `todoliste`
  ADD CONSTRAINT `todoliste_ibfk_1` FOREIGN KEY (`user_userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
