"""
Configuration module for CV Maker Backend.
Centralizes all configuration constants and settings.
"""
import { config as loadEnv } from 'dotenv';
import path from 'path';

// Load environment variables
loadEnv({ path: path.resolve(process.cwd(), '.env') });

// Server configuration
export const SERVER_CONFIG = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Database configuration
export const DATABASE_CONFIG = {
  SQLD_URL: process.env.SQLD_URL || 'http://127.0.0.1:8080',
};

// Security configuration
export const SECURITY_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  UPLOAD_LIMIT: process.env.UPLOAD_LIMIT || '50mb',
};

// CORS configuration
export const CORS_CONFIG = {
  origin: true,
  credentials: true,
};

// File upload configuration
export const UPLOAD_CONFIG = {
  UPLOADS_DIR: path.resolve(process.cwd(), 'uploads'),
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB
};

// Application metadata
export const APP_CONFIG = {
  NAME: 'CV Maker',
  VERSION: '1.0.0',
  DESCRIPTION: 'CV Maker Backend API',
};

// Helper function to get configuration by name
export function getConfig(configName) {
  const configs = {
    SERVER: SERVER_CONFIG,
    DATABASE: DATABASE_CONFIG,
    SECURITY: SECURITY_CONFIG,
    CORS: CORS_CONFIG,
    UPLOAD: UPLOAD_CONFIG,
    APP: APP_CONFIG,
  };
  
  return configs[configName] || null;
}