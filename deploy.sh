#!/bin/bash
# Hexo 一键更新 + GitHub Pages 部署脚本（改进版）
# 使用方法：在博客根目录运行 ./deploy.sh

# 1️⃣ 提交源文件（文章、配置、主题）
echo "提交源文件..."
read -p "输入本次提交信息: " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
  COMMIT_MSG="更新文章/配置"
fi

git add .
git commit -m "$COMMIT_MSG" 2>/dev/null || echo "没有需要提交的源文件"
git push origin main

# 2️⃣ 生成静态文件
echo "生成静态文件..."
hexo clean
hexo g

# 3️⃣ 使用临时分支处理 gh-pages 更新
echo "更新 gh-pages 分支..."
git fetch origin gh-pages
git checkout -B temp-gh-pages origin/gh-pages

# 覆盖临时分支的 public/ 文件
git checkout main -- public

# 提交更新
git add public
git commit -m "更新网站静态文件" 2>/dev/null || echo "public/ 没有变化"

# 强制推送到 gh-pages
git push origin temp-gh-pages:gh-pages --force

# 回到 main 分支
git checkout main
git branch -D temp-gh-pages

echo "部署完成！访问你的 GitHub Pages 查看最新内容"

