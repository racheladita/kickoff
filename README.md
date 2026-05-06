# Kickoff — Football-Themed Wellness Gamification API

[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A robust Backend API designed to power a wellness challenge platform through football-themed gamification. The system integrates physical health tracking with a competitive fantasy football management layer, incentivizing wellness milestones through virtual rewards and team progression.

## 🏗️ System Architecture

The application is built on a modular **Model-View-Controller (MVC)** architecture, ensuring high maintainability and clear separation of concerns:

- **Persistence Layer**: Utilizing MySQL with prepared statements to prevent SQL injection and ensure data integrity.
- **Service Logic**: Decoupled controllers handling complex operations like streak calculation, point allocation, and match simulation.
- **Security Layer**: Tiered ownership validation ensuring that users can only modify their own teams, challenges, and account data.

## 🚀 Core Features

### 🏆 Wellness Gamification

- **Dynamic Challenges**: CRUD operations for health-centric tasks (e.g., hydration tracking, morning routines).
- **Streak Engine**: Automated tracking of consecutive daily completions to maximize user engagement.
- **Reward Pipeline**: Conversion of wellness milestones into "Points," the primary currency for the football management layer.

### ⚽ Football Manager Engine

- **Team Ecosystem**: Comprehensive management of football clubs, including roster building and tactical oversight.
- **Player Marketplace**: A simulated economy where users utilize earned wellness points to unlock high-value players.
- **Match Simulation**: Logic-based matchmaking allowing users to test their rosters against peers or AI opponents.

### 🏅 Achievement System

- **Badge Framework**: Event-driven badge allocation for milestones such as "Consistency King" (Wellness) or "Hat Trick" (Football).

## 🛠️ Tech Stack & Security

- **Runtime**: Node.js & Express.js
- **Database**: MySQL (using `mysql2` for high performance)
- **Configuration**: Dotenv for environment-based credential management.
- **Security**:
  - **Prepared Statements**: Universal implementation of parameterized queries to mitigate SQL injection risks.
  - **Ownership Middleware**: Granular access control logic at the route level.

## ⚙️ Installation & Setup

### 1. Environment Configuration

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_DATABASE=kickoff
```

### 2. Dependency Management

```bash
npm install
```

### 3. Database Initialization

This command initializes the schema and populates the database with initial player catalogues and challenge metadata:

```bash
npm run init_tables
```

### 4. Deployment

```bash
npm start
```

The API is accessible at `http://localhost:3000`.

## 📂 Repository Structure

- `src/controllers/`: Core business logic (Streaks, Points, Matches).
- `src/models/`: Database schema definitions and interaction logic.
- `src/routes/`: API endpoint definitions with ownership security filters.
- `src/services/`: Reusable utility functions for database connectivity.

---

_Developed by Adita Putri Puspaningrum._
