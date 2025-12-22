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
        if (id === 'phase') params.phi = val;
        if (id === 'offset') params.B = val;

        if (displayValues[id]) displayValues[id].textContent = val.toFixed(1);

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
            if (displayValues[key]) displayValues[key].textContent = sliders[key].value;
        });
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
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;

        // 网格
        ctx.beginPath();
        for (let x = centerX % 50; x < width; x += 50) {
            ctx.moveTo(x, 0); ctx.lineTo(x, height);
        }
        for (let y = centerY % 50; y < height; y += 50) {
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
        for (let i = -10; i <= 20; i++) {
            if (i === 0) continue;
            const x = centerX + i * pixelsPerUnit;
            if (x < 0 || x > width) continue;
            ctx.beginPath();
            ctx.moveTo(x, centerY - 5); ctx.lineTo(x, centerY + 5);
            ctx.stroke();
            ctx.fillText(i, x - 5, centerY + 20);
        }
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
