import express from "express"
import pick from "lodash/pick.js"
import { body, validationResult } from "express-validator"
import requiresAuth from "../middleware/requiresAuth.js";

const authorRouter = express.Router();

// authorRouter.get("/authors/test", (request, response) => {
//     response.send({message: "ok"})
// })

// ============== GET /authors ==============:
authorRouter.get("/authors", async (request, response) => {
    const authors = await request.app.locals.prisma.author.findMany()
    response.send({ authors: authors, message: authors? "ok":"Author not found" })
})

// ============== GET /authors/:authorId ==============:
// added requiresauth to protect the route from mga di logged in
authorRouter.get("/authors/:authorId", requiresAuth, async (request, response) => {
    const authorId = request.params.authorId
    const authors = await request.app.locals.prisma.author.findUnique({
        where: {
            id: Number.parseInt(authorId),
        },
    })
    response.send({ author: authors, message: authors? "ok":"Author not found" })
})

// ============== GET /authors/:authorId/books ==============:
authorRouter.get("/authors/:authorId/books", async (request, response) => {
    const authorId = request.params.authorId
    const authors = await request.app.locals.prisma.author.findUnique({
        where: {
            id: Number.parseInt(authorId),
        },
        include: {
            books: true,
          },
    })
    response.send({ books: authors.books, message: authors.books? "ok":"Author does not have any books" })
})

// ============ PUT /authors/:authorId ============:
authorRouter.put("/authors/:authorId", async (request, response) => {
    const authorId = request.params.authorId
    // response.send({data:request.body.title, message:"ok"})

    const filteredBody = pick(request.body, [
        "firstName",
        "lastName"
    ])

    const updatedAuthor = await request.app.locals.prisma.author.update({
        where: {
            id: Number.parseInt(authorId),
          },
        data: filteredBody,
      })
    response.send({ data: updatedAuthor, message: "Field update successful" })
})

// ============== POST /authors ==============:
authorRouter.post(
    "/authors", 
    //validation help from express-validators (inside an array)
    [
        body('firstName')
            .notEmpty()
            .isLength({min: 3}) // title length restriction
            .withMessage("Book requires a `firstName` and should be more than 5 characters long"),
        body('lastName')
            .notEmpty()
            .isLength({min: 2}) // title length restriction
            .withMessage("Book requires a `lastNumber` and should be more than 5 characters long")
    ], 
    async (request, response) => {

        const errors = validationResult(request);
        // if may laman si error, we send a reponse containing all the errors
        if (!errors.isEmpty()) {
            response.status(400).json({ errors: errors.array() })
            return;
        }

        const filteredBody = pick(request.body, [
            "firstName",
            "lastName"
        ])

        // response.send({ data: filteredBody, message: "ok"})
        const author = await request.app.locals.prisma.author.create({
        data: filteredBody,
        })
        // response.send({ data: filteredBody, message: "book added successfully" })
        response.send({ author: author, message: "Author added successfully" })
})

// ============== DELETE /authors/:authorId ==============:
// authorRouter.delete("/authors/:authorId", async (request, response) => {
//     try {
//         const deletedAuthor = await request.app.locals.prisma.author.delete({
//             where: {
//                 id: Number.parseInt(authorId),
//             },
//         });
//         response.send({ data: deletedAuthor, message: deletedAuthor? "ok":"Author not found" })
//     } catch {
//         response.send({ data: null, message: "Author not found" })
//     }
// })

export default authorRouter;