# 🚑 Smart Ambulance Navigation System

An intelligent, real-time routing and management platform designed to minimize emergency response times through dynamic pathfinding, traffic simulation, and signal preemption.

---

## 🌟 Project Overview
The **Smart Ambulance Navigation System** is a full-stack solution that empowers emergency services with state-of-the-art navigation tools. Unlike standard GPS, this system integrates real-time traffic data and infrastructure control (traffic signals) to ensure ambulances take the fastest possible route to life-saving care.

### How it Works (Easy to Understand)
Imagine an ambulance is dispatched to an emergency. This system:
1.  **Analyzes the Entire City**: It loads a real-time map of the city (using OpenStreetMap).
2.  **Calculates the "Smartest" Path**: Instead of just the shortest distance, it calculates the *fastest* time by looking at current traffic speeds on every road.
3.  **Clears the Way**: As the ambulance moves, the system "talks" to upcoming traffic signals. Using **Geofencing**, it triggers a "Green Wave," turning signals green as the ambulance approaches to prevent delays.
4.  **Provides a Command Center**: Administrators can monitor every ambulance in the city, while drivers get a clear, distraction-free navigation interface.

---

## 🛠️ Technology Stack

### **Backend (The Brain)**
- **FastAPI**: A modern, high-performance web framework for Python.
- **MongoDB**: A NoSQL database for flexible user and hospital management.
- **NetworkX & OSMnx**: Advanced libraries used for complex graph theory and road network analysis.
- **A* Search Algorithm**: Used for intelligent, heuristic-based pathfinding.
- **JWT & Bcrypt**: Secure authentication and password hashing.

### **Frontend (The Interface)**
- **React**: A powerful UI library for a responsive, fast user experience.
- **Leaflet**: The leading open-source library for interactive mobile-friendly maps.
- **Lucide-React**: Premium iconography for a clean, professional aesthetic.
- **TailwindCSS/CSS3**: Modern, sleek design with glassmorphism and smooth animations.

---

## 🚀 Key Functionalities

### **1. Intelligent Routing**
- **Dynamic Weights**: Road speeds change in real-time based on traffic conditions.
- **Hospital Selection**: Automatically identifies the best hospital based on specialty (Trauma, Cardiac, etc.) and bed availability.
- **Manual Override**: Drivers can manually select a destination hospital if they need to bypass the automated selection.

### **2. Admin Dashboard**
- **Live Monitoring**: View all active ambulances and their real-time statuses.
- **Infrastructure Management**: Add, remove, or edit hospital data and service capabilities.
- **User Oversight**: Approve new driver registrations and manage system access.

### **3. Driver Navigation**
- **Simulation & Live Modes**: Support for both simulated routing and real-world GPS tracking.
- **Nearby Support**: See other available ambulances in the vicinity for coordination.

### **4. Smart Traffic Control**
- **Signal Preemption**: Automated geofencing (300m radius) that triggers signal changes to "PREEMPTED_GREEN" when an ambulance is nearby.
- **Traffic Randomization**: Simulates realistic city traffic patterns to test routing efficiency.

---

## 📁 Project Structure
```text
root-project/
├── backend/
│   ├── app/
│   │   ├── api/          # Authentication and Admin endpoints
│   │   ├── db/           # MongoDB session management
│   │   ├── schemas/      # Pydantic data validation models
│   │   └── services/     # Core logic (Routing, Traffic, Graph loading)
│   ├── scripts/          # Seeding and utility scripts
│   └── .env              # Sensitive configurations
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI (MapComponent, etc.)
│   │   ├── context/      # Auth state management
│   │   ├── pages/        # Dashboard and Login views
│   │   └── services/     # API communication layers
│   └── .env              # Frontend environment variables
└── README.md             # You are here!
```

---

## 🔒 Security & Best Practices
- **Environment Variables**: All sensitive keys (JWT Secrets, DB URLs) are externalized.
- **Data Validation**: Strict Pydantic models ensure all phone numbers, emails, and coordinates are formatted correctly.
- **RBAC**: Multi-level access control ensures only authorized personnel can perform sensitive operations.
