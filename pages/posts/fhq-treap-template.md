---
title: "FHQ Treap模版"
date: "2026-08-27 20:34:19"
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

## FHQ Treap模版

```cpp
struct FHQTreap {
    struct Node {
        int l, r, val, pri, sz;
    };

    vector<Node> tr;
    int root, cnt;

    FHQTreap(int n) : tr(n + 1), root(0), cnt(0) {}

    int new_node(int val) {
        cnt++;
        tr[cnt] = {0, 0, val, (int)rand(), 1};
        return cnt;
    }

    void pushup(int u) {
        tr[u].sz = tr[tr[u].l].sz + tr[tr[u].r].sz + 1;
    }

    // 按值分裂：x 为 <= val 的部分，y 为 > val 的部分
    void split(int u, int val, int& x, int& y) {
        if (!u) { x = y = 0; return; }
        if (tr[u].val <= val) {
            x = u;
            split(tr[u].r, val, tr[u].r, y);
        } else {
            y = u;
            split(tr[u].l, val, x, tr[u].l);
        }
        pushup(u);
    }

    int merge(int x, int y) {
        if (!x || !y) return x + y;
        if (tr[x].pri < tr[y].pri) {
            tr[x].r = merge(tr[x].r, y);
            pushup(x);
            return x;
        } else {
            tr[y].l = merge(x, tr[y].l);
            pushup(y);
            return y;
        }
    }

    void insert(int val) {
        int x, y;
        split(root, val, x, y);
        root = merge(merge(x, new_node(val)), y);
    }

    // 只删除一个值为 val 的节点
    void erase(int val) {
        int x, y, z;
        split(root, val, x, z);
        split(x, val - 1, x, y);
        y = merge(tr[y].l, tr[y].r);
        root = merge(merge(x, y), z);
    }

    // val 的排名（比 val 小的数的个数 + 1）
    int rank_of(int val) {
        int x, y;
        split(root, val - 1, x, y);
        int res = tr[x].sz + 1;
        root = merge(x, y);
        return res;
    }

    int kth(int u, int k) {
        while (true) {
            if (k <= tr[tr[u].l].sz) u = tr[u].l;
            else if (k == tr[tr[u].l].sz + 1) return tr[u].val;
            else k -= tr[tr[u].l].sz + 1, u = tr[u].r;
        }
    }

    int pre(int val) {
        int x, y;
        split(root, val - 1, x, y);
        int u = x;
        while (tr[u].r) u = tr[u].r;
        int res = tr[u].val;
        root = merge(x, y);
        return res;
    }

    int nxt(int val) {
        int x, y;
        split(root, val, x, y);
        int u = y;
        while (tr[u].l) u = tr[u].l;
        int res = tr[u].val;
        root = merge(x, y);
        return res;
    }
};
```
