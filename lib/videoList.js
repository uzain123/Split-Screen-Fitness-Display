export const videoList = [
  "/videos/IMG_6123.mp4",
  "/videos/IMG_6124.mp4",
  "/videos/IMG_6125.mp4",
  "/videos/IMG_6187.mp4",
  "/videos/IMG_6189.mp4",
  "/videos/IMG_6196.mp4"
];

// import fs from "fs";
// import path from "path";

// const fallback = [
//   "/videos/Excercise_1.mp4",
//   "/videos/Excercise_2.mp4",
//   "/videos/Excercise_3.mp4",
//   "/videos/Excercise_4.mp4",
//   "/videos/Excercise_5.mp4",
//   "/videos/Excercise_6.mp4"
// ];

// export function getVideoList() {
//   try {
//     // Check if we're in a server environment
//     if (typeof window === "undefined") {
//       const videosDir = path.join(process.cwd(), "public", "videos");

//       // Check if directory exists
//       if (fs.existsSync(videosDir)) {
//         const files = fs.readdirSync(videosDir);
//         const videoFiles = files
//           .filter((file) => file.toLowerCase().endsWith(".mp4"))
//           .map((file) => `/videos/${file}`)
//           .sort(); // Sort alphabetically

//         console.log("Video files found:", videoFiles);
//         return videoFiles;
//       }
//     }

//     return fallback;
//   } catch (error) {
//     console.error("Error reading videos directory:", error);
//     return fallback;
//   }
// }

// // For backwards compatibility, export the video list
// export const videoList = getVideoList();
