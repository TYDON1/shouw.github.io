---
title: "zkw线段树模版"
date: "2026-02-12 14:56:12"
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

## 并查集模版

```cpp
#include <bits/stdc++.h>
#define int long long
#define endl "\n"

using namespace std;

struct ZkwTree {
	
    int n, h;
    vector<int> st, tg, sz;

    ZkwTree(int _n) : n(_n) {
        h = __lg(n);
        st.assign(n * 2, 0);
        tg.assign(n * 2, 0);
        sz.assign(n * 2, 0);
    }

    void apply(int p, int v) {
        st[p] += v * sz[p];
        if (p < n) tg[p] += v;
    }

    void build_node(int p) {
        while (p > 1) {
            p >>= 1;
            st[p] = st[p << 1] + st[p << 1 | 1] + tg[p] * sz[p];
        }
    }

    void push_down(int p) {
        for (int s = h; s > 0; --s) {
            int i = p >> s;
            if (tg[i]) {
                apply(i << 1, tg[i]);
                apply(i << 1 | 1, tg[i]);
                tg[i] = 0;
            }
        }
    }

    void init_data() {
        for (int i = 0; i < n; i++) {
            cin >> st[i + n];
            sz[i + n] = 1;
        }
        for (int i = n - 1; i > 0; i--) {
            st[i] = st[i << 1] + st[i << 1 | 1];
            sz[i] = sz[i << 1] + sz[i << 1 | 1];
        }
    }

    void update(int l, int r, int v) {
        l += n, r += n + 1;
        int l0 = l, r0 = r;
        for (; l < r; l >>= 1, r >>= 1) {
            if (l & 1) apply(l++, v);
            if (r & 1) apply(--r, v);
        }
        build_node(l0);
        build_node(r0 - 1);
    }

    int query(int l, int r) {
        l += n, r += n + 1;
        push_down(l);
        push_down(r - 1);
        int res = 0;
        for (; l < r; l >>= 1, r >>= 1) {
            if (l & 1) res += st[l++];
            if (r & 1) res += st[--r];
        }
        return res;
    }

};

void solve() {

    int n, m;
    cin >> n >> m;

    ZkwTree tree(n);
    tree.init_data();

    while (m--) {
        char op;
        int l, r;
        cin >> op >> l >> r;
        if (op == 'C') {
            int k;
            cin >> k;
            tree.update(l - 1, r - 1, k);
        } else {
            cout << tree.query(l - 1, r - 1) << endl;
        }
    }

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;

    while (t--) {
        solve();
    }

}
```