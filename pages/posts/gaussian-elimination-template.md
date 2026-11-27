---
title: "高斯消元模版"
date: "2026-11-27 17:39:42"
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

## 高斯消元模版

包含三种竞赛最常见的高斯-约旦消元：实数线性方程组（列主元稳定版）、质数模意义线性方程组，以及 `bitset` 压位异或方程组。

```cpp
struct Gauss {
    static constexpr double EPS = 1e-9;

    // 1. 实数高斯-约旦消元：a 为 n x (m + 1) 增广矩阵，结果写入 ans[0..m-1]
    // 返回：0 无解，1 唯一解，2 无穷多解
    static int solve_real(vector<vector<double>> a, vector<double>& ans) {
        int n = a.size(), m = (int)a[0].size() - 1;
        vector<int> where(m, -1);
        int row = 0;
        for (int col = 0; col < m && row < n; col++) {
            int sel = row;
            for (int i = row; i < n; i++) {
                if (fabs(a[i][col]) > fabs(a[sel][col])) sel = i;
            }
            if (fabs(a[sel][col]) < EPS) continue;
            swap(a[sel], a[row]);
            where[col] = row;
            double inv = 1.0 / a[row][col];
            for (int j = col; j <= m; j++) a[row][j] *= inv;
            for (int i = 0; i < n; i++) {
                if (i != row && fabs(a[i][col]) > EPS) {
                    double factor = a[i][col];
                    for (int j = col; j <= m; j++) a[i][j] -= a[row][j] * factor;
                }
            }
            row++;
        }
        ans.assign(m, 0.0);
        for (int j = 0; j < m; j++) {
            if (where[j] != -1) ans[j] = a[where[j]][m];
        }
        for (int i = row; i < n; i++) {
            if (fabs(a[i][m]) > EPS) return 0;
        }
        for (int j = 0; j < m; j++) {
            if (where[j] == -1) return 2;
        }
        return 1;
    }

    static int qpow(int a, int b, int mod) {
        int res = 1;
        a = (a % mod + mod) % mod;
        while (b > 0) {
            if (b & 1) res = res * a % mod;
            a = a * a % mod;
            b >>= 1;
        }
        return res;
    }

    // 2. 质数模意义高斯-约旦消元：a 为 n x (m + 1) 增广矩阵
    static int solve_mod(vector<vector<int>> a, int mod, vector<int>& ans) {
        int n = a.size(), m = (int)a[0].size() - 1;
        for (auto& r : a) for (int& x : r) x = (x % mod + mod) % mod;
        vector<int> where(m, -1);
        int row = 0;
        for (int col = 0; col < m && row < n; col++) {
            int sel = row;
            while (sel < n && a[sel][col] == 0) sel++;
            if (sel == n) continue;
            swap(a[sel], a[row]);
            where[col] = row;
            int inv = qpow(a[row][col], mod - 2, mod);
            for (int j = col; j <= m; j++) a[row][j] = a[row][j] * inv % mod;
            for (int i = 0; i < n; i++) {
                if (i != row && a[i][col] != 0) {
                    int factor = a[i][col];
                    for (int j = col; j <= m; j++) {
                        a[i][j] = (a[i][j] - factor * a[row][j] % mod + mod) % mod;
                    }
                }
            }
            row++;
        }
        ans.assign(m, 0);
        for (int j = 0; j < m; j++) {
            if (where[j] != -1) ans[j] = a[where[j]][m];
        }
        for (int i = row; i < n; i++) {
            if (a[i][m] != 0) return 0;
        }
        for (int j = 0; j < m; j++) {
            if (where[j] == -1) return 2;
        }
        return 1;
    }

    // 3. bitset 压位异或方程组消元：第 m 列为常数项，返回自由元个数（-1 表示无解）
    template <size_t MAXM>
    static int solve_xor(vector<bitset<MAXM>> a, int m, bitset<MAXM>& ans) {
        int n = a.size(), row = 0;
        vector<int> where(m, -1);
        for (int col = 0; col < m && row < n; col++) {
            int sel = row;
            while (sel < n && !a[sel][col]) sel++;
            if (sel == n) continue;
            swap(a[sel], a[row]);
            where[col] = row;
            for (int i = 0; i < n; i++) {
                if (i != row && a[i][col]) a[i] ^= a[row];
            }
            row++;
        }
        ans.reset();
        int free_cnt = 0;
        for (int j = 0; j < m; j++) {
            if (where[j] != -1) ans[j] = a[where[j]][m];
            else free_cnt++;
        }
        for (int i = row; i < n; i++) {
            if (a[i][m]) return -1;
        }
        return free_cnt;
    }
};
```
