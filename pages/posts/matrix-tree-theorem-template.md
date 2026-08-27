---
title: "矩阵树定理模版"
date: "2026-08-27 22:22:37"
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

## 矩阵树定理模版

```cpp
struct MatrixTree {
    const int MOD = 1000000007;

    int qpow(int a, int b) {
        int res = 1;
        a %= MOD;
        while (b > 0) {
            if (b & 1) res = res * a % MOD;
            a = a * a % MOD;
            b >>= 1;
        }
        return res;
    }

    // 模意义下高斯消元求行列式
    int determinant(vector<vector<int>> mat, int n) {
        int res = 1;
        for (int i = 0; i < n; i++) {
            int piv = -1;
            for (int j = i; j < n; j++) {
                if (mat[j][i] != 0) { piv = j; break; }
            }
            if (piv == -1) return 0;
            if (piv != i) {
                swap(mat[i], mat[piv]);
                res = (MOD - res) % MOD;
            }

            res = res * mat[i][i] % MOD;
            int inv = qpow(mat[i][i], MOD - 2);
            for (int j = i; j < n; j++) mat[i][j] = mat[i][j] * inv % MOD;

            for (int j = i + 1; j < n; j++) {
                int factor = mat[j][i];
                for (int k = i; k < n; k++) {
                    mat[j][k] = (mat[j][k] - factor * mat[i][k] % MOD + MOD) % MOD;
                }
            }
        }
        return res;
    }

    // 无向无权图生成树计数（基尔霍夫矩阵去掉第 0 行第 0 列后求行列式）
    int count_spanning_trees(int n, vector<pair<int, int>>& edges) {
        vector<vector<int>> lap(n, vector<int>(n, 0));
        for (auto [u, v] : edges) {
            lap[u][u]++;
            lap[v][v]++;
            lap[u][v] = (lap[u][v] - 1 + MOD) % MOD;
            lap[v][u] = (lap[v][u] - 1 + MOD) % MOD;
        }
        vector<vector<int>> sub(n - 1, vector<int>(n - 1));
        for (int i = 1; i < n; i++)
            for (int j = 1; j < n; j++)
                sub[i - 1][j - 1] = lap[i][j];
        return determinant(sub, n - 1);
    }
};
```
