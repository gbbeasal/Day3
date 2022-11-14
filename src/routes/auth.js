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
    // uses express validators to verify request's response
    // if no error sa response, tuloy lang if meron show it
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(400).json({ errors: errors.array() });
      return;
    }
    
    // pick lets u pick out fields you want lang from the request body to use in ur code
    // or to "hawak" muna
    const filteredBody = pick(request.body, ["email", "password"]);

    //checks if user nanag sign in is existing or nah
    const user = await request.app.locals.prisma.user.findUnique({
        where: { email: filteredBody.email}
    })

    //if user does not exisit
    if (!user) {
        response.status(404).json({ data:null, message: "error user not found"})
        return
    }
    // compare pw si bcrypt na dun
    // for is user exists, need to check if pw nya is tama by comparing the pw they put
    // in vs sa naka save sa db na hashed kanina
    // checks if pw ni filteredbody (yung pinang sign up) == pw ni user (yung pinang sign in)
    const isComparePassword = await bcrypt.compare(
        filteredBody.password,
        user.password
    )
    
    // say this if di same pw
    if (!isComparePassword) {
        response.status(401).json({ data:null, message: "wrong pw"})
    }
    // response.send({ data:user, message: "ok"})
    // para result mo wala yung password use omit to omit showing the id and pw ng user
    const filteredUser = omit(user, ["id", "password"])
    response.send({ data:filteredUser, message: "ok"})
})

// POST /sign-out
authRouter.post("/sign-out", (request, response) => {
    response.send({ data:null, message: "ok"})
})






export default authRouter;