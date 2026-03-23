# 推送到 GitHub

## 1. 在 GitHub 建好仓库

1. 打开 https://github.com/new
2. 仓库名：`pixel-love-pwa`（或任意）
3. 选择 **Public**
4. **不要**勾选 "Add a README"（本地已有）
5. 点 Create repository

## 2. 关联并推送

在终端执行（把 `你的用户名` 和 `你的仓库名` 换成你的）：

```bash
cd /Users/zhuyiying/Desktop/pixel-love-pwa

git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

## 3. 以后每次改完代码就推送

```bash
cd /Users/zhuyiying/Desktop/pixel-love-pwa
git add .
git status          # 看看改了啥
git commit -m "描述你的修改"
git push
```

## 4. 查看改动

- **`git status`**：哪些文件有改动
- **`git diff`**：未暂存改动的详细差异
- **`git diff --staged`**：已暂存改动的差异
