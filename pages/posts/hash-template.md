---
title: "哈希模版"
date: "2026-03-30 12:53:41"
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
struct DoubleHash {
    static const int M1 = 1e9 + 7, M2 = 1e9 + 9;
    static int b1, b2;
    static vector<int> p1, p2;
    vector<int> h1, h2;

    static void init(int n) {
        if (!b1) {
            mt19937 rng(chrono::steady_clock::now().time_since_epoch().count());
            b1 = rng() % (M1 - 131) + 131;
            b2 = rng() % (M2 - 13331) + 13331;
        }
        if (p1.empty()) { p1.assign(1, 1); p2.assign(1, 1); }
        while (p1.size() <= n) {
            p1.push_back(p1.back() * b1 % M1);
            p2.push_back(p2.back() * b2 % M2);
        }
    }

    template<typename T>
    DoubleHash(const T& s) {
        int n = s.size();
        init(n);
        h1.assign(n + 1, 0); h2.assign(n + 1, 0);
        for (int i = 0; i < n; i++) {
            h1[i + 1] = (h1[i] * b1 + s[i]) % M1;
            h2[i + 1] = (h2[i] * b2 + s[i]) % M2;
        }
    }

    int get(int l, int r) {
        int v1 = (h1[r + 1] - h1[l] * p1[r - l + 1] % M1 + M1) % M1;
        int v2 = (h2[r + 1] - h2[l] * p2[r - l + 1] % M2 + M2) % M2;
        return (v1 << 32) | v2;
    }
};

int DoubleHash::b1 = 0;
int DoubleHash::b2 = 0;
vector<int> DoubleHash::p1;
vector<int> DoubleHash::p2;
```