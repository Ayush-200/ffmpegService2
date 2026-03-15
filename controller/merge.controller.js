import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const mergeController = async (req, res) => {
  const meetingId = req.body.meetingId;
  const next_cursor = null;
  const videos = [];

  do {
    const response = await cloudinary.api.resources({
      resource_type: 'video',
      prefix: `recordings/${meetingId}`
    })
    videos.push(response);
    next_cursor = response.next_cursor;
  } while (next_cursor)

  const userVideos = {};

  for (const video of videos) {
    const parts = video.public_id.split('/');
    const userId = parts[2];
    if (!userVideos[userId]) {
      userVideos[userId] = [];
    }
    userVideos[userId].push(video);
  }

  for (const userId in userVideos) {
    userVideos[userId].sort((a, b) => {
      const numA = parseInt(a.match(/chunk_(\d+)/)[1]);
      const numB = parseInt(b.match(/chunk_(\d+)/)[1]);
      return numA - numB;
    });
  }

  let userIds = Object.keys(userVideos);

  await mergeUserVideos(userVideos);
  await combineSideBySide(`${userIds[0]}_merged.webm`, `${userIds[1]}_merged.webm`, `final_${userId}.webm`);
}

const mergeUserVideos = async (userVideos) => {
  
  for (const userId in userVideos) {
    const videos = userVideos[userId];

    const content = videos.map(url => `file ${url}`).join("\n");

    const listFile = `${userId}.txt`;
    const outputFile = `${userId}_merged.webm`;

    for (videoUrl in userVideos[userId]) {
      try {
        await fs.writeFile(listFile, content);
        await runFFmpeg(listFile, outputFile);
        await fs.unlink(listFile);
      } catch (err) {
        console.error(`Error writing video URL for user ${userId}:`, err);
      }
    }
  }
}

const runFFmpeg = (inputFile, outputFile) => {
  return new Promise((resolve, reject) => {

    const ffmpeg = spawn("ffmpeg", [
      "-f", "concat",
      "-safe", "0",
      "-i", inputFile,
      "-c", "copy",
      outputFile
    ]);

    ffmpeg.stdout.on("data", (data) => {
      console.log(`ffmpeg: ${data}`);
    });

    ffmpeg.stderr.on("data", (data) => {
      console.log(`ffmpeg: ${data}`);
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });

  });
};

import { spawn } from "child_process";

const combineSideBySide = (video1, video2, outputFile) => {
  return new Promise((resolve, reject) => {

    const ffmpeg = spawn("ffmpeg", [
      "-i", video1,
      "-i", video2,
      "-filter_complex", "hstack",
      outputFile
    ]);

    ffmpeg.stderr.on("data", (data) => {
      console.log(data.toString());
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve(outputFile);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

  });
};