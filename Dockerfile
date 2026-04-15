FROM node:20-alpine

WORKDIR /app

# 更新 apk 索引并安装 Python 用于 better-sqlite3 编译
RUN apk update && apk add --no-cache python3 make g++

# 复制所有源代码
COPY . .

# 安装依赖并构建
RUN cd client && npm install && npm run build && cd ..
RUN cd server && npm install

# 暴露端口
EXPOSE 5567

# 创建数据目录并挂载卷
VOLUME ["/app/server"]

# 启动后端 (会服务前端静态文件)
CMD ["sh", "-c", "cd server && node index.js"]
