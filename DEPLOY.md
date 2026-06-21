# 部署到云平台

## Render

1. 新建一个 GitHub 仓库，把本目录里的文件上传进去。
2. 打开 Render，选择 New Web Service。
3. 连接该 GitHub 仓库。
4. Build Command 填：

```bash
pip install -r requirements.txt
```

5. Start Command 填：

```bash
uvicorn app:app --host 0.0.0.0 --port $PORT
```

6. 部署完成后，Render 会给出一个 `https://...onrender.com` 网址。

## Railway

1. 新建 Project，选择 Deploy from GitHub repo。
2. 连接本项目仓库。
3. Railway 会自动识别 Python 项目；如果需要手动设置启动命令，填：

```bash
uvicorn app:app --host 0.0.0.0 --port $PORT
```

4. 在 Settings/Networking 里生成公开域名。

## 本地运行

```bash
python3 -m pip install -r requirements.txt
python3 -m uvicorn app:app --host 127.0.0.1 --port 8756
```

然后打开：

```text
http://127.0.0.1:8756/
```
