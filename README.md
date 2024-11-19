# ZETALERT: a notification app for the Zetachain community

## Description
Zetalert is a Next.js web application running in Vercel that provides manual and automatic notification functionality for incidents, maintenance windows and failed block health checks.
Currently, it has the following features:


# ZetAlert

ZetAlert is a monitoring and alerting system for ZetaChain networks. It provides real-time monitoring of block production, chain health checks, and integrated alerting through Discord and Slack.

## Features

- **Multi-Channel Alerts**
  - Discord integration
  - Slack integration
  - Rich message formatting with block explorer links
  - Deduplication of alerts

- **Web Dashboard**
  - Live chain status display
  - Ability to manually send recent alerts to any/all channels
  - Message history
  - Webhook configuration

- **Automated Block Monitoring using Zetachain API**
  - Block production time validation
  - Block height change validation 
  - Chain stall detection
  - Customizable alert thresholds
  - Setup to run as a Cron job 

## Setup

### Prerequisites
- Node.js 18+
- Vercel account
- Discord webhook URL
- Slack webhook URL

### Installation

Clone the repository:

```git clone https://github.com/yourusername/zetalert.git
cd zetalert```

Install dependencies:

```npm install```

Create a .env.local file:

```DISCORD_WEBHOOK_URL=your_discord_webhook_url
SLACK_WEBHOOK_URL=your_slack_webhook_url
DEMO_USER=admin
DEMO_PASS=your_pass```

Start the development server:

```npm run dev```

Deployment

Deploy to Vercel:

```vercel deploy``` or merge to the dev branch

### Configure Vercel KV (Redis) for message storage
- Add environment variables in Vercel dashboard
- The cron job will automatically be configured via vercel.json

**Configuration**
  -  Alert Thresholds
    Modify constants in src/app/api/cron/check-blocks/route.ts:
typescriptCopyconst BLOCK_TIME_TARGET = 6; // seconds
const ACCEPTABLE_BLOCK_TIME_VARIANCE = 3; // seconds
const BLOCK_STALL_THRESHOLD = 30; // seconds
Cron Schedule
Edit vercel.json:
```jsonCopy{
  "crons": [{
    "path": "/api/cron/check-blocks",
    "schedule": "* * * * *"
  }]
}```

## Architecture

Frontend: Next.js with TypeScript and Tailwind CSS
Backend: Next.js API routes
Database: Vercel KV (Redis)
Authentication: NextAuth.js
Automated requests: Vercel Cron Jobs

## Development

Project Structure
Copysrc/
  app/              # Next.js app router
    api/            # API routes
    dashboard/      # Dashboard pages
  components/       # React components
  lib/             # Shared utilities
Testing

Run tests:
```npm test```

Adding New Features

Create new components in src/components
Add API routes in src/app/api
Update types in src/lib/types.ts
Add tests in src/__tests__

Contributing

Fork the repository
Create a feature branch
Submit a pull request

License
MIT
Contact
For issues and feature requests, please use the GitHub issue tracker.
