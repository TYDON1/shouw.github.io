---
title: "CDQ分治模版"
date: "2026-11-27 16:24:55"
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

## CDQ分治模版

以经典三维偏序为例：给定 $n$ 个三元组 $(a_i, b_i, c_i)$，对每个 $i$ 求满足 $j \neq i$ 且 $a_j \le a_i, b_j \le b_i, c_j \le c_i$ 的 $j$ 的个数。

```cpp
struct CDQ {
    struct Elem {
        int a, b, c;
        int cnt, ans;
    };

    int k; // c 的值域上限 [1..k]
    vector<int> bit;
    vector<Elem> e, tmp;

    CDQ(int max_c) : k(max_c), bit(max_c + 1, 0) {}

    void bit_add(int i, int v) {
        for (; i <= k; i += i & -i) bit[i] += v;
    }

    int bit_sum(int i) const {
        int res = 0;
        for (; i > 0; i -= i & -i) res += bit[i];
        return res;
    }

    void cdq(int l, int r) {
        if (l >= r) return;
        int mid = (l + r) >> 1;
        cdq(l, mid);
        cdq(mid + 1, r);

        int i = l, j = mid + 1, p = l;
        while (i <= mid && j <= r) {
            if (e[i].b <= e[j].b) {
                bit_add(e[i].c, e[i].cnt);
                tmp[p++] = e[i++];
            } else {
                e[j].ans += bit_sum(e[j].c);
                tmp[p++] = e[j++];
            }
        }
        while (j <= r) {
            e[j].ans += bit_sum(e[j].c);
            tmp[p++] = e[j++];
        }
        // 仅回撤本层已经加入树状数组的左半元素
        for (int t = l; t < i; t++) bit_add(e[t].c, -e[t].cnt);
        while (i <= mid) tmp[p++] = e[i++];
        for (int t = l; t <= r; t++) e[t] = tmp[t];
    }

    // 传入所有三元组 (a, b, c)，返回 f[d] 表示有多少个元素恰好支配 d 个其他元素
    vector<int> solve(vector<array<int, 3>> raw) {
        int n = raw.size();
        sort(raw.begin(), raw.end());
        e.clear();
        for (int i = 0; i < n; ) {
            int j = i;
            while (j < n && raw[j] == raw[i]) j++;
            e.push_back({raw[i][0], raw[i][1], raw[i][2], j - i, 0});
            i = j;
        }
        tmp.resize(e.size());
        if (!e.empty()) cdq(0, (int)e.size() - 1);

        vector<int> freq(n, 0);
        for (const auto& x : e) {
            freq[x.ans + x.cnt - 1] += x.cnt;
        }
        return freq;
    }
};
```
