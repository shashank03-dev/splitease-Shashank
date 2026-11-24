import { Router } from 'express'
import {
  createPerson,
  deletePerson,
  listPeople,
} from '../controllers/person.controller.js'

const router = Router()

router.get('/', listPeople)
router.post('/', createPerson)
router.delete('/:id', deletePerson)

export default router
