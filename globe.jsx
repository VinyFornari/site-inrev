const { useRef, useEffect } = React;

function TechGlobe({ size = 480 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Skip entirely on mobile/tablet
    if (window.innerWidth < 1024) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    let rotation = 0;
    let animId;
    const baseTilt = 18 * Math.PI / 180;
    const R = size * 0.36;
    const cx = size / 2;
    const cy = size / 2;
    const p = '168,85,247';
    const pBright = '192,120,255';

    let targetOffX = 0, targetOffY = 0;
    let offX = 0, offY = 0;
    let localMx = -1, localMy = -1;
    let overGlobe = false;
    let particles = [];

    // Hotspot locations (lat/lon in degrees) — key "transformation points"
    const hotspots = [
      { lat: 10, lon: 30 },
      { lat: -25, lon: 140 },
      { lat: 35, lon: 250 },
      { lat: -10, lon: 320 },
      { lat: 45, lon: 90 },
      { lat: -40, lon: 200 },
    ];

    // Floating labels
    const labels = [
      { text: 'IA', angle: 0, dist: 1.28, speed: 0.15 },
      { text: 'Inovação', angle: Math.PI * 0.33, dist: 1.32, speed: 0.12 },
      { text: 'Dados', angle: Math.PI * 0.66, dist: 1.26, speed: 0.18 },
      { text: 'Estratégia', angle: Math.PI, dist: 1.30, speed: 0.1 },
      { text: 'Digital', angle: Math.PI * 1.33, dist: 1.28, speed: 0.14 },
      { text: 'Negócios', angle: Math.PI * 1.66, dist: 1.32, speed: 0.11 },
    ];

    // Data flow particles (along meridians)
    const dataFlows = [];
    for (let i = 0; i < 12; i++) {
      dataFlows.push({
        lon: (i * 30 + Math.random() * 20) % 360,
        lat: -80 + Math.random() * 160,
        speed: 0.3 + Math.random() * 0.5,
        alpha: 0.3 + Math.random() * 0.4
      });
    }

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      targetOffX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (window.innerWidth * 0.5))) * 0.18;
      targetOffY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (window.innerHeight * 0.5))) * 0.12;
      localMx = (e.clientX - rect.left) * (size / rect.width);
      localMy = (e.clientY - rect.top) * (size / rect.height);
      overGlobe = Math.hypot(localMx - cx, localMy - cy) < R * 1.15;
    };

    window.addEventListener('mousemove', onMove);

    const proj = (lat, lon, tX, tY) => {
      const cl = Math.cos(lat), sl = Math.sin(lat);
      const x = R * cl * Math.sin(lon);
      const y = -R * sl;
      const z = R * cl * Math.cos(lon);
      const cosT = Math.cos(baseTilt + tY), sinT = Math.sin(baseTilt + tY);
      return { x: cx + x + tX * R * 0.15, y: cy + y * cosT - z * sinT, z: y * sinT + z * cosT };
    };

    const latDegs = [-60, -40, -20, 0, 20, 40, 60];
    const lonDegs = [];
    for (let i = 0; i < 360; i += 30) lonDegs.push(i);

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      offX += (targetOffX - offX) * 0.04;
      offY += (targetOffY - offY) * 0.04;
      const t = Date.now() * 0.001;

      // === Atmosphere ===
      const atmo = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R * 1.4);
      atmo.addColorStop(0, `rgba(${p},0.045)`);
      atmo.addColorStop(0.5, `rgba(${p},0.02)`);
      atmo.addColorStop(1, `rgba(${p},0)`);
      ctx.fillStyle = atmo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // === Orbital rings ===
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * 1.18, R * 0.38, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${p},0.07)`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * 1.26, R * 0.3, 0.2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${p},0.04)`;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // === Core pulse ===
      const pulseA = 0.06 + 0.03 * Math.sin(t * 1.5);
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.5);
      core.addColorStop(0, `rgba(${pBright},${pulseA * 1.8})`);
      core.addColorStop(0.5, `rgba(${p},${pulseA})`);
      core.addColorStop(1, `rgba(${p},0)`);
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.5, 0, Math.PI * 2);
      ctx.fill();

      const dots = [];

      // === Grid lines ===
      latDegs.forEach(latDeg => {
        const lat = latDeg * Math.PI / 180;
        const isEq = latDeg === 0;
        ctx.beginPath();
        let zSum = 0, count = 0;
        for (let lonDeg = 0; lonDeg <= 360; lonDeg += 6) {
          const pt = proj(lat, lonDeg * Math.PI / 180 + rotation, offX, offY);
          if (lonDeg === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
          zSum += pt.z; count++;
          if (lonDeg % 30 === 0 && lonDeg < 360) dots.push(pt);
        }
        const avgD = (zSum / count + R) / (2 * R);
        ctx.strokeStyle = `rgba(${p},${isEq ? 0.1 + 0.35 * avgD : 0.04 + 0.2 * avgD})`;
        ctx.lineWidth = isEq ? 1.2 + 0.5 * avgD : 0.6 + 0.4 * avgD;
        ctx.stroke();
      });

      lonDegs.forEach(lonDeg => {
        const lon = lonDeg * Math.PI / 180 + rotation;
        ctx.beginPath();
        let zSum = 0, count = 0;
        for (let latDeg = -90; latDeg <= 90; latDeg += 6) {
          const pt = proj(latDeg * Math.PI / 180, lon, offX, offY);
          if (latDeg === -90) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
          zSum += pt.z; count++;
        }
        const avgD = (zSum / count + R) / (2 * R);
        ctx.strokeStyle = `rgba(${p},${0.04 + 0.18 * avgD})`;
        ctx.lineWidth = 0.6 + 0.4 * avgD;
        ctx.stroke();
      });

      // === Outer ring + scan ===
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${p},0.16)`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${p},0.035)`;
      ctx.lineWidth = 7;
      ctx.stroke();
      // Scan arc
      const sa = t * 0.4;
      ctx.beginPath();
      ctx.arc(cx, cy, R, sa, sa + 0.7);
      ctx.strokeStyle = `rgba(${pBright},0.28)`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // === Intersection dots ===
      dots.forEach(pt => {
        const d = (pt.z + R) / (2 * R);
        if (d < 0.25) return;
        const dr = 1.2 + 1.6 * d;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, dr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p},${0.15 + 0.6 * d})`;
        ctx.fill();
        if (d > 0.6) {
          const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, dr * 3.5);
          g.addColorStop(0, `rgba(${p},${0.04 + 0.12 * d})`);
          g.addColorStop(1, `rgba(${p},0)`);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, dr * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
      });

      // === Hotspots (pulsing bright nodes) ===
      hotspots.forEach((hs, i) => {
        const pt = proj(hs.lat * Math.PI / 180, hs.lon * Math.PI / 180 + rotation, offX, offY);
        const d = (pt.z + R) / (2 * R);
        if (d < 0.35) return;
        const pulse = 0.5 + 0.5 * Math.sin(t * 2.5 + i * 1.2);
        const alpha = (0.4 + 0.4 * pulse) * d;
        const hr = 2.5 + 1.5 * pulse;

        // Bright dot
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, hr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pBright},${alpha})`;
        ctx.fill();

        // Glow ring
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, hr + 4 + 3 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${pBright},${alpha * 0.25})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Large glow
        const hg = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 18 + 8 * pulse);
        hg.addColorStop(0, `rgba(${pBright},${alpha * 0.18})`);
        hg.addColorStop(1, `rgba(${p},0)`);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 18 + 8 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = hg;
        ctx.fill();
      });

      // === Hotspot connections (neural network arcs) ===
      const visibleHotspots = hotspots.map((hs, i) => {
        const pt = proj(hs.lat * Math.PI / 180, hs.lon * Math.PI / 180 + rotation, offX, offY);
        return { ...pt, d: (pt.z + R) / (2 * R), i };
      }).filter(h => h.d > 0.45);

      for (let i = 0; i < visibleHotspots.length; i++) {
        for (let j = i + 1; j < visibleHotspots.length; j++) {
          const a = visibleHotspots[i], b = visibleHotspots[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist > R * 1.2) continue;
          const avgD = (a.d + b.d) / 2;
          const flowPos = (t * 0.8 + i * 0.5) % 1;

          // Connection line
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - dist * 0.12;
          ctx.quadraticCurveTo(mx, my, b.x, b.y);
          ctx.strokeStyle = `rgba(${p},${0.06 + 0.06 * avgD})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Flowing dot along the arc
          const ft = flowPos;
          const fx = (1-ft)*(1-ft)*a.x + 2*(1-ft)*ft*mx + ft*ft*b.x;
          const fy = (1-ft)*(1-ft)*a.y + 2*(1-ft)*ft*my + ft*ft*b.y;
          ctx.beginPath();
          ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${pBright},${0.4 * avgD})`;
          ctx.fill();
        }
      }

      // === Data flow particles (flowing along meridians) ===
      dataFlows.forEach(df => {
        df.lat += df.speed;
        if (df.lat > 80) { df.lat = -80; df.lon = (df.lon + 15 + Math.random() * 10) % 360; }
        const pt = proj(df.lat * Math.PI / 180, df.lon * Math.PI / 180 + rotation, offX, offY);
        const d = (pt.z + R) / (2 * R);
        if (d < 0.3) return;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pBright},${df.alpha * d * 0.6})`;
        ctx.fill();
      });

      // === Orbital particles ===
      for (let i = 0; i < 6; i++) {
        const a = t * 0.3 + i * Math.PI * 2 / 6;
        const oR = R * 1.18 * (1 + 0.04 * Math.sin(t * 0.5 + i));
        const px = cx + oR * Math.cos(a);
        const py = cy + oR * Math.sin(a) * 0.38;
        if (Math.sin(a) < -0.15) continue;
        const alpha = 0.15 + 0.3 * ((Math.sin(a) + 1) / 2);
        ctx.beginPath();
        ctx.arc(px, py, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p},${alpha})`;
        ctx.fill();
        const pg = ctx.createRadialGradient(px, py, 0, px, py, 5);
        pg.addColorStop(0, `rgba(${p},${alpha * 0.3})`);
        pg.addColorStop(1, `rgba(${p},0)`);
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();
      }

      // === Floating labels ===
      ctx.font = `600 ${size * 0.022}px 'Plus Jakarta Sans', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      labels.forEach((lb, i) => {
        const a = lb.angle + t * lb.speed;
        const d = lb.dist * R;
        const lx = cx + d * Math.cos(a);
        const ly = cy + d * Math.sin(a) * 0.4;
        const fadeFactor = 0.5 + 0.5 * Math.cos(a); // fade when "behind"
        const alpha = 0.12 + 0.2 * fadeFactor;

        ctx.fillStyle = `rgba(${pBright},${alpha})`;
        ctx.fillText(lb.text, lx, ly);
      });

      // === Hover particles ===
      if (overGlobe && particles.length < 20 && Math.random() < 0.5) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.4 + Math.random() * 0.9;
        particles.push({
          x: localMx + (Math.random() - 0.5) * 30,
          y: localMy + (Math.random() - 0.5) * 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.4,
          life: 1,
          size: 1.5 + Math.random() * 2.2
        });
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx; pt.y += pt.vy;
        pt.vx *= 0.985; pt.vy *= 0.985;
        pt.life -= 0.008;
        if (pt.life <= 0) { particles.splice(i, 1); continue; }
        const a = pt.life * 0.85;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * pt.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pBright},${a})`;
        ctx.fill();
  
      }

      // === Hover cursor glow ===
      if (overGlobe) {
        const cg = ctx.createRadialGradient(localMx, localMy, 0, localMx, localMy, 80);
        cg.addColorStop(0, `rgba(${pBright},0.15)`);
        cg.addColorStop(0.4, `rgba(${p},0.05)`);
        cg.addColorStop(1, `rgba(${p},0)`);
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(localMx, localMy, 80, 0, Math.PI * 2);
        ctx.fill();
      }

      rotation += 0.002;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMove);
    };
  }, [size]);

  return (
    <canvas ref={canvasRef} style={{
      width: size, height: size, maxWidth: '100%',
      aspectRatio: '1 / 1'
    }} />
  );
}

Object.assign(window, { TechGlobe });
