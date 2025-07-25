import express from 'express';
import { Sequelize } from 'sequelize';
import createUserRoutes from './routes/user';

// 创建Express应用
const app = express();
app.use(express.json());

// 配置Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

// 导入路由
const userRoutes = createUserRoutes(sequelize);
app.use('/api', userRoutes);

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    await sequelize.sync({ force: true });
    console.log(`服务器运行在端口 ${PORT}`);
  } catch (error) {
    console.error('无法启动服务器:', error);
  }
});