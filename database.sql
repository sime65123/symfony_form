-- Création de la base de données
CREATE DATABASE IF NOT EXISTS symfony_form CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Utilisation de la base de données
USE symfony_form;

-- Création de la table users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(12) NOT NULL,
    birthdate DATE NOT NULL,
    address TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de données de test (optionnel)
-- INSERT INTO users (fullname, email, phone, birthdate, address) VALUES
-- ('Jean Dupont', 'jean@example.com', '612345678', '1990-05-15', '123 Rue de Paris, 75000 Paris');
