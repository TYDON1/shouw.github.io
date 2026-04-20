---
title: "莫队模版"
date: "2026-04-20 16:32:27"
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

```cpp
struct MoSolver {
    struct Query {
        int l, r, id, block;
        // 奇偶优化排序
        bool operator<(const Query& other) const {
            if (block != other.block) return block < other.block;
            return (block & 1) ? (r < other.r) : (r > other.r);
        }
    };

    int n, q, block_size;
    vector<int> a;
    vector<Query> queries;
    vector<int> ans;
    vector<int> cnt; // 根据题目需求调整，这里是频次统计
    int curL = 1, curR = 0;
    int current_res = 0;

    // n: 数组大小, q: 询问个数, max_val: 数组中元素的最大可能值（用于开桶）
    MoSolver(int _n, int _q, int max_val) {
        n = _n; q = _q;
        a.resize(n + 1);
        queries.resize(q);
        ans.resize(q);
        cnt.assign(max_val + 1, 0);
        block_size = max(1.0, (double)n / sqrt(max(1.0, (double)q * 2.0 / 3.0))); 
    }

    void add(int idx) {
        int val = a[idx];
        if (cnt[val] == 0) current_res++;
        cnt[val]++;
    }

    void del(int idx) {
        int val = a[idx];
        cnt[val]--;
        if (cnt[val] == 0) current_res--;
    }

    void add_query(int id, int l, int r) {
        queries[id] = {l, r, id, l / block_size};
    }

    void solve() {
        sort(queries.begin(), queries.end());
        for (auto& qry : queries) {
            while (curL > qry.l) add(--curL);
            while (curR < qry.r) add(++curR);
            while (curL < qry.l) del(curL++);
            while (curR > qry.r) del(curR--);
            ans[qry.id] = current_res;
        }
    }
};
```