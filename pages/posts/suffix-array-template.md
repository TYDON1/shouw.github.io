---
title: "后缀数组模版"
date: "2026-08-27 21:55:19"
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

## 后缀数组模版

```cpp
// O(n log^2 n) 倍增法，n 在 1e5 级别足够快；更大规模可换成基数排序做到 O(n log n)
struct SuffixArray {
    int n;
    string s;
    vector<int> sa, rk, height;

    SuffixArray(const string& str) : s(str) {
        n = s.size();
        build();
    }

    void build() {
        sa.resize(n);
        rk.resize(n);
        vector<int> tmp(n);

        for (int i = 0; i < n; i++) rk[i] = s[i];
        for (int i = 0; i < n; i++) sa[i] = i;

        for (int k = 1; ; k <<= 1) {
            auto cmp = [&](int a, int b) {
                if (rk[a] != rk[b]) return rk[a] < rk[b];
                int ra = a + k < n ? rk[a + k] : -1;
                int rb = b + k < n ? rk[b + k] : -1;
                return ra < rb;
            };
            sort(sa.begin(), sa.end(), cmp);
            tmp[sa[0]] = 0;
            for (int i = 1; i < n; i++) tmp[sa[i]] = tmp[sa[i - 1]] + (cmp(sa[i - 1], sa[i]) ? 1 : 0);
            rk = tmp;
            if (rk[sa[n - 1]] == n - 1) break;
        }

        // height[i] = LCP(sa[i], sa[i-1])
        height.assign(n, 0);
        int k = 0;
        for (int i = 0; i < n; i++) {
            if (rk[i] == 0) { k = 0; continue; }
            if (k > 0) k--;
            int j = sa[rk[i] - 1];
            while (i + k < n && j + k < n && s[i + k] == s[j + k]) k++;
            height[rk[i]] = k;
        }
    }
};
```
