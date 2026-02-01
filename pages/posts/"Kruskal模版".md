---
title: "Kruskal模版"
date: "2026-02-01 14:27:20"
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

## Kruskal模版

```cpp
#include <bits/stdc++.h>
#define int long long

using namespace std;

struct Node {
    int u, v ,w;
    bool operator<(const Node &n) const {
        return w < n.w;
    }
};

struct DSU {

    vector<int> par;
    vector<int> sz;

    DSU(int n) {

        par.assign(n + 1, 0);
        sz.assign(n + 1, 1);
        iota(par.begin(), par.end(), 0);

    }

    int find(int x) {
        if (par[x] == x) return x;
        return par[x] = find(par[x]);
    }

    void unite(int x, int y) {
        int root_x = find(x);
        int root_y = find(y);
        if (root_x == root_y) return;
        if (sz[root_x] < sz[root_y]) {
            swap(root_x, root_y);
        }
        par[root_y] = root_x;
        sz[root_x] += sz[root_y];
    }

    bool connected(int x, int y) {
        return find(x) == find(y);
    }

    int size(int x) {
        return sz[find(x)];
    }

};

void solve() {

    int n, m, ans = 0;
    cin >> n >> m;
    vector<Node> g(m);
    DSU dsu(n);

    for (int i = 0; i < m; i++) {
        cin >> g[i].u >> g[i].v >> g[i].w;
    }

    sort(g.begin(), g.end());

    for (int i = 0; i < m; i++) {
        int u = g[i].u, v = g[i].v, w = g[i].w;

        if (!dsu.connected(u, v)) {
            dsu.unite(u, v);
            ans += w;
        }
    }

    if (dsu.size(n) != n) {
        cout << "impossible" << endl;
    } else {
        cout << ans << endl;
    }

}

signed main() {

    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();

}
```