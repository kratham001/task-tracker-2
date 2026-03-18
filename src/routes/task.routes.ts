import { Router } from 'express';
import { 
    getTasks, 
    createTask, 
    getTaskById, 
    updateTask, 
    deleteTask, 
    toggleTaskStatus 
} from '../controllers/task.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateUser);

router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTaskStatus);

export default router;