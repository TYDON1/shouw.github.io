---
title: "PAM模版"
date: "2026-08-27 22:36:52"
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

## PAM模版

```cpp
struct PAM {
    struct State {
        int len, fail;
        int next[26];
        int occ; // 该回文串的出现次数，需调用 calc_occ 后才准确
        int suf; // 该回文串的回文后缀个数（含自身），构造时直接得到

        State() {
            len = 0;
            fail = 0;
            occ = 0;
            suf = 0;
            for (int i = 0; i < 26; i++) next[i] = 0;
        }
    };

    vector<State> st;
    string s;
    int last, n;

    // 0 号节点为奇根 (len = -1)，1 号节点为偶根 (len = 0)
    PAM() {
        st.resize(2);
        st[0].len = -1;
        st[0].fail = 0;
        st[1].len = 0;
        st[1].fail = 0;
        last = 1;
        n = 0;
        s = "$"; // 哨兵字符，避免越界
    }

    int get_fail(int x) {
        while (s[n - st[x].len - 1] != s[n]) x = st[x].fail;
        return x;
    }

    void extend(char c) {
        s += c;
        n++;
        int idx = c - 'a';
        int cur = get_fail(last);
        if (!st[cur].next[idx]) {
            int now = st.size();
            st.emplace_back();
            st[now].len = st[cur].len + 2;
            st[now].fail = (st[now].len == 1) ? 1 : st[get_fail(st[cur].fail)].next[idx];
            st[now].suf = st[st[now].fail].suf + 1;
            st[cur].next[idx] = now;
        }
        last = st[cur].next[idx];
        st[last].occ++;
    }

    // fail 树上索引天然满足 fail[i] < i，直接倒序累加即可，无需拓扑排序
    void calc_occ() {
        for (int i = st.size() - 1; i >= 2; i--) {
            st[st[i].fail].occ += st[i].occ;
        }
    }

    // 本质不同的回文串个数（不含两个根节点）
    int distinct_palindromes() {
        return st.size() - 2;
    }
};
```
