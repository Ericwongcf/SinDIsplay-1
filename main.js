/**
 * SinDisplay - 正弦波变换可视化核心逻辑
 */

// 全局状态
let params = {
    A: 1.0,
    w: 1.0,
    phi: 0,
    B: 0.0
};

const pixelsPerUnit = 100; // 1单位 = 100px

function init() {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliders = {
        amplitude: document.getElementById('amplitude'),
        frequency: document.getElementById('frequency'),
        phase: document.getElementById('phase'),
        offset: document.getElementById('offset')
    };

    const formulaDisplay = document.getElementById('current-formula');

    // 处理初次渲染
    function updateFormulaDisplay() {
        if (!formulaDisplay) return;

        const A = params.A.toFixed(1);
        const w = params.w.toFixed(1);
        const B = params.B.toFixed(1);
        // phi 已经在 params 中存为弧度，我们需要获取其 π 的倍数显示
        const phiVal = (params.phi / Math.PI).toFixed(1);

        // 构造 LaTeX 字符串
        let latex = `y = ${A} \\sin(${w}x`;

        if (phiVal > 0) latex += ` + ${phiVal}\\pi`;
        else if (phiVal < 0) latex += ` - ${Math.abs(phiVal)}\\pi`;

        latex += `)`;

        if (params.B > 0) latex += ` + ${B}`;
        else if (params.B < 0) latex += ` - ${Math.abs(B)}`;

        // 使用 KaTeX 渲染
        try {
            katex.render(latex, formulaDisplay, {
                throwOnError: false,
                displayMode: true
            });
        } catch (err) {
            formulaDisplay.textContent = latex;
        }
    }

    const displayValues = {
        amplitude: document.getElementById('val-amplitude'),
        frequency: document.getElementById('val-frequency'),
        phase: document.getElementById('val-phase'),
        offset: document.getElementById('val-offset')
    };

    const obsText = document.getElementById('obs-text');
    const resetBtn = document.getElementById('reset-btn');

    function updateParam(id, val) {
        if (id === 'amplitude') params.A = val;
        if (id === 'frequency') params.w = val;
        // 注意：这里的 val 是滑块数值，phi 以 π 为单位
        if (id === 'phase') params.phi = val * Math.PI;
        if (id === 'offset') params.B = val;

        if (displayValues[id]) {
            if (id === 'phase') {
                displayValues[id].textContent = val.toFixed(1) + "π";
            } else {
                displayValues[id].textContent = val.toFixed(1);
            }
        }

        updateFormulaDisplay();

        const observationNotes = {
            amplitude: "A (振幅)：纵向伸缩。观察波峰到 X 轴的距离如何随 A 增大而变高。",
            frequency: "ω (频率)：横向伸缩。ω 变大时，单位长度内出现的波峰数量会变多。",
            phase: "ϕ (相位)：左右平移。当 ϕ 为正数时，图像向左平移；为负数时向右平移。",
            offset: "B (位移)：上下平移。观察整个波形的“中轴线”相对于 X 轴的高度。"
        };
        if (obsText) obsText.innerHTML = observationNotes[id];
    }

    function reset() {
        params = { A: 1.0, w: 1.0, phi: 0, B: 0.0 };
        sliders.amplitude.value = 1.0;
        sliders.frequency.value = 1.0;
        sliders.phase.value = 0;
        sliders.offset.value = 0.0;
        Object.keys(displayValues).forEach(key => {
            if (displayValues[key]) {
                displayValues[key].textContent = key === 'phase' ? "0π" : sliders[key].value;
            }
        });
        updateFormulaDisplay();
        if (obsText) obsText.innerHTML = "调节滑块以观察波形变化...";
    }

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // 确保有尺寸，否则使用默认值
        const width = rect.width || 800;
        const height = rect.height || 600;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        ctx.resetTransform();
        ctx.scale(dpr, dpr);

        console.log(`Canvas resized: ${width}x${height} at ${dpr} x`);
    }

    function drawAxes(width, height, centerX, centerY) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // 网格线 - 水平网格保持 50px，垂直网格对齐于 π/2 单位
        const horizontalStep = 50;
        const verticalStep = (Math.PI / 2) * pixelsPerUnit;

        ctx.beginPath();
        // 垂直网格 (X)
        for (let x = centerX; x < width; x += verticalStep) {
            ctx.moveTo(x, 0); ctx.lineTo(x, height);
        }
        for (let x = centerX - verticalStep; x > 0; x -= verticalStep) {
            ctx.moveTo(x, 0); ctx.lineTo(x, height);
        }
        // 水平网格 (Y)
        for (let y = centerY; y < height; y += horizontalStep) {
            ctx.moveTo(0, y); ctx.lineTo(width, y);
        }
        for (let y = centerY - horizontalStep; y > 0; y -= horizontalStep) {
            ctx.moveTo(0, y); ctx.lineTo(width, y);
        }
        ctx.stroke();

        // 轴线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
        ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height);
        ctx.stroke();

        // 刻度
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px Inter, monospace';
        const labelStep = Math.PI / 2;
        for (let i = -20; i <= 40; i++) {
            if (i === 0) continue;
            const val = i * labelStep;
            const x = centerX + val * pixelsPerUnit;
            if (x < 0 || x > width) continue;

            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.moveTo(x, centerY - 5); ctx.lineTo(x, centerY + 5);
            ctx.stroke();

            // 格式化标签: π/2, π, 3π/2...
            let label = "";
            const absI = Math.abs(i);
            const sign = i < 0 ? "-" : "";

            if (i % 2 === 0) {
                // 偶数倍的 PI/2 即整数倍的 PI
                const count = absI / 2;
                label = sign + (count === 1 ? "" : count) + "π";
            } else {
                // 奇数倍的 PI/2
                if (absI === 1) label = sign + "π/2";
                else label = sign + absI + "π/2";
            }

            const metrics = ctx.measureText(label);
            ctx.fillText(label, x - metrics.width / 2, centerY + 20);
        }
    }

    function drawReferenceWave(width, height, centerX, centerY) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(248, 113, 113, 0.8)'; // 更明显的红色
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        for (let px = 0; px < width; px++) {
            const x = (px - centerX) / pixelsPerUnit;
            const valY = Math.sin(x); // 初始正弦函数 y = sin(x)
            const py = centerY - (valY * pixelsPerUnit);

            if (px === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
    }

    function drawWave(width, height, centerX, centerY) {
        const offsetPixels = params.B * pixelsPerUnit;

        // 中轴辅助线
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(0, centerY - offsetPixels);
        ctx.lineTo(width, centerY - offsetPixels);
        ctx.stroke();
        ctx.setLineDash([]);

        // 波形路径
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#38bdf8';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.beginPath();

        for (let px = 0; px < width; px++) {
            const x = (px - centerX) / pixelsPerUnit;
            const valY = params.A * Math.sin(params.w * x + params.phi);
            const py = centerY - (valY * pixelsPerUnit + offsetPixels);

            if (px === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 标注 A
        if (Math.abs(params.A) > 0.1) {
            const peakUnitX = (Math.PI / 2 - params.phi) / params.w;
            const peakX = centerX + peakUnitX * pixelsPerUnit;

            if (peakX > 0 && peakX < width) {
                const topY = centerY - (params.A * pixelsPerUnit + offsetPixels);
                const baseY = centerY - offsetPixels;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.moveTo(peakX, baseY); ctx.lineTo(peakX, topY);
                ctx.stroke();
                ctx.fillText(`A = ${params.A.toFixed(1)} `, peakX + 5, topY + (baseY - topY) / 2);
            }
        }
    }

    function animate() {
        if (!canvas.width || !canvas.height) return requestAnimationFrame(animate);

        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);
        const centerX = width / 4;
        const centerY = height / 2;

        ctx.clearRect(0, 0, width, height);
        drawAxes(width, height, centerX, centerY);
        drawReferenceWave(width, height, centerX, centerY);
        drawWave(width, height, centerX, centerY);
        requestAnimationFrame(animate);
    }

    Object.keys(sliders).forEach(key => {
        if (sliders[key]) {
            sliders[key].addEventListener('input', (e) => {
                updateParam(key, parseFloat(e.target.value));
            });
        }
    });
    updateFormulaDisplay();

    if (resetBtn) resetBtn.addEventListener('click', reset);

    window.addEventListener('resize', resize);
    // 使用 ResizeObserver 监听父容器变化
    if (window.ResizeObserver && canvas.parentElement) {
        new ResizeObserver(resize).observe(canvas.parentElement);
    }

    resize();
    animate();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
