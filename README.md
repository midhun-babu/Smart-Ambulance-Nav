# Intelligent Ambulance Routing & Traffic Signal Preemption System

This project is a full-stack web application that simulates an Intelligent Ambulance Routing and Traffic Signal Preemption System for Kerala. It uses OpenStreetMap data (Kochi region for performance) to build the road graph, calculates the shortest path using A* routing based on travel time, and simulates an ambulance moving along the route, preempting traffic signals as it approaches within a 300m geofenced radius.

## Prerequisites

- **Python 3.9+**
- **Node.js** (v18+ recommended) and `npm`

## Setup and Run Instructions

### 1. Backend Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   **Note**: On first startup, it will download the OpenStreetMap data for Kochi. This can take a minute or two depending on your internet connection. Wait until you see "Graph loaded with X nodes and Y edges" before starting the frontend simulation.

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser to the URL provided (usually `http://localhost:5173`).

## Simulation Features

- **Case Type Selector**: Choose between General, Trauma, or Cardiac. The system will auto-select the nearest capable hospital.
- **Start Simulation**: Calculates the optimal route via A* routing on the OSM road graph and begins ambulance movement.
- **Traffic Signals**: ~20 randomly selected intersections are simulated as traffic lights. They cycle normally until the ambulance gets within 300m, triggering a **PREEMPTED_GREEN** state for a clean window.
- **Driver Alerts**: UI-banners notify the operator when a signal is preempted or if failsafe mode is activated.

-Have to implement LLM TO MAKE SURE EADY TRANSPORT 
