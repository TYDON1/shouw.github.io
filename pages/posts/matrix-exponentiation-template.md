---
title: "矩阵快速幂模版"
date: "2026-03-31 15:50:10"
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
struct Matrix {

    int r, c;
    vector<vector<int>> m;

    Matrix(int _r = 2, int _c = 2) : r(_r), c(_c) {
        m.assign(r, vector<int>(c, 0));
    }

    static Matrix identity(int sz) {
        Matrix res(sz, sz);
        for (int i = 0; i < sz; i++) res.m[i][i] = 1;
        return res;
    }

    Matrix operator*(const Matrix& b) const {
        Matrix res(r, b.c);
        for (int i = 0; i < r; i++) {
            for (int k = 0; k < c; k++) {
                if (m[i][k] == 0) continue;
                for (int j = 0; j < b.c; j++) {
                    res.m[i][j] = (res.m[i][j] + m[i][k] * b.m[k][j]) % MOD;
                }
            }
        }
        return res;
    }

    Matrix pow(int n) {
        Matrix res = Matrix::identity(r);
        Matrix a = *this;
        while (n > 0) {
            if (n & 1) res = res * a;
            a = a * a;
            n >>= 1;
        }
        return res;
    }
    
};
```