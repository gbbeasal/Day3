import express, { response } from "express"
import pick from "lodash/pick.js"
import bcrypt from "bcrypt"
import omit from "lodash/omit.js"
import { body, validationResult } from "express-validator"

const SALT_ROUNDS = 10

const authRouter = express.Router()

// GET /me
authRouter.get("/me", (request, response) => {
    response.send({ data:null, message: "ok"})
})


// POST /sign-up
// takes in the body sa postman, filters out malicious fields to ckean ur data,
// hashes ur pw before creating a user sa db mo
// returns the user you created
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
authRouter.post(
    "/sign-in",
[
    body('password')
        .notEmpty()
        .isLength({min: 5}) // title length restriction
        .withMessage("Sign in requires a valiid pw"),
    body('email')
        .notEmpty()
        .isEmail()
        .withMessage("sign in reqs a valid email"),
], 
async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(400).json({ errors: errors.array() });
      return;
    }
    
    const filteredBody = pick(request.body, ["email", "password"]);
    const user = await request.app.locals.prisma.user.findUnique({
        where: { email: filteredBody.email}
    })

    if (!user) {
        response.status(404).json({ data:null, message: "error user not found"})
        return
    }
    // compare pw si bcrypt na dun
    const isComparePassword = await bcrypt.compare(
        filteredBody.password,
        user.password
    )

    if (!isComparePassword) {
        response.status(401).json({ data:null, message: "wrong pw"})
    }
    // response.send({ data:user, message: "ok"})
    // para result mo wala yung password
    const filteredUser = omit(user, ["id", "password"])
    response.send({ data:filteredUser, message: "ok"})
})

// POST /sign-out
authRouter.post("/sign-out", (request, response) => {
    response.send({ data:null, message: "ok"})
})






export default authRouter;