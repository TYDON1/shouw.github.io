---
title: "KM算法模版"
date: "2026-11-27 17:08:33"
author: shouw
katex: true
categories:
  - 模版
email: KijinSeija@shouw.blog
readmore: true
tags:
  - 编程
  - 算法竞赛
  - 模版
---

## KM算法模版

BFS 迭代版 Kuhn-Munkres 算法，严格 $O(n^3)$ 求解二分图最大权完美匹配，不存在 DFS 版退化至 $O(n^4)$ 的风险。

```cpp
struct KM {
    static constexpr int INF = 4e18;
    int n;
    vector<vector<int>> w;
    vector<int> lx, ly, match, pre, slack;
    vector<bool> vis;

    // 默认不存在边权为 -INF（求最大权完美匹配）；若允许不匹配可传 default_w = 0
    KM(int n, int default_w = -INF / 4)
        : n(n), w(n + 1, vector<int>(n + 1, default_w)),
          lx(n + 1, -INF), ly(n + 1, 0), match(n + 1, 0),
          pre(n + 1, 0), slack(n + 1, 0), vis(n + 1, false) {}

    void add_edge(int u, int v, int weight) {
        w[u][v] = max(w[u][v], weight);
    }

    void bfs(int st) {
        fill(vis.begin(), vis.end(), false);
        fill(slack.begin(), slack.end(), INF);
        fill(pre.begin(), pre.end(), 0);
        int y = 0;
        match[0] = st;
        do {
            vis[y] = true;
            int x = match[y], delta = INF, ny = 0;
            for (int j = 1; j <= n; j++) {
                if (vis[j]) continue;
                int d = lx[x] + ly[j] - w[x][j];
                if (d < slack[j]) {
                    slack[j] = d;
                    pre[j] = y;
                }
                if (slack[j] < delta) {
                    delta = slack[j];
                    ny = j;
                }
            }
            for (int j = 0; j <= n; j++) {
                if (vis[j]) {
                    lx[match[j]] -= delta;
                    ly[j] += delta;
                } else {
                    slack[j] -= delta;
                }
            }
            y = ny;
        } while (match[y] != 0);

        while (y != 0) {
            match[y] = match[pre[y]];
            y = pre[y];
        }
    }

    // 返回最大权完美匹配总权值；match[j] 表示右部点 j 匹配的左部点
    int solve() {
        for (int i = 1; i <= n; i++) {
            lx[i] = *max_element(w[i].begin() + 1, w[i].end());
        }
        for (int i = 1; i <= n; i++) bfs(i);
        int ans = 0;
        for (int j = 1; j <= n; j++) ans += w[match[j]][j];
        return ans;
    }
};
```
