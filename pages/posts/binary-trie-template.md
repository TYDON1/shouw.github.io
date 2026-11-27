---
title: "01-Trie模版"
date: "2026-11-27 16:12:25"
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

## 01-Trie模版

支持插入、删除、查询与 `x` 的最大/最小异或值，以及统计集合中满足 `y ^ x < limit` 的元素个数。

```cpp
struct BinaryTrie {
    struct Node {
        int ch[2] = {0, 0};
        int cnt = 0; // 经过该节点的数字个数
    };

    int MAXB;
    vector<Node> tr;

    BinaryTrie(int max_bit = 30, int reserve_nodes = 0) : MAXB(max_bit) {
        if (reserve_nodes > 0) tr.reserve(reserve_nodes);
        tr.emplace_back(); // 0 号为根节点
    }

    // delta = +1 插入，delta = -1 删除
    void update(int x, int delta) {
        int u = 0;
        tr[u].cnt += delta;
        for (int i = MAXB; i >= 0; i--) {
            int b = (x >> i) & 1;
            if (!tr[u].ch[b]) {
                tr[u].ch[b] = tr.size();
                tr.emplace_back();
            }
            u = tr[u].ch[b];
            tr[u].cnt += delta;
        }
    }

    void insert(int x) { update(x, 1); }
    void erase(int x) { update(x, -1); }

    // 查询集合中与 x 异或的最大值（集合非空）
    int max_xor(int x) const {
        int u = 0, res = 0;
        for (int i = MAXB; i >= 0; i--) {
            int b = (x >> i) & 1;
            int want = b ^ 1;
            if (tr[u].ch[want] && tr[tr[u].ch[want]].cnt > 0) {
                res |= (1LL << i);
                u = tr[u].ch[want];
            } else {
                u = tr[u].ch[b];
            }
        }
        return res;
    }

    // 查询集合中与 x 异或的最小值（集合非空）
    int min_xor(int x) const {
        int u = 0, res = 0;
        for (int i = MAXB; i >= 0; i--) {
            int b = (x >> i) & 1;
            if (tr[u].ch[b] && tr[tr[u].ch[b]].cnt > 0) {
                u = tr[u].ch[b];
            } else {
                res |= (1LL << i);
                u = tr[u].ch[b ^ 1];
            }
        }
        return res;
    }

    // 统计集合中有多少个 y 满足 (y ^ x) < limit
    int count_less(int x, int limit) const {
        int u = 0, res = 0;
        for (int i = MAXB; i >= 0; i--) {
            int bx = (x >> i) & 1;
            int bl = (limit >> i) & 1;
            if (bl == 1) {
                // 让该位异或为 0（严格小于 limit），累加对应子树
                if (tr[u].ch[bx]) res += tr[tr[u].ch[bx]].cnt;
                u = tr[u].ch[bx ^ 1];
            } else {
                u = tr[u].ch[bx];
            }
            if (!u || tr[u].cnt == 0) break;
        }
        return res;
    }
};
```
