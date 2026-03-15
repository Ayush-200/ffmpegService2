# FFmpeg Service

A Node.js-based service for video processing and merging using FFmpeg.

## Features

- Video merging functionality
- RESTful API endpoints
- Built with Express.js

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd ffmpegService
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Ensure FFmpeg is installed on your system. Download from [ffmpeg.org](https://ffmpeg.org/download.html) if needed.

## Usage

Start the server:
```
npm start
```
or
```
node server.js
```

The server will run on `http://localhost:3000` (or the port specified in your environment).

## API Endpoints

- `POST /merge` - Merge video files (see `routes/merge.routes.js` for details)

## Project Structure

- `server.js` - Main server file
- `controller/merge.controller.js` - Logic for merging videos
- `routes/merge.routes.js` - API routes for merge functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License