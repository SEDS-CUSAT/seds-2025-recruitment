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
MONGODB_URI = your_mongodb_connection_string
JWT_SECRET = your_jwt_secret
DISCORD_WEBHOOK_URL = your_discord_webhook_url
```
4. Start the development server:
```bash
npm run dev
```

## Environment Variables

- `MONGODB_URI`: MongoDB connection string for storing application data.
- `JWT_SECRET`: Secret key for signing JWT tokens.
- `DISCORD_WEBHOOK_URL`: Webhook URL for sending logs to Discord.