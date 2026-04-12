import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middleware.ts";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(authMiddleware);

// ==========================================
// 1. DATA USER (Sementara, nanti bisa diganti dengan database)
// ==========================================
const users = [
  { id: 1, username: "CEO", password: "CEO123", role: "admin" },
  { id: 2, username: "karyawan", password: "karyawan123", role: "user" },
];

// ==========================================
// 2. ENDPOINT LOGIN (Pabrik Bikin JWT)
// ==========================================
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password,
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const payload = { id: user.id, username: user.username, role: user.role };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  res.cookie("authCookie", token, {
    httpOnly: true,
    secure: false,
    maxAge: 3600000,
  });

  res.json({
    message: "login successful, check your cookie",
  });
  console.log(`Generated JWT for user ${user.username}: ${token}`);
});

// ==========================================
// 4. ENDPOINT TEST
// ==========================================
app.get("/profile", (req, res) => {
  const userId = req.user.id;
  
  //tidak menampilkan password di response
  const { password, ...loggedInUser } =
    users.find((u) => u.id === userId) ?? {};

  res.json({ message: "welcome to your profile", data: loggedInUser });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
