import express from 'express';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;