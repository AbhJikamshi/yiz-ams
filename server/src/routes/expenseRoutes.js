import express from "express";

import {
  create,
  getAll,
  getById,
  update,
  remove,
} from "../controllers/expenseController.js";

import protect from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorize.js";
import validateExpense from "../middlewares/expenseValidation.js";

const router = express.Router();

// ===============================
// Authentication
// ===============================
router.use(protect);
router.use(authorize("ADMIN"));

// ===============================
// Expense Routes
// ===============================
router.post("/", validateExpense, create);

router.get("/", getAll);

router.get("/:id", getById);

router.put("/:id", validateExpense, update);

router.delete("/:id", remove);

export default router;