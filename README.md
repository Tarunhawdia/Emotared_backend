---

# Emotorad Backend Task: Identity Reconciliation

## Overview

This project involves building a backend service for the integration of Emotorad's identity reconciliation system with Zamazon.com. The service identifies and links customers who use different contact information (emails and phone numbers) for their purchases, creating a consolidated contact profile.

### Objective

The service accepts JSON payloads containing `email` and `phoneNumber` fields and identifies whether the incoming contact information already exists in the database. If it does, the service links the new information to the existing profile as a secondary contact. If not, it creates a new primary contact.

### Features:

1.  **Contact Identification**: Accepts requests with email or phone number to identify existing contacts.
2.  **Contact Linking**: Links new contact details (email or phone number) to an existing contact as a secondary contact.
3.  **New Contact Creation**: If no match is found, a new contact entry is created.
4.  **Support for Multiple Contacts**: Each contact can have multiple email addresses and phone numbers, all linked together.

---

## API Endpoint

### `POST /identify`

This endpoint receives the contact information (email or phone number) and returns the primary contact and associated secondary contact details.

#### Request Body (JSON)

`{
  "email": "doc@zamazon.com",
  "phoneNumber": "1234567890"
}`

- `email`: (optional) The email address associated with the customer.
- `phoneNumber`: (optional) The phone number associated with the customer.

At least one of `email` or `phoneNumber` should be provided in the request body.

#### Response (JSON)

The response will include the primary contact ID, all emails, phone numbers, and linked secondary contact IDs.

Example response for a new contact:

`{
  "primaryContactId": 1,
  "emails": ["doc@zamazon.com"],
  "phoneNumbers": ["1234567890"],
  "secondaryContactIds": []
}`

Example response when a secondary contact is linked:

`{
  "primaryContactId": 1,
  "emails": ["doc@zamazon.com"],
  "phoneNumbers": ["1234567890", "0987654321"],
  "secondaryContactIds": [2]
}`

---

## Setup

### Prerequisites

1.  **Node.js**: Ensure that Node.js (v14 or higher) is installed.
2.  **PostgreSQL**: Make sure you have PostgreSQL installed and running.
3.  **Prisma**: This project uses Prisma ORM to interact with the database.

### Steps to Set Up

1.  Clone the repository to your local machine:

        `git clone https://github.com/Tarunhawdia/Emotared_backend.git

    cd emotorad-backend-task`

2.  Install the required dependencies:

    `npm install`

3.  Set up the PostgreSQL database:

    - Create a database named `emotorad`.
    - Update the `DATABASE_URL` in the `.env` file with your PostgreSQL connection string.

4.  Run Prisma migrations to set up the database schema:

    `npx prisma migrate dev`

5.  Start the application:

    `npm start`

The server will be running on `http://localhost:3000`.

---

## Example CURL Commands

1.  **Create a new contact**:

        `curl -X POST http://localhost:3000/identify -H "Content-Type: application/json" -d '{"email": "doc@zamazon.com", "phoneNumber": "1234567890"}'`

        **Expected response**:

        `{

    "primaryContactId": 1,
    "emails": ["doc@zamazon.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
    }`

2.  **Link a new secondary contact**:

        `curl -X POST http://localhost:3000/identify -H "Content-Type: application/json" -d '{"phoneNumber": "0987654321"}'`

        **Expected response**:

        `{

    "primaryContactId": 1,
    "emails": ["doc@zamazon.com"],
    "phoneNumbers": ["1234567890", "0987654321"],
    "secondaryContactIds": [2]
    }`

3.  **Add a new email to an existing contact**:

        `curl -X POST http://localhost:3000/identify -H "Content-Type: application/json" -d '{"email": "marty@zamazon.com"}'`

        **Expected response**:

        `{

    "primaryContactId": 1,
    "emails": ["doc@zamazon.com", "marty@zamazon.com"],
    "phoneNumbers": ["1234567890", "0987654321"],
    "secondaryContactIds": [2, 3]
    }`

---

## Error Handling

- **400 Bad Request**: If neither `email` nor `phoneNumber` is provided in the request body, a 400 error is returned.

  `{
  "error": "Email or phone number is required"
}`

- **500 Internal Server Error**: If an error occurs while processing the request, a 500 error is returned.

  `{
  "error": "Failed to process the request"
}`

---

## Database Schema

The database schema for the contacts is as follows:

`CREATE TABLE "Contact" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255),
  "phoneNumber" VARCHAR(20),
  "linkedId" INTEGER, -- Points to another contact (self-referencing)
  "linkPrecedence" VARCHAR(20), -- "primary" or "secondary"
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP
);`

### Relationships:

- `linkedId` refers to another contact that is linked to this one.
- `linkPrecedence` determines if the contact is a primary or secondary contact.

---

## Unit Testing

You can write unit tests to verify the correctness of the implementation. Tests should ensure:

1.  Correct linking of contacts when email or phone number matches.
2.  Creation of a new contact when no match is found.
3.  Handling of edge cases such as missing fields or malformed requests.

---

## Conclusion

This service consolidates customer contact information across multiple orders using different emails and phone numbers. It helps Zamazon.com and Emotorad create personalized customer experiences by linking contact details together efficiently.
