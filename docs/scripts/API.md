# Satellite Nexus API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}