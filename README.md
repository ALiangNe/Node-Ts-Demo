# Node.js + TypeScript API 项目

一个使用Node.js、Express和TypeScript构建的RESTful API示例，实现用户注册登录功能，并使用Sequelize ORM连接SQLite数据库。

## 目录

- [安装和初始化](#安装和初始化)
- [项目结构](#项目结构)
- [TypeScript配置](#typescript配置)
- [依赖包说明](#依赖包说明)
- [创建Express应用](#创建express应用)
- [数据库模型](#数据库模型)
- [API路由](#api路由)
- [运行指令](#运行指令)
- [API测试](#api测试)
- [查看数据库数据](#查看数据库数据)

## 安装和初始化

```bash
# 创建项目目录
mkdir node-api-demo
cd node-api-demo

# 初始化npm项目
npm init -y

# 安装核心依赖
npm install express sequelize sqlite3

# 安装TypeScript相关依赖
npm install -D typescript @types/express @types/node ts-node-dev

# 初始化TypeScript配置
npx tsc --init
```

## 项目结构

手动创建以下项目结构:

```
node-api-demo/
│
├── src/                      # 源代码目录
│   ├── controllers/          # 控制器目录
│   │   └── userController.ts # 用户控制器
│   │
│   ├── models/               # 数据库模型目录
│   │   └── User.ts           # 用户模型
│   │
│   ├── routes/               # 路由目录
│   │   └── user.ts           # 用户路由
│   │
│   └── index.ts              # 应用入口文件
│
├── dist/                     # 编译后的JavaScript代码
├── node_modules/             # 依赖包目录
├── .gitignore                # Git忽略文件
├── database.sqlite           # SQLite数据库文件
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript配置
└── README.md                 # 项目说明
```

创建目录命令:

```bash
mkdir -p src/controllers src/models src/routes
```

## TypeScript配置

编辑`tsconfig.json`文件:

```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## 依赖包说明

**核心依赖**:
- `express`: Web应用框架
- `sequelize`: ORM数据库工具
- `sqlite3`: SQLite数据库驱动

**开发依赖**:
- `typescript`: TypeScript语言支持
- `@types/express`: Express的类型定义
- `@types/node`: Node.js的类型定义
- `ts-node-dev`: 开发时自动重启服务器

## 创建Express应用

### 1. 入口文件 (src/index.ts)

```typescript
import express from 'express';
import { Sequelize } from 'sequelize';
import userRoutes from './routes/user';

// 创建Express应用
const app = express();
app.use(express.json());

// 配置Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: 'API正常工作' });
});

// 使用用户路由
app.use('/api', userRoutes);

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    await sequelize.sync({ force: false });
    console.log(`服务器运行在端口 ${PORT}`);
  } catch (error) {
    console.error('无法启动服务器:', error);
  }
});

export { sequelize };
```

## 数据库模型

### 用户模型 (src/models/User.ts)

```typescript
import { Model, DataTypes, Sequelize } from 'sequelize';

interface UserAttributes {
  id: number;
  username: string;
  password: string;
  email?: string;
}

export default function(sequelize: Sequelize) {
  class User extends Model<UserAttributes> implements UserAttributes {
    public id!: number;
    public username!: string;
    public password!: string;
    public email!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users'
  });

  return User;
}
```

## API路由

### 用户路由 (src/routes/user.ts)

```typescript
import express from 'express';
import { sequelize } from '../index';
import UserModel from '../models/User';

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
        id: user.get('id'),
        username: user.get('username'),
        email: user.get('email')
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ message: '注册失败', error });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 简单密码验证
    if (user.get('password') !== password) {
      return res.status(401).json({ message: '密码错误' });
    }
    
    res.json({
      message: '登录成功',
      user: {
        id: user.get('id'),
        username: user.get('username'),
        email: user.get('email')
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ message: '登录失败', error });
  }
});

// 获取所有用户
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'createdAt']  // 排除密码
    });
    res.json(users);
  } catch (error) {
    console.error('获取用户失败:', error);
    res.status(500).json({ message: '获取用户失败', error });
  }
});

export default router;
```

## 运行指令

在`package.json`中添加脚本:

```json
"scripts": {
  "start": "node dist/index.js",
  "build": "tsc",
  "dev": "ts-node-dev --respawn src/index.ts"
}
```

运行命令:

```bash
# 开发模式运行（自动重启）
npm run dev

# 构建生产版本
npm run build

# 运行生产版本
npm start
```

## API测试

使用Postman或curl测试API:

### 1. 注册用户
```
POST http://localhost:3000/api/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com"
}
```

### 2. 用户登录
```
POST http://localhost:3000/api/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

### 3. 查询用户列表
```
GET http://localhost:3000/api/users
```

## 查看数据库数据

### 方法1: 通过API
访问 http://localhost:3000/api/users

### 方法2: 使用DB Browser for SQLite
1. 下载安装 [DB Browser for SQLite](https://sqlitebrowser.org/dl/)
2. 打开软件，选择"打开数据库"
3. 浏览到项目目录，选择`database.sqlite`文件
4. 在"浏览数据"标签页查看表内容

### 方法3: 使用SQLite命令行
```bash
# 安装sqlite3命令行工具
npm install -g sqlite3

# 打开数据库
sqlite3 database.sqlite

# 查看所有表
.tables

# 查询用户数据
SELECT * FROM users;

# 退出
.exit
```