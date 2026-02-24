# Message Chess

A chess.com-style "Game Review" app for your text message screenshots, built with Next.js, Tailwind, and Shadcn UI.

## Features

1. **Screenshot Game Review**: Upload a text conversation and get AI-powered meme-heavy coach commentary, critical moments, and accuracy scores out of 100.
2. **Puzzles Practice Mode**: Chat with varied NPC personas (Sarcastic, Golden Retriever, Dry Texter, etc.) to practice your text game.

## Tech Stack

- **Framework**: Next.js App Router
- **Styling**: Tailwind CSS & Shadcn UI
- **Graphs**: Recharts
- **Image Export**: html-to-image
- **Validation**: Zod
- **AI**: OpenAI SDK (supports mock fallback mode)

## Getting Started

1. **Clone the repository** (if not done already).

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Copy `.env.example` to `.env.local` and configure your settings.
   ```bash
   cp .env.example .env.local
   ```
   
   - `SHARED_PASSWORD`: The beta access password. The default is `demo`.
   - `OPENAI_API_KEY`: Add your OpenAI Key to enable AI reviews. If left blank, the app will run in "Mock Mode" and return sample data for testing the UI.

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Default Password Gate

The entire app is gated behind a simple password page. 
Use the password defined in `SHARED_PASSWORD` to log in. In mock mode, this is `demo`.

## Deployment

Recommended deployment on [Vercel](https://vercel.com).
Ensure you securely provide the required Environment Variables in the project settings.

## Future Plans

Scaffolding exists for expanding to:
- Auth logic (Supabase/Auth.js)
- Subscriptions (Stripe)
- Review history & analytics
