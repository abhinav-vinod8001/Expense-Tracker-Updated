# Expense Tracker App

A web-based expense tracker application built with React and TypeScript. The app allows users to track their daily expenses and income with a dialer-style numpad interface, view transaction history with customizable currency display, and get AI-powered spending insights with YouTube recommendations.

## Features

- Track expenses and income with an intuitive interface
- View transaction history with customizable currency display
- Get AI-powered spending insights
- Watch YouTube recommendations for financial tips
- Dark/Light mode support
- Multiple currency support

## Environment Variables

This application uses environment variables for API keys. To set up the required environment variables:

### Local Development

1. Create a `.env` file in the root directory of the project
2. Add your YouTube API key to the `.env` file:
   ```
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```
3. Run the development server with `npm run dev`

### Vercel Deployment

To make the YouTube API key work on Vercel:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add a new environment variable:
   - Name: `YOUTUBE_API_KEY`
   - Value: Your YouTube API key
4. Save the changes and redeploy your application

## Getting a YouTube API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to APIs & Services > Library
4. Search for "YouTube Data API v3" and enable it
5. Go to APIs & Services > Credentials
6. Create an API key and restrict it to the YouTube Data API v3

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## License

MIT