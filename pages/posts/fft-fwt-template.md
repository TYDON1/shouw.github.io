---
title: "FFT与FWT模版"
date: "2026-11-27 17:46:00"
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

## FFT与FWT模版

包含迭代版 Cooley-Tukey 复数 FFT（任意模数或整数精确卷积）与 FWT 快速沃尔什变换（支持 OR / AND / XOR 位运算卷积）。

```cpp
struct FFT {
    using cd = complex<double>;
    static constexpr double PI = 3.14159265358979323846;

    static void fft(vector<cd>& a, bool inv) {
        int n = a.size();
        for (int i = 1, j = 0; i < n; i++) {
            int bit = n >> 1;
            for (; j & bit; bit >>= 1) j ^= bit;
            j ^= bit;
            if (i < j) swap(a[i], a[j]);
        }
        for (int len = 2; len <= n; len <<= 1) {
            double ang = 2.0 * PI / len * (inv ? -1 : 1);
            cd wlen(cos(ang), sin(ang));
            for (int i = 0; i < n; i += len) {
                cd w(1.0, 0.0);
                for (int j = 0; j < len / 2; j++) {
                    cd u = a[i + j], v = a[i + j + len / 2] * w;
                    a[i + j] = u + v;
                    a[i + j + len / 2] = u - v;
                    w *= wlen;
                }
            }
        }
        if (inv) {
            for (cd& x : a) x /= n;
        }
    }

    static vector<int> multiply(const vector<int>& a, const vector<int>& b) {
        if (a.empty() || b.empty()) return {};
        int tot = (int)a.size() + (int)b.size() - 1, sz = 1;
        while (sz < tot) sz <<= 1;
        vector<cd> fa(sz), fb(sz);
        for (size_t i = 0; i < a.size(); i++) fa[i] = a[i];
        for (size_t i = 0; i < b.size(); i++) fb[i] = b[i];
        fft(fa, false);
        fft(fb, false);
        for (int i = 0; i < sz; i++) fa[i] *= fb[i];
        fft(fa, true);
        vector<int> res(tot);
        for (int i = 0; i < tot; i++) res[i] = llround(fa[i].real());
        return res;
    }
};

// FWT 快速沃尔什变换：支持 OR / AND / XOR 位运算卷积（长度须为 2 的幂）
struct FWT {
    static constexpr int MOD = 998244353;
    static constexpr int INV2 = (MOD + 1) / 2;

    static void fwt_or(vector<int>& a, bool inv) {
        int n = a.size();
        for (int len = 1; len < n; len <<= 1) {
            for (int i = 0; i < n; i += len << 1) {
                for (int j = 0; j < len; j++) {
                    if (!inv) a[i + j + len] = (a[i + j + len] + a[i + j]) % MOD;
                    else a[i + j + len] = (a[i + j + len] - a[i + j] + MOD) % MOD;
                }
            }
        }
    }

    static void fwt_and(vector<int>& a, bool inv) {
        int n = a.size();
        for (int len = 1; len < n; len <<= 1) {
            for (int i = 0; i < n; i += len << 1) {
                for (int j = 0; j < len; j++) {
                    if (!inv) a[i + j] = (a[i + j] + a[i + j + len]) % MOD;
                    else a[i + j] = (a[i + j] - a[i + j + len] + MOD) % MOD;
                }
            }
        }
    }

    static void fwt_xor(vector<int>& a, bool inv) {
        int n = a.size();
        for (int len = 1; len < n; len <<= 1) {
            for (int i = 0; i < n; i += len << 1) {
                for (int j = 0; j < len; j++) {
                    int u = a[i + j], v = a[i + j + len];
                    a[i + j] = (u + v) % MOD;
                    a[i + j + len] = (u - v + MOD) % MOD;
                    if (inv) {
                        a[i + j] = a[i + j] * INV2 % MOD;
                        a[i + j + len] = a[i + j + len] * INV2 % MOD;
                    }
                }
            }
        }
    }

    // op: 0 = OR, 1 = AND, 2 = XOR
    static vector<int> conv(vector<int> a, vector<int> b, int op) {
        int n = a.size();
        auto trans = [&](vector<int>& v, bool inv) {
            if (op == 0) fwt_or(v, inv);
            else if (op == 1) fwt_and(v, inv);
            else fwt_xor(v, inv);
        };
        trans(a, false);
        trans(b, false);
        for (int i = 0; i < n; i++) a[i] = a[i] * b[i] % MOD;
        trans(a, true);
        return a;
    }
};
```
