# 童语同音二期 — 学前儿童普通话师资培训平台（PC端）

> "童语同音"学前儿童普通话师资培训报名系统，PC 端 HTML 静态项目，使用 **Vite** 构建工具开发，SCSS 直接引入，内置 jQuery 交互与 SweetAlert2 弹窗组件。

---

## 项目结构

```
html-pc-童语同音二期/
├── index.html              # 入口页（活动未开始/已开始的导航落地页）
├── register.html           # 报名页（核心页面，六步骤流程）
├── not-started.html        # 活动未开始状态页
├── ended.html              # 活动已结束状态页
├── main.js                 # Vite 根入口（已废弃，入口移至 style/main.js）
├── vite.config.js          # Vite 配置（多页应用 MPA）
├── package.json            # 依赖与脚本
├── .gitignore
└── style/
    ├── main.js             # JS 入口：import SCSS + jQuery 交互逻辑
    ├── common.scss         # 全局 SCSS 样式（含 SweetAlert2 主题覆盖）
    └── img/                # 图片资源
        ├── big-title.png   # 顶部标题图
        ├── bg_body.jpg     # 页面背景图
        ├── p01.jpg         # 期次卡片封面图
        └── ...             # 其他 UI 图标与资源
```

---

## 技术栈

| 类目 | 技术 |
|------|------|
| 构建工具 | [Vite 5](https://vitejs.dev/) |
| 样式 | SCSS（由 Vite 编译，无需手动构建） |
| 交互 | jQuery 4 |
| 弹窗组件 | SweetAlert2 11 |

---

## 页面说明

| 页面 | 说明 |
|------|------|
| `index.html` | 活动状态入口，链接到报名页 |
| `register.html` | 六步骤报名流程：填写信息 → 获取账号 → 绑定微信 → 选择班级 → 添加班主任 → 完成报名 |
| `not-started.html` | 活动尚未开始时的提示页 |
| `ended.html` | 活动已结束时的提示页 |

---

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

浏览器访问：

```
http://localhost:5173/register.html
```

Vite 会自动处理 SCSS 编译与热更新，**无需任何额外构建步骤**。

---

## 生产构建

```bash
npm run build
```

构建产物输出至 `dist/` 目录，可直接部署到任意静态服务器（Nginx、CDN 等）。

构建后预览：

```bash
npm run preview
```

---

## 报名流程说明

```
第一步  填写基本信息（姓名、区域、学校、身份证、手机、验证码）
  ↓
第二步  获取账号信息（系统下发登录账号与初始密码）
  ↓
第三步  绑定微信号（扫描公众号二维码完成绑定）
  ↓
第四步  选择课程班级（按期次/班级选择，点击"我要报名"弹出确认框）
  ↓
第五步  添加班主任（填写班主任姓名与手机号）
  ↓
第六步  完成报名
```

---

## 备注

- 开发环境仅需 `npm run dev`，**不依赖**外部 CDN（jQuery、SCSS 编译器均通过 npm 本地引入）。
- `style/img/bg_body.jpg` 为背景图，路径在 SCSS 中以相对路径引用，Vite 构建时会自动处理资源哈希。
