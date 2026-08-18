---
title: "ST表模版"
date: "2026-04-14 13:50:27"
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
template <typename T>
struct ST {
    int n;
    int max_log;
    vector<vector<T>> st;
    vector<int> lg; // 预处理 log2 的值，比直接调 log2() 函数快得多

    // 默认提供 max 函数，如果需要 min 或 gcd，可以修改或作为参数传入
    T merge(T a, T b) {
        return max(a, b);
    }

    // 初始化：传入原始数组（通常从下标 0 或 1 开始取决于输入 vector）
    ST(const vector<T>& a) {
        n = a.size();
        max_log = (n > 0) ? __lg(n) + 1 : 0;
        
        // st[i][j] 表示从下标 i 开始，长度为 2^j 的区间内的最值
        st.assign(n, vector<T>(max_log));
        lg.assign(n + 1, 0);

        // 1. 预处理 log2 数组
        for (int i = 2; i <= n; i++) {
            lg[i] = lg[i / 2] + 1;
        }

        // 2. 填充基础层 (长度为 2^0 = 1 的区间)
        for (int i = 0; i < n; i++) {
            st[i][0] = a[i];
        }

        // 3. 动态规划填表：区间 DP
        // st[i][j] = merge(左半部分, 右半部分)
        for (int j = 1; j < max_log; j++) {
            for (int i = 0; i + (1 << j) - 1 < n; i++) {
                st[i][j] = merge(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
            }
        }
    }

    // 查询区间 [L, R] 的最值 (0-indexed)
    // 注意：如果是 1-indexed 输入，调用时请传入 [L-1, R-1]
    T query(int L, int R) {
        if (L > R) return T(); // 或者根据具体题目返回一个极小/极大值
        int k = lg[R - L + 1];
        // 利用两个长度为 2^k 的区间覆盖 [L, R]，允许重叠（重叠不影响 max/min/gcd）
        return merge(st[L][k], st[R - (1 << k) + 1][k]);
    }
};
```