---
title: "可持久化线段树模版"
date: "2026-04-06 18:39:23"
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

## 可持久化线段树模版

```cpp
struct PST {
    struct Node {
        int count;      // 区间内元素的个数
        long long sum;  // 区间内元素的权值和 (如果不需要可以删掉以省空间)
        int L, R;       // 左右子节点的索引
    };

    int min_val, max_val;
    int node_cnt;
    vector<Node> tree;
    vector<int> roots;  // roots[i] 表示插入第 i 个元素后的线段树根节点

    // 初始化：传入值域的下界和上界，以及最大可能生成的节点数
    // 空间通常开 (N + Q) * (log2(max_val - min_val) + 2)
    PST(int min_val, int max_val, int max_nodes) : min_val(min_val), max_val(max_val) {
        node_cnt = 0;
        tree.resize(max_nodes);
        roots.push_back(0); // roots[0] 代表一棵全为空的树
    }

    // 内部方法：单点插入更新
    int update(int prev, int l, int r, int val) {
        int curr = ++node_cnt;
        tree[curr] = tree[prev]; // 复制历史版本节点
        tree[curr].count++;
        tree[curr].sum += val;
        
        if (l == r) return curr;
        
        int mid = l + (r - l) / 2;
        if (val <= mid)
            tree[curr].L = update(tree[prev].L, l, mid, val);
        else
            tree[curr].R = update(tree[prev].R, mid + 1, r, val);
            
        return curr;
    }

    // 对外接口：按原数组顺序插入一个值
    void insert(int val) {
        roots.push_back(update(roots.back(), min_val, max_val, val));
    }

    // 内部方法：树上二分查询第 K 小的数
    int query_kth(int u, int v, int l, int r, int k) {
        if (l == r) return l;

        int mid = l + (r - l) / 2;
        // 计算左子树在当前区间 [L, R] 新增的元素个数
        int left_size = tree[tree[v].L].count - tree[tree[u].L].count;

        if (k <= left_size) {
            return query_kth(tree[u].L, tree[v].L, l, mid, k);
        } else {
            return query_kth(tree[u].R, tree[v].R, mid + 1, r, k - left_size);
        }
    }

    // 内部方法：查询值域在 [ql, qr] 范围内的元素个数
    int query_count(int u, int v, int l, int r, int ql, int qr) {
        if (ql <= l && r <= qr) {
            return tree[v].count - tree[u].count;
        }
        int mid = l + (r - l) / 2;
        int res = 0;
        if (ql <= mid) res += query_count(tree[u].L, tree[v].L, l, mid, ql, qr);
        if (qr > mid)  res += query_count(tree[u].R, tree[v].R, mid + 1, r, ql, qr);
        return res;
    }
    
    // 内部方法：查询值域在 [ql, qr] 范围内的元素权值和
    int query_sum(int u, int v, int l, int r, int ql, int qr) {
        if (ql <= l && r <= qr) {
            return tree[v].sum - tree[u].sum;
        }
        int mid = l + (r - l) / 2;
        int res = 0;
        if (ql <= mid) res += query_sum(tree[u].L, tree[v].L, l, mid, ql, qr);
        if (qr > mid)  res += query_sum(tree[u].R, tree[v].R, mid + 1, r, ql, qr);
        return res;
    }

    // 查询原数组区间 [L, R] 中，第 k 小的元素
    int get_kth(int L, int R, int k) {
        return query_kth(roots[L - 1], roots[R], min_val, max_val, k);
    }

    // 查询原数组区间 [L, R] 中，值落在 [val_L, val_R] 的元素个数
    int get_count(int L, int R, int val_L, int val_R) {
        if (val_L > val_R) return 0;
        return query_count(roots[L - 1], roots[R], min_val, max_val, val_L, val_R);
    }
    
    // 查询原数组区间 [L, R] 中，值落在 [val_L, val_R] 的元素权值和
    int get_sum(int L, int R, int val_L, int val_R) {
        if (val_L > val_R) return 0;
        return query_sum(roots[L - 1], roots[R], min_val, max_val, val_L, val_R);
    }
};
```