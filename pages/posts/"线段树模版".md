---
title: "线段树模版"
date: "2026-02-01 13:49:13"
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

## 线段树模版

```cpp
struct SGT {
    struct Node {
        int mx;   // 区间最大值
        int id;   // 最大值所在的下标
        int tag;  // 懒惰标记 (Lazy Tag)
    };

    int n;
    int st_idx; // 起始下标 (0 或 1)
    vector<Node> tree;

    // n: 数组长度, start_index: 你的数组下标是从 0 还是 1 开始
    SGT(int n, int start_index = 1) : n(n), st_idx(start_index) {
        tree.assign(4 * n + 1, {0, 0, 0});
    }
    
    void pushup(int v) {
        if (tree[v * 2].mx >= tree[v * 2 + 1].mx) {
            tree[v].mx = tree[v * 2].mx;
            tree[v].id = tree[v * 2].id;
        } else {
            tree[v].mx = tree[v * 2 + 1].mx;
            tree[v].id = tree[v * 2 + 1].id;
        }
    }

    void apply(int v, int val) {
        tree[v].mx += val;
        tree[v].tag += val;
    }

    void pushdown(int v) {
        if (tree[v].tag != 0) {
            apply(v * 2, tree[v].tag);
            apply(v * 2 + 1, tree[v].tag);
            tree[v].tag = 0;
        }
    }

    void build(int v, int l, int r, const vector<int>& vals) {
        if (l == r) {
            tree[v].mx = vals[l];
            tree[v].id = l;
            return;
        }
        int mid = (l + r) >> 1;
        build(v * 2, l, mid, vals);
        build(v * 2 + 1, mid + 1, r, vals);
        pushup(v);
    }

    void update(int v, int l, int r, int L, int R, int val) {
        if (L > R) return;
        if (l == L && r == R) {
            apply(v, val);
            return;
        }
        pushdown(v);
        int mid = (l + r) >> 1;
        if (L <= mid) update(v * 2, l, mid, L, min(mid, R), val);
        if (R > mid)  update(v * 2 + 1, mid + 1, r, max(mid + 1, L), R, val);
        pushup(v);
    }

    pair<int, int> query(int v, int l, int r, int L, int R) {
        if (L > R) return {LLONG_MIN, -1}; // 无效区间返回极小值
        if (l == L && r == R) return {tree[v].mx, tree[v].id};
        
        pushdown(v);
        int mid = (l + r) >> 1;
        
        if (R <= mid) return query(v * 2, l, mid, L, R);
        if (L > mid)  return query(v * 2 + 1, mid + 1, r, L, R);
        
        auto res_left = query(v * 2, l, mid, L, mid);
        auto res_right = query(v * 2 + 1, mid + 1, r, mid + 1, R);
        return res_left.first >= res_right.first ? res_left : res_right;
    }

    // [树上二分] 查询区间 [L, R] 内第一个大于等于 val 的元素下标
    int find_first(int v, int l, int r, int L, int R, int val) {
        if (L > R || tree[v].mx < val) return -1; // 剪枝
        if (l == r) return l; 
        
        pushdown(v);
        int mid = (l + r) >> 1;
        
        if (L <= mid) {
            int res = find_first(v * 2, l, mid, L, min(mid, R), val);
            if (res != -1) return res; 
        }
        if (R > mid) {
            return find_first(v * 2 + 1, mid + 1, r, max(mid + 1, L), R, val);
        }
        return -1;
    }

    
    void build_tree(const vector<int>& vals) {
        build(1, st_idx, st_idx + n - 1, vals);
    }

    void modify(int L, int R, int val) {
        update(1, st_idx, st_idx + n - 1, L, R, val);
    }

    pair<int, int> ask_max(int L, int R) {
        return query(1, st_idx, st_idx + n - 1, L, R);
    }
    
    int find_first_ge(int L, int R, int val) {
        return find_first(1, st_idx, st_idx + n - 1, L, R, val);
    }
};
```