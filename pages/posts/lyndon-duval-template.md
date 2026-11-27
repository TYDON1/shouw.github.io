---
title: "Lyndon分解模版"
date: "2026-11-27 17:20:55"
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

## Lyndon分解模版

Duval 算法在线性时间内将字符串唯一分解为字典序非严格递减的 Lyndon 串：$s = w_1 w_2 \dots w_k$，满足 $w_1 \ge w_2 \ge \dots \ge w_k$ 且每个 $w_i$ 严格小于其所有非空真后缀。

```cpp
struct LyndonDuval {
    // 返回所有 Lyndon 串的 0-based 闭区间 [l, r]
    static vector<pair<int, int>> factorize(const string& s) {
        int n = s.size();
        vector<pair<int, int>> res;
        for (int i = 0; i < n; ) {
            int j = i + 1, k = i;
            while (j < n && s[k] <= s[j]) {
                if (s[k] < s[j]) k = i;
                else k++;
                j++;
            }
            while (i <= k) {
                res.emplace_back(i, i + (j - k) - 1);
                i += j - k;
            }
        }
        return res;
    }

    // 应用：利用 Duval 算法 O(n) 求循环移位最小表示起始下标
    static int min_cyclic_shift(const string& s) {
        int n = s.size();
        string t = s + s;
        int ans = 0;
        for (int i = 0; i < n; ) {
            ans = i;
            int j = i + 1, k = i;
            while (j < 2 * n && t[k] <= t[j]) {
                if (t[k] < t[j]) k = i;
                else k++;
                j++;
            }
            while (i <= k) i += j - k;
        }
        return ans;
    }
};
```
