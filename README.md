# Care Connect

## Overview

Care Connect is an e-healthcare platform designed to simplify the process of discovering and booking healthcare services. It enables users to search for hospitals and doctors based on **location, specialization, and severity of health conditions**, while ensuring a streamlined and reliable appointment booking process.

The platform addresses the current limitations in online healthcare services by integrating **severity-based filtering**, **location-based discovery**, and **fast appointment scheduling**. In addition, it implements secure authentication and provider verification mechanisms to ensure credibility and trust.

---

## Features

* **Severity-Based Filtering**: Prioritizes hospitals and doctors with specialized infrastructure for high-severity conditions.
* **Location-Based Search**: Powered by PostgreSQL with PostGIS to deliver efficient spatial queries and proximity-based recommendations.
* **Fast Appointment Booking**: Reduces scheduling delays through optimized backend workflows.
* **User Authentication**: Secure login and data management system.
* **Provider Verification**: Ensures that hospitals and doctors listed are verified and accredited.

---

## Technology Stack

* **Frontend**: React.js with TypeScript
* **Backend**: Node.js with Express.js (TypeScript)
* **Database**: PostgreSQL with Prisma ORM
* **Spatial Data Handling**: PostGIS extension for PostgreSQL

---

## System Architecture

1. **Frontend**: Developed with React and TypeScript, focusing on modularity and scalability.
2. **Backend**: Built with Node.js and Express.js, providing RESTful APIs for data access and business logic.
3. **Database**: PostgreSQL is used for relational data management. Prisma ORM is integrated to simplify schema modeling and ensure type-safe queries.
4. **Spatial Queries**: PostGIS powers location-based filtering and hospital proximity calculations.

---

## Project Objectives

* To provide users with a **fast and reliable healthcare discovery platform**.
* To bridge the gap in current systems lacking severity-based prioritization.
* To reduce appointment booking friction through simplified workflows.
* To ensure security, scalability, and maintainability through modern web technologies.

---

## Installation & Setup

### Prerequisites

* Node.js (>= 16.x)
* PostgreSQL (>= 13.x)
* Prisma ORM CLI
* PostGIS extension enabled on PostgreSQL

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/care-connect.git
   cd care-connect
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/careconnect"
   ```
4. Apply Prisma schema and migrations:

   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:

   ```bash
   npm run dev
   ```

---

## Future Enhancements

* Integration of AI-driven severity detection during appointment booking.
* Real-time patient triage and automated routing to specialized facilities.
* Multi-language support for broader accessibility.
* Enhanced analytics dashboards for hospitals and doctors.
