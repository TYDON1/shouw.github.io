---
title: "笛卡尔树模版"
date: "2026-08-27 22:09:16"
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

## 笛卡尔树模版

```cpp
// 按值建小根堆笛卡尔树，中序遍历即原数组下标顺序
// 区间 [l, r] 的最小值下标 = 笛卡尔树上 l 和 r 的 LCA，可配合 LCA 模版做 O(1)/O(log n) RMQ
struct CartesianTree {
    int n, root;
    vector<int> val, ls, rs, par;

    CartesianTree(vector<int>& a) : n(a.size()), val(a), ls(n, -1), rs(n, -1), par(n, -1) {
        build();
    }

    void build() {
        vector<int> stk;
        for (int i = 0; i < n; i++) {
            int last = -1;
            while (!stk.empty() && val[stk.back()] > val[i]) {
                last = stk.back();
                stk.pop_back();
            }
            ls[i] = last;
            if (last != -1) par[last] = i;
            if (!stk.empty()) {
                rs[stk.back()] = i;
                par[i] = stk.back();
            }
            stk.push_back(i);
        }
        root = stk[0];
    }
};
```
