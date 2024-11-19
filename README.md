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

