# SEDS CUSAT 2025 Recruitment Portal

This is the recruitment portal for SEDS CUSAT 2025 intake. The portal handles student applications and payment verification.

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
```
4. Start the development server:
```bash
npm run dev
```

## Environment Variables

- `MONGODB_URI`: MongoDB connection string for storing application data.
