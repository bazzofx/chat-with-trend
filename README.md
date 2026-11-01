# Chat with Trend

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Configuration

The chat API runs on [OpenRouter](https://openrouter.ai). Set the API key in your environment before starting the app:

```powershell
$env:OPENROUTER_API_KEY="sk-or-v1-..."
```

The existing `apiOpenRouterChatWithTrend` name is also accepted as a fallback. The route fails fast if neither is set, so the key must be available when running `next build` as well as at runtime. The default model is `openai/gpt-4o`; override it with the `OPENROUTER_MODEL` environment variable.

## Local development

```bash
npm run dev
```

The dev server listens on `http://localhost:4987`.

## Docker Compose (production)

Create a `.env` file in the project root with your OpenRouter key (never commit it):

```dotenv
OPENROUTER_API_KEY=sk-or-v1-...
# optional
OPENROUTER_MODEL=openai/gpt-4o
```

Build and start the container:

```bash
docker compose up -d --build
```

The app will be available at `http://localhost:4987`. The first start builds the Next.js app, so allow a minute or two before the health check turns healthy.

Useful commands:

```bash
docker compose ps
docker compose logs -f
docker compose down
```

You can use `apiOpenRouterChatWithTrend` instead of `OPENROUTER_API_KEY` in `.env`; the app accepts either.

## Deployment

Your project is live at:

**[https://vercel.com/bazzofx-outlookcoms-projects/v0-chat-with-trend](https://vercel.com/bazzofx-outlookcoms-projects/v0-chat-with-trend)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/jCiCX2k4TJQ](https://v0.app/chat/projects/jCiCX2k4TJQ)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
