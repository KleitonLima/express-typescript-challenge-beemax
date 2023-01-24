import express, { Router, Request, Response } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { knex } from "./knexfile";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "./types";
import kioskRouter from "./routers/kiosk.routers";

const app = express();
const router = Router();
const auth = { SECRET: String(process.env.SECRET) };

dotenv.config();

app.use(express.json());
app.use(router);
app.use(cors());

app.use("/kiosks", kioskRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Hello World!</h1>");
});

app.post("/login", (req: Request, res: Response) => {
  knex("users")
    .where({ email: req.body.email })
    .first()
    .then((user: User) => {
      if (!user) {
        res.status(401).json({
          error: "Email não cadastrado",
        });
      } else {
        return bcrypt
          .compare(req.body.password, user.password)
          .then((isAuthenticated) => {
            if (!isAuthenticated) {
              res.status(401).json({
                error: "Unauthorized Access!",
              });
            } else {
              return jwt.sign(user, auth.SECRET, (_error, token) => {
                res.status(200).json({ token, user });
              });
            }
          });
      }
    });
});

export default app;
