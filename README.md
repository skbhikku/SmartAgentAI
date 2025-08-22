### Smart Helpdesk with Agentic Triage ###

An AI-powered helpdesk where users raise support tickets and an AI coworker (powered by Mistral AI) triages them by classifying,
fetching relevant knowledge base (KB) articles, drafting a reply, and either auto-resolving or assigning to a human support agent.

## Features

- Role-based access:
  - User: create/view tickets, see replies
  - Support Agent: review AI replies, edit and resolve tickets
  - Admin: manage KB articles, configure thresholds, monitor audit logs
- Knowledge Base management: CRUD articles with tags and status
- Ticket lifecycle: create ticket → AI triage → suggested reply → auto-resolve or assign
- Agentic workflow: plan → classify → retrieve KB → draft reply → decision → log
- Audit log: every step logged with traceId
- Notifications: in-app updates on ticket status

## Tech Stack

- Frontend: React (Vite) + TailwindCSS
- Backend: Node.js + Express.js + MongoDB (Mongoose)
- AI Integration: Mistral AI API for classification and drafting
- Auth: JWT-based authentication

## Architecture

Frontend (React + Vite + Tailwind)
    |
    | REST API (Auth, Tickets, KB, Config, Audit)
    v
Backend (Node.js + Express + Mongoose)
    |
    | Calls Mistral AI (classify, draft reply)
    v
Mistral AI API
    |
    v
MongoDB for persistence

## Agentic Workflow

1. Classify ticket text using rules or Mistral AI
2. Retrieve top KB articles with simple keyword search
3. Draft AI reply with citations to KB
4. Decision: auto-close if confidence ≥ threshold, else assign to human
5. Audit log: append step with traceId for transparency



## Demo

Short video walkthrough shows:
- Creating a ticket
- User panel workflow
- Agent panel workflow
- Admin panel workflow
Google Drive Link : https://drive.google.com/file/d/1VleTQjo67PeLcAPin_9oHsGupdI3Kxl/view?usp=drive_link


## Deployment
The application is live and can be accessed at:
https://smartaiagent.netlify.app
Source code is available on GitHub:
https://github.com/skbhikku/SmartAgentAI


## Author

Built with ❤️ by Shaik Bhikku Saheb
