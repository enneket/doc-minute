FROM node:20-alpine

WORKDIR /app

# 安装依赖（放在 COPY 之前，利用 Docker 缓存）
RUN apk update && apk add --no-cache python3 make g++

# 复制 package 文件
COPY server/package*.json ./
COPY client/package*.json ./

# 安装服务端依赖
RUN cd server && npm install

# 复制源代码
COPY --chown=node:node . .

# 安装前端依赖并构建
RUN cd client && npm install && npm run build

# 创建数据目录
RUN mkdir -p /app/db

# 切换到非 root 用户
USER node

# 暴露端口
EXPOSE 5567

# 启动服务
CMD ["sh", "-c", "cd server && node index.js"]
