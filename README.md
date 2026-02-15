# AeroSense.ai - Backend

This is the production-ready backend for AeroSense.ai, an AI-powered air quality monitoring and forecasting platform. Built with Node.js, TypeScript, MongoDB, and Redis.

## Features
- **Real-time AQI**: Fetches live data from OpenWeather.
- **Caching**: Uses Redis to minimize API costs and latency.
- **AI Forecast**: Simple linear regression engine predicting next 24 hours based on historical trends.
- **Background Jobs**: 30-minute interval database snapshots for history tracking.
- **Threshold Alerts**: Automatic email notifications when AQI exceeds user-defined limits.
- **Secure Auth**: JWT-based authentication with bcrypt password hashing.

## Prerequisites
- **Node.js**: v18+ 
- **MongoDB**: Local or Atlas instance.
- **Redis**: Required for caching (optional but recommended).
- **OpenWeather API Key**: Get one at [openweathermap.org](https://openweathermap.org/api).

## Installation

1.  **Clone and Install**:
    