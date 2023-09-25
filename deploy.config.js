module.exports = {
  apps: [
    {
      name: "JCWD-2404-01", // Format JCWD-{batchcode}-{groupnumber}
      script: "./projects/server/src/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 3401,
      },
      time: true,
    },
  ],
};
