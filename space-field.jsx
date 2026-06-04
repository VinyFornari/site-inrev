const { useRef, useEffect } = React;

function SpaceField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = parent.offsetWidth;
    let h = parent.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const p = '168,85,247';
    let mouseX = w / 2, mouseY = h / 2;
    let animId;

    // Generate star particles
    const stars = [];
    const starCount = Math.floor((w * h) / 3200);
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 0.4 + Math.random() * 1.4,
        alpha: 0.1 + Math.random() * 0.25,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinkleOffset: Math.random() * Math.PI * 2,
        depth: 0.3 + Math.random() * 0.7 // parallax depth
      });
    }

    // Generate constellation connections (nearby stars)
    const connections = [];
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dist = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
        if (dist < 130 && dist > 40 && Math.random() < 0.18) {
          connections.push({ a: i, b: j, dist });
        }
      }
    }

    // Data flow particles (move toward right side where globe is)
    const flows = [];
    for (let i = 0; i < 18; i++) {
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
    window.addEventListener('mousemove', onMove);

    const onResize = () => {
      w = parent.offsetWidth;
      h = parent.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', onResize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const t = Date.now() * 0.001;

      // Parallax offset based on mouse
      const parallaxX = (mouseX - w / 2) / w;
      const parallaxY = (mouseY - h / 2) / h;

      // Draw constellation connections
      connections.forEach(conn => {
        const a = stars[conn.a];
        const b = stars[conn.b];
        const ax = a.x + parallaxX * 12 * a.depth;
        const ay = a.y + parallaxY * 8 * a.depth;
        const bx = b.x + parallaxX * 12 * b.depth;
        const by = b.y + parallaxY * 8 * b.depth;
        const avgAlpha = (a.alpha + b.alpha) / 2 * 0.35;

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = `rgba(${p},${avgAlpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Draw stars with twinkle
      stars.forEach(star => {
        const sx = star.x + parallaxX * 12 * star.depth;
        const sy = star.y + parallaxY * 8 * star.depth;
        const twinkle = 0.6 + 0.4 * Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.alpha * twinkle;

        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p},${alpha})`;
        ctx.fill();

        // Subtle glow on brighter stars
        if (star.size > 1 && alpha > 0.15) {
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, star.size * 4);
          g.addColorStop(0, `rgba(${p},${alpha * 0.15})`);
          g.addColorStop(1, `rgba(${p},0)`);
          ctx.beginPath();
          ctx.arc(sx, sy, star.size * 4, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
      });

      // Draw data flow particles
      flows.forEach(fl => {
        fl.x += fl.vx;
        fl.y += fl.vy;
        fl.vy += (Math.random() - 0.5) * 0.02;
        fl.vy *= 0.99;

        // Store trail
        fl.trail.push({ x: fl.x, y: fl.y });
        if (fl.trail.length > 12) fl.trail.shift();

        // Reset when off screen
        if (fl.x > w + 20) {
          fl.x = -10;
          fl.y = Math.random() * h;
          fl.trail = [];
        }

        // Draw trail
        for (let i = 0; i < fl.trail.length - 1; i++) {
          const ta = (i / fl.trail.length) * fl.alpha * 0.5;
          ctx.beginPath();
          ctx.moveTo(fl.trail[i].x, fl.trail[i].y);
          ctx.lineTo(fl.trail[i + 1].x, fl.trail[i + 1].y);
          ctx.strokeStyle = `rgba(${p},${ta})`;
          ctx.lineWidth = fl.size * 0.6;
          ctx.stroke();
        }

        // Draw head
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
