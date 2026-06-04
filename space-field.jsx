const { useRef, useEffect } = React;

function SpaceField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Skip on mobile/tablet — no canvas animation needed
    if (window.innerWidth < 1024) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = parent.offsetWidth;
    let h = parent.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const p = '168,85,247';
    let mouseX = w / 2, mouseY = h / 2;
    let animId;

    // Fewer stars for performance
    const stars = [];
    const starCount = Math.min(120, Math.floor((w * h) / 5000));
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 0.4 + Math.random() * 1.4,
        alpha: 0.1 + Math.random() * 0.25,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinkleOffset: Math.random() * Math.PI * 2,
        depth: 0.3 + Math.random() * 0.7
      });
    }

    // Constellation connections (pre-calculated once)
    const connections = [];
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dist = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
        if (dist < 130 && dist > 40 && Math.random() < 0.18) {
          connections.push({ a: i, b: j });
        }
      }
    }

    // Data flow particles
    const flows = [];
    for (let i = 0; i < 12; i++) {
      flows.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: 0.15 + Math.random() * 0.3,
        vy: (Math.random() - 0.5) * 0.15,
        alpha: 0.1 + Math.random() * 0.2,
        size: 0.8 + Math.random() * 1,
        trail: []
      });
    }

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    let lastResize = 0;
    const onResize = () => {
      const now = Date.now();
      if (now - lastResize < 200) return;
      lastResize = now;
      w = parent.offsetWidth;
      h = parent.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', onResize, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const t = Date.now() * 0.001;
      const px = (mouseX - w / 2) / w;
      const py = (mouseY - h / 2) / h;

      // Batch constellation lines
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      connections.forEach(conn => {
        const a = stars[conn.a], b = stars[conn.b];
        ctx.moveTo(a.x + px * 12 * a.depth, a.y + py * 8 * a.depth);
        ctx.lineTo(b.x + px * 12 * b.depth, b.y + py * 8 * b.depth);
      });
      ctx.strokeStyle = `rgba(${p},0.06)`;
      ctx.stroke();

      // Batch stars (no individual gradients for small ones)
      stars.forEach(star => {
        const sx = star.x + px * 12 * star.depth;
        const sy = star.y + py * 8 * star.depth;
        const twinkle = 0.6 + 0.4 * Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.alpha * twinkle;

        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p},${alpha})`;
        ctx.fill();
      });

      // Data flow particles
      flows.forEach(fl => {
        fl.x += fl.vx;
        fl.y += fl.vy;
        fl.vy += (Math.random() - 0.5) * 0.02;
        fl.vy *= 0.99;

        fl.trail.push({ x: fl.x, y: fl.y });
        if (fl.trail.length > 8) fl.trail.shift();

        if (fl.x > w + 20) {
          fl.x = -10;
          fl.y = Math.random() * h;
          fl.trail = [];
        }

        // Trail as single path
        if (fl.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(fl.trail[0].x, fl.trail[0].y);
          for (let i = 1; i < fl.trail.length; i++) {
            ctx.lineTo(fl.trail[i].x, fl.trail[i].y);
          }
          ctx.strokeStyle = `rgba(${p},${fl.alpha * 0.35})`;
          ctx.lineWidth = fl.size * 0.5;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(fl.x, fl.y, fl.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p},${fl.alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0
    }} />
  );
}

Object.assign(window, { SpaceField });
