#!/bin/bash
# Hexo 一键更新 + GitHub Pages 部署脚本 (改进版)
# 使用方法：在博客根目录运行 ./deploy.sh

# 1️⃣ 提交源文件
echo "提交源文件..."
read -p "输入本次提交信息: " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
  echo "提交信息为空，使用默认信息: 更新文章/配置"
  COMMIT_MSG="更新文章/配置"
fi

git add .
git commit -m "$COMMIT_MSG" 2>/dev/null || echo "没有需要提交的源文件"
git push origin main

# 2️⃣ 生成静态文件
echo "生成静态文件..."
hexo clean
hexo g

# 3️⃣ 确保本地 gh-pages 分支与远程一致
echo "同步 gh-pages 分支..."
git fetch origin gh-pages
git branch -f gh-pages origin/gh-pages

# 4️⃣ 推送 public/ 到 gh-pages
echo "推送到 gh-pages 分支..."
git subtree push --prefix public origin gh-pages || echo "推送失败，请检查远程仓库权限或冲突"

echo "部署完成! 访问你的 GitHub Pages 查看最新内容"

