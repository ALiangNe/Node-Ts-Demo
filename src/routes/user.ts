import express from 'express';
import { Sequelize } from 'sequelize';
import UserModel from '../models/User';

export default function (sequelize: Sequelize) {
    const router = express.Router();
    const User = UserModel(sequelize);

    // 注册用户
    router.post('/register', async (req, res) => {
        try {
            const { username, password, email } = req.body;

            // 检查用户是否已存在
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({ message: '用户名已存在' });
            }

            // 创建用户
            const user = await User.create({ username, password, email });

            res.status(201).json({
                message: '用户注册成功',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('注册失败:', error);
            res.status(500).json({ message: '注册失败', error });
        }
    });

    // 登录
    router.post('/login', async (req, res) => {
        try {
            const { username, password } = req.body;

            // 查找用户
            const user = await User.findOne({ where: { username } });
            if (!user) {
                return res.status(404).json({ message: '用户不存在' });
            }

            // 简单密码验证（实际项目中应使用加密比较）
            if (user.password !== password) {
                return res.status(401).json({ message: '密码错误' });
            }

            res.json({
                message: '登录成功',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('登录失败:', error);
            res.status(500).json({ message: '登录失败', error });
        }
    });

    // 在routes/user.js中添加
    router.get('/users', async (req, res) => {
        try {
            const users = await User.findAll();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: '查询失败', error });
        }
    });

    return router;
}