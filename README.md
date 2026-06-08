# AI-Powered CyberSecure Network Dashboard for ISP Insights

A smart network dashboard that leverages artificial intelligence and cybersecurity analytics to track patterns, detect anomalies, and provide actionable suggestions for Internet Service Providers.

## Project Structure

This repository is organized into a client-server architecture:

- `/server`: The backend API built with Node.js and Express.
- `/client`: (Coming Soon) The frontend dashboard.

---

## Backend Setup (Server)

The backend follows a modular structure (Controllers, Models, Routes, etc.) to ensure scalability and clean code.

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your system.

### Installation
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install the required packages:
   ```bash
   npm install
   ```

### Running the Server
- **Development Mode** (with automatic restart):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

The server will start on `http://localhost:5000` (by default).

### API Documentation
Once the server is running, you can access the interactive Swagger documentation at:
`http://localhost:5000/api-docs`

---

## Packages Used

### Core Dependencies
- **express**: Fast, unopinionated, minimalist web framework for Node.js.
- **cors**: Middleware to enable Cross-Origin Resource Sharing.
- **dotenv**: Loads environment variables from a `.env` file into `process.env`.
- **swagger-ui-express**: Serves auto-generated swagger-ui generated API docs from express.
- **swagger-jsdoc**: Generates swagger specifications from JSDoc comments in your code.

### Development Dependencies
- **nodemon**: Automatically restarts the node application when file changes in the directory are detected.

---

## Collaboration Guidelines
- Use feature branches for new tasks: `git checkout -b feature/your-feature-name`
- Open a Pull Request (PR) for code review before merging into `main`.
- Refer to `server/src/notes.txt` for a detailed technical breakdown of the architecture.
