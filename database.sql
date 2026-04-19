-- Database export file

CREATE DATABASE eventDB;

USE eventDB;

CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  capacity INT,
  type VARCHAR(50)
);