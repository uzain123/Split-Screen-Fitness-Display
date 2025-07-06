# Multi-Video Stream Dashboard

A professional video management application built with Next.js for large displays and TV casting. This application allows you to manage multiple video streams simultaneously with an intuitive interface optimized for large screens.

## Features

- **Multi-Video Grid**: Display up to 6 video players simultaneously
- **Video Assignment**: Assign different videos to each player
- **Global Controls**: Play/pause and mute/unmute all videos at once
- **TV Mode**: Fullscreen mode optimized for large displays
- **Drag & Drop Upload**: Easy video file upload with drag and drop support
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Adding Videos
- Place video files in the `/public/videos/` folder
- Use the drag & drop upload area to add videos
- Videos will automatically appear in the video library

### Video Assignment
- Use the control panel to assign videos to each player
- Select "No video" to clear a player
- Use "Clear All Assignments" to reset all players

### TV Mode
- Click "TV Mode" to enter fullscreen mode
- Press ESC to exit fullscreen
- Move mouse to show/hide controls

### Global Controls
- "Play All" / "Pause All" to control all videos
- "Mute All" / "Unmute All" to control audio

## Technology Stack

- **Framework**: Next.js 15
- **Language**: JavaScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React

## Project Structure

```
chroma-stream-nextjs/
├── app/                    # Next.js app directory
│   ├── page.js            # Main dashboard page
│   ├── layout.js          # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # UI components (buttons, cards, etc.)
│   ├── VideoPlayer.jsx   # Individual video player
│   ├── ControlPanel.jsx  # Video assignment controls
│   ├── VideoUpload.jsx   # File upload component
│   ├── FullscreenView.jsx # TV mode component
│   └── GlobalControls.jsx # Global play/mute controls
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── public/              # Static assets
```

## Development

This project was migrated from a Vite + React TypeScript application to Next.js JavaScript. All components have been converted from TypeScript to JavaScript while maintaining full functionality.

## License

This project is open source and available under the MIT License.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
