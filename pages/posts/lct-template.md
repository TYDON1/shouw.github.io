---
title: "Link-Cut Tree模版"
date: "2026-08-27 20:56:14"
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

## Link-Cut Tree模版

```cpp
struct LCT {
    struct Node {
        int ch[2], fa, val, xor_sum;
        bool rev;
    };

    vector<Node> tr;

    LCT(int n) : tr(n + 1) {}

    bool is_root(int u) {
        return tr[tr[u].fa].ch[0] != u && tr[tr[u].fa].ch[1] != u;
    }

    bool which(int u) {
        return tr[tr[u].fa].ch[1] == u;
    }

    void pushup(int u) {
        tr[u].xor_sum = tr[tr[u].ch[0]].xor_sum ^ tr[tr[u].ch[1]].xor_sum ^ tr[u].val;
    }

    void pushrev(int u) {
        if (!u) return;
        swap(tr[u].ch[0], tr[u].ch[1]);
        tr[u].rev ^= 1;
    }

    void pushdown(int u) {
        if (tr[u].rev) {
            pushrev(tr[u].ch[0]);
            pushrev(tr[u].ch[1]);
            tr[u].rev = 0;
        }
    }

    void rotate(int u) {
        int f = tr[u].fa, g = tr[f].fa;
        bool k = which(u);
        if (!is_root(f)) tr[g].ch[which(f)] = u;
        tr[u].fa = g;
        tr[f].ch[k] = tr[u].ch[k ^ 1];
        if (tr[u].ch[k ^ 1]) tr[tr[u].ch[k ^ 1]].fa = f;
        tr[u].ch[k ^ 1] = f;
        tr[f].fa = u;
        pushup(f);
        pushup(u);
    }

    void splay(int u) {
        vector<int> stk;
        int x = u;
        stk.push_back(x);
        while (!is_root(x)) {
            x = tr[x].fa;
            stk.push_back(x);
        }
        while (!stk.empty()) {
            pushdown(stk.back());
            stk.pop_back();
        }
        while (!is_root(u)) {
            int f = tr[u].fa, g = tr[f].fa;
            if (!is_root(f)) (which(f) == which(u)) ? rotate(f) : rotate(u);
            rotate(u);
        }
    }

    void access(int u) {
        for (int c = 0; u; c = u, u = tr[u].fa) {
            splay(u);
            tr[u].ch[1] = c;
            pushup(u);
        }
    }

    void make_root(int u) {
        access(u);
        splay(u);
        pushrev(u);
    }

    int find_root(int u) {
        access(u);
        splay(u);
        while (tr[u].ch[0]) {
            pushdown(u);
            u = tr[u].ch[0];
        }
        splay(u);
        return u;
    }

    void link(int u, int v) {
        make_root(u);
        if (find_root(v) != u) tr[u].fa = v;
    }

    void cut(int u, int v) {
        make_root(u);
        if (find_root(v) == u && tr[v].fa == u && !tr[v].ch[0]) {
            tr[v].fa = tr[u].ch[1] = 0;
            pushup(u);
        }
    }

    // 查询 u-v 路径信息（这里以异或和为例，可按需替换 pushup 中的合并逻辑）
    int query(int u, int v) {
        make_root(u);
        access(v);
        splay(v);
        return tr[v].xor_sum;
    }

    void update(int u, int val) {
        splay(u);
        tr[u].val = val;
        pushup(u);
    }
};
```
