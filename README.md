# JFB Lead Command

Lead generation tool for JFB Hart Coatings. Find flooring contractor leads, score them, and generate personalized outreach messages.

## Features

- **Search Leads**: Enter a city, get 25 flooring contractor leads from OpenWebNinja API
- **Auto-Rating**: Leads automatically scored 1-5 based on business type fit
- **Map View**: Google Maps with colored pins by rating
- **Message Generator**: Personalized outreach messages per business type
- **Email Lookup**: Hunter.io integration to find contact emails (production)
- **Export**: CSV and TXT downloads

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Create .env file with your API keys
cp .env.example .env
# Edit .env and add your keys

# Start dev server
npm run dev
```

Open http://localhost:3000

## Environment Variables

### Local Development (.env)
```
VITE_OPENWEBNINJA_API_KEY=your_key
VITE_GOOGLE_MAPS_API_KEY=your_key
```

### Vercel Production (set in dashboard)
```
OPENWEBNINJA_API_KEY=your_key
HUNTER_API_KEY=your_key
VITE_GOOGLE_MAPS_API_KEY=your_key
```

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## API Keys Needed

- **OpenWebNinja**: https://openwebninja.com - Business search API
- **Google Maps**: https://console.cloud.google.com - Enable Maps JavaScript API
- **Hunter.io**: https://hunter.io - Email finder (optional, for production)

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Google Maps JavaScript API
- OpenWebNinja API
- Hunter.io API
- Vercel Serverless Functions
