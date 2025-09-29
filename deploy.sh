#!/bin/bash

# Hexo Yun 部署脚本 (强制推送 gh-pages)

# 提示输入提交信息
read -p "输入本次提交信息: " commit_msg
if [ -z "$commit_msg" ]; then
  commit_msg="更新"
fi

echo "清理旧文件..."
hexo clean

echo "生成静态文件..."
hexo g

# 添加 .gitignore 忽略不必要文件
echo -e "node_modules/\ndb.json\n.deploy_git/" > .gitignore

# 提交源文件到 main 分支
git add -A
git commit -m "$commit_msg" || echo "没有源文件更新"

git push origin main

# 切换到临时 gh-pages 分支
git checkout -B temp-gh-pages origin/gh-pages 2>/dev/null || git checkout -B temp-gh-pages

# 清理旧内容
git rm -rf . >/dev/null 2>&1

# 复制 public/ 下的最新文件
cp -r public/* ./

# 添加、提交、推送到 gh-pages
git add -A
git commit -m "$commit_msg" || echo "没有 public 文件更新"
git push -f origin temp-gh-pages:gh-pages

# 切换回 main 分支
git checkout main

echo "部署完成! 访问你的 GitHub Pages 查看最新内容"

