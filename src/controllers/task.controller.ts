import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response) => {
    try {
        const userId = req.body.user.id;
        const { page = '1', limit = '10', status, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const whereClause: any = { userId };

        if (status) whereClause.status = String(status);
        if (search) whereClause.title = { contains: String(search), mode: 'insensitive' };

        const tasks = await prisma.task.findMany({
            where: whereClause,
            skip,
            take: Number(limit)
        });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

export const createTask = async (req: Request, res: Response) => {
    try {
        const userId = req.body.user.id;
        const { title } = req.body;
        if (!title) return res.status(400).json({ error: "Title required" });
        const task = await prisma.task.create({
            data: { title, userId }
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

export const getTaskById = async (req: Request, res: Response) => {
    try {
        const userId = req.body.user.id;
        const taskId = Number(req.params.id);
        const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
        if (!task) return res.status(404).json({ error: "Not found" });
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    try {
        const userId = req.body.user.id;
        const taskId = Number(req.params.id);
        const { title, status } = req.body;
        const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
        if (!task) return res.status(404).json({ error: "Not found" });
        const updated = await prisma.task.update({
            where: { id: taskId },
            data: { title, status }
        });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const userId = req.body.user.id;
        const taskId = Number(req.params.id);
        const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
        if (!task) return res.status(404).json({ error: "Not found" });
        await prisma.task.delete({ where: { id: taskId } });
        res.status(200).json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

export const toggleTaskStatus = async (req: Request, res: Response) => {
    try {
        const userId = req.body.user.id;
        const taskId = Number(req.params.id);
        const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
        if (!task) return res.status(404).json({ error: "Not found" });
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        const updated = await prisma.task.update({
            where: { id: taskId },
            data: { status: newStatus }
        });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};