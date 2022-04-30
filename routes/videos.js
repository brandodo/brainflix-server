const express = require("express");
const multer = require("multer");

const fs = require("fs");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const VIDEO_DATA = "./data/videos.json";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// GET videos
router.get("/", (_, res) => {
  fs.readFile(VIDEO_DATA, "utf-8", (err, data) => {
    if (err) throw err;

    const currentData = JSON.parse(data);
    const videos = currentData.map((video) => {
      return {
        id: video.id,
        title: video.title,
        channel: video.channel,
        image: video.image,
      };
    });

    res.status(200).json(videos);
  });
});

// POST uploaded video
router.post("/", upload.single("file"), (req, res) => {
  const { title, description } = req.body;
  const { originalname } = req.file;

  const videoJSON = {
    title: title,
    channel: "The Best Ever Bike Review Channel",
    image: originalname,
    description: description,
    views: "8,420,349",
    likes: "430,345",
    duration: "10:23",
    video: "brainstationSampleVideo.mp4",
    timestamp: 1646551434785,
    comments: [],
    id: uuidv4(),
  };

  fs.readFile(VIDEO_DATA, "utf-8", (err, data) => {
    if (err) throw err;

    let currentData = JSON.parse(data);

    currentData.push(videoJSON);

    fs.writeFile(VIDEO_DATA, JSON.stringify(currentData), (err) => {
      if (err) throw err;

      console.log("Video uploaded successfully!");
      res.status(200).json(videoJSON);
    });
  });
});

// GET main video data
router.get("/:id", (req, res) => {
  fs.readFile(VIDEO_DATA, "utf-8", (err, data) => {
    if (err) throw err;
    const parsedData = JSON.parse(data);
    const videoIndex = parsedData.findIndex(
      (video) => video.id === req.params.id
    );

    if (videoIndex === -1) {
      res.status(404).send("Video not found!");
    }

    res.json(parsedData[videoIndex]);
  });
});

// POST comments
router.post("/:id/comments", (req, res) => {
  if (!req.body.name || !req.body.comment) {
    res
      .status(400)
      .send("Bad request, please provide both a name and comment!");
  } else {
    fs.readFile(VIDEO_DATA, "utf-8", (err, data) => {
      if (err) throw err;

      let currentData = JSON.parse(data);

      const videoIndex = currentData.findIndex(
        (video) => video.id === req.params.id
      );

      if (videoIndex === -1) {
        res.status(404).send("Cannot post comment, video not found!");
      } else {
        const newComment = {
          name: req.body.name,
          comment: req.body.comment,
          likes: 0,
          timestamp: Date.now(),
          id: uuidv4(),
        };

        currentData[videoIndex].comments.push(newComment);

        fs.writeFile(VIDEO_DATA, JSON.stringify(currentData), (err) => {
          if (err) throw err;

          console.log("Successfully written file!");
          res.status(200).json(newComment);
        });
      }
    });
  }
});

// DELETE comments
router.delete("/:videoId/comments/:commentId", (req, res) => {
  fs.readFile(VIDEO_DATA, "utf-8", (err, data) => {
    if (err) throw err;

    const currentData = JSON.parse(data);
    const videoIndex = currentData.findIndex(
      (video) => video.id === req.params.videoId
    );

    const commentIndex = currentData[videoIndex].comments.findIndex(
      (comment) => {
        comment.id === req.params.commentId;
      }
    );

    const removedComment = currentData[videoIndex].comments.splice(
      commentIndex,
      1
    );

    fs.writeFile(VIDEO_DATA, JSON.stringify(currentData), (err) => {
      if (err) throw err;

      console.log("Comment deleted!");
      res.status(200).json(removedComment);
    });
  });
});

// PUT likes on video
router.put("/:videoId", (req, res) => {
  fs.readFile(VIDEO_DATA, "utf-8", (err, data) => {
    if (err) throw err;

    const currentData = JSON.parse(data);
    const videoIndex = currentData.findIndex(
      (video) => video.id === req.params.videoId
    );

    currentData[videoIndex].likes++;

    fs.writeFile(VIDEO_DATA, JSON.stringify(currentData), (err) => {
      if (err) throw err;

      res.status(200).json(currentData[videoIndex]);
    });
  });
});

module.exports = router;
