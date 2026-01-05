# Brainstormer

A high-polish "Design Engineer" style React application that transforms messy brain dumps into structured, actionable plans using AI.

## Features

- **Brain Dump Workspace**: Large, elegant textarea for free-form input
- **AI-Powered Distillation**: Uses OpenAI GPT-5 mini to transform thoughts into organized action cards
- **Auto-Distill on Paste**: Automatically processes pasted text (if textarea is empty)
- **Fallback Mode**: Works without API key using mock data generator
- **Action Cards**: 
  - Copy entire sections to clipboard
  - Expand with AI-suggested actions
  - Click tasks to add to Running List
  - Individual checkboxes for task completion
- **Running List Sidebar**: Persistent task list with copy, clear, and individual removal
- **Persistent Storage**: Running list saved to localStorage
- **Toast Notifications**: User feedback for all actions
- **Smooth Animations**: Framer Motion powered micro-interactions
- **Mobile Responsive**: Adapts beautifully to all screen sizes

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons
- OpenAI API (GPT-5 mini)
- Vite
- Vercel Serverless Functions

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure OpenAI API

The OpenAI API key must be set in Vercel's environment variables (server-side only):

- **Variable name**: `OPENAI_API_KEY`
- **Set in**: Vercel Dashboard → Project Settings → Environment Variables
- **Never expose this key in client code**

Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys).

**Note**: The app will work without an API key using a mock data generator, but AI features will be disabled.

### 3. Local Development

For local development with API routes, use Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

This runs both the frontend and API functions locally.

Alternatively, for frontend-only development (without API routes):

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port), but AI features will use the mock data generator.

### 4. Build for Production

```bash
npm run build
```

## Deployment

When deploying to Vercel:

1. The `/api/*` directory is automatically mapped to serverless functions
2. Set the `OPENAI_API_KEY` environment variable in Vercel Dashboard
3. The API key is never exposed to the client - all OpenAI calls happen server-side
4. The model is hard-locked to `gpt-5-mini` for cost control

## Usage

1. **Type or Paste**: Type your brain dump into the textarea, or paste text (auto-distills if textarea is empty)
2. **Distill**: Click "Distill & Expand" to organize your thoughts into action cards
3. **Add to Running List**: Click on any task to add it to your Running List
4. **Expand**: Use the expand button (✨) to get AI-suggested additional actions
5. **Copy**: Copy sections or the entire running list as needed
6. **Persist**: Your Running List is automatically saved and will persist across page refreshes

## Design Philosophy

- **Modern Minimalist**: Clean whitespace and sophisticated typography
- **Visual Depth**: Subtle shadows, rounded corners, and backdrop blurs
- **Micro-interactions**: Smooth animations that make the UI feel alive

## Security

- OpenAI API key is stored server-side only (never exposed to the browser)
- All AI requests go through `/api/distill` serverless function
- Model is hard-locked to `gpt-5-mini` for cost control
- Rate limiting and request size limits protect against abuse