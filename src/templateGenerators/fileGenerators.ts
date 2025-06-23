import { BaseTemplateGenerator, RandomDataContext } from './types';
import { RANDOM_DATA, getRandomItem, getCompanyName } from './randomData';

export class BackupFileGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {
			backupDate: this.generateRandomDate(),
			originalSize: this.generateRandomSize(),
			passwordHash: this.generateRandomHash(32),
			userPasswordHash: `$2y$10$${this.generateRandomHash(53)}`,
			totalLines: this.generateRandomLines(),
			backupType: getRandomItem(['full', 'incremental', 'differential']),
			companyName: getCompanyName(this.context.companyName),
			appName: getRandomItem(RANDOM_DATA.apps),
			version: this.generateRandomVersion(),
			user: getRandomItem(RANDOM_DATA.users),
			serverName: getRandomItem(['server01', 'web-prod', 'db-master', 'app-server']),
			backupTool: getRandomItem(['mysqldump', 'pg_dump', 'rsync', 'tar', 'backup_script']),
		};
	}

	generate(): string {
		const templates = [
			// Database backup
			`# Database Backup File
# Created: {{backupDate}}
# Type: {{backupType}} backup
# Original size: {{originalSize}} bytes
# Checksum: {{passwordHash}}
# Tool: {{backupTool}}

-- Database: {{companyName}}_db
-- Version: {{version}}
-- Host: {{serverName}}
-- Backup user: {{user}}

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS \`{{companyName}}_db\` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE \`{{companyName}}_db\`;

DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`username\` varchar(50) NOT NULL,
  \`password\` varchar(255) NOT NULL,
  \`email\` varchar(100) NOT NULL,
  \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`username\` (\`username\`),
  UNIQUE KEY \`email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO \`users\` (\`username\`, \`password\`, \`email\`) VALUES
('{{user}}', '{{userPasswordHash}}', '{{user}}@example.com'),
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@{{companyName}}.com'),
('guest', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'guest@example.org');

-- Total records: {{totalLines}}
-- Backup completed: {{backupDate}}`,

			// Configuration backup
			`# Configuration Backup
# Generated: {{backupDate}}
# Application: {{appName}}
# Version: {{version}}
# Size: {{originalSize}} bytes
# Hash: {{checksum}}

[application]
name={{appName}}
version={{version}}
environment=production
debug=false
timezone=UTC
locale=en_US

[database]
driver=mysql
host={{serverName}}.{{companyName}}.local
port=3306
database={{companyName}}_prod
username={{user}}
password={{passwordHash}}
charset=utf8mb4
collation=utf8mb4_unicode_ci
prefix=
pool_size=10
timeout=30

[cache]
driver=redis
host=redis.{{companyName}}.local
port=6379
database=0
password={{checksum}}
prefix={{appName}}_cache_
ttl=3600

[session]
driver=database
lifetime=120
encrypt=true
files=/var/lib/{{appName}}/sessions
connection=default
table=sessions
store=database
lottery=[2, 100]
cookie={{appName}}_session
path=/
domain=.{{companyName}}.com
secure=true
http_only=true
same_site=lax

[mail]
driver=smtp
host=smtp.{{companyName}}.com
port=587
username={{user}}@{{companyName}}.com
password={{checksum}}
encryption=tls
from_address={{user}}@{{companyName}}.com
from_name={{companyName}}

[logging]
default=stack
channels[stack][driver]=stack
channels[stack][channels][]=single
channels[stack][channels][]=stderr
channels[single][driver]=single
channels[single][path]=/var/log/{{appName}}/application.log
level=debug
days=14
max_files=5

[security]
key={{checksum}}
cipher=AES-256-CBC
bcrypt_rounds=10
password_timeout=10800
session_timeout=7200

# Backup summary
# Original file: /etc/{{appName}}/config.ini
# Backup type: {{backupType}}
# Created by: {{user}}@{{serverName}}
# Total lines: {{totalLines}}`,

			// System backup
			`#!/bin/bash
# System Backup Script
# Created: {{backupDate}}
# Server: {{serverName}}
# User: {{user}}
# Type: {{backupType}}

# Backup configuration
BACKUP_DATE="{{backupDate}}"
BACKUP_TYPE="{{backupType}}"
SOURCE_DIR="/var/www/{{appName}}"
BACKUP_DIR="/backup/{{appName}}"
LOG_FILE="/var/log/backup_{{appDate}}.log"
RETENTION_DAYS=30

# Database settings
DB_HOST="{{serverName}}"
DB_NAME="{{companyName}}_db"
DB_USER="{{user}}"
DB_PASS="{{checksum}}"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

log "Starting {{backupType}} backup"
log "Source: $SOURCE_DIR"
log "Destination: $BACKUP_DIR"

# Create backup directory
mkdir -p $BACKUP_DIR
cd $BACKUP_DIR

# Backup files
tar -czf "files_{{backupDate}}.tar.gz" $SOURCE_DIR
FILESIZE=$(stat -c%s "files_{{backupDate}}.tar.gz")
log "Files backup completed: $FILESIZE bytes"

# Backup database
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME > "database_{{backupDate}}.sql"
gzip "database_{{backupDate}}.sql"
DBSIZE=$(stat -c%s "database_{{backupDate}}.sql.gz")
log "Database backup completed: $DBSIZE bytes"

# Generate checksums
md5sum *.tar.gz *.sql.gz > checksums_{{backupDate}}.md5
log "Checksums generated"

# Cleanup old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.md5" -mtime +$RETENTION_DAYS -delete
log "Old backups cleaned up"

log "Backup completed successfully"
log "Total size: {{originalSize}} bytes"
log "Checksum: {{passwordHash}}"
log "Files: {{totalLines}}"

exit 0`,

			// Application backup metadata
			`{
  "backup_info": {
    "created_at": "{{backupDate}}T00:00:00Z",
    "type": "{{backupType}}",
    "version": "{{version}}",
    "application": {
      "name": "{{appName}}",
      "version": "{{version}}",
      "environment": "production"
    },
    "server": {
      "hostname": "{{serverName}}",
      "user": "{{user}}",
      "company": "{{companyName}}"
    },
    "statistics": {
      "total_size": {{originalSize}},
      "file_count": {{totalLines}},
      "checksum": "{{passwordHash}}",
      "compression_ratio": 0.73
    }
  },
  "files": [
    {
      "path": "/var/www/{{appName}}/index.php",
      "size": 2048,
      "modified": "{{backupDate}}",
      "checksum": "{{passwordHash}}"
    },
    {
      "path": "/var/www/{{appName}}/config.php",
      "size": 1024,
      "modified": "{{backupDate}}",
      "checksum": "{{passwordHash}}"
    },
    {
      "path": "/var/www/{{appName}}/database.sql",
      "size": 50000,
      "modified": "{{backupDate}}",
      "checksum": "{{checksum}}"
    }
  ],
  "databases": [
    {
      "name": "{{companyName}}_db",
      "engine": "MySQL",
      "version": "8.0.28",
      "size": {{originalSize}},
      "tables": {{totalLines}},
      "checksum": "{{passwordHash}}"
    }
  ],
  "backup_command": "{{backupTool}} --{{backupType}} --compress --verify",
  "restore_command": "{{backupTool}} --restore --decompress --verify",
  "retention_policy": "30 days",
  "encryption": "AES-256",
  "notes": "Automated {{backupType}} backup created by {{user}}"
}`,
		];

		const selectedTemplate = getRandomItem(templates);
		return this.replaceVariables(selectedTemplate);
	}

	getContentType(): string {
		return 'text/plain; charset=utf-8';
	}

	getDescription(): string {
		return 'Backup file';
	}
}

export class DatabaseFileGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {
			dbName: `${getCompanyName(this.context.companyName).toLowerCase()}_db`,
			version: getRandomItem(['8.0.28', '5.7.39', '10.6.12', '13.8', '14.5']),
			user: getRandomItem(RANDOM_DATA.users),
			password: this.generateRandomKey(16),
			host: getRandomItem(['localhost', '127.0.0.1', 'db.internal']),
			port: getRandomItem(['3306', '5432', '27017', '1433']),
			charset: getRandomItem(['utf8mb4', 'utf8', 'latin1']),
			engine: getRandomItem(['InnoDB', 'MyISAM', 'PostgreSQL', 'MongoDB']),
			tableCount: Math.floor(Math.random() * 50) + 5,
			recordCount: Math.floor(Math.random() * 10000) + 100,
			dumpDate: this.generateRandomDate(),
			passwordHash: this.generateRandomHash(),
			userPasswordHash: `$2y$10$${this.generateRandomHash(53)}`,
			checksum: this.generateRandomHash(),
		};
	}

	generate(): string {
		const templates = [
			// MySQL dump
			`-- MySQL dump {{version}}
--
-- Host: {{host}}    Database: {{dbName}}
-- ------------------------------------------------------
-- Server version	{{version}}

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES {{charset}} */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: \`{{dbName}}\`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ \`{{dbName}}\` /*!40100 DEFAULT CHARACTER SET {{charset}} COLLATE {{charset}}_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE \`{{dbName}}\`;

--
-- Table structure for table \`users\`
--

DROP TABLE IF EXISTS \`users\`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = {{charset}} */;
CREATE TABLE \`users\` (
  \`id\` int unsigned NOT NULL AUTO_INCREMENT,
  \`username\` varchar(255) COLLATE {{charset}}_unicode_ci NOT NULL,
  \`email\` varchar(255) COLLATE {{charset}}_unicode_ci NOT NULL,
  \`email_verified_at\` timestamp NULL DEFAULT NULL,
  \`password\` varchar(255) COLLATE {{charset}}_unicode_ci NOT NULL,
  \`remember_token\` varchar(100) COLLATE {{charset}}_unicode_ci DEFAULT NULL,
  \`created_at\` timestamp NULL DEFAULT NULL,
  \`updated_at\` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`users_email_unique\` (\`email\`)
) ENGINE={{engine}} AUTO_INCREMENT={{recordCount}} DEFAULT CHARSET={{charset}} COLLATE={{charset}}_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table \`users\`
--

LOCK TABLES \`users\` WRITE;
/*!40000 ALTER TABLE \`users\` DISABLE KEYS */;
INSERT INTO \`users\` VALUES
(1,'{{user}}','{{user}}@example.com',NULL,'{{userPasswordHash}}',NULL,'{{dumpDate}} 00:00:00','{{dumpDate}} 00:00:00'),
(2,'admin','admin@example.com',NULL,'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',NULL,'{{dumpDate}} 00:00:00','{{dumpDate}} 00:00:00'),
(3,'guest','guest@example.com',NULL,'$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm',NULL,'{{dumpDate}} 00:00:00','{{dumpDate}} 00:00:00');
/*!40000 ALTER TABLE \`users\` ENABLE KEYS */;
UNLOCK TABLES;

-- Dump completed on {{dumpDate}}  0:00:00
-- Total tables: {{tableCount}}
-- Total records: {{recordCount}}
-- Checksum: {{passwordHash}}`,

			// PostgreSQL dump
			`--
-- PostgreSQL database dump
--

-- Dumped from database version {{version}}
-- Dumped by pg_dump version {{version}}

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: {{dbName}}; Type: DATABASE; Schema: -; Owner: {{user}}
--

CREATE DATABASE {{dbName}} WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';

ALTER DATABASE {{dbName}} OWNER TO {{user}};

\\connect {{dbName}}

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: users; Type: TABLE; Schema: public; Owner: {{user}}
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.users OWNER TO {{user}};

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: {{user}}
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.users_id_seq OWNER TO {{user}};

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: {{user}}
--

COPY public.users (id, username, email, password, created_at, updated_at) FROM stdin;
1	{{user}}	{{user}}@example.com	{{passwordHash}}	{{dumpDate}} 00:00:00	{{dumpDate}} 00:00:00
2	admin	admin@example.com	{{passwordHash}}	{{dumpDate}} 00:00:00	{{dumpDate}} 00:00:00
3	guest	guest@example.com	{{passwordHash}}	{{dumpDate}} 00:00:00	{{dumpDate}} 00:00:00
\\.

--
-- PostgreSQL database dump complete
--
-- Total objects: {{tableCount}}
-- Total records: {{recordCount}}
-- Checksum: {{passwordHash}}`,

			// SQLite dump
			`PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

-- Database: {{dbName}}
-- Version: {{version}}
-- Created: {{dumpDate}}
-- User: {{user}}

CREATE TABLE IF NOT EXISTS "users" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL UNIQUE,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users VALUES(1,'{{user}}','{{user}}@example.com','{{passwordHash}}','{{dumpDate}} 00:00:00','{{dumpDate}} 00:00:00');
INSERT INTO users VALUES(2,'admin','admin@example.com','{{passwordHash}}','{{dumpDate}} 00:00:00','{{dumpDate}} 00:00:00');
INSERT INTO users VALUES(3,'guest','guest@example.com','{{passwordHash}}','{{dumpDate}} 00:00:00','{{dumpDate}} 00:00:00');

CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT PRIMARY KEY,
    "user_id" INTEGER,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "payload" TEXT,
    "last_activity" INTEGER,
    FOREIGN KEY("user_id") REFERENCES "users"("id")
);

CREATE INDEX IF NOT EXISTS "users_email_index" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "users_username_index" ON "users" ("username");
CREATE INDEX IF NOT EXISTS "sessions_user_id_index" ON "sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "sessions_last_activity_index" ON "sessions" ("last_activity");

COMMIT;

-- Dump statistics
-- Tables: {{tableCount}}
-- Records: {{recordCount}}
-- Size: {{originalSize}} bytes
-- Checksum: {{passwordHash}}`,
		];

		const selectedTemplate = getRandomItem(templates);
		return this.replaceVariables(selectedTemplate);
	}

	getContentType(): string {
		return 'application/sql; charset=utf-8';
	}

	getDescription(): string {
		return 'Database dump file';
	}
}

export class EnvironmentFileGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {
			appName: getRandomItem(RANDOM_DATA.apps),
			appKey: this.generateRandomKey(32),
			appUrl: `https://${getRandomItem(RANDOM_DATA.domains)}`,
			dbHost: getRandomItem(['localhost', '127.0.0.1', 'mysql', 'database']),
			dbPort: getRandomItem(['3306', '5432', '27017']),
			dbDatabase: `${getCompanyName(this.context.companyName).toLowerCase()}_db`,
			dbUsername: getRandomItem(RANDOM_DATA.users),
			dbPassword: this.generateRandomKey(16),
			mailHost: `smtp.${getRandomItem(RANDOM_DATA.domains)}`,
			mailUsername: getRandomItem(RANDOM_DATA.emails),
			mailPassword: this.generateRandomKey(12),
			redisHost: getRandomItem(['localhost', 'redis', '127.0.0.1']),
			redisPassword: this.generateRandomKey(20),
			jwtSecret: this.generateRandomKey(64),
			sessionSecret: this.generateRandomKey(32),
			environment: getRandomItem(['production', 'staging', 'development']),
			debug: Math.random() > 0.7 ? 'true' : 'false',
			timezone: getRandomItem(['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo']),
			locale: getRandomItem(['en', 'en_US', 'ru_RU', 'de_DE']),
		};
	}

	generate(): string {
		const templates = [
			// Laravel .env
			`APP_NAME={{appName}}
APP_ENV={{environment}}
APP_KEY=base64:{{appKey}}
APP_DEBUG={{debug}}
APP_URL={{appUrl}}

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST={{dbHost}}
DB_PORT={{dbPort}}
DB_DATABASE={{dbDatabase}}
DB_USERNAME={{dbUsername}}
DB_PASSWORD={{dbPassword}}

BROADCAST_DRIVER=log
CACHE_DRIVER=redis
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=redis
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST={{redisHost}}
REDIS_PASSWORD={{redisPassword}}
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST={{mailHost}}
MAIL_PORT=587
MAIL_USERNAME={{mailUsername}}
MAIL_PASSWORD={{mailPassword}}
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="{{mailUsername}}"
MAIL_FROM_NAME="{{appName}}"

AWS_ACCESS_KEY_ID={{jwtSecret}}
AWS_SECRET_ACCESS_KEY={{sessionSecret}}
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET={{appName}}-storage

PUSHER_APP_ID={{appName}}
PUSHER_APP_KEY={{appKey}}
PUSHER_APP_SECRET={{sessionSecret}}
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_PUSHER_APP_KEY="{{appKey}}"
VITE_PUSHER_HOST="{{mailHost}}"
VITE_PUSHER_PORT="443"
VITE_PUSHER_SCHEME="https"
VITE_PUSHER_APP_CLUSTER="mt1"

JWT_SECRET={{jwtSecret}}
SESSION_ENCRYPT=true
BCRYPT_ROUNDS=10`,

			// Node.js .env
			`# Application Settings
NODE_ENV={{environment}}
APP_NAME={{appName}}
APP_VERSION=1.0.0
PORT=3000
HOST=0.0.0.0
APP_URL={{appUrl}}
DEBUG={{debug}}
TIMEZONE={{timezone}}
LOCALE={{locale}}

# Database Configuration
DATABASE_URL=mysql://{{dbUsername}}:{{dbPassword}}@{{dbHost}}:{{dbPort}}/{{dbDatabase}}
DB_HOST={{dbHost}}
DB_PORT={{dbPort}}
DB_NAME={{dbDatabase}}
DB_USER={{dbUsername}}
DB_PASS={{dbPassword}}
DB_SSL=false
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis Configuration
REDIS_URL=redis://{{redisPassword}}@{{redisHost}}:6379/0
REDIS_HOST={{redisHost}}
REDIS_PORT=6379
REDIS_PASSWORD={{redisPassword}}
REDIS_DB=0

# Session Configuration
SESSION_SECRET={{sessionSecret}}
SESSION_NAME={{appName}}_session
SESSION_COOKIE_MAX_AGE=86400000
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTP_ONLY=true

# JWT Configuration
JWT_SECRET={{jwtSecret}}
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST={{mailHost}}
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER={{mailUsername}}
SMTP_PASS={{mailPassword}}
MAIL_FROM={{mailUsername}}
MAIL_FROM_NAME={{appName}}

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,gif,pdf,doc,docx
UPLOAD_DEST=uploads/

# Security
CORS_ORIGIN={{appUrl}}
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5`,

			// Python Django .env
			`# Django Settings
SECRET_KEY={{sessionSecret}}
DEBUG={{debug}}
ALLOWED_HOSTS={{appUrl}},localhost,127.0.0.1
DJANGO_SETTINGS_MODULE={{appName}}.settings.{{environment}}

# Database
DATABASE_ENGINE=django.db.backends.mysql
DATABASE_NAME={{dbDatabase}}
DATABASE_USER={{dbUsername}}
DATABASE_PASSWORD={{dbPassword}}
DATABASE_HOST={{dbHost}}
DATABASE_PORT={{dbPort}}
DATABASE_OPTIONS={"charset": "utf8mb4"}

# Cache
CACHE_BACKEND=django_redis.cache.RedisCache
CACHE_LOCATION=redis://{{redisPassword}}@{{redisHost}}:6379/1
CACHE_TIMEOUT=300

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST={{mailHost}}
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER={{mailUsername}}
EMAIL_HOST_PASSWORD={{mailPassword}}
DEFAULT_FROM_EMAIL={{mailUsername}}

# Security
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SECURE_CONTENT_TYPE_NOSNIFF=True
SECURE_BROWSER_XSS_FILTER=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# Static Files
STATIC_URL=/static/
STATIC_ROOT=/var/www/{{appName}}/static/
MEDIA_URL=/media/
MEDIA_ROOT=/var/www/{{appName}}/media/

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/{{appName}}/django.log

# Celery
CELERY_BROKER_URL=redis://{{redisPassword}}@{{redisHost}}:6379/2
CELERY_RESULT_BACKEND=redis://{{redisPassword}}@{{redisHost}}:6379/3
CELERY_TASK_SERIALIZER=json
CELERY_ACCEPT_CONTENT=["json"]
CELERY_RESULT_SERIALIZER=json
CELERY_TIMEZONE={{timezone}}`,

			// Generic config file
			`[general]
app_name = {{appName}}
environment = {{environment}}
debug = {{debug}}
timezone = {{timezone}}
locale = {{locale}}
version = 1.0.0
base_url = {{appUrl}}

[database]
type = mysql
host = {{dbHost}}
port = {{dbPort}}
name = {{dbDatabase}}
username = {{dbUsername}}
password = {{dbPassword}}
charset = utf8mb4
pool_size = 10
timeout = 30
ssl = false

[cache]
driver = redis
host = {{redisHost}}
port = 6379
password = {{redisPassword}}
database = 0
prefix = {{appName}}_
ttl = 3600

[session]
driver = redis
lifetime = 7200
cookie_name = {{appName}}_session
cookie_path = /
cookie_domain =
cookie_secure = true
cookie_httponly = true
encrypt = true
secret = {{sessionSecret}}

[mail]
driver = smtp
host = {{mailHost}}
port = 587
username = {{mailUsername}}
password = {{mailPassword}}
encryption = tls
from_email = {{mailUsername}}
from_name = {{appName}}
timeout = 30

[security]
jwt_secret = {{jwtSecret}}
jwt_ttl = 86400
password_bcrypt_rounds = 12
csrf_token_name = _token
csrf_expire = 7200
encryption_key = {{appKey}}

[logging]
level = info
file = /var/log/{{appName}}/app.log
max_size = 10M
max_files = 5
format = [%datetime%] %channel%.%level_name%: %message% %context% %extra%

[uploads]
max_size = 10485760
allowed_types = jpg,jpeg,png,gif,pdf,doc,docx,txt
upload_path = /var/www/{{appName}}/uploads/
url_path = /uploads/`,
		];

		const selectedTemplate = getRandomItem(templates);
		return this.replaceVariables(selectedTemplate);
	}

	getContentType(): string {
		return 'text/plain; charset=utf-8';
	}

	getDescription(): string {
		return 'Environment configuration file';
	}
}
