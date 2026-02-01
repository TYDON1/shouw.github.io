import{_ as f}from"./ValaxyMain.vue_vue_type_style_index_0_lang.BSCzw40Z.js";import{e as d,u as v,a as y}from"./chunks/vue-router.DovaHd8B.js";import{ab as g,aq as l,ak as p,af as n,ah as s,B as _,aa as h,D as x}from"./framework.BL_Vg4VX.js";import"./app.DX4bNN5t.js";import"./chunks/dayjs.BdcnXKr1.js";import"./chunks/vue-i18n.umiMoLsd.js";import"./chunks/pinia.D2eK2DmZ.js";/* empty css                    */import"./chunks/@vueuse/motion.z1QilgpX.js";import"./chunks/nprogress.Bru8d7fl.js";import"./YunComment.vue_vue_type_style_index_0_lang.DdOpPsza.js";import"./index.C5okkQwF.js";import"./YunPageHeader.vue_vue_type_script_setup_true_lang.BAng1Vn4.js";import"./post.G6gnYidw.js";const b=d('/posts/"线段树模版"',async e=>JSON.parse('{"title":"线段树模版","description":"","frontmatter":{"title":"线段树模版","date":"2025-02-01 13:49:13","author":"shouw","katex":true,"email":"KijinSeija@shouw.blog","readmore":true,"tags":["编程","算法竞赛","模版"]},"headers":[],"relativePath":"pages/posts/\\"线段树模版\\".md","lastUpdated":1769925087000}'),{lazy:(e,i)=>e.name===i.name}),U={__name:'"线段树模版"',setup(e,{expose:i}){const{data:u}=b(),r=y(),o=v(),t=Object.assign(o.meta.frontmatter||{},u.value?.frontmatter||{});return r.currentRoute.value.data=u.value,x("valaxy:frontmatter",t),globalThis.$frontmatter=t,i({frontmatter:{title:"线段树模版",date:"2025-02-01 13:49:13",author:"shouw",katex:!0,email:"KijinSeija@shouw.blog",readmore:!0,tags:["编程","算法竞赛","模版"]}}),(a,c)=>{const m=f;return h(),g(m,{frontmatter:_(t)},{"main-content-md":l(()=>[...c[0]||(c[0]=[n("h2",{id:"线段树模版",tabindex:"-1"},[s("线段树模版 "),n("a",{class:"header-anchor",href:"#线段树模版","aria-label":'Permalink to "线段树模版"'},"​")],-1),n("div",{class:"language-"},[n("button",{title:"Copy code",class:"copy"}),n("span",{class:"lang"}),n("pre",{class:"shiki shiki-themes github-light github-dark vp-code"},[n("code",{"v-pre":""},[n("span",{class:"line"},[n("span",null,"#include <bits/stdc++.h>")]),s(`
`),n("span",{class:"line"},[n("span",null,"#define int long long")]),s(`
`),n("span",{class:"line"},[n("span",null,'#define endl "\\n"')]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"using namespace std;")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"/**")]),s(`
`),n("span",{class:"line"},[n("span",null," * Tag 结构体：用于维护“懒标记”（Lazy Tag）")]),s(`
`),n("span",{class:"line"},[n("span",null," * 在区间修改时，我们不立即更新到叶子节点，而是先存放在标记里。")]),s(`
`),n("span",{class:"line"},[n("span",null," */")]),s(`
`),n("span",{class:"line"},[n("span",null,"struct Tag {")]),s(`
`),n("span",{class:"line"},[n("span",null,"    int add = 0; // 这里的 add 表示区间加法的增量")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    // apply 函数：实现标记的合并（即当一个区间已经有标记时，叠加新的标记）")]),s(`
`),n("span",{class:"line"},[n("span",null,"    void apply(const Tag &t) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"        add += t.add;")]),s(`
`),n("span",{class:"line"},[n("span",null,"    }")]),s(`
`),n("span",{class:"line"},[n("span",null,"};")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"/**")]),s(`
`),n("span",{class:"line"},[n("span",null," * Info 结构体：维护线段树每个节点存储的具体信息")]),s(`
`),n("span",{class:"line"},[n("span",null," */")]),s(`
`),n("span",{class:"line"},[n("span",null,"struct Info {")]),s(`
`),n("span",{class:"line"},[n("span",null,"    // 初始化最大值为负无穷，最小值为正无穷")]),s(`
`),n("span",{class:"line"},[n("span",null,"    int max_v = -2e18, min_v = 2e18;")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    Info() {}")]),s(`
`),n("span",{class:"line"},[n("span",null,"    // 构造函数：用于叶子节点的初始化，此时最大值和最小值都是它本身")]),s(`
`),n("span",{class:"line"},[n("span",null,"    Info(int v) : max_v(v), min_v(v) {}")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    // apply 函数：将标记 Tag 的修改应用到当前的 Info 数据上")]),s(`
`),n("span",{class:"line"},[n("span",null,"    void apply(const Tag &t) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"        // 如果当前节点不是空节点（无效值），则执行加法更新")]),s(`
`),n("span",{class:"line"},[n("span",null,"        if (max_v != -2e18) max_v += t.add;")]),s(`
`),n("span",{class:"line"},[n("span",null,"        if (min_v != 2e18) min_v += t.add;")]),s(`
`),n("span",{class:"line"},[n("span",null,"    }")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    // 重载 + 运算符：实现 Push Up 操作，即如何由左右两个子节点合并出父节点的信息")]),s(`
`),n("span",{class:"line"},[n("span",null,"    friend Info operator+(const Info &a, const Info &b) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"        Info res;")]),s(`
`),n("span",{class:"line"},[n("span",null,"        res.max_v = max(a.max_v, b.max_v); // 父节点最大值等于子节点最大值的较大者")]),s(`
`),n("span",{class:"line"},[n("span",null,"        res.min_v = min(a.min_v, b.min_v); // 父节点最小值等于子节点最小值的较小者")]),s(`
`),n("span",{class:"line"},[n("span",null,"        return res;")]),s(`
`),n("span",{class:"line"},[n("span",null,"    }")]),s(`
`),n("span",{class:"line"},[n("span",null,"};")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"/**")]),s(`
`),n("span",{class:"line"},[n("span",null," * Segment_Tree 类：通用线段树模板")]),s(`
`),n("span",{class:"line"},[n("span",null," * @tparam Info 节点信息类")]),s(`
`),n("span",{class:"line"},[n("span",null," * @tparam Tag 懒标记类")]),s(`
`),n("span",{class:"line"},[n("span",null," */")]),s(`
`),n("span",{class:"line"},[n("span",null,"template<class Info, class Tag>")]),s(`
`),n("span",{class:"line"},[n("span",null,"struct Segment_Tree {")]),s(`
`),n("span",{class:"line"},[n("span",null,"    int n;")]),s(`
`),n("span",{class:"line"},[n("span",null,"    vector<Info> info; // 存储树节点的数组")]),s(`
`),n("span",{class:"line"},[n("span",null,"    vector<Tag> tag;   // 存储懒标记的数组")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    Segment_Tree(): n(0) {}")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    // 构造函数：指定大小 n 和默认初始信息 v")]),s(`
`),n("span",{class:"line"},[n("span",null,"    Segment_Tree(int n_, Info v_ = Info()) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"        init(n_, v_);")]),s(`
`),n("span",{class:"line"},[n("span",null,"    }")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    // 构造函数：直接传入一个 vector 进行初始化")]),s(`
`),n("span",{class:"line"},[n("span",null,"    template<class T>")]),s(`
`),n("span",{class:"line"},[n("span",null,"    Segment_Tree(vector<T> init_) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"        init(init_);")]),s(`
`),n("span",{class:"line"},[n("span",null,"    }")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    void init(int n_, Info v_ = Info()) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"        init(vector<Info>(n_, v_));")]),s(`
`),n("span",{class:"line"},[n("span",null,"    }")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    // 核心初始化函数")]),s(`
`),n("span",{class:"line"},[n("span",null,"    template<class T>")]),s(`
`),n("span",{class:"line"},[n("span",null,"    void init(vector<T> init_) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"        n = init_.size();")]),s(`
`),n("span",{class:"line"},[n("span",null,"        // 计算空间：通常开 4n 空间。这里使用了位运算来确定数组大小")]),s(`
`),n("span",{class:"line"},[n("span",null,"        int m = 1;")]),s(`
`),n("span",{class:"line"},[n("span",null,"        while (m < n) m <<= 1;")]),s(`
`),n("span",{class:"line"},[n("span",null,"        info.assign(m << 2, Info());")]),s(`
`),n("span",{class:"line"},[n("span",null,"        tag.assign(m << 2, Tag());")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"        // 递归构建线段树")]),s(`
`),n("span",{class:"line"},[n("span",null,"        function<void(int, int, int)> build = [&](int p, int l, int r) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"            if (l == r) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"                info[p] = init_[l];")]),s(`
`),n("span",{class:"line"},[n("span",null,"                return;")]),s(`
`),n("span",{class:"line"},[n("span",null,"            }")]),s(`
`),n("span",{class:"line"},[n("span",null,"            int m = (l + r) >> 1;")]),s(`
`),n("span",{class:"line"},[n("span",null,"            build(2 * p, l, m);")]),s(`
`),n("span",{class:"line"},[n("span",null,"            build(2 * p + 1, m + 1, r);")]),s(`
`),n("span",{class:"line"},[n("span",null,"            pull(p); // 向上合并信息")]),s(`
`),n("span",{class:"line"},[n("span",null,"        };")]),s(`
`),n("span",{class:"line"},[n("span",null,"        build(1, 0, n - 1);")]),s(`
`),n("span",{class:"line"},[n("span",null,"    }")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    // apply：对节点 p 应用标记 v，同时更新该节点的 info 和 tag")]),s(`
`),n("span",{class:"line"},[n("span",null,"    void apply(int p, const Tag &v) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"        info[p].apply(v);")]),s(`
`),n("span",{class:"line"},[n("span",null,"        tag[p].apply(v);")]),s(`
`),n("span",{class:"line"},[n("span",null,"    }")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    // push：下传标记（Push Down）")]),s(`
`),n("span",{class:"line"},[n("span",null,"    // 将当前节点的懒标记传递给左右儿子，然后清空当前标记")]),s(`
`),n("span",{class:"line"},[n("span",null,"    void push(int p) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"        apply(2 * p, tag[p]);")]),s(`
`),n("span",{class:"line"},[n("span",null,"        apply(2 * p + 1, tag[p]);")]),s(`
`),n("span",{class:"line"},[n("span",null,"        tag[p] = Tag();")]),s(`
`),n("span",{class:"line"},[n("span",null,"    }")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    // pull：上传信息（Push Up）")]),s(`
`),n("span",{class:"line"},[n("span",null,"    // 根据左右儿子节点的信息更新当前节点")]),s(`
`),n("span",{class:"line"},[n("span",null,"    void pull(int p) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"        info[p] = info[p * 2] + info[p * 2 + 1];")]),s(`
`),n("span",{class:"line"},[n("span",null,"    }")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    // modify：区间修改")]),s(`
`),n("span",{class:"line"},[n("span",null,"    // 在 [l, r] 范围内查找并修改落在 [x, y] 间的节点")]),s(`
`),n("span",{class:"line"},[n("span",null,"    void modify(int p, int l, int r, int x, int y, const Tag &v) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"        if (l >= x && r <= y) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"            apply(p, v);")]),s(`
`),n("span",{class:"line"},[n("span",null,"            return;")]),s(`
`),n("span",{class:"line"},[n("span",null,"        }")]),s(`
`),n("span",{class:"line"},[n("span",null,"        push(p); // 操作前先下传标记")]),s(`
`),n("span",{class:"line"},[n("span",null,"        int m = (l + r) >> 1;")]),s(`
`),n("span",{class:"line"},[n("span",null,"        if (x <= m) modify(2 * p, l, m, x, y, v);")]),s(`
`),n("span",{class:"line"},[n("span",null,"        if (y > m) modify(2 * p + 1, m + 1, r, x, y, v);")]),s(`
`),n("span",{class:"line"},[n("span",null,"        pull(p); // 修改完成后向上更新")]),s(`
`),n("span",{class:"line"},[n("span",null,"    }")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    void modify(int l, int r, const Tag &v) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"        if (l > r) return;")]),s(`
`),n("span",{class:"line"},[n("span",null,"        modify(1, 0, n - 1, l, r, v);")]),s(`
`),n("span",{class:"line"},[n("span",null,"    }")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    // query：区间查询")]),s(`
`),n("span",{class:"line"},[n("span",null,"    // 返回 [x, y] 范围内的合并后的 Info 信息")]),s(`
`),n("span",{class:"line"},[n("span",null,"    Info query(int p, int l, int r, int x, int y) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"        if (l > y || r < x) return Info(); // 不在范围内返回空")]),s(`
`),n("span",{class:"line"},[n("span",null,"        if (l >= x && r <= y) return info[p];")]),s(`
`),n("span",{class:"line"},[n("span",null,"        push(p);")]),s(`
`),n("span",{class:"line"},[n("span",null,"        int m = (l + r) >> 1;")]),s(`
`),n("span",{class:"line"},[n("span",null,"        return query(2 * p, l, m, x, y) + query(2 * p + 1, m + 1, r, x, y);")]),s(`
`),n("span",{class:"line"},[n("span",null,"    }")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    void query(int l, int r) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"        if (l > r) return Info();")]),s(`
`),n("span",{class:"line"},[n("span",null,"        return query(1, 0, n - 1, l, r);")]),s(`
`),n("span",{class:"line"},[n("span",null,"    }")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    /**")]),s(`
`),n("span",{class:"line"},[n("span",null,"     * find_first：在线段树上进行二分查找")]),s(`
`),n("span",{class:"line"},[n("span",null,"     * 查找区间 [x, y] 内第一个满足 pred 条件的索引")]),s(`
`),n("span",{class:"line"},[n("span",null,"     */")]),s(`
`),n("span",{class:"line"},[n("span",null,"    template<class F>")]),s(`
`),n("span",{class:"line"},[n("span",null,"    int find_first(int p, int l, int r, int x, int y, F &&pred) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"        // 如果当前区间完全不符合条件，或者不在查询范围内，返回 -1")]),s(`
`),n("span",{class:"line"},[n("span",null,"        if ((l > y || r < x) || (l >= x && r <= y && !pred(info[p]))) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"            return -1;")]),s(`
`),n("span",{class:"line"},[n("span",null,"        }")]),s(`
`),n("span",{class:"line"},[n("span",null,"        // 如果到达叶子节点，说明找到了")]),s(`
`),n("span",{class:"line"},[n("span",null,"        if (l == r) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"            return l;")]),s(`
`),n("span",{class:"line"},[n("span",null,"        }")]),s(`
`),n("span",{class:"line"},[n("span",null,"        push(p);")]),s(`
`),n("span",{class:"line"},[n("span",null,"        int m = (l + r) >> 1;")]),s(`
`),n("span",{class:"line"},[n("span",null,"        // 优先在左子树找")]),s(`
`),n("span",{class:"line"},[n("span",null,"        int res = find_first(2 * p, l, m, x, y, pred);")]),s(`
`),n("span",{class:"line"},[n("span",null,"        if (res == -1) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"            // 左子树没找到再去右子树找")]),s(`
`),n("span",{class:"line"},[n("span",null,"            res = find_first(2 * p + 1, m + 1, r, x, y, pred);")]),s(`
`),n("span",{class:"line"},[n("span",null,"        }")]),s(`
`),n("span",{class:"line"},[n("span",null,"        return res;")]),s(`
`),n("span",{class:"line"},[n("span",null,"    }")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    template<class F>")]),s(`
`),n("span",{class:"line"},[n("span",null,"    int find_first(int l, int r, F &&pred) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"        return find_first(1, 0, n - 1, l, r, pred);")]),s(`
`),n("span",{class:"line"},[n("span",null,"    }")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    /**")]),s(`
`),n("span",{class:"line"},[n("span",null,"     * find_last：在线段树上二分查找")]),s(`
`),n("span",{class:"line"},[n("span",null,"     * 查找区间 [x, y] 内最后一个满足 pred 条件的索引")]),s(`
`),n("span",{class:"line"},[n("span",null,"     */")]),s(`
`),n("span",{class:"line"},[n("span",null,"    template<class F>")]),s(`
`),n("span",{class:"line"},[n("span",null,"    int find_last(int p, int l, int r, int x, int y, F &&pred) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"        if ((l > y || r < x) || (l >= x && r <= y && !pred(info[p]))) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"            return -1;")]),s(`
`),n("span",{class:"line"},[n("span",null,"        }")]),s(`
`),n("span",{class:"line"},[n("span",null,"        if (l == r) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"            return l;")]),s(`
`),n("span",{class:"line"},[n("span",null,"        }")]),s(`
`),n("span",{class:"line"},[n("span",null,"        push(p);")]),s(`
`),n("span",{class:"line"},[n("span",null,"        int m = (l + r) >> 1;")]),s(`
`),n("span",{class:"line"},[n("span",null,"        // 既然找最后一个，就优先去右子树寻找")]),s(`
`),n("span",{class:"line"},[n("span",null,"        int res = find_last(2 * p + 1, m + 1, r, x, y, pred);")]),s(`
`),n("span",{class:"line"},[n("span",null,"        if (res == -1) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"            res = find_last(2 * p, l, m, x, y, pred);")]),s(`
`),n("span",{class:"line"},[n("span",null,"        }")]),s(`
`),n("span",{class:"line"},[n("span",null,"        return res;")]),s(`
`),n("span",{class:"line"},[n("span",null,"    }")]),s(`
`),n("span",{class:"line"},[n("span")]),s(`
`),n("span",{class:"line"},[n("span",null,"    template<class F>")]),s(`
`),n("span",{class:"line"},[n("span",null,"    int find_last(int l, int r, F &&pred) {")]),s(`
`),n("span",{class:"line"},[n("span",null,"        return find_last(1, 0, n - 1, l, r, pred);")]),s(`
`),n("span",{class:"line"},[n("span",null,"    }")]),s(`
`),n("span",{class:"line"},[n("span",null,"};")])])]),n("button",{class:"code-block-unfold-btn"})],-1)])]),"main-header":l(()=>[p(a.$slots,"main-header")]),"main-header-after":l(()=>[p(a.$slots,"main-header-after")]),"main-nav":l(()=>[p(a.$slots,"main-nav")]),"main-content-before":l(()=>[p(a.$slots,"main-content-before")]),"main-content":l(()=>[p(a.$slots,"main-content")]),"main-content-after":l(()=>[p(a.$slots,"main-content-after")]),"main-nav-before":l(()=>[p(a.$slots,"main-nav-before")]),"main-nav-after":l(()=>[p(a.$slots,"main-nav-after")]),comment:l(()=>[p(a.$slots,"comment")]),footer:l(()=>[p(a.$slots,"footer")]),aside:l(()=>[p(a.$slots,"aside")]),"aside-custom":l(()=>[p(a.$slots,"aside-custom")]),default:l(()=>[p(a.$slots,"default")]),_:3},8,["frontmatter"])}}};export{U as default,b as usePageData};
