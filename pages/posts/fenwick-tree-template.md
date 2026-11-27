---
title: "树状数组模版"
date: "2026-11-27 16:00:00"
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

## 树状数组模版

包含标准单点修改/区间查询、树状数组上倍增二分 `kth`，以及基于差分双树状数组的区间修改/区间查询。

```cpp
// 1-based 标准树状数组：支持单点加、区间和、树状数组上二分求第 k 小
struct BIT {
    int n;
    vector<int> tr;

    BIT(int n = 0) : n(n), tr(n + 1, 0) {}

    void add(int i, int v) {
        for (; i <= n; i += i & -i) tr[i] += v;
    }

    int sum(int i) const {
        int res = 0;
        for (; i > 0; i -= i & -i) res += tr[i];
        return res;
    }

    int query(int l, int r) const {
        if (l > r) return 0;
        return sum(r) - sum(l - 1);
    }

    // 权值非负时，求最小的 pos 使得 sum(pos) >= k；不存在则返回 n + 1
    int kth(int k) const {
        int pos = 0;
        for (int bit = 1LL << (63 - __builtin_clzll(max(1LL, n))); bit > 0; bit >>= 1) {
            if (pos + bit <= n && tr[pos + bit] < k) {
                pos += bit;
                k -= tr[pos];
            }
        }
        return pos + 1;
    }
};

// 1-based 区间修改 + 区间查询树状数组（双树状数组维护差分）
struct RangeBIT {
    int n;
    BIT d1, d2; // 分别维护 d[i] 与 i * d[i]

    RangeBIT(int n = 0) : n(n), d1(n), d2(n) {}

    void add(int l, int r, int v) {
        d1.add(l, v);
        d2.add(l, l * v);
        if (r + 1 <= n) {
            d1.add(r + 1, -v);
            d2.add(r + 1, -(r + 1) * v);
        }
    }

    int prefix(int x) const {
        return (x + 1) * d1.sum(x) - d2.sum(x);
    }

    int query(int l, int r) const {
        if (l > r) return 0;
        return prefix(r) - prefix(l - 1);
    }
};
```
