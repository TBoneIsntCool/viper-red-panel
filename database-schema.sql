-- MySQL Database Schema for Viper Discord Bot

-- Users table to store Discord user information
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discord_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    avatar TEXT,
    access_token TEXT,
    refresh_token TEXT,
    guilds JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Shifts table to track moderator shifts
CREATE TABLE IF NOT EXISTS shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    server_id VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(discord_id)
);

-- Moderation logs table
CREATE TABLE IF NOT EXISTS moderation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    server_id VARCHAR(255) NOT NULL,
    moderator_id VARCHAR(255) NOT NULL,
    action_type ENUM('warn', 'kick', 'ban', 'timeout', 'clear_messages', 'note') NOT NULL,
    target_user VARCHAR(255) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (moderator_id) REFERENCES users(discord_id)
);

-- Server members table (for tracking member counts)
CREATE TABLE IF NOT EXISTS server_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    server_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    UNIQUE KEY unique_server_user (server_id, user_id)
);

-- Server settings table
CREATE TABLE IF NOT EXISTS server_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    server_id VARCHAR(255) UNIQUE NOT NULL,
    server_name VARCHAR(255) NOT NULL,
    has_viper_bot BOOLEAN DEFAULT FALSE,
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_shifts_user_server ON shifts(user_id, server_id);
CREATE INDEX idx_moderation_logs_server ON moderation_logs(server_id);
CREATE INDEX idx_moderation_logs_created_at ON moderation_logs(created_at);
CREATE INDEX idx_server_members_server ON server_members(server_id);