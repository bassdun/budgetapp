# HomeBudget - Personal Finance Tracker

A modern personal budget tracking application built with React, Firebase, and Neon PostgreSQL.

## Features

- 🔐 Secure user authentication with Firebase
- 📊 Transaction management with CSV upload
- 🤖 AI-powered transaction categorization
- 📈 Interactive budget dashboard
- 💬 AI assistant for financial insights
- 📱 Mobile-friendly design

## Tech Stack

- Frontend: React + Tailwind CSS
- Authentication: Firebase Auth
- Database: Neon PostgreSQL
- AI: OpenAI GPT-4
- Deployment: Vercel

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_DATABASE_URL=your_neon_postgresql_url
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  source VARCHAR(100),
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE budgets (
  user_id UUID REFERENCES users(id),
  category VARCHAR(100),
  monthly_limit DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (user_id, category)
);

CREATE TABLE income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  source VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Deployment

The application is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel and deploy.

## License

MIT 