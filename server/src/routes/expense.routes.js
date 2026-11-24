import { Router } from 'express'
import {
  createExpense,
  deleteExpense,
  listExpenses,
  updateExpense,
} from '../controllers/expense.controller.js'

const router = Router()

router.get('/', listExpenses)
router.post('/', createExpense)
router.put('/:id', updateExpense)
router.delete('/:id', deleteExpense)

export default router
