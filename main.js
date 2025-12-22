/**
 * SinDisplay - 正弦波变换可视化核心逻辑
 */
import './style.css';

const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');

// UI 元素
const sliders = {
    amplitude: document.getElementById('amplitude'),
    frequency: document.getElementById('frequency'),
    phase: document.getElementById('phase'),
    offset: document.getElementById('offset')
};

const displayValues = {
    amplitude: document.getElementById('val-amplitude'),
    frequency: document.getElementById('val-frequency'),
    phase: document.getElementById('val-phase'),
    offset: document.getElementById('val-offset')
};

const obsText = document.getElementById('obs-text');
const resetBtn = document.getElementById('reset-btn');

// 初始参数
let params = {
    A: 100,
    w: 1.0,
    phi: 0,
    B: 0
};

const observationNotes = {
    A: "A (振幅)：纵向伸缩。观察波峰到 X 轴的距离如何随 A 增大而变高。",
    w: "ω (频率)：横向伸缩。ω 变大时，两个 π 之间出现的波峰数量会变多。",
    phi: "ϕ (相位)：左右平移。当 ϕ 为正数时，图像向左平移；为负数时向右平移。",
    B: "B (位移)：上下平移。观察整个波形的“中轴线”相对于 X 轴的高度。"
};

let lastChangedParam = null;

// 初始化
function init() {
    resize();
    window.addEventListener('resize', resize);

    // 事件监听
    Object.keys(sliders).forEach(key => {
        sliders[key].addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            updateParam(key, val);
            lastChangedParam = key;
        });
    });

    resetBtn.addEventListener('click', reset);

    animate();
}

function resize() {
    canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

function updateParam(id, val) {
    if (id === 'amplitude') params.A = val;
    if (id === 'frequency') params.w = val;
    if (id === 'phase') params.phi = val;
    if (id === 'offset') params.B = val;

    // 更新显示数值
    displayValues[id].textContent = val.toFixed(id === 'amplitude' || id === 'offset' ? 0 : 2);

    // 更新观察点文字
    const paramKey = id === 'amplitude' ? 'A' : (id === 'frequency' ? 'w' : (id === 'phase' ? 'phi' : 'B'));
    obsText.innerHTML = observationNotes[paramKey];
}

function reset() {
    params = { A: 100, w: 1.0, phi: 0, B: 0 };
    sliders.amplitude.value = 100;
    sliders.frequency.value = 1;
    sliders.phase.value = 0;
    sliders.offset.value = 0;

    Object.keys(displayValues).forEach(key => {
        displayValues[key].textContent = sliders[key].value;
    });

    obsText.innerHTML = "调节滑块以观察波形变化...";
}

function drawAxes(width, height, centerX, centerY) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;

    // 网格
    ctx.beginPath();
    for (let x = 0; x < width; x += 50) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += 50) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    ctx.stroke();

    // 坐标轴
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // X轴
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    // Y轴
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // 绘制 π 刻度 (假设 centerX 为 0)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px monospace';
    const pixelsPerUnit = 100; // 1单位 = 100px
    for (let i = -10; i <= 10; i++) {
        if (i === 0) continue;
        const x = centerX + i * pixelsPerUnit * Math.PI;
        ctx.fillText(i + 'π', x - 10, centerY + 20);
        ctx.beginPath();
        ctx.moveTo(x, centerY - 5);
        ctx.lineTo(x, centerY + 5);
        ctx.stroke();
    }
}

function drawWave(width, height, centerX, centerY) {
    const pixelsPerUnit = 100;

    // 1. 绘制中轴线 (B 影响)
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(0, centerY - params.B);
    ctx.lineTo(width, centerY - params.B);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. 绘制波形
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#38bdf8';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();

    for (let px = 0; px < width; px++) {
        const x = (px - centerX) / pixelsPerUnit;
        // y = A * sin(w * x + phi) + B
        // 注意：Canvas Y 轴向下，所以波形要取反或通过 offset 调整
        const y = params.A * Math.sin(params.w * x + params.phi);
        const py = centerY - (y + params.B);

        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3. 视觉辅助线 (基于 lastChangedParam)
    if (params.A > 0) {
        // 振幅辅助线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        // 找一个波峰 (sin = 1)
        // w * x + phi = pi/2  => x = (pi/2 - phi) / w
        const peakX = ((Math.PI / 2 - params.phi) / params.w) * pixelsPerUnit + centerX;
        if (peakX > 0 && peakX < width) {
            ctx.beginPath();
            ctx.moveTo(peakX, centerY - params.B);
            ctx.lineTo(peakX, centerY - (params.A + params.B));
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.fillText('A', peakX + 5, centerY - params.B - params.A / 2);
        }
    }
}

function animate() {
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;
    const centerX = width / 4; // 偏左一点
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    drawAxes(width, height, centerX, centerY);
    drawWave(width, height, centerX, centerY);

    requestAnimationFrame(animate);
}

init();
