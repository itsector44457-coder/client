const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");

// 1. GET: Saare posts frontend par bhejne ke liye (Naye posts sabse upar)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. POST: Naya doubt ya post save karne ke liye
router.post("/add", async (req, res) => {
  const { author, authorId, content, field, imageUrl } = req.body;

  if (!authorId) {
    return res.status(400).json({ message: "authorId is required" });
  }

  const post = new Post({
    author: author || "Krishna", // Default aapka nickname
    authorId,
    content,
    field,
    imageUrl: imageUrl || "",
  });

  try {
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. PUT: Like toggle (like/unlike)
router.put("/like/:id", async (req, res) => {
  try {
    const userId = req.body.userId || req.body.currentUserId;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post nahi mila" });
    }

    // Legacy docs may still have numeric likes; normalize once.
    if (!Array.isArray(post.likes)) {
      post.likes = [];
    }

    const alreadyLiked = post.likes.some(
      (id) => String(id) === String(userId),
    );

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      message: alreadyLiked ? "Unliked" : "Liked",
      likes: post.likes,
    });
  } catch (err) {
    res.status(500).json({ message: "Like logic fail ho gaya" });
  }
});

// 4. POST: Comment add karna
router.post("/:id/comment", async (req, res) => {
  try {
    const userId = req.body.userId || req.body.currentUserId;
    const { userName, text } = req.body;
    if (!userId || !text?.trim()) {
      return res.status(400).json({ message: "userId aur text required hai" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post nahi mila" });
    }

    if (!Array.isArray(post.comments)) {
      post.comments = [];
    }

    let finalUserName = userName;
    if (!finalUserName) {
      const user = await User.findById(userId).select("name");
      if (!user) {
        return res.status(404).json({ message: "User nahi mila" });
      }
      finalUserName = user.name;
    }

    post.comments.push({
      userId,
      userName: finalUserName,
      text: text.trim(),
    });

    await post.save();
    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ message: "Comment add nahi hua" });
  }
});

// 5. PUT: Post save karna user profile mein
router.put("/save/:postId", async (req, res) => {
  try {
    const { currentUserId } = req.body;
    if (!currentUserId) {
      return res.status(400).json({ message: "currentUserId is required" });
    }

    const [post, user] = await Promise.all([
      Post.findById(req.params.postId),
      User.findById(currentUserId),
    ]);

    if (!post) {
      return res.status(404).json({ message: "Post nahi mila" });
    }
    if (!user) {
      return res.status(404).json({ message: "User nahi mila" });
    }

    const alreadySaved = (user.savedPosts || []).some(
      (id) => String(id) === String(req.params.postId),
    );

    if (!alreadySaved) {
      user.savedPosts.push(req.params.postId);
      await user.save();
    }

    res.json({
      message: alreadySaved ? "Post pehle se saved hai" : "Post saved",
      savedPosts: user.savedPosts,
    });
  } catch (err) {
    res.status(500).json({ message: "Post save nahi hui", error: err.message });
  }
});

// 6. POST: Repost banana
router.post("/repost/:id", async (req, res) => {
  try {
    const { currentUserId } = req.body;
    if (!currentUserId) {
      return res.status(400).json({ message: "currentUserId is required" });
    }

    const [originalPost, currentUser] = await Promise.all([
      Post.findById(req.params.id),
      User.findById(currentUserId).select("name field"),
    ]);

    if (!originalPost) {
      return res.status(404).json({ message: "Original post nahi mila" });
    }
    if (!currentUser) {
      return res.status(404).json({ message: "User nahi mila" });
    }

    const repost = new Post({
      author: currentUser.name,
      authorId: currentUserId,
      content: originalPost.content,
      field: originalPost.field || currentUser.field,
      imageUrl: originalPost.imageUrl || "",
      isRepost: true,
      originalAuthor: originalPost.originalAuthor || originalPost.author,
    });

    const newRepost = await repost.save();
    res.status(201).json(newRepost);
  } catch (err) {
    res.status(500).json({ message: "Repost nahi ban paya", error: err.message });
  }
});

// 7. GET (via POST body): Sirf followed users ke posts dikhana
router.post("/following", async (req, res) => {
  try {
    // Frontend se following IDs ki list aayegi
    const { followingIds } = req.body;

    // Database mein dhoondho jahan authorId hamari following list mein ho
    const posts = await Post.find({
      authorId: { $in: followingIds },
    }).sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Following feed load nahi hui" });
  }
});

router.get("/user/:authorId", async (req, res) => {
  try {
    const posts = await Post.find({ authorId: req.params.authorId }).sort({
      createdAt: -1,
    });
    res.json(posts);
  } catch (err) {
    console.error("Database Query Error:", err);
    res
      .status(500)
      .json({ message: "Posts dhoondhne mein error", error: err.message });
  }
});

module.exports = router;
