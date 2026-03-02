---
title: "Atc的DP专训"
date: "2026-03-02 14:45:14"
author: shouw
katex: true
categories:
  - 模版
email: KijinSeija@shouw.blog
readmore: true
tags:
  - 题解
---

## Atc的DP专训

### A
```cpp
// A - Frog 1

#include <bits/stdc++.h>
#define int long long
#define endl "\n"

using namespace std;

void solve() {

    int n;
    cin >> n;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    vector<int> dp(n + 1, LLONG_MAX);
    dp[1] = 0;
    dp[2] = abs(a[2] - a[1]);
    for (int i = 3; i <= n; i++) {
        dp[i] = min(dp[i - 2] + abs(a[i] - a[i - 2]), dp[i - 1] + abs(a[i] - a[i - 1]));
    }

    cout << dp[n] << endl;
    
}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
}
```

### B
```cpp
// B - Frog 2

#include <bits/stdc++.h>
#define int long long
#define endl "\n"

using namespace std;

void solve() {

    int n, k;
    cin >> n >> k;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    k = min(k, n);
    vector<int> dp(n + 1, LLONG_MAX);
    dp[1] = 0;
    for (int i = 2; i <= k; i++) {
        for (int j = 1; j < i; j++) {
            dp[i] = min(dp[i], dp[i - j] + abs(a[i - j] - a[i]));
        }
    }

    for (int i = k + 1; i <= n; i++) {
        for (int j = 1; j <= k; j++) {
            dp[i] = min(dp[i], dp[i - j] + abs(a[i - j] - a[i]));
        }
    }

    cout << dp[n] << endl;
    
}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
}
```

### C
```cpp
// C - Vacation

#include <bits/stdc++.h>
#define int long long
#define endl "\n"

using namespace std;

void solve() {

    int n;
    cin >> n;
    vector<vector<int>> a(n + 1, vector<int>(4));
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= 3; j++) cin >> a[i][j];
    }

    vector<vector<int>> dp(n + 1, vector<int>(4));
    for (int i = 1; i <= n; i++) {
        dp[i][1] = max(dp[i - 1][2] + a[i][1], dp[i - 1][3] + a[i][1]);
        dp[i][2] = max(dp[i - 1][1] + a[i][2], dp[i - 1][3] + a[i][2]);
        dp[i][3] = max(dp[i - 1][1] + a[i][3], dp[i - 1][2] + a[i][3]);
    }

    cout << max({dp[n][1], dp[n][2], dp[n][3]}) << endl;
    
}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
}
```

### D
```cpp
// D - Knapsack 1

#include <bits/stdc++.h>
#define int long long
#define endl "\n"

using namespace std;

void solve() {

    int n, s;
    cin >> n >> s;
    vector<pair<int, int>> v(n + 1);
    for (int i = 1; i <= n; i++) {
        cin >> v[i].first >> v[i].second;
    }

    vector<int> dp(s + 1);
    for (auto it : v) {
        int w = it.first, x = it.second;
        for (int i = s; i >= 0; i--) {
            if (i - w < 0) break;
            dp[i] = max(dp[i], dp[i - w] + x);
        }
    }

    cout << dp[s] << endl;
    
}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
}
```

### E
```cpp
// E - Knapsack 2

#include <bits/stdc++.h>
#define int long long
#define endl "\n"

using namespace std;

const int N = 1e5 + 10;

void solve() {

    int n, s;
    cin >> n >> s;
    vector<pair<int, int>> v(n + 1);
    for (int i = 1; i <= n; i++) {
        cin >> v[i].first >> v[i].second;
    }

    vector<bool> dp(N, false);
    vector<int> ws(N, LLONG_MAX);
    ws[0] = 0LL;
    dp[0] = true;
    for (auto it : v) {
        int w = it.first, x = it.second;
        for (int i = N - 1; i >= 0; i--) {
            if (i - x < 0) break;
            if (dp[i - x]) {
                ws[i] = min(ws[i], ws[i - x] + w);
                if (ws[i] <= s) {
                    dp[i] = true;
                }
            }
        }
    }

    int ans = 0;
    for (int i = 0; i < N; i++) {
        if (dp[i]) {
            ans = i;
        }
    }

    cout << ans << endl;

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;

    while (t--) {
        solve();
    }

}
```

### F
```cpp
// F - LCS

#include <bits/stdc++.h>
#define int long long
#define endl "\n"

using namespace std;

void solve() {

    string s1, s2;
    cin >> s1 >> s2;
    int s1_n = s1.length();
    int s2_n = s2.length();
    vector<vector<int>> dp(s1_n + 1, vector<int>(s2_n + 1));

    for (int i = 1; i <= s1_n; i++) {
        for (int j = 1; j <= s2_n; j++) {
            if (s1[i - 1] == s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    string res;

    int i = s1_n, j = s2_n;
    while (i > 0 && j > 0) {
        if (s1[i - 1] == s2[j - 1]) {
            res += s1[i - 1];
            i--;
            j--;
        } else {
            if (dp[i - 1][j] >= dp[i][j - 1]) {
                i--;
            } else {
                j--;
            }
        }
    }

    reverse(res.begin(), res.end());
    cout << res << endl;
    
}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
}
```

### G
```cpp
// G - Longest Path

#include <bits/stdc++.h>
#define int long long
#define endl "\n"

using namespace std;

int ans = 0;
int dfs(int d, vector<vector<int>> &g, vector<int> &deepest) {
    if (deepest[d] != -1) return deepest[d];

    int best = 0;
    for (auto it : g[d]) {
        best = max(best, dfs(it, g, deepest) + 1);
    }

    deepest[d] = best;
    ans = max(ans, deepest[d]);
    return deepest[d];

}

void solve() {

    int n, m;
    cin >> n >> m;
    vector<int> deepest(n + 1, -1);
    vector<vector<int>> g(n + 1);

    for (int i = 1; i <= m; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
    }

    for (int i = 1; i <= n; i++) {
        dfs(i, g, deepest);
    }
    cout << ans << endl;

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
}
```

### H
```cpp
// H - Grid 1

#include <bits/stdc++.h>
#define int long long
#define endl "\n"

using namespace std;

const int MOD = 1e9 + 7;

int n, m;

void dfs(int x, int y, vector<vector<char>> &g, vector<vector<int>> &ans, vector<vector<bool>> &memo) {

    if (memo[x][y]) {
        return;
    }

    if (x + 1 <= n && g[x + 1][y] != '#') {
        dfs(x + 1, y, g, ans, memo);
    }

    if (y + 1 <= m && g[x][y + 1] != '#') {
        dfs(x, y + 1, g, ans, memo);
    }

    ans[x][y] = max(ans[x][y], ans[x][y + 1] + ans[x + 1][y]) % MOD;
    memo[x][y] = true;

}

void solve() {

    cin >> n >> m;
    vector<vector<int>> ans(n + 2, vector<int>(m + 2, 0));
    ans[n][m] = 1;
    vector<vector<bool>> memo(n + 2, vector<bool>(m + 2, false));
    vector<vector<char>> g(n + 2, vector<char>(m + 2, '#'));
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            cin >> g[i][j];
        }
    }

    dfs(1, 1, g, ans, memo);

    cout << ans[1][1] % MOD << endl;
    
}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
}
```

### I
```cpp
// I - Coins

#include <bits/stdc++.h>
#define int long long
#define db double
#define endl "\n"

using namespace std;

db dp[3005][3005];
db p[3005];

void solve() {

    int n;
    cin >> n;

    for (int i = 1; i <= n; i++) cin >> p[i];

    dp[0][0] = 1.0;

    for (int i = 1; i <= n; i++) {
        for (int j = 0; j <= i; j++) {
            if (j > 0) {
                dp[i][j] += dp[i - 1][j - 1] * p[i];
            }
            dp[i][j] += dp[i - 1][j] * (1.0 - p[i]);
        }
    }

    db ans = 0;
    for (int j = n / 2 + 1; j <= n; j++) {
        ans += dp[n][j];
    }
    cout << fixed << setprecision(10) << ans << endl;

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
}
```

### J
```cpp
// J - Sushi

#include <bits/stdc++.h>
#define int long long
#define db double
#define endl "\n"

using namespace std;

db memo[305][305][305];
bool vis[305][305][305];
int N;

db dfs(int c1, int c2, int c3) {

    if (c1 == 0 && c2 == 0 && c3 == 0) return 0.0;

    if (vis[c1][c2][c3]) return memo[c1][c2][c3];

    int sum = c1 + c2 + c3;
    db res = (db)N;

    if (c1 > 0) res += c1 * dfs(c1 - 1, c2, c3);
    if (c2 > 0) res += c2 * dfs(c1 + 1, c2 - 1, c3);
    if (c3 > 0) res += c3 * dfs(c1, c2 + 1, c3 - 1);

    res /= (db)sum;

    vis[c1][c2][c3] = true;
    return memo[c1][c2][c3] = res;
}

void solve() {

    cin >> N;

    int cnt[4] = {0};
    for (int i = 0; i < N; i++) {
        int x; cin >> x;
        cnt[x]++;
    }
    cout << fixed << setprecision(20) << dfs(cnt[1], cnt[2], cnt[3]) << endl;

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
}
```

### K
```cpp
// K - Stones

#include <bits/stdc++.h>
#define int long long
#define db double
#define endl "\n"

using namespace std;

int n, k;
int a[110];
int memo[100010];

int dfs(int rem) {

    if (memo[rem] != -1) return memo[rem];

    for (int i = 0; i < n; i++) {
        if (rem >= a[i]) {
            if (!dfs(rem - a[i])) {
                return memo[rem] = 1;
            }
        }
    }
    return memo[rem] = 0;

}

void solve() {

    cin >> n >> k;
    for (int i = 0; i < n; i++) cin >> a[i];

    memset(memo, -1, sizeof(memo));

    if (dfs(k)) {
        cout << "First" << endl;
    } else {
        cout << "Second" << endl;
    }

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
}
```

### L
```cpp
// L - Deque

#include <bits/stdc++.h>
#define int long long
#define db double
#define endl "\n"

using namespace std;

const int N = 3e3 + 10;
vector<vector<int>> dp(N, vector<int>(N));

void solve() {

    int n;
    cin >> n;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];

    for (int i = 1; i <= n; i++) {
        dp[i][i] = a[i];
    }

    for (int i = 2; i <= n; i++) {
        for (int j = 1; j <= n - i + 1; j++) {
            int p = j + i - 1;
            dp[j][p] = max(a[j] - dp[j + 1][p], a[p] - dp[j][p - 1]);
        }
    }

    cout << dp[1][n] << endl;
    
}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
}
```

### M
```cpp
// M - Candies

#include <bits/stdc++.h>
#define int long long
#define db double
#define endl "\n"

using namespace std;

const int MOD = 1e9 + 7;

void solve() {
    
    int n, k;
    cin >> n >> k;
    vector<int> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];

    vector<int> dp(k + 1, 0);
    dp[0] = 1;

    for (int i = 1; i <= n; i++) {

        vector<int> sum(k + 2, 0);
        for (int j = 0; j <= k; j++) {
            sum[j + 1] = (sum[j] + dp[j]) % MOD;
        }

        for (int j = 0; j <= k; j++) {
            int l = max(0LL, j - a[i]);
            int r = j;
            dp[j] = (sum[r + 1] - sum[l] + MOD) % MOD;
        }

    }
    cout << dp[k] << endl;

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
}
```

### N
```cpp
// N - Slimes

#include <bits/stdc++.h>
#define int long long
#define db double
#define endl "\n"

using namespace std;

int n;
int a[410];
int s[410];
int dp[410][410];

void solve() {

    cin >> n;

    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        s[i] = s[i - 1] + a[i];
    }

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if (i == j) dp[i][j] = 0;
            else dp[i][j] = 1e18;
        }
    }

    for (int len = 2; len <= n; len++) {
        for (int i = 1; i <= n - len + 1; i++) {
            int j = i + len - 1;
            int cost = s[j] - s[i - 1];
            for (int k = i; k < j; k++) {
                dp[i][j] = min(dp[i][j], dp[i][k] + dp[k + 1][j] + cost);
            }
        }
    }
    cout << dp[1][n] << endl;

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
}
```

### O
```cpp
// O - Matching

#include <bits/stdc++.h>
#define int long long
#define db double
#define endl "\n"

using namespace std;

const int MOD = 1e9 + 7;
int a[22][22];
int dp[1 << 21];

void solve() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cin >> a[i][j];
        }
    }

    dp[0] = 1;

    for (int s = 0; s < 1 << n; s++) {
        int i = __builtin_popcount(s);

        for (int j = 0; j < n; j++) {
            if (a[i][j] && !(s & (1 << j))) {
                int next_s = s | (1 << j);
                dp[next_s] = (dp[next_s] + dp[s]) % MOD;
            }
        }
    }
    cout << dp[(1 << n) - 1] << endl;

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
}
```

### P
```cpp
// P - Independent Set

#include <bits/stdc++.h>
#define int long long
#define db double
#define endl "\n"

using namespace std;

const int MOD = 1e9 + 7;

void dfs(int pre, int cur, vector<vector<int>> &g, vector<pair<int, int>> &f) {

    f[cur].first = 1;
    f[cur].second = 1;

    for (auto it : g[cur]) {

        if (it == pre) continue;
        dfs(cur, it, g, f);
        f[cur].first = (f[cur].first * (f[it].first + f[it].second)) % MOD;
        f[cur].second = (f[cur].second * f[it].first) % MOD;

    }

}



void solve() {

    int n;
    cin >> n;
    vector<vector<int>> g(n + 1);
    for (int i = 1; i < n; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }

    g[1].push_back(0);
    g[0].push_back(1);

    vector<pair<int, int>> all(n + 1);
    all[1].first = 1;
    all[1].second = 1;

    dfs(0, 1, g, all);

    int ans = (all[1].first + all[1].second) % MOD;
    cout << ans << endl;

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
}
```

### Q
```cpp
// Q - Flowers

#include <bits/stdc++.h>
#define int long long
#define db double
#define endl "\n"

using namespace std;

const int N = 2e5 + 10;
int bit[N];
int n;

void update(int x, int val) {
    for (; x <= n; x += x & -x) {
        bit[x] = max(bit[x], val);
    }
}

int query(int x) {
    int res = 0;
    for (; x > 0; x -= x & -x) {
        res = max(res, bit[x]);
    }
    return res;
}

void solve() {

    cin >> n;
    vector<int> h(n + 1), v(n + 1);
    for (int i = 1; i <= n; i++) cin >> h[i];
    for (int i = 1; i <= n; i++) cin >> v[i];

    int ans = 0;
    for (int i = 1; i <= n; i++) {
        int best_prev = query(h[i] - 1);

        int cur = best_prev + v[i];

        update(h[i], cur);

        ans = max(ans, cur);
    }
    cout << ans << endl;

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;

    while (t--) {
        solve();
    }

}
```

### R
```cpp
// R - Walk

#include <bits/stdc++.h>
#define int long long
#define db double
#define endl "\n"

using namespace std;

const int MOD = 1e9 + 7;

int n, k;

vector<vector<int>> matrix_cal(vector<vector<int>> &pre_mat, vector<vector<int>> &cur_mat) {

    vector<vector<int>> ans(n + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if (pre_mat[i][j] == 0) continue;
            for (int p = 1; p <= n; p++) {
                ans[i][p] = ans[i][p] + pre_mat[i][j] * cur_mat[j][p];
                ans[i][p] %= MOD;
            }
        }
    }
    return ans;

}

vector<vector<int>> quick_power(vector<vector<int>> &now, int pow) {

    vector<vector<int>> ans(n + 1, vector<int>(n + 1));
    for (int i = 1; i <= n; i++) {
        ans[i][i] = 1;
    }

    while (pow) {

        if (pow & 1) {
            ans = matrix_cal(ans, now);
        }
        now = matrix_cal(now, now);
        pow >>= 1;

    }

    return ans;

}

void solve() {

    cin >> n >> k;
    vector<vector<int>> mat(n + 1, vector<int>(n + 1));
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            cin >> mat[i][j];
        }
    }

    int ans = 0;
    vector<vector<int>> ans_v = quick_power(mat, k);

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            ans += ans_v[i][j];
            ans %= MOD;
        }
    }
    cout << ans << endl;

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
}
```

### S
```cpp
// S - Digit Sum

#include <bits/stdc++.h>
#define int long long
#define db double
#define endl "\n"

using namespace std;

const int MOD = 1e9 + 7;
string K;
int D;
int memo[10005][105][2];

int dfs(int pos, int rem, bool lmt) {

    if (pos == K.length()) {
        return !rem;
    }

    if (memo[pos][rem][lmt] != -1) {
        return memo[pos][rem][lmt];
    }

    int res = 0;
    int up = lmt ? K[pos] - '0' : 9;

    for (int d = 0; d <= up; d++) {
        res += dfs(pos + 1, (rem + d) % D, lmt && (d == up));
        res %= MOD;
    }
    return memo[pos][rem][lmt] = res;

}

void solve() {

    cin >> K >> D;

    memset(memo, -1, sizeof(memo));

    int ans = dfs(0, 0, true);

    ans = (ans - 1 + MOD) % MOD;
    cout << ans << endl;

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
}
```

### T
```cpp
// T - Permutation

#include <bits/stdc++.h>
#define int long long
#define db double
#define endl "\n"

using namespace std;

const int MOD = 1e9 + 7;

void solve() {

    int n;
    string s;
    cin >> n >> s;

    vector<vector<int>> dp(n + 1, vector<int>(n + 1, 0));

    dp[1][1] = 1;

    for (int i = 1; i < n; i++) {
        vector<int> sum(i + 1, 0);
        for (int j = 1; j <= i; j++) {
            sum[j] = (sum[j - 1] + dp[i][j]) % MOD;
        }

        for (int k = 1; k <= i + 1; k++) {
            if (s[i - 1] == '<') {
                dp[i + 1][k] = sum[k - 1];
            } else {
                dp[i + 1][k] = (sum[i] - sum[k - 1] + MOD) % MOD;
            }
        }
    }

    int ans = 0;
    for (int j = 1; j <= n; j++) {
        ans = (ans + dp[n][j]) % MOD;
    }
    cout << ans << endl;

}

signed main() {

    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int t = 1;
    // cin >> t;
    
    while (t--) {
        solve();
    }
    
}
```