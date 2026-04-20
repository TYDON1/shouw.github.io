---
title: "线性基模版"
date: "2026-04-20 16:18:09"
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

```cpp
struct LinearBasis {
    static const int MAX_L = 30; // int 范围内最高位到 30 (2^30)
    int p[MAX_L + 1];      // 基础线性基
    int d[MAX_L + 1];      // 用于查询第 k 小的重构基
    int cnt;               // 线性基内元素的个数
    bool has_zero;         // 是否能异或出 0

    LinearBasis() {
        memset(p, 0, sizeof(p));
        memset(d, 0, sizeof(d));
        cnt = 0;
        has_zero = false;
    }

    // 插入一个 int 数值
    bool insert(int x) {
        for (int i = MAX_L; i >= 0; --i) {
            if (!(x >> i)) continue;
            if (!p[i]) {
                p[i] = x;
                cnt++;
                return true;
            }
            x ^= p[i];
        }
        has_zero = true;
        return false;
    }

    // 查询当前集合能异或出的最大值
    int query_max() {
        int res = 0;
        for (int i = MAX_L; i >= 0; --i) {
            res = max(res, res ^ p[i]);
        }
        return res;
    }

    // 查询最小正异或和
    int query_min() {
        if (has_zero) return 0;
        for (int i = 0; i <= MAX_L; ++i) {
            if (p[i]) return p[i];
        }
        return 0;
    }

    // 高斯消元重构，支持查询第 k 小
    void rebuild() {
        cnt = 0;
        for (int i = 0; i <= MAX_L; ++i) d[i] = 0;
        
        // 这一步是关键优化：将线性基转为行最简形
        for (int i = MAX_L; i >= 0; --i) {
            for (int j = i - 1; j >= 0; --j) {
                if ((p[i] >> j) & 1) p[i] ^= p[j];
            }
        }
        for (int i = 0; i <= MAX_L; ++i) {
            if (p[i]) d[cnt++] = p[i];
        }
    }

    // 查询第 k 小值
    int query_kth(int k) {
        if (has_zero) k--; 
        if (k == 0) return 0;
        if (k >= (1 << cnt)) return -1;

        int res = 0;
        for (int i = 0; i < cnt; ++i) {
            if ((k >> i) & 1) res ^= d[i];
        }
        return res;
    }
};
```