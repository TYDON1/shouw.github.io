---
title: "AC自动机模版"
date: "2026-03-30 18:17:12"
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
struct AC {
    struct Node {
        int next[26];
        int fail;
        int count;
        Node() {
            for (int i = 0; i < 26; i++) next[i] = 0;
            fail = 0;
            count = 0;
        }
    };

    vector<Node> trie;

    AC() { trie.emplace_back(); }

    void insert(const string& s) {
        int u = 0;
        for (char c : s) {
            int v = c - 'a';
            if (!trie[u].next[v]) {
                trie[u].next[v] = trie.size();
                trie.emplace_back();
            }
            u = trie[u].next[v];
        }
        trie[u].count++;
    }

    void build() {
        queue<int> q;
        for (int i = 0; i < 26; i++) {
            if (trie[0].next[i]) q.push(trie[0].next[i]);
        }
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int i = 0; i < 26; i++) {
                if (trie[u].next[i]) {
                    trie[trie[u].next[i]].fail = trie[trie[u].fail].next[i];
                    q.push(trie[u].next[i]);
                } else {
                    trie[u].next[i] = trie[trie[u].fail].next[i];
                }
            }
        }
    }

    int query(const string& t) {
        int u = 0, res = 0;
        for (char c : t) {
            u = trie[u].next[c - 'a'];
            for (int j = u; j && trie[j].count != -1; j = trie[j].fail) {
                res += trie[j].count;
                trie[j].count = -1;
            }
        }
        return res;
    }
};
```