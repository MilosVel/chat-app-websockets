import { Router, Request, Response } from "express";

// import { User } from "#models/User.js";
import { User } from "#models/Users.js";

const router: Router = Router();

// Creating user
router.post("/", async (req: Request, res: Response) => {
    try {
        const { name, email, password, picture } = req.body as {
            name: string;
            email: string;
            password: string;
            picture: string;
        };

        const user = await User.create({ name, email, password, picture });
        res.status(201).json(user);
    } catch (e) {
        const err = e as { code?: number; message?: string };
        const msg = err.code === 11000 ? "User already exists" : err.message;
        console.error(e);
        res.status(400).json(msg);
    }
});

// Login user
router.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body as {
            email: string;
            password: string;
        };

        const user = await User.findByCredentials(email, password);
        user.status = "online";
        await user.save();
        res.status(200).json(user);
    } catch (e) {
        const err = e as { message: string };
        res.status(400).json(err.message);
    }
});

export default router;