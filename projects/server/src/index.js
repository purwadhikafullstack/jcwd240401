require("dotenv/config");
const express = require("express");
const cors = require("cors");
const { join } = require("path");
const router = require("./routes");

const PORT = process.env.PORT || 8000;
const app = express();
app.use(
  cors()
  //   {
  //   origin: [
  //     process.env.WHITELISTED_DOMAIN &&
  //       process.env.WHITELISTED_DOMAIN.split(","),
  //   ],
  // }
);

app.use(express.json());

//#region API ROUTES

// multer
app.use("/src/Public/product", express.static("src/Public/product"));
app.use("/src/Public/profile", express.static("src/Public/profile"));
app.use("/src/Public/refund", express.static("src/Public/refund"));
app.use("/src/Public/category", express.static("src/Public/category"));
app.use("/src/Public/payment", express.static("src/Public/payment"));

// ===========================
// NOTE : Add your routes here

app.get("/api", (req, res) => {
  res.send(`Hello, this is my API`);
});

app.get("/api/greetings", (req, res, next) => {
  res.status(200).json({
    message: "Hello, Student !",
  });
});

app.use("/api/auth", router.auth);
app.use("/api/admins", router.admin);
app.use("/api/users", router.user);

// ===========================

// not found
app.use((req, res, next) => {
  if (req.path.includes("/api/")) {
    res.status(404).send("Not found !");
  } else {
    next();
  }
});

// error
app.use((err, req, res, next) => {
  if (req.path.includes("/api/")) {
    console.error("Error : ", err.stack);
    res.status(500).send("Error !");
  } else {
    next();
  }
});

//#endregion

//#region CLIENT
const clientPath = "../../client/build";
app.use(express.static(join(__dirname, clientPath)));

// Serve the HTML page
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, clientPath, "index.html"));
});

//#endregion

app.listen(PORT, (err) => {
  if (err) {
    console.log(`ERROR: ${err}`);
  } else {
    console.log(`APP RUNNING at ${PORT} ✅`);
  }
});
