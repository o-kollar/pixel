import express from "express";
import { createUser, checkAuth, loginUser } from "./services/userService.js";
import { generateImage,getUserGeneratedImages } from "./services/imageService.js";
import cookieParser from 'cookie-parser';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static("app"));
app.use('/auth', express.static("auth"));

app.get('/check-auth', async (req, res) => {
  console.log("check-auth called");
  const token = req.cookies.pb_auth;
  if (!token) {
    return res.redirect('/auth');
  }
  const result = await checkAuth(token);
  if (result.authenticated) {
    res.json({ authenticated: true });
  } else {
    res.redirect('/auth');
  }
});

app.post("/login", async (req, res) => {
  console.log("Login request received");
  try {
    const authData = await loginUser(req.body);
    const rememberMe = req.body.rememberMe || false;
    res.cookie("pb_auth", authData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: process.env.NODE_ENV === "production" ? ".yourdomain.com" : "localhost",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined,
    });
    res.json({ success: true, redirectUrl: "/" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const user = await createUser(req.body);
    const loginData = {
      email: req.body.email,
      password: req.body.password
    };
    const authData = await loginUser(loginData);
    const rememberMe = req.body.rememberMe || false;
    res.cookie("pb_auth", authData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: process.env.NODE_ENV === "production" ? ".yourdomain.com" : "localhost",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined,
    });
    res.json({ success: true, redirectUrl: "/" });
  } catch (error) {
    console.error("Error in /signup:", error);
    if (error.status === 400) {
      if (error.data?.data?.email?.code === "validation_not_unique") {
        res.status(409).json({ error: "Email already exists" });
      } else {
        res.status(400).json({ error: "Validation error", details: error.data?.data });
      }
    } else {
      res.status(500).json({ error: "Failed to create user" });
    }
  }
});

app.post("/generate", async (req, res) => {
  const token = req.cookies.pb_auth;
  if (!token) {
    return res.status(403).json({ error: "Failed to Generate, missing authentication" });
  }
  const result = await checkAuth(token);
  if (result.authenticated) {
    req.user = result.user;
    try {
      await generateImage(req, res);
    } catch (error) {
      console.error("Error in /generate:", error);
      res.status(500).json({ error: "Failed to generate image" });
    }
  } else {
    res.status(403).json({ error: "Failed to Authenticate" });
  }
});

app.get("/user-images", async (req, res) => {
  const token = req.cookies.pb_auth;
  if (!token) {
    return res.status(403).json({ error: "Authentication required" });
  }
  
  const result = await checkAuth(token);
  if (result.authenticated) {
    req.user = result.user;
    try {
      await getUserGeneratedImages(req, res);
    } catch (error) {
      console.error("Error in /user-images:", error);
      res.status(500).json({ error: "Failed to retrieve images" });
    }
  } else {
    res.status(403).json({ error: "Authentication failed" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


