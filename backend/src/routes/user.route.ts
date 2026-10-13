
import { Router } from "express";

import { addUser, listUsers, editUser, changeUserActive } from "../controllers/user.controller";

import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/", listUsers);
router.post("/", addUser);
router.patch("/:id", editUser);
router.patch("/:id/active", changeUserActive);

export default router;