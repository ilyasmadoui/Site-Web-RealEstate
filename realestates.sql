-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3310
-- Généré le : sam. 28 juin 2025 à 23:48
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `realestates`
--

-- --------------------------------------------------------

--
-- Structure de la table `favorite`
--

CREATE TABLE `favorite` (
  `idFavorite` varchar(255) NOT NULL,
  `idUser` varchar(255) NOT NULL,
  `idPost` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `favorite`
--

INSERT INTO `favorite` (`idFavorite`, `idUser`, `idPost`) VALUES
('2e386d8d-4401-4227-af06-bae77399d2df', '2d879106-9a68-4643-ac31-f5e04f70080e', 'b11773d6-ed41-4b23-95d6-bf4f8d52ff9c'),
('aefef139-6cdf-48f5-b64a-9a15c1806b3e', '3c5b20f7-03bb-4001-b230-acdcee232163', '421f6ddc-efbc-4595-9f6f-19926ff07586');

-- --------------------------------------------------------

--
-- Structure de la table `notifs`
--

CREATE TABLE `notifs` (
  `idNotif` varchar(255) NOT NULL,
  `idSender` text NOT NULL,
  `idReciever` text NOT NULL,
  `Context` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `notifs`
--

INSERT INTO `notifs` (`idNotif`, `idSender`, `idReciever`, `Context`) VALUES
('7b793644-a3b5-4792-9d0f-a20121e1c14f', '3156493b-64a8-4a57-ae42-76e1fa22787a', '2d879106-9a68-4643-ac31-f5e04f70080e', 'hello'),
('adc0119b-687b-4a27-80d5-179b628ece92', '3156493b-64a8-4a57-ae42-76e1fa22787a', '3c5b20f7-03bb-4001-b230-acdcee232163', 'hello');

-- --------------------------------------------------------

--
-- Structure de la table `owner`
--

CREATE TABLE `owner` (
  `ownerID` varchar(255) NOT NULL,
  `phoneNum` int(11) NOT NULL,
  `email` varchar(50) NOT NULL,
  `id` varchar(36) NOT NULL DEFAULT uuid()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `owner`
--

INSERT INTO `owner` (`ownerID`, `phoneNum`, `email`, `id`) VALUES
('3156493b-64a8-4a57-ae42-76e1fa22787a', 659909424, 'ilyasmadoui2020@gmail.com', '2d75fc7d-bbe9-4e5e-ba0a-0c6e43db7431'),
('3156493b-64a8-4a57-ae42-76e1fa22787a', 659909424, 'ilyasmadoui2020@gmail.com', '37c5cc94-34ac-49d2-94d0-ff2947594ee5');

-- --------------------------------------------------------

--
-- Structure de la table `posts`
--

CREATE TABLE `posts` (
  `postID` varchar(255) NOT NULL,
  `ownerID` varchar(255) NOT NULL,
  `price` double NOT NULL,
  `state` varchar(50) NOT NULL,
  `Muniplicyt` text NOT NULL,
  `street` varchar(50) NOT NULL,
  `width` int(11) NOT NULL,
  `height` int(11) NOT NULL,
  `created_at` date DEFAULT curdate(),
  `type_product` varchar(50) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `posts`
--

INSERT INTO `posts` (`postID`, `ownerID`, `price`, `state`, `Muniplicyt`, `street`, `width`, `height`, `created_at`, `type_product`, `status`) VALUES
('421f6ddc-efbc-4595-9f6f-19926ff07586', '3156493b-64a8-4a57-ae42-76e1fa22787a', 100000, 'Biskra', 'Biskra', 'Chriaa', 2000, 190, '2025-04-08', 'House', 'Accepted'),
('b11773d6-ed41-4b23-95d6-bf4f8d52ff9c', '3156493b-64a8-4a57-ae42-76e1fa22787a', 6788, 'Alger', 'Alger', 'Alger center', 50, 120, '2025-04-06', 'House', 'Accepted');

-- --------------------------------------------------------

--
-- Structure de la table `posts_pics`
--

CREATE TABLE `posts_pics` (
  `id` varchar(255) NOT NULL,
  `postID` varchar(255) NOT NULL,
  `pic1` longblob DEFAULT NULL,
  `pic2` longblob DEFAULT NULL,
  `pic3` longblob DEFAULT NULL,
  `pic4` longblob DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `posts_pics`
--

INSERT INTO `posts_pics` (`id`, `postID`, `pic1`, `pic2`, `pic3`, `pic4`) VALUES
('0d583ef2-9bc4-4136-92cd-5ed9a185a61e', 'b11773d6-ed41-4b23-95d6-bf4f8d52ff9c', 0x313734333936323431353534302d3133343437353436392e6a7067, 0x313734333936323431353534312d696d61676573202833292e6a7067, 0x313734333936323431353534322d696d61676573202834292e6a7067, 0x313734333936323431353534332d696d61676573202837292e6a7067),
('7ffc620d-872e-4cc1-87d9-0436a9c95708', '421f6ddc-efbc-4595-9f6f-19926ff07586', 0x313734343039373735303435352d3133343437353436392e6a7067, 0x313734343039373735303436312d696d61676573202832292e6a7067, 0x313734343039373735303436332d696d61676573202833292e6a7067, 0x313734343039373735303436342d696d61676573202834292e6a7067);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `email` text NOT NULL,
  `phoneNum` int(11) NOT NULL,
  `FullName` text NOT NULL,
  `pass` text NOT NULL,
  `image` longblob DEFAULT NULL,
  `role` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `email`, `phoneNum`, `FullName`, `pass`, `image`, `role`) VALUES
('3c5b20f7-03bb-4001-b230-acdcee232163', 'meradmalek@gmail.com', 65990922, 'meradmalek', '$2b$10$w3NltzjuY59rKgAmPTi9RekrqA9K58bAiidX.LZRvxGaYpyiahCmW', 0x75706c6f6164732f313734343039383035353834332d6465736b746f702d77616c6c70617065722d64726966742d6361722d736b796c696e652d636f6f6c2d636172732e6a7067, 1),
('2d879106-9a68-4643-ac31-f5e04f70080e', 'anismadoui@gmail.com', 659909421, 'Anis_madoui', '$2b$10$2MOzzu5xFdlqsfa2u0x3kOsauD3z6.Uef.9YWaTtFFWZJD7kNLycO', 0x75706c6f6164732f313734333936333035393032362d6465736b746f702d77616c6c70617065722d64726966742d6361722d736b796c696e652d636f6f6c2d636172732e6a7067, 1),
('eacd8508-9d4e-4581-9869-124768e643e9', 'saidmerad@gmail.com', 659909423, 'said_merad', '$2b$10$xBMPHx8dCFjedL.3/6lMjOpFOnI8KIfDw61r/XRs3N1CbRhBlCL5m', 0x75706c6f6164732f313734333936323533353038322d346b2d57616c6c70617065722d412d73706563746163756c61722d67616d696e672d616476656e747572652d776974682d746869732d7374756e6e696e672d31353336783835382e6a7067, 0),
('3156493b-64a8-4a57-ae42-76e1fa22787a', 'ilyasmadoui2020@gmail.com', 659909424, 'ilyas_madoui', '$2b$10$ee8KdIPuQzToey9dDig6FurAt1yN7X7Qui86nsJerdUNAuZD5XcKu', 0x75706c6f6164732f313734333936313833383933372d34356533656633396133356434313437336537636364396433613530663066342e6a7067, 1),
('86f9d56d-ef77-479b-a563-929e73f7fa00', 'mohamed@gmail.com', 659909499, 'mohamed', '$2b$10$j6UQAzva34AJqiEh0HKH2etuBcLZ70FBAAbs8BkxllRihIJL0Qp1C', 0x75706c6f6164732f313734393331363436303734382d3133343437353436392e6a7067, 1);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `favorite`
--
ALTER TABLE `favorite`
  ADD PRIMARY KEY (`idFavorite`);

--
-- Index pour la table `notifs`
--
ALTER TABLE `notifs`
  ADD PRIMARY KEY (`idNotif`);

--
-- Index pour la table `owner`
--
ALTER TABLE `owner`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`postID`);

--
-- Index pour la table `posts_pics`
--
ALTER TABLE `posts_pics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `postID` (`postID`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD UNIQUE KEY `phoneNum` (`phoneNum`);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `posts_pics`
--
ALTER TABLE `posts_pics`
  ADD CONSTRAINT `posts_pics_ibfk_1` FOREIGN KEY (`postID`) REFERENCES `posts` (`postID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
