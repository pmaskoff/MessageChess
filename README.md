# Message Chess

A chess.com-style Game Review app for important conversations, built with Next.js, Tailwind, and Shadcn UI.

## Features

1. **Screenshot Game Review**: Upload a message screenshot and get AI-powered coach commentary, critical moments, move labels, and accuracy scores.
2. **Conversation Practice Mode**: Chat with varied personas to practice important conversations like dating, networking, favors, follow-ups, and other high-stakes asks.
3. **Chess Framing**: Break down conversations with openings, blunders, brilliant moves, and suggested next lines.

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
