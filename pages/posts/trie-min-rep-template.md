---
title: "Trie字典树与最小表示法模版"
date: "2026-11-27 17:14:40"
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

## Trie字典树与最小表示法模版

封装小写字母字典树（支持插入、删除、精确统计、前缀统计）以及线性时间求字符串循环同构最小表示法。

```cpp
struct Trie {
    struct Node {
        int ch[26] = {};
        int pass = 0, end = 0;
    };

    vector<Node> tr;

    Trie(int reserve_nodes = 0) {
        if (reserve_nodes > 0) tr.reserve(reserve_nodes);
        tr.emplace_back();
    }

    void insert(const string& s) {
        int u = 0;
        tr[u].pass++;
        for (char c : s) {
            int id = c - 'a';
            if (!tr[u].ch[id]) {
                tr[u].ch[id] = tr.size();
                tr.emplace_back();
            }
            u = tr[u].ch[id];
            tr[u].pass++;
        }
        tr[u].end++;
    }

    int count_exact(const string& s) const {
        int u = 0;
        for (char c : s) {
            int id = c - 'a';
            if (!tr[u].ch[id]) return 0;
            u = tr[u].ch[id];
        }
        return tr[u].end;
    }

    int count_prefix(const string& s) const {
        int u = 0;
        for (char c : s) {
            int id = c - 'a';
            if (!tr[u].ch[id]) return 0;
            u = tr[u].ch[id];
        }
        return tr[u].pass;
    }
};

// O(n) 求字符串 s 的循环同构最小表示的起始下标
int min_representation(const string& s) {
    int n = s.size();
    int i = 0, j = 1, k = 0;
    while (i < n && j < n && k < n) {
        char a = s[(i + k) % n], b = s[(j + k) % n];
        if (a == b) {
            k++;
        } else {
            if (a > b) i += k + 1;
            else j += k + 1;
            if (i == j) j++;
            k = 0;
        }
    }
    return min(i, j);
}
```
