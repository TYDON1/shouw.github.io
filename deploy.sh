#!/bin/bash
# Hexo 一键更新 + GitHub Pages 部署脚本（最终版）
# 使用方法：在博客根目录运行 ./deploy.sh

# 1️⃣ 提交源文件（文章、配置、主题）
echo "提交源文件..."
git add .

read -p "输入本次提交信息: " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
  COMMIT_MSG="更新文章/配置"
fi

# 检查是否有变化
if git diff-index --quiet HEAD --; then
  echo "源文件没有变化，无需提交"
else
  git commit -m "$COMMIT_MSG"
  git push origin main
fi

# 2️⃣ 生成静态文件
echo "生成静态文件..."
hexo clean
hexo g

# 3️⃣ 检查 public/ 是否有变化
git add public
if git diff-index --quiet HEAD -- public; then
  echo "public/ 没有变化，跳过 gh-pages 提交"
else
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
fi

echo "部署完成！访问你的 GitHub Pages 查看最新内容"

