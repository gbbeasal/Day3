import express, { response } from "express";
import { PrismaClient } from "@prisma/client";
import booksRouter from "./routes/book.js";
import authorRouter from "./routes/author.js";
import genreRouter from "./routes/genre.js";
import authRouter from "./routes/auth.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"

dotenv.config();
// console.log(process.env) to make prisma read other env vars

const app = express();
app.use(express.json()); // need to be able to do POST requests
app.use(cookieParser()); // allows express to read/create cookies

const prisma = new PrismaClient(); // used for us to get data from the db + L2
const PORT = 4000;
app.use(booksRouter);
app.use(authorRouter);
app.use(genreRouter);
app.use(authRouter);

// express allows us to define global variables using app.locals
// yung prisma sa L6 nagrerefer sa L12; now we can reuse
app.locals.prisma = prisma;

app.get("/", (request, response) => {
//   console.log("testing");
  response.send({ message: "hi" })
});

app.listen(PORT, () => console.log(`Listening on Port ${PORT}`));