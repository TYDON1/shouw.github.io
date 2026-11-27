---
title: "珂朵莉树 (ODT) 模版"
date: "2026-11-27 16:06:12"
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

## 珂朵莉树 (ODT) 模版

珂朵莉树（Old Driver Tree / 颜色段均摊），使用 `std::set` 维护值相同的连续区间，擅长含区间推平（`assign`）操作的随机数据题。

```cpp
struct ODT {
    struct Node {
        int l, r;
        mutable int v;
        Node(int l, int r = -1, int v = 0) : l(l), r(r), v(v) {}
        bool operator<(const Node& o) const { return l < o.l; }
    };

    set<Node> s;

    // 用初始数组 a[1..n] 建树（合并相邻相等段）
    void init(const vector<int>& a, int n) {
        s.clear();
        for (int i = 1; i <= n; ) {
            int j = i;
            while (j <= n && a[j] == a[i]) j++;
            s.emplace(i, j - 1, a[i]);
            i = j;
        }
    }

    // 把包含 pos 的区间 [l, r] 分裂成 [l, pos-1] 和 [pos, r]，返回指向 [pos, r] 的迭代器
    set<Node>::iterator split(int pos) {
        auto it = s.lower_bound(Node(pos));
        if (it != s.end() && it->l == pos) return it;
        if (it == s.begin()) return s.end();
        --it;
        if (it->r < pos) return s.end();
        int l = it->l, r = it->r, v = it->v;
        s.erase(it);
        s.emplace(l, pos - 1, v);
        return s.emplace(pos, r, v).first;
    }

    // 区间推平：将 [l, r] 全部赋值为 v（必须先 split(r + 1) 再 split(l)！）
    void assign(int l, int r, int v) {
        auto itr = split(r + 1), itl = split(l);
        s.erase(itl, itr);
        s.emplace(l, r, v);
    }

    // 区间加：将 [l, r] 每个元素加上 v
    void add(int l, int r, int v) {
        auto itr = split(r + 1), itl = split(l);
        for (auto it = itl; it != itr; ++it) it->v += v;
    }

    // 查询 [l, r] 内的第 k 小（1-based）
    int kth(int l, int r, int k) {
        auto itr = split(r + 1), itl = split(l);
        vector<pair<int, int>> vec;
        for (auto it = itl; it != itr; ++it) {
            vec.emplace_back(it->v, it->r - it->l + 1);
        }
        sort(vec.begin(), vec.end());
        for (auto [val, len] : vec) {
            if (k <= len) return val;
            k -= len;
        }
        return -1;
    }

    static int qpow(int a, int b, int mod) {
        int res = 1;
        a %= mod;
        while (b > 0) {
            if (b & 1) res = res * a % mod;
            a = a * a % mod;
            b >>= 1;
        }
        return res;
    }

    // 查询 [l, r] 内所有元素的 x 次方和 mod y
    int pow_sum(int l, int r, int x, int mod) {
        auto itr = split(r + 1), itl = split(l);
        int res = 0;
        for (auto it = itl; it != itr; ++it) {
            int len = (it->r - it->l + 1) % mod;
            res = (res + len * qpow(it->v, x, mod)) % mod;
        }
        return res;
    }
};
```
