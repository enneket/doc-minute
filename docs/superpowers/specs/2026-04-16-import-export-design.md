# 数据导入导出设计

## 概述

为纪要应用添加 JSON 格式的数据导入导出功能，支持完整数据备份和迁移。

## 功能设计

### 导出

- 位置：Header 右侧导出按钮
- 格式：JSON
- 文件名：`notes-YYYY-MM-DD.json`
- 数据结构：
```json
{
  "exported_at": "2026-04-16",
  "notes": [
    {
      "title": "会议纪要",
      "created_at": "2026-04-16T10:00:00Z",
      "items": [
        { "content": "任务一", "completed": true },
        { "content": "任务二", "completed": false }
      ]
    }
  ]
}
```

### 导入

- 位置：Header 右侧导入按钮
- 格式：JSON
- 去重逻辑：按 `title` + `created_at` 匹配
- 存在则跳过，不存在则创建

## API 设计

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/export | 导出所有数据为 JSON |
| POST | /api/import | 导入 JSON 数据 |

## 前端变更

### Header.jsx
- 导出按钮：点击调用 `/api/export` 并下载文件
- 导入按钮：触发文件选择，读取后 POST 到 `/api/import`

## 后端变更

### routes/export.js (新建)
- `GET /api/export` - 查询所有笔记和条目，组装 JSON 返回
- `POST /api/import` - 解析 JSON，按 title + created_at 去重写入

## 验证标准

1. 导出后下载的 JSON 文件包含所有笔记和条目
2. 导入 JSON 后数据正确写入数据库
3. 重复导入不会产生重复数据
