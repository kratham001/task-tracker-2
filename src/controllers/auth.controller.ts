import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Missing fields" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, passwordHash: hashedPassword }
        });
        res.status(201).json({ id: user.id, email: user.email });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return res.status(401).json({ error: "Invalid credentials" });
        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
        await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
        res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

export const refresh = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(401).json({ error: "No token" });
        const decoded: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user || user.refreshToken !== token) return res.status(401).json({ error: "Invalid token" });
        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
        res.status(200).json({ accessToken });
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { id } = req.body.user;
        await prisma.user.update({ where: { id }, data: { refreshToken: null } });
        res.status(200).json({ message: "Logged out" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};