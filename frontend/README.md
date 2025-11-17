# Dating App Frontend

A modern, inclusive dating app built with React and Vite.

## Features

- User authentication with OTP verification
- Multi-step onboarding questionnaire
- Profile setup with photo upload
- Discovery feed with swipe functionality
- In-app chat
- Filter and search capabilities
- Premium features

## Tech Stack

- React 19
- React Router DOM
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React Icons

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment

This project is configured for Vercel deployment. The `vercel.json` file includes:

- Build configuration
- SPA routing rewrites
- Framework detection

### Deploy to Vercel

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in Vercel
3. Vercel will automatically detect Vite and use the configuration
4. Deploy!

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── data/          # Mock data
│   ├── constants/     # Theme constants
│   ├── App.jsx        # Main app component
│   └── main.jsx       # Entry point
├── public/            # Static assets
├── vercel.json        # Vercel configuration
└── package.json       # Dependencies
```

## Environment Variables

No environment variables are required for basic functionality. All data is stored in localStorage for demo purposes.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private project
