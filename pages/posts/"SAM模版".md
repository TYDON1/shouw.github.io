---
title: "SAM模版"
date: "2026-03-30 15:46:18"
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
struct SAM {
    struct State {

        int len, link;
        int next[26];
        int count;

        State() {
            len = 0;
            link = -1;
            count = 0;
            for (int i = 0; i < 26; i++) next[i] = 0;
        }
    };

    vector<State> st;
    int last;

    SAM(int n) {
        st.reserve(2 * n);
        st.emplace_back(); 
        last = 0;
    }

    void extend(char c) {
        int cur = st.size();
        st.emplace_back();
        st[cur].len = st[last].len + 1;
        st[cur].count = 1;
        
        int p = last;
        while (p != -1 && !st[p].next[c - 'a']) {
            st[p].next[c - 'a'] = cur;
            p = st[p].link;
        }

        if (p == -1) {
            st[cur].link = 0;
        } else {
            int q = st[p].next[c - 'a'];
            if (st[p].len + 1 == st[q].len) {
                st[cur].link = q;
            } else {
                int clone = st.size();
                st.push_back(st[q]);
                st[clone].len = st[p].len + 1;
                st[clone].count = 0;
                while (p != -1 && st[p].next[c - 'a'] == q) {
                    st[p].next[c - 'a'] = clone;
                    p = st[p].link;
                }
                st[q].link = st[cur].link = clone;
            }
        }
        last = cur;
    }

    void calc_count() {
        int n = st.size();
        vector<int> cnt(st[last].len + 1, 0);
        vector<int> ord(n);

        for (int i = 0; i < n; i++) cnt[st[i].len]++;
        for (int i = 1; i <= st[last].len; i++) cnt[i] += cnt[i - 1];
        for (int i = 0; i < n; i++) ord[--cnt[st[i].len]] = i;

        for (int i = n - 1; i > 0; i--) {
            int u = ord[i];
            st[st[u].link].count += st[u].count;
        }
    }

    int total_distinct_substrings() {
        int res = 0;
        for (int i = 1; i < st.size(); i++) {
            res += st[i].len - st[st[i].link].len;
        }
        return res;
    }

};
```