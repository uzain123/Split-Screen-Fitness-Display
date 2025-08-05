// src/lib/videoList.js
const baseURL = "https://videosbuckett.s3.eu-north-1.amazonaws.com/";

export const videoList = [
  "ex_1.mp4",
  "ex_2.mp4",
  "ex_3.mp4",
  "ex_4.mp4",
  "ex_5.mp4",
].map(name => baseURL + name);
