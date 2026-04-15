FROM node:20-alpine

WORKDIR /app

# 复制所有源代码
COPY . .

# 安装依赖并构建
RUN cd client && npm install && npm run build && cd ..
RUN cd server && npm install

# 暴露端口
EXPOSE 5567

# 启动后端 (会服务前端静态文件)
CMD ["sh", "-c", "cd server && node index.js"]
