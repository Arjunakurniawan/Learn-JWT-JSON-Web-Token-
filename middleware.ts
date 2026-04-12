import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const isPrivateAPI = privateApis.some(
    ({ path, method }) => path === req.path && method === req.method,
  );
  if (!isPrivateAPI) {
    next();
  }

  const token = req.cookies.authCookie;

  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  jwt.verify(
    token,
    JWT_SECRET,
    (err: jwt.VerifyErrors | null,) => {
      if (err) {
        console.error("Token verification failed:", err);
        return res.status(403).json({ message: "Invalid token" });
      }

       const decodedUser = jwt.decode(token) as {
         id: number;
         username: string;
         role: string;
       };

       req.user = decodedUser
      next();
    },
  );
};

const privateApis = [{ path: "/profile", method: "GET" }];
