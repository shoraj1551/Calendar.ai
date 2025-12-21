# AI Integration Setup Guide

This project supports **Ollama** (Local LLM) and **OpenAI/Groq** (Cloud LLM) for natural language processing features.

## Option 1: Local Setup (Recommended for Privacy/Free)
We use **Ollama** to run models like `llama3` locally.

### 1. Install Ollama
Download and install Ollama from [ollama.com](https://ollama.com).

### 2. Pull the Model
Open your terminal and run:
```bash
ollama run llama3
```
*Note: This downloads the model (~4.7GB). Keep this terminal running or ensure the Ollama service is active.*

### 3. Configure `.env`
Add the following to your `.env` file (create it if missing):

```ini
AI_BASE_URL="http://localhost:11434/v1"
AI_API_KEY="ollama"
AI_MODEL="llama3"
```

## Option 2: Cloud Setup (OpenAI / Groq)
If you prefer using a cloud provider:

### 1. Get an API Key
- **OpenAI**: [platform.openai.com](https://platform.openai.com/api-keys)
- **Groq**: [console.groq.com](https://console.groq.com)

### 2. Configure `.env`
```ini
# For OpenAI
AI_BASE_URL="https://api.openai.com/v1"
AI_API_KEY="sk-..."
AI_MODEL="gpt-4o-mini"

# For Groq
# AI_BASE_URL="https://api.groq.com/openai/v1"
# AI_API_KEY="gsk_..."
# AI_MODEL="llama3-8b-8192"
```

## Verification
You can test the connection by running the app and using the AI Command API, or via curl:

```bash
curl -X POST http://localhost:3000/api/ai/command \
  -H "Content-Type: application/json" \
  -d '{"text": "Schedule a meeting with Alice tomorrow at 10am"}'
```
