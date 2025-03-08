# Resume Builder Application

A modern web application that helps users create professional resumes easily.

## Features

- Multi-step form for adding personal information, work experience, education, and skills
- Responsive design that works on desktop and mobile devices
- Resume templates to choose from
- Preview and download options
- Simple navigation with progress tracking

## Tech Stack

- React
- React Router
- Axios for API requests
- Vite for build tooling
- CSS for styling (no external UI libraries)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```
npm run build
```

## Project Structure

- `/src` - Source files
  - `/components` - Reusable components
  - `/pages` - Page components
  - `/assets` - Static assets like images
  - `/styles` - CSS files
  - `/util` - Utility functions
  - `main.jsx` - Application entry point

## API Endpoints

The application communicates with a backend server running on `http://localhost:4000` with the following endpoints:

- `POST /resume/generate` - Creates a new resume from the submitted form data

## License

[MIT](LICENSE)
