# 全家一周食谱智能生成器

## 这是什么
一个面向家庭的智能膳食规划工具，输入成员信息后自动生成一周三餐食谱。

## 怎么跑起来（3 步）
1. 确保电脑有 Python 3.9+
2. 安装依赖：`pip install fastapi uvicorn`
3. 启动：`python3 app.py`

然后浏览器打开 `http://localhost:8756` 就能用了。

## 文件结构
```
meal-planner/
├── app.py              # 后端（FastAPI，营养计算引擎，菜谱数据库）
├── static/
│   ├── index.html      # 前端页面
│   ├── style.css       # 样式
│   └── app.js          # 前端交互逻辑
└── meal-planner.tar.gz # 完整打包
```

## 去其他 AI 平台怎么用
把上面 4 个文件的内容复制给对方 AI，说：
"帮我继续开发这个全家食谱生成器，这是现有代码，请阅读后按我的需求修改。"

就这么简单，不依赖任何特定平台。
