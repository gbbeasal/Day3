import express, { response } from "express"
import pick from "lodash/pick.js"
import bcrypt from "bcrypt"

const SALT_ROUNDS = 10

const authRouter = express.Router()

// GET /me
authRouter.get("/me", (request, response) => {
    response.send({ data:null, message: "ok"})
})


// POST /sign-up
authRouter.post("/sign-up", async (request, response) => {
    const filteredBody = pick(request.body, [
        "firstName",
        "lastName",
        "email",
        "password",
    ])

    const hashedPassword = await bcrypt.hash(filteredBody.password, SALT_ROUNDS)
    filteredBody.password = hashedPassword;
    
    const user = await request.app.locals.prisma.user.create({
        data: filteredBody,
    })

    response.send({ data:filteredBody, message: "ok"})
})

// POST /sign-in
authRouter.post("/sign-in", (request, response) => {
    response.send({ data:null, message: "ok"})
})

// POST /sign-out
authRouter.post("/sign-out", (request, response) => {
    response.send({ data:null, message: "ok"})
})






export default authRouter;