<<<<<<< HEAD
# CV-MAKER

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-ykw8f7jd)
=======
# CV MAKER

![Node](https://img.shields.io/badge/node-20+-339933?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.21-000?style=flat-square&logo=express)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)
![libSQL](https://img.shields.io/badge/libSQL-Turso-4B32C3?style=flat-square)

**Full-stack CV builder with job scraper, market analysis, and bidirectional skill matching.**

## Features

### CV Builder
- Drag-and-drop CV editor (react-beautiful-dnd)
- Multi-language support (PL/EN via i18n)
- PDF generation with custom fonts (pdfkit + Inter)
- Shareable CV links with QR codes
- Template system

### Job Scraper
- **50 configured sources**, 15 actively scraping
- 1500+ job offers collected and growing
- Sources: solid.jobs, pracuj.pl, justjoin.it, arbeitnow.com, jobicy.com, remotive.com, himalayas.app, jobtechdev.se, 15 RSS feeds
- Cloudflare WAF bypass for blocked sources (Indeed, LinkedIn, Glassdoor)

### Market Analysis
- Market profiles with skill gap analysis
- Best role matching based on your CV
- Enrichment and rescoring engine
- Salary benchmarking

### Dashboard
- Stats dashboard with charts
- Search, filter, sort across all offers
- CSV export for offline analysis
- Best role cards with match percentage

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js 20, Express 4.21 |
| Database | libSQL (Turso) / SQLite (sqld) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Frontend | React 18, Vite 5, TailwindCSS 3 |
| PDF | pdfkit, custom Inter fonts |
| Scraping | cheerio, axios |

## Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  sqld     │◄────│  Backend  │◄────│  Frontend │
│  :8080    │     │  :3000    │     │  :5173    │
└──────────┘     └────┬─────┘     └──────────┘
                      │
               ┌──────▼──────┐
               │  Scrapers   │
               │  (50 srcs)  │
               └─────────────┘
```

## Quick Start

```bash
# Start the database
systemctl --user start cv-sqld

# Start backend
systemctl --user start cv-api

# Start frontend
systemctl --user start cv-front

# Or all at once
bash run.sh start
```

### Development

```bash
# Backend
cd backend
npm install
cp ../.env.example .env
node server.js

# Frontend (separate terminal)
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Current user |

### CVs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cvs` | List CVs |
| `POST` | `/api/cvs` | Create CV |
| `GET` | `/api/cvs/:id` | Get CV |
| `PUT` | `/api/cvs/:id` | Update CV |
| `DELETE` | `/api/cvs/:id` | Delete CV |
| `GET` | `/api/cvs/shared/:code` | Shared CV (public) |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/jobs` | List jobs |
| `POST` | `/api/jobs/scan` | Trigger scan |
| `GET` | `/api/jobs/stats` | Stats |
| `GET` | `/api/jobs/match` | Match CV to jobs |
| `GET` | `/api/jobs/skills` | Skill gap analysis |
| `GET` | `/api/jobs/export` | CSV export |

## Deployment

```bash
# Using Docker Compose
docker compose up -d

# Or natively with systemd
bash run.sh start
bash run.sh stop
bash run.sh status
```

## Test Login

- Email: `test@t.pl`
- Password: `test123`

## Screenshots

| Page | URL |
|---|---|
| Login | `http://192.168.0.28:5173/login` |
| CV Editor | `http://192.168.0.28:5173/cvs` |
| Job Dashboard | `http://192.168.0.28:5173/jobs` |
| CV PL (shared) | `http://192.168.0.28:5173/shared/437f87ffe34e` |
| CV EN (shared) | `http://192.168.0.28:5173/shared/7a1aafac9d59` |

## License

MIT
>>>>>>> aa0f469 (init: CV MAKER full-stack app)
