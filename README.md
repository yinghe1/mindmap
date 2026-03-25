# Cognitive Map

Interactive visualization of how notable people think, speak, and behave — powered by AI.

Enter any person's name (exists in wikipedia) and get a rich cognitive architecture map: themed nodes, weighted connections, life-phase trends, behavioural patterns, and more.

<video src="demo.mp4" autoplay loop muted playsinline width="100%"></video>

![Dark mode](https://img.shields.io/badge/theme-dark%20%26%20light-blue)

---

> **There are 3 main reasons I created this project:**
>
> 1. **Recent obsession of studying how transformer LLMs think and reason** — understanding the latent structures that emerge when models process information about real people.
>
> 2. **I used to keep an Excel file to list all the people who inspire me. I call them Great Inspirers.** Now with AI, I can visualize how they think and behave.
>
> 3. **For you, who share the same interest. Enjoy!**

---

## Features

- Generate cognitive maps for any notable person via Wikipedia + LLM
- Interactive force-directed graph with draggable nodes
- Cognitive architecture decision tree
- Thinking, speaking, and behaviour pattern analysis with samples, impact, outcomes, and audience influence
- Life-phase timeline animation
- Light and dark mode
- Export to standalone HTML or JSON
- Import/export person data for sharing

## Tech Stack

- **Client**: React + TypeScript + Vite
- **Server**: Node.js + Express + TypeScript
- **Database**: SQLite (via better-sqlite3)
- **AI**: OpenAI API (structured output)
- **Data**: Wikipedia API for biographical summaries

## Prerequisites

- Node.js 18+
- npm 9+
- An [OpenAI API key](https://platform.openai.com/api-keys)

## Install & Run

```bash
# Clone the repo
git clone https://github.com/yinghe1/mindmap.git
cd mindmap

# Install dependencies (workspaces)
npm install

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env and add your OpenAI API key:
#   OPENAI_API_KEY=sk-...

# Run in development mode (starts both server and client)
npm run dev
```

The app will be available at **http://localhost:5173** (client) with the API server on **http://localhost:3000**.

## Project Structure

```
mindmap/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── api/           # API client
│       ├── components/    # UI components
│       ├── design-system/ # Reusable design tokens & components
│       ├── hooks/         # Custom React hooks
│       ├── store/         # Zustand state management
│       └── utils/         # Utilities (HTML export, etc.)
├── server/          # Express backend
│   └── src/
│       ├── prompts/       # LLM prompt & schema
│       ├── routes/        # API routes
│       ├── services/      # Wikipedia, Anthropic, DB services
│       └── types/         # TypeScript types
└── package.json     # Workspace root
```

## Usage

1. Enter a person's name (e.g., "Mark Twain") and click **Generate**
2. Explore the interactive graph — drag nodes, click for details
3. Use the timeline slider to see how themes evolved across life phases
4. Click **Patterns** to see detailed thinking/speaking/behaviour analysis
5. Toggle between dark and light mode
6. Export as HTML for a standalone shareable page, or as JSON for data

## License

MIT
