# 正弦波变换可视化 (SinDisplay)

这是一个交互式的正弦波变换可视化工具，旨在帮助用户直观地理解正弦函数的各个参数（振幅、频率、相位、位移）如何影响波形。

## 功能特点

- **实时波形绘制**：使用 HTML5 Canvas 高性能绘制正弦波。
- **参数调节**：
  - **A (振幅)**：控制波峰到 X 轴的距离（纵向伸缩）。
  - **ω (频率)**：控制单位长度内的波峰数量（横向伸缩）。
  - **ϕ (相位)**：控制波形的左右平移。
  - **B (位移)**：控制波形的上下平移。
- **公式展示**：使用 KaTeX 实时渲染当前的数学公式 ($y = A \sin(\omega x + \phi) + B$)。
- **交互式体验**：拖动滑块即可看到波形的即时变化，并伴有文字说明。

## 技术栈

- **前端核心**：HTML5, CSS3, JavaScript (ES6+ Modules)
- **绘图引擎**：HTML5 Canvas API
- **数学公式渲染**：[KaTeX](https://katex.org/)
- **构建工具**：[Vite](https://vitejs.dev/)

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Ericwongcf/SinDIsplay-1.git
cd SinDIsplay-1
```

### 2. 安装依赖

确保你已经安装了 [Node.js](https://nodejs.org/)。

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

启动后，在浏览器中访问控制台输出的地址（通常是 `http://localhost:5173/SinDIsplay-1/`）。

## 许可证

MIT License
