# Animal List Creation Application

A simple web application for creating and managing animal lists. This application allows users to view lists of animals, create new lists by combining animals from existing lists, and delete custom lists.

## Features

- View original animal lists from the external API
- Create new custom lists by selecting animals from existing lists
- Delete custom lists
- Automatically generates names for new lists
- Responsive design for mobile and desktop
- Data is persisted in localStorage

## Running the Application

### Option 1: Using the Standalone HTML File (Frontend Only)

This is the simplest way to run the application without needing any development environment:

1. Download or clone this repository
2. Open the `index.html` file directly in your web browser
3. That's it! The application will load and connect to the external API

### Option 2: Running the Full Stack Application

If you want to run the full application with both frontend and backend:

#### Prerequisites
- Node.js (version 16 or newer)
- npm package manager (comes with Node.js)

#### Steps for Windows
1. Install dependencies:
   ```
   npm install
   ```

2. Install the cross-env package:
   ```
   npm install --save-dev cross-env
   ```

3. Update the package.json scripts section:
   ```json
   "scripts": {
     "dev": "cross-env NODE_ENV=development tsx server/index.ts"
   }
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5000`

#### Steps for Mac/Linux
1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5000`

## Application Structure

### Frontend-Only Version
The frontend-only version is contained in a single `index.html` file that includes:
- HTML structure
- CSS styles
- JavaScript functionality using vanilla JS
- Direct API access to the external data source
- LocalStorage for persisting custom lists

### Full Stack Version
- `/client` - Frontend React application
- `/server` - Backend Express server
- `/shared` - Shared code between frontend and backend

## Data Flow

1. The application fetches animal data from an external API
2. The data is processed and transformed into the application's format
3. Users can interact with the lists to create new custom lists
4. Custom lists are stored in localStorage for persistence
5. API data is also cached in localStorage to reduce API calls

## Troubleshooting

- If the data doesn't load, check your internet connection
- If lists aren't saving, ensure your browser supports localStorage
- For the full stack version, make sure ports 5000 and 3000 are not in use by other applications
- Clear your browser's localStorage if you want to reset the application to its initial state