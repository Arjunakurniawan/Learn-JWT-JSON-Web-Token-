import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;

const app = express();
app.use(express.json());

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
app.post("/login", async (req: express.Request, res: express.Response) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password,
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const payload = { id: user.id, username: user.username, role: user.role };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  res.json({
    message: "login successful",
    token: token,
  });
});

// ==========================================
// 3. MIDDELWARE AUTHENTICATION (Pabrik Cek JWT)
// ==========================================
const authenticateToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  jwt.verify(token, JWT_SECRET, (err: jwt.VerifyErrors | null, decodedUser) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    (req as any).user = decodedUser;
    next();
  });
};

// ==========================================
// 4. ENDPOINT TEST
// ==========================================
app.get(
  "/profile",
  authenticateToken,
  (req: express.Request, res: express.Response) => {
    const user = (req as any).user;
    res.json({ message: "Welcome To Secret Area", Data: user });
  },
);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});