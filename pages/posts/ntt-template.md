---
title: "NTT模版"
date: "2026-08-27 20:03:11"
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

## NTT模版

```cpp
struct NTT {
    const int MOD = 998244353;
    const int G = 3;
    int qpow(int a, int b) {
        int res = 1;
        while (b > 0) {
            if (b & 1) res = res * a % MOD;
            a = a * a % MOD;
            b >>= 1;
        }
        return res;
    }
    vector<int> rev, rt;
    void init(int n) {
        if (sz(rev) == n) return;
        rev.resize(n);
        for (int i = 0; i < n; i++) {
            rev[i] = (rev[i >> 1] >> 1) | ((i & 1) * (n >> 1));
        }
        if (rt.empty()) {
            rt = {1, 1};
        }
        for (int k = rt.size(); k < n; k *= 2) {
            rt.resize(k * 2);
            int z = qpow(G, (MOD - 1) / (k * 2));
            for (int i = k / 2; i < k; i++) {
                rt[2 * i] = rt[i];
                rt[2 * i + 1] = rt[i] * z % MOD;
            }
        }
    }
    void transform(vector<int>& a, bool inv) {
        int n = sz(a);
        init(n);
        for (int i = 0; i < n; i++) {
            if (i < rev[i]) swap(a[i], a[rev[i]]);
        }
        for (int k = 1; k < n; k *= 2) {
            for (int i = 0; i < n; i += 2 * k) {
                for (int j = 0; j < k; j++) {
                    int u = a[i + j];
                    int v = a[i + j + k] * rt[k + j] % MOD;
                    a[i + j] = u + v >= MOD ? u + v - MOD : u + v;
                    a[i + j + k] = u - v < 0 ? u - v + MOD : u - v;
                }
            }
        }
        if (inv) {
            reverse(a.begin() + 1, a.end());
            int inv_n = qpow(n, MOD - 2);
            for (int& x : a) x = x * inv_n % MOD;
        }
    }
    vector<int> multiply(const vector<int>& A, const vector<int>& B) {
        if (A.empty() || B.empty()) return {};
        int tot = A.size() + B.size() - 1;
        int sz = 1;
        while (sz < tot) sz <<= 1;
        vector<int> a = A, b = B;
        a.resize(sz);
        b.resize(sz);
        transform(a, false);
        transform(b, false);
        for (int i = 0; i < sz; i++) {
            a[i] = a[i] * b[i] % MOD;
        }
        transform(a, true);
        a.resize(tot);
        return a;
    }
};
```
