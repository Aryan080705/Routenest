const http = require("http");

const createPost = (title, body, topic, authorName, authorId) => {
  return new Promise((resolve) => {
    // We need to bypass JWT since we just want to create a post.
    // Wait, the API requires a valid token.
    // Let's create an auth token first by logging in as Aarav or someone.
  });
};
