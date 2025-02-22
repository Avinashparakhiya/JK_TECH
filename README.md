# JK Tech Project

## Overview

This project is a NestJS application that provides APIs for user management, document management, and data ingestion. It uses PostgreSQL as the database and includes authentication and authorization mechanisms.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Documents](#documents)
  - [Ingestion](#ingestion)
- [Roles and Permissions](#roles-and-permissions)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Avinashparakhiya/JK_TECH.git
   cd JK_TECH
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

Create a `.env` file in the root directory and include the following variables:

```env
DB_TYPE=postgres
DB_HOST=your_database_host
DB_PORT=your_database_port
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
DB_DATABASE=your_database_name
DB_SSL_CA=-----BEGIN CERTIFICATE-----
your_certificate_content
-----END CERTIFICATE-----
SERVER_PORT=3000
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

## Running the Application

1. Start the application:
   ```bash
   npm run start
   ```
2. Access the application at:
   ```
   http://localhost:3000
   ```

## API Endpoints

### Authentication

- **Register**: `POST /auth/register`
  - **Request Body**:
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
  - **Response**: `201 Created`

- **Login**: `POST /auth/login`
  - **Request Body**:
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
  - **Response**: `200 OK` with JWT token

### Users

- **Get All Users**: `GET /users`
  - **Role**: Admin
  - **Response**: `200 OK` with a list of users

- **Get User by ID**: `GET /users/:id`
  - **Role**: Admin
  - **Response**: `200 OK` with user details

- **Update User**: `PUT /users/:id`
  - **Role**: Admin, Editor
  - **Request Body**:
    ```json
    {
      "name": "string",
      "email": "string",
      "role": "string"
    }
    ```
  - **Response**: `200 OK` with updated user details

- **Delete User**: `DELETE /users/:id`
  - **Role**: Admin
  - **Response**: `200 OK`

### Documents

- **Get All Documents**: `GET /documents`
  - **Role**: Admin, Editor, Viewer
  - **Response**: `200 OK` with a list of documents

- **Get Document by ID**: `GET /documents/:id`
  - **Role**: Admin, Editor, Viewer
  - **Response**: `200 OK` with document details

- **Upload Document**: `POST /documents`
  - **Role**: Admin, Editor
  - **Request Body**: Multipart file upload
  - **Response**: `201 Created` with document details

- **Update Document**: `PUT /documents/:id`
  - **Role**: Admin, Editor
  - **Request Body**: Multipart file upload
  - **Response**: `200 OK` with updated document details

- **Delete Document**: `DELETE /documents/:id`
  - **Role**: Admin
  - **Response**: `200 OK`

### Ingestion

- **Get Total Users by Role**: `GET /ingestion/total-users-by-role`
  - **Role**: Admin
  - **Response**: `200 OK` with user count by role

- **Get Documents Uploaded by Role**: `GET /ingestion/documents-uploaded-by-role`
  - **Role**: Admin
  - **Response**: `200 OK` with document count by role

## Roles and Permissions

- **Admin**: Full access to all endpoints and functionalities.
- **Editor**: Can upload and update documents, and view all documents.
- **Viewer**: Can only view documents.

