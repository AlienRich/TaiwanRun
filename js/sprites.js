/**
 * TaiwanOutRun - SEGA 1986 OutRun Super-Scaler 點陣圖素與 6 大台灣神車渲染引擎
 * 包含：6 款特色載具精細正後方構圖、搞笑氮氣大招演出、撞車翻車解體小劇場 (Crash & Wipeout)
 */
class SpriteRenderer {
  constructor() {
    this.particles = [];
    for (let i = 0; i < 90; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 4,
        color: '#fff',
        life: 0,
        maxLife: 1
      });
    }

    // 預載入 6 款台灣神車《合金彈頭》像素圖集 (含所有行駛狀態與 18 步翻車分解空中重組序列)
    this.vehicleAtlases = {};
    this.initVehicleAtlases();

    // 預載入使用者上傳的 8 大終點《合金彈頭》全螢幕構圖
    this.finaleImages = {};
    this.initFinaleImages();
  }

  initFinaleImages() {
    const finaleMap = {
      end_eluanbi: 'assets/finales/finale_eluanbi.jpg',
      eluanbi: 'assets/finales/finale_eluanbi.jpg',
      end_penghu: 'assets/finales/finale_penghu.jpg',
      end_chihkan: 'assets/finales/finale_chihkan.jpg',
      tainan: 'assets/finales/finale_chihkan.jpg',
      end_alishan: 'assets/finales/finale_alishan.jpg',
      alishan: 'assets/finales/finale_alishan.jpg',
      end_sanxiantai: 'assets/finales/finale_sanxiantai.jpg',
      sanxiantai: 'assets/finales/finale_sanxiantai.jpg',
      end_lukang: 'assets/finales/finale_lukang.jpg',
      end_baishatun: 'assets/finales/finale_baishatun.jpg',
      end_taroko: 'assets/finales/finale_taroko.jpg',
      taroko: 'assets/finales/finale_taroko.jpg'
    };
    const cacheBySrc = {};
    Object.keys(finaleMap).forEach((stageId) => {
      const src = finaleMap[stageId];
      if (!cacheBySrc[src]) {
        const img = new Image();
        img.decoding = 'async';
        img.src = src;
        const entry = { img, loaded: false };
        img.onload = () => {
          entry.loaded = true;
        };
        cacheBySrc[src] = entry;
      }
      this.finaleImages[stageId] = cacheBySrc[src];
    });
  }

  hasFinaleImage(stageId) {
    const entry = this.finaleImages && this.finaleImages[stageId];
    return Boolean(entry && entry.loaded && entry.img && entry.img.complete && entry.img.naturalWidth > 0);
  }

  initVehicleAtlases() {
    const atlasMap = window.VEHICLE_SPRITE_ATLAS || {};
    Object.keys(atlasMap).forEach((id) => {
      const entry = atlasMap[id];
      const img = new Image();
      img.decoding = 'async';
      img.src = entry.src;
      this.vehicleAtlases[id] = {
        img,
        frames: entry.frames,
        loaded: false
      };
      img.onload = () => {
        this.vehicleAtlases[id].loaded = true;
        if (typeof window.onVehicleAtlasLoaded === 'function') {
          window.onVehicleAtlasLoaded(id);
        }
      };
    });
  }

  hasAtlas(vehicleId) {
    const a = this.vehicleAtlases[vehicleId];
    return Boolean(a && a.loaded && a.img && a.img.complete && a.img.naturalWidth > 0);
  }

  /**
   * 繪製車庫選車卡片的像素預覽圖
   */
  drawVehicleCardPreview(canvasEl, vehicleId) {
    if (!canvasEl) return;
    const pctx = canvasEl.getContext('2d');
    const cw = canvasEl.width;
    const ch = canvasEl.height;
    pctx.clearRect(0, 0, cw, ch);

    if (!this.hasAtlas(vehicleId)) return;
    const atlas = this.vehicleAtlases[vehicleId];
    const frame = atlas.frames.right_cruise1 || atlas.frames.left_cruise1 || atlas.frames.cruise1;
    if (!frame) return;

    pctx.save();
    pctx.imageSmoothingEnabled = false;
    const pad = 4;
    const scale = Math.min((cw - pad * 2) / frame.w, (ch - pad * 2) / frame.h);
    const dw = Math.floor(frame.w * scale);
    const dh = Math.floor(frame.h * scale);
    const dx = Math.floor((cw - dw) / 2);
    const dy = Math.floor(ch - dh - 2);
    pctx.drawImage(atlas.img, frame.x, frame.y, frame.w, frame.h, dx, dy, dw, dh);
    pctx.restore();
  }

  spawnParticle(x, y, vx, vy, size, color, maxLife = 0.4) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) {
        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = vx;
        p.vy = vy;
        p.size = size;
        p.color = color;
        p.life = 0;
        p.maxLife = maxLife;
        return;
      }
    }
  }

  updateAndDrawParticles(ctx, dt) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const alpha = 1 - p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      const s = Math.max(2, Math.floor(p.size * (1 + p.life * 1.6)));
      ctx.fillRect(Math.floor(p.x - s / 2), Math.floor(p.y - s / 2), s, s);
    }
    ctx.globalAlpha = 1.0;
  }

  drawArcadeText(ctx, text, x, y, font, fillStyle, align = 'left', shadowOffset = 2) {
    ctx.save();
    ctx.font = font;
    ctx.textAlign = align;
    ctx.fillStyle = '#000000';
    ctx.fillText(text, x + shadowOffset, y + shadowOffset);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = fillStyle;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  /**
   * 繪製貼切台灣各關卡真實地景的多層次視差山海遠景：
   * - 蘇花公路清水斷崖 (suhua)：左側險峻斷崖垂直入海、右側一望無際太平洋海平線與遠洋輪船
   * - 阿里山神木雲海 (alishan)：金色日出光芒、翻騰白色雲海與左側千年紅檜巨木剪影
   * - 花蓮太魯閣峽谷 (taroko)：左右高聳大理石峽谷峭壁與山谷吊橋
   * - 九份山城 (jiufen)：層疊山城茶樓窗火、紅燈籠串與東北角海灣夜景
   * - 墾丁南灣 (kenting)：白色鵝鑾鼻燈塔、翠綠岬角與碧藍熱帶海洋
   * - 台北/高雄 (taipei/kaohsiung)：台北 101 / 高雄 85 大樓與都會霓虹天際線
   */
  drawBackground(ctx, width, height, horizonY, skyOffset, stageTheme) {
    const clampedHorizon = Math.max(60, Math.min(height - 60, Math.floor(horizonY)));
    const hTheme = stageTheme.horizonTheme || stageTheme.id;
    const now = performance.now();

    // 1. 多層次大氣漸層天空 (呈現真實晨昏、碧海藍天與高山暮色)
    const grad = ctx.createLinearGradient(0, 0, 0, clampedHorizon);
    grad.addColorStop(0, stageTheme.skyTop);
    grad.addColorStop(0.52, stageTheme.skyMid || stageTheme.skyBottom);
    grad.addColorStop(0.88, stageTheme.skyBottom);
    grad.addColorStop(1, '#fff5e4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, clampedHorizon);

    const cloudShift = ((skyOffset * 0.25) % width + width) % width;
    const mountainShift = ((skyOffset * 0.55) % width + width) % width;
    const nearShift = ((skyOffset * 0.9) % width + width) % width;

    // 2. 若為合歡山暗空公園、馬祖藍眼淚或九份山城夜色：繪製璀璨星斗與銀河星雲
    if (hTheme === 'hehuanshan_galaxy' || hTheme === 'matsu_qinbi' || hTheme === 'jiufen') {
      for (let s = 0; s < 48; s++) {
        const sx = (s * 73 + Math.floor(skyOffset * 0.06)) % width;
        const sy = (s * 31) % Math.max(24, clampedHorizon - 45);
        const twinkle = 0.45 + 0.55 * Math.abs(Math.sin(now * 0.003 + s));
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle.toFixed(2)})`;
        const sz = (s % 4 === 0) ? 3 : 2;
        ctx.fillRect((sx + width) % width, sy, sz, sz);
      }
      if (hTheme === 'hehuanshan_galaxy' || hTheme === 'matsu_qinbi') {
        const galGrad = ctx.createLinearGradient(width * 0.2, 0, width * 0.7, clampedHorizon);
        galGrad.addColorStop(0, 'rgba(155, 89, 182, 0.22)');
        galGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.25)');
        galGrad.addColorStop(1, 'rgba(46, 213, 115, 0.14)');
        ctx.fillStyle = galGrad;
        ctx.beginPath();
        ctx.moveTo(width * 0.12, 0);
        ctx.lineTo(width * 0.42, 0);
        ctx.lineTo(width * 0.78, clampedHorizon);
        ctx.lineTo(width * 0.46, clampedHorizon);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 3. 太陽 / 明月與三層神聖光暈 (Sun / Moon Halo & Crepuscular Rays)
    const sunX = Math.floor(((width * 0.72 - skyOffset * 0.12) % width + width) % width);
    const sunY = clampedHorizon - 58;
    const haloGrad = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 88);
    haloGrad.addColorStop(0, stageTheme.sunColor || '#fff200');
    haloGrad.addColorStop(0.42, 'rgba(255, 215, 110, 0.42)');
    haloGrad.addColorStop(1, 'rgba(255, 215, 110, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 88, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = stageTheme.sunColor;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.arc(sunX - 6, sunY - 6, 16, 0, Math.PI * 2);
    ctx.fill();

    // 4. 立體雙色雲海與遠方飛鳥 (Multi-layered Pixel Clouds & Soaring Birds)
    for (let i = -1; i <= 1; i++) {
      const cx = i * width - cloudShift;
      const clouds = [
        { x: cx + 36, y: clampedHorizon - 92, w: 118, h: 12 },
        { x: cx + 190, y: clampedHorizon - 108, w: 92, h: 10 },
        { x: cx + 310, y: clampedHorizon - 78, w: 146, h: 13 },
        { x: cx + 510, y: clampedHorizon - 98, w: 108, h: 11 }
      ];
      clouds.forEach((c) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.fillRect(c.x + c.w * 0.16, c.y - 6, c.w * 0.66, 6);
        ctx.fillStyle = 'rgba(255, 234, 167, 0.35)';
        ctx.fillRect(c.x + 4, c.y + c.h - 3, c.w - 8, 3);
      });
    }

    // 飛翔海鷗/山鳥剪影
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.5;
    for (let b = 0; b < 4; b++) {
      const bx = ((b * 130 + now * 0.025) % (width - 60)) + 30;
      const by = 26 + (b % 2) * 16 + Math.sin(now * 0.005 + b) * 4;
      const flap = Math.sin(now * 0.012 + b * 1.4) * 3;
      ctx.beginPath();
      ctx.moveTo(bx - 6, by + flap);
      ctx.quadraticCurveTo(bx - 3, by - 3, bx, by);
      ctx.quadraticCurveTo(bx + 3, by - 3, bx + 6, by + flap);
      ctx.stroke();
    }

    if (hTheme === 'fugang_town') {
      // 【起點：桃園楊梅・富岡火車站與昭和老街精緻天際線】
      // 遠景楊梅伯公岡台地翠綠茶園山陵
      ctx.fillStyle = '#2d4c3e';
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon);
      ctx.lineTo(0, clampedHorizon - 46);
      ctx.lineTo(width * 0.28, clampedHorizon - 58);
      ctx.lineTo(width * 0.62, clampedHorizon - 40);
      ctx.lineTo(width, clampedHorizon - 52);
      ctx.lineTo(width, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      for (let i = -1; i <= 1; i++) {
        const nx = i * width - nearShift * 0.45;
        // 昭和紅磚老街連棟斜瓦街屋與的女兒牆
        for (let b = 0; b < width; b += 46) {
          ctx.fillStyle = '#8e3b1c';
          ctx.fillRect(nx + b, clampedHorizon - 28, 42, 28);
          ctx.fillStyle = '#d35400';
          ctx.fillRect(nx + b + 4, clampedHorizon - 24, 12, 10);
          ctx.fillRect(nx + b + 22, clampedHorizon - 24, 12, 10);
          ctx.fillStyle = '#c0392b';
          ctx.fillRect(nx + b - 2, clampedHorizon - 34, 46, 6);
        }
        // 呂家聲洋樓「鑊嫲篤」拜占庭圓頂與希臘山牆剪影
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath();
        ctx.arc(nx + 210, clampedHorizon - 34, 24, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(nx + 186, clampedHorizon - 34, 48, 6);
        // 永昌碾米廠紅磚高塔與木造穀倉屋脊
        ctx.fillStyle = '#a04000';
        ctx.fillRect(nx + 420, clampedHorizon - 68, 28, 68);
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.moveTo(nx + 414, clampedHorizon - 68);
        ctx.lineTo(nx + 434, clampedHorizon - 80);
        ctx.lineTo(nx + 454, clampedHorizon - 68);
        ctx.closePath();
        ctx.fill();
      }
      // 台鐵電車線門型架與行駛中的台鐵區間快車
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon - 22);
      ctx.lineTo(width, clampedHorizon - 22);
      ctx.stroke();

      const trainX = ((now * 0.065) % (width + 220)) - 110;
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(trainX, clampedHorizon - 16, 108, 14);
      ctx.fillStyle = '#dfe6e9';
      ctx.fillRect(trainX, clampedHorizon - 10, 108, 4);
      ctx.fillStyle = '#ffd32a';
      for (let w = 0; w < 6; w++) {
        ctx.fillRect(trainX + 8 + w * 16, clampedHorizon - 14, 10, 5);
      }
      return;
    }

    if (hTheme === 'suhua' || hTheme === 'sanxiantai_bridge' || hTheme === 'longpan_cliff') {
      // 【清水斷崖 / 七星潭 / 三仙台 / 龍磐崩崖】左半邊千仞大理石翠綠斷崖、右半邊漸層太平洋與白浪拍岸
      const seaGrad = ctx.createLinearGradient(0, clampedHorizon - 30, 0, clampedHorizon);
      seaGrad.addColorStop(0, '#003d66');
      seaGrad.addColorStop(0.55, '#0077b6');
      seaGrad.addColorStop(1, '#00b4d8');
      ctx.fillStyle = seaGrad;
      ctx.fillRect(width * 0.28, clampedHorizon - 30, width * 0.72, 30);

      // 海面波光粼粼太陽倒影與白色浪花線
      for (let w = 0; w < 8; w++) {
        const wy = clampedHorizon - 26 + w * 3.2;
        const waveX = width * 0.34 + ((w * 57 + now * 0.02) % (width * 0.58));
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.fillRect(waveX, wy, 28 + (w % 3) * 14, 1.8);
      }

      if (hTheme === 'sanxiantai_bridge') {
        // 遠景台東三仙台八拱跨海步橋與離岸三座火山角礫岩巨島
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(width * 0.80, clampedHorizon - 10, 34, Math.PI, 0);
        ctx.arc(width * 0.74, clampedHorizon - 10, 24, Math.PI, 0);
        ctx.arc(width * 0.85, clampedHorizon - 10, 22, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.arc(width * 0.80, clampedHorizon - 16, 22, Math.PI, 0);
        ctx.fill();
        for (let a = 0; a < 8; a++) {
          const ax = width * 0.42 + a * 18;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(ax, clampedHorizon - 12, 9, Math.PI, 0);
          ctx.stroke();
          ctx.strokeStyle = '#ff3838';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(ax, clampedHorizon - 14, 9, Math.PI, 0);
          ctx.stroke();
        }
      }

      // 左側多層次清水斷崖大理石岩層與山嵐雲霧
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon);
      ctx.lineTo(0, clampedHorizon - 124);
      ctx.lineTo(width * 0.14, clampedHorizon - 110);
      ctx.lineTo(width * 0.28, clampedHorizon - 82);
      ctx.lineTo(width * 0.44, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      // 岩壁大理石亮面紋理與翠綠植被冠
      ctx.fillStyle = '#7f8c8d';
      ctx.beginPath();
      ctx.moveTo(width * 0.08, clampedHorizon);
      ctx.lineTo(width * 0.14, clampedHorizon - 102);
      ctx.lineTo(width * 0.26, clampedHorizon - 76);
      ctx.lineTo(width * 0.38, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1e8449';
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon - 124);
      ctx.lineTo(width * 0.14, clampedHorizon - 110);
      ctx.lineTo(width * 0.28, clampedHorizon - 82);
      ctx.lineTo(width * 0.22, clampedHorizon - 68);
      ctx.lineTo(0, clampedHorizon - 92);
      ctx.closePath();
      ctx.fill();

      // 斷崖山腳拍岸白浪泡沫
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(width * 0.36, clampedHorizon - 5, width * 0.16, 4);
      return;
    }

    if (hTheme === 'gaomei_windmills') {
      // 【高美濕地】夕陽餘暉天空之鏡倒影 + 蜿蜒木棧道 + 一字排開旋轉的巨型白色風力發電機組
      const mirrorGrad = ctx.createLinearGradient(0, clampedHorizon - 24, 0, clampedHorizon);
      mirrorGrad.addColorStop(0, '#ff7f50');
      mirrorGrad.addColorStop(0.5, '#ffbe76');
      mirrorGrad.addColorStop(1, '#686de0');
      ctx.fillStyle = mirrorGrad;
      ctx.fillRect(0, clampedHorizon - 24, width, 24);

      // 濕地水面夕陽金波倒影
      ctx.fillStyle = 'rgba(255, 242, 0, 0.45)';
      for (let r = 0; r < 5; r++) {
        ctx.fillRect(sunX - 28 + r * 3, clampedHorizon - 22 + r * 4, 56 - r * 6, 2.5);
      }

      const bladeAngle = now * 0.0025;
      for (let w = 0; w < 6; w++) {
        const wx = Math.floor(width * 0.10 + w * (width * 0.16) - (nearShift * 0.12) % 48);
        const wy = clampedHorizon - 84;
        // 水中風車倒影
        ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.fillRect(wx - 1.5, clampedHorizon - 22, 3, 22);
        // 風車塔柱
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(wx - 2.5, wy, 5, 64);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(wx - 2.5, wy + 46, 5, 6);
        for (let b = 0; b < 3; b++) {
          const ang = bladeAngle + w * 0.7 + (b * Math.PI * 2) / 3;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(wx, wy);
          ctx.lineTo(wx + Math.cos(ang) * 28, wy + Math.sin(ang) * 28);
          ctx.stroke();
        }
      }
      return;
    }

    if (hTheme === 'volcano_fumarole') {
      // 【陽明山小油坑】大屯火山群層疊山峰、崩塌硫磺火山口、金黃芒草坡與直衝天際的白色硫氣噴煙
      ctx.fillStyle = '#3d4852';
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon);
      ctx.lineTo(width * 0.18, clampedHorizon - 92);
      ctx.lineTo(width * 0.44, clampedHorizon - 58);
      ctx.lineTo(width * 0.76, clampedHorizon - 104);
      ctx.lineTo(width, clampedHorizon - 48);
      ctx.lineTo(width, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.moveTo(width * 0.44, clampedHorizon - 58);
      ctx.lineTo(width * 0.76, clampedHorizon - 104);
      ctx.lineTo(width, clampedHorizon - 48);
      ctx.lineTo(width, clampedHorizon);
      ctx.lineTo(width * 0.44, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      // 黃色硫磺結晶壁與多層次上升白煙
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(width * 0.16, clampedHorizon - 56, 62, 32);
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(width * 0.18, clampedHorizon - 48, 44, 18);
      const smokeLift = (now * 0.03) % 52;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
      ctx.beginPath();
      ctx.arc(width * 0.21, clampedHorizon - 58 - smokeLift, 18 + smokeLift * 0.32, 0, Math.PI * 2);
      ctx.arc(width * 0.25, clampedHorizon - 76 - smokeLift * 0.85, 25, 0, Math.PI * 2);
      ctx.arc(width * 0.18, clampedHorizon - 88 - smokeLift * 0.65, 20, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (hTheme === 'shifen_lanterns') {
      // 【十分瀑布與平溪老街】翠綠山谷層巒、十分大瀑布水霧與冉冉升空的祈福天燈海
      ctx.fillStyle = '#1e372f';
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon);
      ctx.lineTo(0, clampedHorizon - 68);
      ctx.lineTo(width * 0.32, clampedHorizon - 84);
      ctx.lineTo(width * 0.64, clampedHorizon - 52);
      ctx.lineTo(width, clampedHorizon - 78);
      ctx.lineTo(width, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      const rise = (now * 0.022) % 95;
      for (let l = 0; l < 9; l++) {
        const lx = (55 + l * Math.floor(width / 9)) % width;
        const ly = clampedHorizon - 22 - ((rise + l * 26) % 98);
        // 天燈暖紅外暈
        ctx.fillStyle = 'rgba(255, 159, 67, 0.32)';
        ctx.beginPath();
        ctx.arc(lx, ly, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = (l % 2 === 0) ? '#ff5252' : '#ff793f';
        ctx.fillRect(lx - 7, ly - 10, 14, 16);
        ctx.fillStyle = '#fff200';
        ctx.fillRect(lx - 4, ly + 2, 8, 5);
      }
      return;
    }

    if (hTheme === 'foguang_buddha') {
      // 【佛光山佛陀紀念館】萬道金色佛光、對稱成佛大道八寶塔與遠方 108 公尺金色佛光大佛
      const cx = width * 0.5;
      const haloR = 88 + Math.sin(now * 0.003) * 6;
      const bGrad = ctx.createRadialGradient(cx, clampedHorizon - 48, 10, cx, clampedHorizon - 48, haloR);
      bGrad.addColorStop(0, 'rgba(255, 242, 0, 0.65)');
      bGrad.addColorStop(0.55, 'rgba(255, 165, 2, 0.25)');
      bGrad.addColorStop(1, 'rgba(255, 165, 2, 0)');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(cx, clampedHorizon - 44, haloR, Math.PI, 0);
      ctx.fill();

      // 兩側對稱中國式寶塔剪影
      [-170, -125, -85, 85, 125, 170].forEach((ox) => {
        ctx.fillStyle = '#b03a2e';
        ctx.fillRect(cx + ox - 8, clampedHorizon - 46, 16, 46);
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(cx + ox - 11, clampedHorizon - 50, 22, 5);
        ctx.fillRect(cx + ox - 10, clampedHorizon - 34, 20, 4);
      });

      // 中央金色大佛與蓮花座
      ctx.fillStyle = '#ffd32a';
      ctx.beginPath();
      ctx.arc(cx, clampedHorizon - 72, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - 24, clampedHorizon - 56, 48, 42);
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(cx - 32, clampedHorizon - 14, 64, 14);
      return;
    }

    if (hTheme === 'lanyang_guishan') {
      // 【宜蘭蘭陽博物館】太平洋碧波、海平面上栩栩如生的「龜山島（含海底溫泉白煙）」與單面山博物館倒影
      ctx.fillStyle = '#005f73';
      ctx.fillRect(0, clampedHorizon - 24, width, 24);
      ctx.fillStyle = '#0a9396';
      ctx.fillRect(0, clampedHorizon - 10, width, 10);

      // 龜山島（昂首龜頭、高聳龜甲山峰、靈動龜尾與翠綠植被層）
      ctx.fillStyle = '#1b4332';
      ctx.beginPath();
      ctx.moveTo(width * 0.54, clampedHorizon - 16);
      ctx.lineTo(width * 0.58, clampedHorizon - 44); // 龜首
      ctx.lineTo(width * 0.62, clampedHorizon - 32);
      ctx.lineTo(width * 0.70, clampedHorizon - 66); // 401高地龜甲主峰
      ctx.lineTo(width * 0.80, clampedHorizon - 26);
      ctx.lineTo(width * 0.88, clampedHorizon - 16); // 龜尾長灘
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#40916c';
      ctx.beginPath();
      ctx.moveTo(width * 0.62, clampedHorizon - 32);
      ctx.lineTo(width * 0.70, clampedHorizon - 66);
      ctx.lineTo(width * 0.76, clampedHorizon - 36);
      ctx.closePath();
      ctx.fill();

      // 龜首海底硫磺溫泉湧出牛奶海白煙
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.arc(width * 0.55, clampedHorizon - 18, 9, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (hTheme === 'alishan' || hTheme === 'xitou_bamboo') {
      // 【阿里山日出雲海 / 溪頭竹林】層疊玉山群峰、翻騰金色雲海與千年紅檜巨木林
      ctx.fillStyle = '#1e3746';
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon);
      ctx.lineTo(0, clampedHorizon - 98);
      ctx.lineTo(width * 0.26, clampedHorizon - 76);
      ctx.lineTo(width * 0.52, clampedHorizon - 105);
      ctx.lineTo(width * 0.78, clampedHorizon - 64);
      ctx.lineTo(width, clampedHorizon - 86);
      ctx.lineTo(width, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      // 翻湧的多層次日出金邊雲海
      for (let c = -48; c < width + 48; c += 42) {
        const cx = c - (cloudShift * 0.35) % 42;
        const ch = 18 + ((Math.abs(c) * 13) % 16);
        ctx.fillStyle = '#ffeaa7';
        ctx.beginPath();
        ctx.arc(cx + 22, clampedHorizon - ch, 24, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx, clampedHorizon - ch, 46, ch);
      }

      // 左側參天千年紅檜神木群
      ctx.fillStyle = '#4a2511';
      ctx.fillRect(38, clampedHorizon - 116, 20, 116);
      ctx.fillRect(108, clampedHorizon - 94, 16, 94);
      ctx.fillStyle = '#145a32';
      ctx.beginPath();
      ctx.arc(48, clampedHorizon - 114, 34, 0, Math.PI * 2);
      ctx.arc(116, clampedHorizon - 94, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.arc(42, clampedHorizon - 118, 22, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (hTheme === 'kenting' || hTheme === 'yehliu_cape' || hTheme === 'qimei_twin_hearts' || hTheme === 'liuqiu_vase_rock' || hTheme === 'penghu_ocean') {
      // 【墾丁南灣 / 野柳岬 / 澎湖雙心石滬 / 小琉球花瓶岩 / 澎湖跨海大橋】熱帶珊瑚礁漸層碧海、白色浪花與專屬海岸地標
      const tropGrad = ctx.createLinearGradient(0, clampedHorizon - 30, 0, clampedHorizon);
      tropGrad.addColorStop(0, '#005086');
      tropGrad.addColorStop(0.55, '#00a8e8');
      tropGrad.addColorStop(1, '#00f5d4');
      ctx.fillStyle = tropGrad;
      ctx.fillRect(0, clampedHorizon - 30, width, 30);

      // 海岸白色浪花與陽光水波
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      for (let w = 0; w < 8; w++) {
        const wx = ((w * 92 + now * 0.018) % (width - 40));
        ctx.fillRect(wx, clampedHorizon - 6 - (w % 3) * 7, 28 + (w % 2) * 14, 2);
      }

      if (hTheme === 'yehliu_cape') {
        // 野柳單面山海岬、燭台石群與女王頭岩層天際線
        ctx.fillStyle = '#a67c52';
        ctx.beginPath();
        ctx.moveTo(0, clampedHorizon - 14);
        ctx.lineTo(width * 0.18, clampedHorizon - 58);
        ctx.lineTo(width * 0.46, clampedHorizon - 28);
        ctx.lineTo(width * 0.65, clampedHorizon - 14);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#d4a373';
        ctx.beginPath();
        ctx.moveTo(width * 0.06, clampedHorizon - 14);
        ctx.lineTo(width * 0.18, clampedHorizon - 58);
        ctx.lineTo(width * 0.34, clampedHorizon - 24);
        ctx.closePath();
        ctx.fill();
        // 遠景女王頭與蕈狀岩剪影
        const qx = width * 0.42;
        ctx.fillStyle = '#c89b6e';
        ctx.beginPath();
        ctx.arc(qx, clampedHorizon - 42, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(qx - 2.5, clampedHorizon - 35, 5, 12);
        ctx.fillRect(qx - 9, clampedHorizon - 24, 18, 10);
      } else if (hTheme === 'qimei_twin_hearts') {
        // 澎湖七美雙心石滬玄武岩海岬與翡翠海灣雙心滬堤
        ctx.fillStyle = '#3d405b';
        ctx.beginPath();
        ctx.moveTo(0, clampedHorizon - 18);
        ctx.lineTo(width * 0.28, clampedHorizon - 54);
        ctx.lineTo(width * 0.44, clampedHorizon - 18);
        ctx.closePath();
        ctx.fill();
        // 海面玄武岩雙心石滬弧線
        ctx.strokeStyle = '#e0e1dd';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(width * 0.62, clampedHorizon - 15, 28, 8, -0.1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(width * 0.68, clampedHorizon - 11, 32, 9, -0.1, 0, Math.PI * 2);
        ctx.stroke();
      } else if (hTheme === 'liuqiu_vase_rock') {
        // 小琉球花瓶岩珊瑚裙礁與翠綠冠頂
        const vx = width * 0.66;
        ctx.fillStyle = '#b5835a';
        ctx.fillRect(vx - 6, clampedHorizon - 36, 12, 22);
        ctx.fillRect(vx - 12, clampedHorizon - 52, 24, 18);
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(vx, clampedHorizon - 54, 16, 0, Math.PI * 2);
        ctx.fill();
      } else if (hTheme === 'penghu_ocean') {
        // 澎湖跨海大橋連綿白色橋墩與拱門橫跨碧海
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(width * 0.18, clampedHorizon - 20);
        ctx.lineTo(width * 0.82, clampedHorizon - 20);
        ctx.stroke();
        for (let p = 0; p < 12; p++) {
          ctx.fillStyle = '#dfe6e9';
          ctx.fillRect(width * (0.20 + p * 0.052), clampedHorizon - 20, 3, 12);
        }
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(width * 0.5, clampedHorizon - 18, 28, Math.PI, 0);
        ctx.stroke();
      } else {
        // 墾丁鵝鑾鼻白色燈塔、大尖山與熱帶椰林海岬
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.moveTo(0, clampedHorizon);
        ctx.lineTo(0, clampedHorizon - 52);
        ctx.lineTo(width * 0.26, clampedHorizon - 42);
        ctx.lineTo(width * 0.42, clampedHorizon);
        ctx.closePath();
        ctx.fill();
        // 墾丁大尖山標誌性尖峰
        ctx.fillStyle = '#1e8449';
        ctx.beginPath();
        ctx.moveTo(width * 0.22, clampedHorizon - 38);
        ctx.lineTo(width * 0.29, clampedHorizon - 82);
        ctx.lineTo(width * 0.36, clampedHorizon - 28);
        ctx.closePath();
        ctx.fill();

        const lhX = Math.floor(width * 0.15);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(lhX - 9, clampedHorizon - 94, 18, 54);
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(lhX, clampedHorizon - 94, 11, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 242, 0, 0.45)';
        ctx.beginPath();
        ctx.moveTo(lhX, clampedHorizon - 92);
        ctx.lineTo(lhX + 95, clampedHorizon - 115);
        ctx.lineTo(lhX + 95, clampedHorizon - 70);
        ctx.closePath();
        ctx.fill();
      }
      return;
    }

    if (hTheme === 'sunmoon_lake' || hTheme === 'liyutan_lake') {
      // 【日月潭 / 花蓮鯉魚潭】水社大山層巒、慈恩塔九層寶塔、拉魯島與碧綠湖面波光倒影
      ctx.fillStyle = '#2c5e4f';
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon - 22);
      ctx.lineTo(width * 0.16, clampedHorizon - 88);
      ctx.lineTo(width * 0.38, clampedHorizon - 54);
      ctx.lineTo(width * 0.64, clampedHorizon - 96);
      ctx.lineTo(width * 0.86, clampedHorizon - 58);
      ctx.lineTo(width, clampedHorizon - 76);
      ctx.lineTo(width, clampedHorizon - 22);
      ctx.closePath();
      ctx.fill();

      // 山頂慈恩塔（日月潭標誌八角寶塔）
      if (hTheme === 'sunmoon_lake') {
        const px = Math.floor(width * 0.64);
        const py = clampedHorizon - 96;
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(px - 5, py - 28, 10, 28);
        ctx.fillStyle = '#ffd32a';
        for (let r = 0; r < 4; r++) {
          ctx.fillRect(px - 8 + r * 0.5, py - 28 + r * 7, 16 - r, 2.5);
        }
      }

      // 碧綠潭水與金色湖面波光
      const lakeGrad = ctx.createLinearGradient(0, clampedHorizon - 24, 0, clampedHorizon);
      lakeGrad.addColorStop(0, '#0a6c74');
      lakeGrad.addColorStop(0.5, '#16a085');
      lakeGrad.addColorStop(1, '#48c9b0');
      ctx.fillStyle = lakeGrad;
      ctx.fillRect(0, clampedHorizon - 24, width, 24);

      // 湖中央拉魯島 (Lalu Island) 與遊艇白浪
      ctx.fillStyle = '#1e8449';
      ctx.beginPath();
      ctx.ellipse(width * 0.45, clampedHorizon - 14, 28, 7, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 234, 167, 0.55)';
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(width * (0.2 + i * 0.12), clampedHorizon - 18 + (i % 3) * 5, 24, 2);
      }
      return;
    }

    if (hTheme === 'palace_museum') {
      // 【台北故宮博物院】外雙溪翠綠群山環抱、黃瓦綠脊白牆中式宮殿大景與漢白玉天下為公牌坊
      ctx.fillStyle = '#1b4332';
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon);
      ctx.lineTo(width * 0.22, clampedHorizon - 96);
      ctx.lineTo(width * 0.50, clampedHorizon - 78);
      ctx.lineTo(width * 0.78, clampedHorizon - 102);
      ctx.lineTo(width, clampedHorizon - 58);
      ctx.lineTo(width, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      const cx = Math.floor(width * 0.5);
      // 宮殿漢白玉三層基座
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(cx - 110, clampedHorizon - 32, 220, 32);
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(cx - 90, clampedHorizon - 54, 180, 22);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 64, clampedHorizon - 74, 128, 20);
      // 琉璃金黃重簷歇山頂與翠綠屋脊
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.moveTo(cx - 78, clampedHorizon - 74);
      ctx.lineTo(cx, clampedHorizon - 94);
      ctx.lineTo(cx + 78, clampedHorizon - 74);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#16a085';
      ctx.fillRect(cx - 102, clampedHorizon - 58, 204, 6);
      return;
    }

    if (hTheme === 'cingjing_castle') {
      // 【清境農場】奇萊合歡連峰、青青草原翠綠牧場、歐式綿羊城堡與放牧綿羊群
      ctx.fillStyle = '#2b4c7e';
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon);
      ctx.lineTo(width * 0.18, clampedHorizon - 92);
      ctx.lineTo(width * 0.48, clampedHorizon - 110);
      ctx.lineTo(width * 0.76, clampedHorizon - 84);
      ctx.lineTo(width, clampedHorizon - 98);
      ctx.lineTo(width, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      // 青青草原緩坡
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon);
      ctx.quadraticCurveTo(width * 0.35, clampedHorizon - 58, width, clampedHorizon - 18);
      ctx.lineTo(width, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      // 歐式都鐸風綿羊城堡
      const kx = Math.floor(width * 0.28);
      ctx.fillStyle = '#dfe6e9';
      ctx.fillRect(kx - 28, clampedHorizon - 64, 56, 36);
      ctx.fillRect(kx - 36, clampedHorizon - 78, 18, 50);
      ctx.fillRect(kx + 18, clampedHorizon - 78, 18, 50);
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.moveTo(kx - 40, clampedHorizon - 78);
      ctx.lineTo(kx - 27, clampedHorizon - 96);
      ctx.lineTo(kx - 14, clampedHorizon - 78);
      ctx.moveTo(kx + 14, clampedHorizon - 78);
      ctx.lineTo(kx + 27, clampedHorizon - 96);
      ctx.lineTo(kx + 40, clampedHorizon - 78);
      ctx.fill();
      return;
    }

    if (hTheme === 'chishang_paddy' || hTheme === 'rift_valley') {
      // 【池上伯朗大道 / 關山縱谷】中央山脈雲瀑、一望無際金黃稻浪與奉茶金城武樹
      ctx.fillStyle = '#2d4c68';
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon - 18);
      ctx.lineTo(width * 0.20, clampedHorizon - 98);
      ctx.lineTo(width * 0.46, clampedHorizon - 74);
      ctx.lineTo(width * 0.72, clampedHorizon - 106);
      ctx.lineTo(width, clampedHorizon - 68);
      ctx.lineTo(width, clampedHorizon - 18);
      ctx.closePath();
      ctx.fill();

      // 山腰白色雲瀑
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      for (let c = 0; c < width; c += 36) {
        ctx.beginPath();
        ctx.arc(c, clampedHorizon - 36, 16, 0, Math.PI * 2);
        ctx.fill();
      }

      // 縱谷金黃稻浪平原
      const paddyGrad = ctx.createLinearGradient(0, clampedHorizon - 24, 0, clampedHorizon);
      paddyGrad.addColorStop(0, '#badc58');
      paddyGrad.addColorStop(0.5, '#f1c40f');
      paddyGrad.addColorStop(1, '#e67e22');
      ctx.fillStyle = paddyGrad;
      ctx.fillRect(0, clampedHorizon - 24, width, 24);

      // 伯朗大道金城武樹剪影
      const tx = Math.floor(width * 0.62);
      ctx.fillStyle = '#5c2e14';
      ctx.fillRect(tx - 4, clampedHorizon - 42, 8, 24);
      ctx.fillStyle = '#1e8449';
      ctx.beginPath();
      ctx.arc(tx, clampedHorizon - 48, 20, 0, Math.PI * 2);
      ctx.arc(tx - 12, clampedHorizon - 42, 14, 0, Math.PI * 2);
      ctx.arc(tx + 12, clampedHorizon - 42, 14, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (hTheme === 'tainan_forts' || hTheme === 'temple_festive') {
      // 【台南府城古蹟群・赤嵌樓・安平古堡・林百貨 / 鹿港天后宮 / 白沙屯拱天宮 全景天際線】
      const cx = Math.floor(width * 0.5);
      const isTainan = hTheme === 'tainan_forts';

      // 1. 遠景台江內海夕照霞光與全寬古都紅瓦街屋天際線
      ctx.fillStyle = '#5c2314';
      for (let b = -40; b < width + 40; b += 42) {
        const sx = b - (nearShift * 0.25) % 42;
        const sh = 18 + ((Math.abs(b) * 11) % 16);
        ctx.fillRect(sx, clampedHorizon - sh, 38, sh);
        ctx.fillStyle = '#a04000';
        ctx.fillRect(sx - 2, clampedHorizon - sh - 4, 42, 4);
        ctx.fillStyle = '#ffd32a';
        ctx.fillRect(sx + 8, clampedHorizon - sh + 5, 8, 6);
        ctx.fillRect(sx + 22, clampedHorizon - sh + 5, 8, 6);
        ctx.fillStyle = '#5c2314';
      }

      if (isTainan) {
        // 2A. 左側遠景：【安平古堡】三層階梯紅磚城基 + 純白高聳方圓瞭望塔與紅頂 + 百年古榕
        const ax = Math.floor(width * 0.18);
        ctx.fillStyle = '#922b21';
        ctx.fillRect(ax - 62, clampedHorizon - 22, 124, 22);
        ctx.fillStyle = '#b03a2e';
        ctx.fillRect(ax - 46, clampedHorizon - 38, 92, 16);
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(ax - 32, clampedHorizon - 50, 64, 12);
        // 雉堞女牆
        for (let m = -44; m <= 36; m += 14) {
          ctx.fillRect(ax + m, clampedHorizon - 43, 8, 5);
        }
        // 安平古堡純白高聳瞭望塔與紅色觀景頂
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ax - 11, clampedHorizon - 96, 22, 46);
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(ax - 9, clampedHorizon - 88, 18, 8);
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(ax - 16, clampedHorizon - 96);
        ctx.lineTo(ax, clampedHorizon - 110);
        ctx.lineTo(ax + 16, clampedHorizon - 96);
        ctx.closePath();
        ctx.fill();

        // 2B. 右側遠景：【1932 台南林百貨】五層樓昭和摩登黃褐溝面磚大樓 + 圓形牛眼窗 + 頂樓神社鳥居
        const hx = Math.floor(width * 0.82);
        ctx.fillStyle = '#a04000';
        ctx.fillRect(hx - 44, clampedHorizon - 78, 88, 78);
        ctx.fillStyle = '#d35400';
        ctx.fillRect(hx - 14, clampedHorizon - 88, 28, 88);
        // 五層樓水平洗石子飾帶与格窗
        for (let f = 1; f <= 4; f++) {
          const fy = clampedHorizon - f * 16;
          ctx.fillStyle = '#ecf0f1';
          ctx.fillRect(hx - 44, fy, 88, 2.5);
          ctx.fillStyle = '#ffeaa7';
          ctx.fillRect(hx - 36, fy + 4, 14, 8);
          ctx.fillRect(hx + 22, fy + 4, 14, 8);
        }
        // 標誌性圓形牛眼窗與頂樓神社鳥居
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(hx, clampedHorizon - 74, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(hx - 16, clampedHorizon - 98, 4, 12);
        ctx.fillRect(hx + 12, clampedHorizon - 98, 4, 12);
        ctx.fillRect(hx - 20, clampedHorizon - 98, 40, 3);
      } else {
        // 鹿港 / 白沙屯：兩側千里眼順風耳護法塔樓與進香紅燈籠長廊
        [width * 0.18, width * 0.82].forEach((tx) => {
          ctx.fillStyle = '#8e281c';
          ctx.fillRect(tx - 38, clampedHorizon - 54, 76, 54);
          ctx.fillStyle = '#f39c12';
          ctx.beginPath();
          ctx.moveTo(tx - 48, clampedHorizon - 54);
          ctx.quadraticCurveTo(tx, clampedHorizon - 76, tx + 48, clampedHorizon - 54);
          ctx.closePath();
          ctx.fill();
        });
      }

      // 3. 正中央：【台南赤嵌樓（海神廟＆文昌閣雙重簷樓閣） / 媽祖宮殿三川殿】
      ctx.fillStyle = '#8e281c';
      ctx.fillRect(cx - 125, clampedHorizon - 34, 250, 34);
      // 綠釉花瓶欄杆與雉堞
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(cx - 120, clampedHorizon - 38, 240, 4);
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(cx - 82, clampedHorizon - 64, 164, 26);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(cx - 76, clampedHorizon - 60, 152, 22);
      // 傳統閩南燕尾雙層重簷歇山頂與雙龍搶珠
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.moveTo(cx - 104, clampedHorizon - 60);
      ctx.quadraticCurveTo(cx, clampedHorizon - 86, cx + 104, clampedHorizon - 60);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffd32a';
      ctx.beginPath();
      ctx.moveTo(cx - 74, clampedHorizon - 76);
      ctx.quadraticCurveTo(cx, clampedHorizon - 104, cx + 74, clampedHorizon - 76);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(cx, clampedHorizon - 96, 5, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (hTheme === 'taipei' || hTheme === 'kaohsiung') {
      // 【台北101都會天際線 / 高雄85大樓港都天際線】
      ctx.fillStyle = '#192a56';
      for (let b = 0; b < width; b += 34) {
        const bh = 22 + ((b * 17) % 42);
        ctx.fillRect(b, clampedHorizon - bh, 28, bh);
        ctx.fillStyle = 'rgba(255, 211, 42, 0.45)';
        ctx.fillRect(b + 5, clampedHorizon - bh + 6, 18, 4);
        ctx.fillStyle = '#192a56';
      }
      if (hTheme === 'taipei') {
        // 台北 101 經典八節竹節摩天大樓
        const tx = Math.floor(width * 0.64);
        ctx.fillStyle = '#00a8ff';
        for (let s = 0; s < 6; s++) {
          const sy = clampedHorizon - 20 - s * 16;
          ctx.beginPath();
          ctx.moveTo(tx - 11, sy);
          ctx.lineTo(tx - 14, sy - 15);
          ctx.lineTo(tx + 14, sy - 15);
          ctx.lineTo(tx + 11, sy);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillRect(tx - 2, clampedHorizon - 134, 4, 20);
      } else {
        // 高雄 85 大樓雙塔字型摩天大樓與愛河海港倒影
        const kx = Math.floor(width * 0.62);
        ctx.fillStyle = '#0097e6';
        ctx.fillRect(kx - 18, clampedHorizon - 72, 14, 72);
        ctx.fillRect(kx + 4, clampedHorizon - 72, 14, 72);
        ctx.fillRect(kx - 14, clampedHorizon - 108, 28, 42);
        ctx.fillRect(kx - 3, clampedHorizon - 122, 6, 14);
      }
      return;
    }

    if (hTheme === 'taroko') {
      // 【花蓮太魯閣千仞峽谷「一線天」絕景】左右巍峨大理石斷崖壁立千仞、立霧溪碧綠湍流、高空錐麓/岳王亭紅色懸索吊橋與峽谷雲霧
      // 遠景峽谷天空透光漸層
      const skyGrad = ctx.createLinearGradient(0, clampedHorizon - 190, 0, clampedHorizon);
      skyGrad.addColorStop(0, '#74b9ff');
      skyGrad.addColorStop(0.5, '#dfe6e9');
      skyGrad.addColorStop(1, '#b2bec3');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(width * 0.28, clampedHorizon - 190, width * 0.44, 190);

      // 左側千仞大理石絕壁（高聳拔地而起、垂直陡峭）
      ctx.fillStyle = '#2f3640';
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon);
      ctx.lineTo(0, clampedHorizon - 195);
      ctx.lineTo(width * 0.16, clampedHorizon - 180);
      ctx.lineTo(width * 0.30, clampedHorizon - 140);
      ctx.lineTo(width * 0.36, clampedHorizon - 75);
      ctx.lineTo(width * 0.34, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      // 左壁大理石灰白褶皺岩紋與節理層次
      ctx.fillStyle = '#718093';
      ctx.beginPath();
      ctx.moveTo(width * 0.05, clampedHorizon);
      ctx.lineTo(width * 0.10, clampedHorizon - 165);
      ctx.lineTo(width * 0.24, clampedHorizon - 125);
      ctx.lineTo(width * 0.30, clampedHorizon - 60);
      ctx.lineTo(width * 0.28, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#f5f6fa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width * 0.06, clampedHorizon - 170);
      ctx.lineTo(width * 0.18, clampedHorizon - 130);
      ctx.lineTo(width * 0.26, clampedHorizon - 70);
      ctx.moveTo(width * 0.12, clampedHorizon - 150);
      ctx.lineTo(width * 0.22, clampedHorizon - 90);
      ctx.stroke();

      // 右側千仞大理石絕壁（直插雲霄）
      ctx.fillStyle = '#353b48';
      ctx.beginPath();
      ctx.moveTo(width, clampedHorizon);
      ctx.lineTo(width, clampedHorizon - 190);
      ctx.lineTo(width * 0.84, clampedHorizon - 175);
      ctx.lineTo(width * 0.70, clampedHorizon - 135);
      ctx.lineTo(width * 0.64, clampedHorizon - 75);
      ctx.lineTo(width * 0.66, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      // 右壁大理石岩紋與岩脈
      ctx.fillStyle = '#7f8fa6';
      ctx.beginPath();
      ctx.moveTo(width * 0.95, clampedHorizon);
      ctx.lineTo(width * 0.90, clampedHorizon - 160);
      ctx.lineTo(width * 0.76, clampedHorizon - 120);
      ctx.lineTo(width * 0.70, clampedHorizon - 55);
      ctx.lineTo(width * 0.72, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#f5f6fa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width * 0.94, clampedHorizon - 165);
      ctx.lineTo(width * 0.82, clampedHorizon - 125);
      ctx.lineTo(width * 0.74, clampedHorizon - 65);
      ctx.stroke();

      // 岩壁邊緣垂掛的翠綠深山原生林叢
      ctx.fillStyle = '#10ac84';
      [
        [0.16, 175, 14], [0.24, 130, 18], [0.32, 75, 15],
        [0.84, 170, 16], [0.74, 125, 15], [0.66, 70, 16]
      ].forEach(([gx, gy, gr]) => {
        ctx.beginPath();
        ctx.arc(width * gx, clampedHorizon - gy, gr, 0, Math.PI * 2);
        ctx.fill();
      });

      // 谷底立霧溪碧綠/Tiffany藍冰川湍流
      ctx.fillStyle = '#00d2d3';
      ctx.fillRect(width * 0.34, clampedHorizon - 22, width * 0.32, 22);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(width * 0.38, clampedHorizon - 16, width * 0.08, 3);
      ctx.fillRect(width * 0.50, clampedHorizon - 10, width * 0.10, 3);

      // 高空橫跨太魯閣峽谷兩岸的「錐麓／岳王亭紅色懸索吊橋」
      const bridgeY = clampedHorizon - 62;
      const bl = width * 0.32;
      const br = width * 0.68;
      // 兩側深紅橋塔
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(bl - 3, bridgeY - 24, 6, 28);
      ctx.fillRect(br - 3, bridgeY - 24, 6, 28);
      // 主懸索弧線
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bl, bridgeY - 20);
      ctx.quadraticCurveTo(width * 0.50, bridgeY + 4, br, bridgeY - 20);
      ctx.stroke();
      // 橋面木棧道
      ctx.fillStyle = '#d35400';
      ctx.fillRect(bl, bridgeY, br - bl, 4);
      // 懸吊垂直細索
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      for (let sx = bl + 12; sx < br; sx += 14) {
        ctx.beginPath();
        ctx.moveTo(sx, bridgeY - 14);
        ctx.lineTo(sx, bridgeY);
        ctx.stroke();
      }

      // 峽谷間飄盪的朦朧薄霧
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.fillRect(width * 0.28, clampedHorizon - 45, width * 0.44, 16);
      return;
    }

    if (hTheme === 'jiufen') {
      // 【九份山城夜景】深邃東北角海灣漁火、基隆山剪影、層疊阿妹茶樓暖黃窗格與紅燈籠海
      ctx.fillStyle = '#0b1324';
      ctx.fillRect(width * 0.45, clampedHorizon - 24, width * 0.55, 24);
      // 海面點點金黃漁火與倒影
      ctx.fillStyle = '#ffd32a';
      [0.56, 0.68, 0.81, 0.90].forEach((fx) => {
        ctx.fillRect(width * fx, clampedHorizon - 14, 10, 3);
        ctx.fillStyle = 'rgba(255, 211, 42, 0.35)';
        ctx.fillRect(width * fx - 2, clampedHorizon - 9, 14, 4);
        ctx.fillStyle = '#ffd32a';
      });

      ctx.fillStyle = '#241734';
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon);
      ctx.lineTo(0, clampedHorizon - 108);
      ctx.lineTo(width * 0.34, clampedHorizon - 84);
      ctx.lineTo(width * 0.56, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 7 - row; col++) {
          const tx = 20 + col * 36 + row * 12;
          const ty = clampedHorizon - 20 - row * 21;
          ctx.fillStyle = '#3d284d';
          ctx.fillRect(tx - 4, ty - 6, 28, 18);
          ctx.fillStyle = '#ffd32a';
          ctx.fillRect(tx, ty, 11, 8);
          ctx.fillStyle = '#ff1e1e';
          ctx.fillRect(tx + 15, ty + 1, 6, 7);
        }
      }
      return;
    }

    // ================= 新增 12 大台灣中途景點：畫面正中央遠景地平線 (Horizon Backdrops) =================
    if (hTheme === 'dapengbay_bridge' || hTheme === 'tamsui_lover_bridge') {
      // 【屏東東港大鵬灣跨海大橋 / 新北淡水漁人碼頭情人橋】
      const isTamsui = hTheme === 'tamsui_lover_bridge';
      // 對岸遠景：小琉球島影 (大鵬灣) 或 八里觀音山剪影 (淡水)
      ctx.fillStyle = isTamsui ? '#30336b' : '#1e3799';
      ctx.beginPath();
      if (isTamsui) {
        ctx.moveTo(0, clampedHorizon - 22);
        ctx.lineTo(width * 0.16, clampedHorizon - 78);
        ctx.lineTo(width * 0.36, clampedHorizon - 92);
        ctx.lineTo(width * 0.56, clampedHorizon - 32);
        ctx.lineTo(0, clampedHorizon - 22);
      } else {
        ctx.moveTo(width * 0.66, clampedHorizon - 22);
        ctx.quadraticCurveTo(width * 0.78, clampedHorizon - 48, width * 0.92, clampedHorizon - 22);
      }
      ctx.closePath();
      ctx.fill();

      // 潟湖 / 淡水河口波光水面
      const waterGrad = ctx.createLinearGradient(0, clampedHorizon - 26, 0, clampedHorizon);
      waterGrad.addColorStop(0, isTamsui ? '#c0392b' : '#0052a5');
      waterGrad.addColorStop(0.5, isTamsui ? '#e55039' : '#0097e6');
      waterGrad.addColorStop(1, isTamsui ? '#f6b93b' : '#00d2d3');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, clampedHorizon - 26, width, 26);

      // 純白單塔非對稱斜張大橋（A字/風帆高塔 + 放射狀斜張鋼索 + 跨海拱形橋面）
      const pylonX = Math.floor(width * 0.46);
      const pylonTopY = clampedHorizon - 106;
      // 斜張鋼索扇面
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.4;
      for (let c = 1; c <= 7; c++) {
        ctx.beginPath();
        ctx.moveTo(pylonX, pylonTopY + 10);
        ctx.lineTo(pylonX - c * 24, clampedHorizon - 26);
        ctx.moveTo(pylonX, pylonTopY + 10);
        ctx.lineTo(pylonX + c * 22, clampedHorizon - 26);
        ctx.stroke();
      }
      // 跨海弧形白色橋面與橋墩
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(width * 0.12, clampedHorizon - 18);
      ctx.quadraticCurveTo(pylonX, clampedHorizon - 38, width * 0.86, clampedHorizon - 18);
      ctx.stroke();
      // 純白高聳單塔主橋塔
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(pylonX - 10, clampedHorizon - 20);
      ctx.lineTo(pylonX - 3, pylonTopY);
      ctx.lineTo(pylonX + 5, pylonTopY);
      ctx.lineTo(pylonX + 12, clampedHorizon - 20);
      ctx.closePath();
      ctx.fill();
      return;
    }

    if (hTheme === 'lotuspond_pagodas') {
      // 【高雄左營蓮池潭・龍虎雙塔與半屏山】
      // 遠景半屏山珊瑚礁石灰岩山體
      ctx.fillStyle = '#2d4c3e';
      ctx.beginPath();
      ctx.moveTo(width * 0.12, clampedHorizon - 22);
      ctx.lineTo(width * 0.28, clampedHorizon - 82);
      ctx.lineTo(width * 0.64, clampedHorizon - 76);
      ctx.lineTo(width * 0.84, clampedHorizon - 22);
      ctx.closePath();
      ctx.fill();

      // 碧綠蓮池潭水面與荷葉
      ctx.fillStyle = '#009432';
      ctx.fillRect(0, clampedHorizon - 24, width, 24);
      ctx.fillStyle = '#2ecc71';
      for (let l = 0; l < 10; l++) {
        ctx.fillRect(width * (0.1 + l * 0.08), clampedHorizon - 10 - (l % 2) * 5, 18, 4);
      }

      // 中央九曲橋與左右對稱七層「龍塔、虎塔」
      const cx = Math.floor(width * 0.5);
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(cx - 86, clampedHorizon - 18, 172, 5);
      [-54, 54].forEach((offsetX, idx) => {
        const tx = cx + offsetX;
        for (let floor = 0; floor < 7; floor++) {
          const fy = clampedHorizon - 22 - floor * 11;
          const fw = 28 - floor * 2;
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(tx - fw / 2, fy - 9, fw, 9);
          ctx.fillStyle = (idx === 0) ? '#27ae60' : '#d35400';
          ctx.fillRect(tx - fw / 2 - 4, fy - 11, fw + 8, 3);
        }
        // 塔前張口巨龍（綠）/ 猛虎（橘黃）
        ctx.fillStyle = (idx === 0) ? '#2ecc71' : '#f39c12';
        ctx.beginPath();
        ctx.arc(tx, clampedHorizon - 20, 12, Math.PI, 0);
        ctx.fill();
      });
      return;
    }

    if (hTheme === 'qigu_salt_mountain') {
      // 【台南七股鹽山＆黑面琵鷺夕照】
      // 曾文溪口潟湖夕陽水面
      const lagGrad = ctx.createLinearGradient(0, clampedHorizon - 24, 0, clampedHorizon);
      lagGrad.addColorStop(0, '#eb4d4b');
      lagGrad.addColorStop(1, '#f9ca24');
      ctx.fillStyle = lagGrad;
      ctx.fillRect(0, clampedHorizon - 24, width, 24);

      // 兩側連綿雪白小鹽丘與中央高達六層樓的「七股鹽山」主峰
      const cx = Math.floor(width * 0.5);
      ctx.fillStyle = '#dfe6e9';
      ctx.beginPath();
      ctx.moveTo(cx - 190, clampedHorizon - 14);
      ctx.lineTo(cx - 115, clampedHorizon - 58);
      ctx.lineTo(cx - 45, clampedHorizon - 14);
      ctx.moveTo(cx + 45, clampedHorizon - 14);
      ctx.lineTo(cx + 120, clampedHorizon - 54);
      ctx.lineTo(cx + 195, clampedHorizon - 14);
      ctx.fill();

      // 中央七股鹽山主峰（受光雪白亮面 + 夕陽淡紫背光面）
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx - 95, clampedHorizon - 12);
      ctx.lineTo(cx, clampedHorizon - 102);
      ctx.lineTo(cx + 95, clampedHorizon - 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(180, 195, 215, 0.55)';
      ctx.beginPath();
      ctx.moveTo(cx, clampedHorizon - 102);
      ctx.lineTo(cx + 95, clampedHorizon - 12);
      ctx.lineTo(cx - 8, clampedHorizon - 12);
      ctx.closePath();
      ctx.fill();
      return;
    }

    if (hTheme === 'npmsouth_tropic') {
      // 【嘉義故宮南院至美橋＆北回歸線太陽館】
      const cx = Math.floor(width * 0.5);
      // 至善湖面
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(0, clampedHorizon - 20, width, 20);

      // 左側：科幻飛碟造型「北回歸線太陽館」巨塔
      const tx = Math.floor(width * 0.25);
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(tx - 8, clampedHorizon - 86, 16, 68);
      ctx.fillStyle = '#00a8ff';
      ctx.beginPath();
      ctx.ellipse(tx, clampedHorizon - 78, 34, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd32a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 右側：故宮南院流線雙弧黑銀主館與跨湖鮮紅「至美橋」
      const mx = Math.floor(width * 0.65);
      ctx.fillStyle = '#2d3436';
      ctx.beginPath();
      ctx.arc(mx, clampedHorizon - 18, 56, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#dfe6e9';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 朱紅雙弧「至美橋」
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(width * 0.36, clampedHorizon - 12);
      ctx.quadraticCurveTo(width * 0.52, clampedHorizon - 42, width * 0.72, clampedHorizon - 12);
      ctx.stroke();
      return;
    }

    if (hTheme === 'duoliang_station') {
      // 【台東太麻里・多良火車站】左靠大武山翠綠山崖與山洞，右臨太平洋漸層藍海，中間高架鮮紅欄杆月台與藍皮火車疾馳！
      const seaGrad = ctx.createLinearGradient(0, clampedHorizon - 32, 0, clampedHorizon);
      seaGrad.addColorStop(0, '#0052a5');
      seaGrad.addColorStop(0.55, '#00a8e8');
      seaGrad.addColorStop(1, '#7ed6df');
      ctx.fillStyle = seaGrad;
      ctx.fillRect(width * 0.25, clampedHorizon - 32, width * 0.75, 32);

      // 左側太麻里山崖與多良一號隧道口
      ctx.fillStyle = '#1e5631';
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon);
      ctx.lineTo(0, clampedHorizon - 118);
      ctx.lineTo(width * 0.24, clampedHorizon - 92);
      ctx.lineTo(width * 0.42, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      // 臨海高架鐵道水泥橋墩與經典「多良鮮紅欄杆月台」
      ctx.fillStyle = '#95a5a6';
      ctx.fillRect(width * 0.18, clampedHorizon - 34, width * 0.66, 8);
      for (let p = 0; p < 8; p++) {
        ctx.fillRect(width * (0.22 + p * 0.075), clampedHorizon - 26, 6, 26);
      }
      ctx.fillStyle = '#ff3838';
      ctx.fillRect(width * 0.20, clampedHorizon - 40, width * 0.62, 6);

      // 疾馳而過的藍皮解憂號 / 紅斑馬列車
      const trainX = width * 0.22 + ((now * 0.055) % (width * 0.52));
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(trainX, clampedHorizon - 52, 92, 12);
      ctx.fillStyle = '#ffeaa7';
      for (let w = 0; w < 5; w++) {
        ctx.fillRect(trainX + 6 + w * 17, clampedHorizon - 50, 11, 5);
      }
      return;
    }

    if (hTheme === 'beigang_xiluo') {
      // 【雲林西螺大橋＆北港朝天宮】左半：橫跨濁水溪的連續鮮紅鋼桁架「西螺大橋」；右半：北港朝天宮重簷燕尾大廟
      ctx.fillStyle = '#0097e6';
      ctx.fillRect(0, clampedHorizon - 18, width * 0.58, 18);

      // 左半邊：西螺大橋鮮紅華倫氏鋼鐵桁架連拱
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 3.5;
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(width * 0.04, clampedHorizon - 24, width * 0.52, 5);
      for (let t = 0; t < 5; t++) {
        const tx = width * 0.05 + t * (width * 0.10);
        const tw = width * 0.095;
        ctx.strokeRect(tx, clampedHorizon - 54, tw, 30);
        ctx.beginPath();
        ctx.moveTo(tx, clampedHorizon - 24);
        ctx.lineTo(tx + tw / 2, clampedHorizon - 54);
        ctx.lineTo(tx + tw, clampedHorizon - 24);
        ctx.stroke();
      }

      // 右半邊：北港朝天宮金碧輝煌三川殿與雙龍燕尾屋脊
      const mx = Math.floor(width * 0.76);
      ctx.fillStyle = '#8e281c';
      ctx.fillRect(mx - 74, clampedHorizon - 38, 148, 38);
      ctx.fillStyle = '#ffd32a';
      ctx.beginPath();
      ctx.moveTo(mx - 88, clampedHorizon - 38);
      ctx.quadraticCurveTo(mx, clampedHorizon - 68, mx + 88, clampedHorizon - 38);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(mx - 58, clampedHorizon - 56);
      ctx.quadraticCurveTo(mx, clampedHorizon - 86, mx + 58, clampedHorizon - 56);
      ctx.closePath();
      ctx.fill();
      return;
    }

    if (hTheme === 'ruisui_tropic_pasture') {
      // 【花蓮瑞穗北回歸線標＆瑞穗牧場】中央山脈與海岸山脈夾峙、純白日晷窺陽塔「瑞穗北回歸線標碑」與綠茵乳牛牧場
      ctx.fillStyle = '#1e5631';
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon);
      ctx.lineTo(width * 0.18, clampedHorizon - 92);
      ctx.lineTo(width * 0.45, clampedHorizon - 58);
      ctx.lineTo(width * 0.78, clampedHorizon - 96);
      ctx.lineTo(width, clampedHorizon - 54);
      ctx.lineTo(width, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      // 翠綠瑞穗牧場草原與白色木柵欄
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(0, clampedHorizon - 24, width, 24);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, clampedHorizon - 20, width, 3);

      // 中央純白高聳日晷窺陽塔「瑞穗北回歸線標」
      const cx = Math.floor(width * 0.5);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx - 22, clampedHorizon - 14);
      ctx.lineTo(cx - 6, clampedHorizon - 104);
      ctx.lineTo(cx + 6, clampedHorizon - 104);
      ctx.lineTo(cx + 22, clampedHorizon - 14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#00a8ff';
      ctx.fillRect(cx - 28, clampedHorizon - 68, 56, 7);
      return;
    }

    if (hTheme === 'shitiping_steps') {
      // 【花蓮豐濱・石梯坪單面山＆親不知子海上古道】
      ctx.fillStyle = '#0052a5';
      ctx.fillRect(0, clampedHorizon - 28, width, 28);

      // 灰白色火山凝灰岩「石梯坪階梯狀單面山」斜插進太平洋
      const cx = Math.floor(width * 0.52);
      ctx.fillStyle = '#dfe6e9';
      ctx.beginPath();
      ctx.moveTo(cx - 140, clampedHorizon - 12);
      ctx.lineTo(cx + 25, clampedHorizon - 88);
      ctx.lineTo(cx + 68, clampedHorizon - 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#b2bec3';
      for (let s = 1; s <= 4; s++) {
        ctx.fillRect(cx - 120 + s * 28, clampedHorizon - 14 - s * 15, 34, 6);
      }

      // 拍岸高空雪白巨浪水花
      const splashH = 18 + Math.abs(Math.sin(now * 0.005)) * 22;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(cx + 68, clampedHorizon - 14 - splashH * 0.5, 16, 0, Math.PI * 2);
      ctx.arc(cx + 84, clampedHorizon - 12 - splashH * 0.3, 12, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (hTheme === 'longteng_broken_bridge') {
      // 【苗栗三義・龍騰斷橋（魚藤坪紅磚斷橋）＆舊山線山谷】
      ctx.fillStyle = '#1b4332';
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon);
      ctx.lineTo(width * 0.22, clampedHorizon - 88);
      ctx.lineTo(width * 0.52, clampedHorizon - 58);
      ctx.lineTo(width * 0.82, clampedHorizon - 92);
      ctx.lineTo(width, clampedHorizon - 48);
      ctx.lineTo(width, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      // 四座巍峨屹立於翠綠山谷中的紅磚糯米斷橋拱柱遺跡
      const archBaseX = Math.floor(width * 0.26);
      for (let p = 0; p < 4; p++) {
        const px = archBaseX + p * 74;
        const ph = 78 - (p === 2 ? 16 : 0);
        ctx.fillStyle = '#a04000';
        ctx.fillRect(px - 12, clampedHorizon - ph, 24, ph);
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(px - 13, clampedHorizon - ph + 18, 26, 4);
        ctx.fillRect(px - 13, clampedHorizon - ph + 38, 26, 4);
        // 斷裂殘拱
        if (p < 3) {
          ctx.strokeStyle = '#c0392b';
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.arc(px + 37, clampedHorizon - ph + 22, 26, Math.PI, Math.PI * 1.68);
          ctx.stroke();
        }
      }
      return;
    }

    if (hTheme === 'qingshui_cliff') {
      // 【花蓮秀林・蘇花公路清水斷崖】左半近 90 度垂直竄升兩千公尺的大理石絕壁與明隧道 + 右半三色蒂芬妮藍太平洋
      const seaGrad = ctx.createLinearGradient(0, clampedHorizon - 34, 0, clampedHorizon);
      seaGrad.addColorStop(0, '#003d66');
      seaGrad.addColorStop(0.5, '#00a8e8');
      seaGrad.addColorStop(1, '#00f5d4');
      ctx.fillStyle = seaGrad;
      ctx.fillRect(width * 0.30, clampedHorizon - 34, width * 0.70, 34);

      // 左側近乎垂直的清水大山千仞大理石斷崖與連續明隧道口
      ctx.fillStyle = '#2d3436';
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon);
      ctx.lineTo(0, clampedHorizon - 138);
      ctx.lineTo(width * 0.24, clampedHorizon - 122);
      ctx.lineTo(width * 0.38, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#b2bec3';
      ctx.beginPath();
      ctx.moveTo(width * 0.12, clampedHorizon);
      ctx.lineTo(width * 0.22, clampedHorizon - 114);
      ctx.lineTo(width * 0.35, clampedHorizon);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.moveTo(0, clampedHorizon - 138);
      ctx.lineTo(width * 0.24, clampedHorizon - 122);
      ctx.lineTo(width * 0.20, clampedHorizon - 88);
      ctx.lineTo(0, clampedHorizon - 98);
      ctx.closePath();
      ctx.fill();
      return;
    }

    if (hTheme === 'hsinchu_east_gate') {
      // 【新竹東門城（迎曦門）＆護城河與都城隍廟】
      const cx = Math.floor(width * 0.5);
      // 護城河水面倒影
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(0, clampedHorizon - 18, width, 18);

      // 石砌圓拱城門基座
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(cx - 88, clampedHorizon - 46, 176, 32);
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.arc(cx, clampedHorizon - 14, 22, Math.PI, 0);
      ctx.fill();

      // 迎曦門紅磚城樓與重簷歇山頂
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(cx - 62, clampedHorizon - 72, 124, 26);
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.moveTo(cx - 82, clampedHorizon - 68);
      ctx.quadraticCurveTo(cx, clampedHorizon - 88, cx + 82, clampedHorizon - 68);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 58, clampedHorizon - 82);
      ctx.quadraticCurveTo(cx, clampedHorizon - 102, cx + 58, clampedHorizon - 82);
      ctx.closePath();
      ctx.fill();
      return;
    }

    // 預設三層次台灣壯麗山脈、山谷雲霧與田園水波天際線
    // 第一層：遠方高山稜線 (玉山/中央山脈剪影)
    ctx.fillStyle = stageTheme.mountainFar || stageTheme.mountainColor;
    for (let i = -1; i <= 1; i++) {
      const bx = i * width - mountainShift * 0.65;
      ctx.beginPath();
      ctx.moveTo(bx, clampedHorizon);
      ctx.lineTo(bx + width * 0.12, clampedHorizon - 68);
      ctx.lineTo(bx + width * 0.25, clampedHorizon - 38);
      ctx.lineTo(bx + width * 0.42, clampedHorizon - 88);
      ctx.lineTo(bx + width * 0.58, clampedHorizon - 44);
      ctx.lineTo(bx + width * 0.76, clampedHorizon - 78);
      ctx.lineTo(bx + width * 0.90, clampedHorizon - 36);
      ctx.lineTo(bx + width, clampedHorizon);
      ctx.closePath();
      ctx.fill();
    }

    // 山腰飄渺雲霧帶
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillRect(0, clampedHorizon - 36, width, 10);

    // 第二層：近景翠綠山麓與稜線受光面
    ctx.fillStyle = stageTheme.mountainNear || stageTheme.grassDark || '#1e5631';
    for (let i = -1; i <= 1; i++) {
      const nx = i * width - nearShift * 0.85;
      ctx.beginPath();
      ctx.moveTo(nx, clampedHorizon);
      ctx.lineTo(nx + width * 0.18, clampedHorizon - 38);
      ctx.lineTo(nx + width * 0.36, clampedHorizon - 18);
      ctx.lineTo(nx + width * 0.56, clampedHorizon - 46);
      ctx.lineTo(nx + width * 0.78, clampedHorizon - 22);
      ctx.lineTo(nx + width * 0.92, clampedHorizon - 34);
      ctx.lineTo(nx + width, clampedHorizon);
      ctx.closePath();
      ctx.fill();
    }
  }

  /**
   * 繪製路邊景物、起點富岡車站、35關沿途6段小景點（牌樓/小吃/山景/海景/街景）、8大終點正中央地標與兩旁歡呼群眾
   */
  drawRoadsideSprite(ctx, sp, screenX, screenY, scale, roadHalfWidth, roadCenterX) {
    if (screenY < 0 || screenY > 560) return;

    // 以玩家車輛所在畫面深度 (scale ≈ 0.000804, screenY ≈ 364) 定義透視基準倍率 pScale (0 -> 1.0)
    const pScale = Math.min(1.08, scale * 1244);
    if (pScale < 0.012) return;

    // 依照現有比例，將車輛與道路上食物的長、寬各放大一倍 (2.0x)
    const playerUnitW = 86 * 2.0 * pScale;
    const playerUnitH = 70 * 2.0 * pScale;

    // 道路兩邊景物基準尺寸（拉到最近時，景物高度可佔整個 400px 畫面高度的 75% ≈ 300px）
    const baseW = Math.min(265, Math.max(2, scale * 225000));
    const baseH = Math.min(295, Math.max(2, scale * 280000));

    // 【1. 嚴格保持兩邊景物在道路兩側外緣，絕對不跨入/移動到道路車道上】
    const isRoadside = sp.type === 'SUBSPOT_SCENERY' ||
      (sp.type && (sp.type.startsWith('STREET_') || sp.type.startsWith('PROP_'))) ||
      Math.abs(sp.offset || 0) > 1.0;

    if (isRoadside) {
      const center = roadCenterX !== undefined ? roadCenterX : (screenX - (sp.offset || 0) * roadHalfWidth);
      const curbClearance = roadHalfWidth * 1.30 + baseW * 0.58 + 10;
      if ((sp.offset || 0) > 0) {
        if (screenX < center + curbClearance) {
          screenX = center + curbClearance;
        }
      } else {
        if (screenX > center - curbClearance) {
          screenX = center - curbClearance;
        }
      }
    }

    const x = Math.floor(screenX - baseW / 2);
    const y = Math.floor(screenY - baseH);
    const w = Math.floor(baseW);
    const h = Math.floor(baseH);

    ctx.save();

    // 優先處理沿途 6 段式小景點（牌樓、小吃攤、山景、海景、古蹟街景：恢復前一版大小）
    if (sp.type === 'SUBSPOT_SCENERY') {
      this.drawSubSpotScenerySprite(ctx, sp, screenX, screenY, w, h);
      ctx.restore();
      return;
    }

    // 相容處理富岡老街街景與景點建築 (`STREET_*` 與 `PROP_*`：恢復前一版大小)
    if (sp.type && (sp.type.startsWith('STREET_') || sp.type.startsWith('PROP_'))) {
      this.drawSequentialStreetProp(ctx, sp, screenX, screenY, w, h);
      ctx.restore();
      return;
    }

    switch (sp.type) {
      case 'FUGANG_STATION_GATE': {
        // 【起點：桃園楊梅・富岡火車站大門與月台天橋】車輛直接從車站玄關衝出！
        const archHalfW = Math.max(w * 1.55, roadHalfWidth * 1.25);
        const leftX = Math.floor(screenX - archHalfW);
        const rightX = Math.floor(screenX + archHalfW);
        const totalW = rightX - leftX;
        const pillarW = Math.max(10, Math.floor(w * 0.42));
        const roofH = Math.max(22, Math.floor(h * 0.36));

        // 左右車站藍白磁磚水泥立柱與紅白平交道號誌桿
        ctx.fillStyle = '#dfe6e9';
        ctx.fillRect(leftX, y, pillarW, h);
        ctx.fillRect(rightX - pillarW, y, pillarW, h);
        ctx.fillStyle = '#0984e3';
        ctx.fillRect(leftX, y + h * 0.55, pillarW, h * 0.45);
        ctx.fillRect(rightX - pillarW, y + h * 0.55, pillarW, h * 0.45);
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = Math.max(1.5, pillarW * 0.08);
        ctx.strokeRect(leftX, y, pillarW, h);
        ctx.strokeRect(rightX - pillarW, y, pillarW, h);

        // 車站斜瓦屋簷與台鐵藍底白字站名牌樓
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.moveTo(leftX - pillarW * 0.4, y + roofH);
        ctx.lineTo(screenX, y - roofH * 0.55);
        ctx.lineTo(rightX + pillarW * 0.4, y + roofH);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0038a8';
        ctx.fillRect(leftX, y, totalW, roofH);
        ctx.strokeStyle = '#ffd32a';
        ctx.lineWidth = Math.max(2, pillarW * 0.12);
        ctx.strokeRect(leftX, y, totalW, roofH);

        // 車站中央復古圓鐘
        const clockR = Math.max(4, roofH * 0.34);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(screenX, y - roofH * 0.12, clockR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (w > 18) {
          this.drawArcadeText(
            ctx,
            '🚂 台鐵・富岡火車站 FUGANG STATION（起點出發！）',
            screenX,
            y + roofH * 0.68,
            `900 ${Math.max(10, Math.floor(roofH * 0.48))}px sans-serif`,
            '#ffd32a',
            'center',
            2
          );
        }
        break;
      }

      case 'STAGE_WELCOME_ARCH': {
        // 【關卡入口指標牌樓：嵌入《合金彈頭》風格實景圖案 + 鉚釘重鋼骨橫幅】
        const archHalfW = Math.max(w * 1.45, roadHalfWidth * 1.18);
        const leftPillarX = Math.floor(screenX - archHalfW);
        const rightPillarX = Math.floor(screenX + archHalfW - w * 0.30);
        const pillarW = Math.max(6, Math.floor(w * 0.30));
        const bannerW = rightPillarX - leftPillarX + pillarW;
        const bannerH = Math.max(20, Math.floor(h * 0.40));

        ctx.fillStyle = '#8c4627';
        ctx.fillRect(leftPillarX, y, pillarW, h);
        ctx.fillRect(rightPillarX, y, pillarW, h);
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = Math.max(1.5, pillarW * 0.08);
        ctx.strokeRect(leftPillarX, y, pillarW, h);
        ctx.strokeRect(rightPillarX, y, pillarW, h);

        ctx.fillStyle = '#141b29';
        ctx.fillRect(leftPillarX, y, bannerW, bannerH);
        ctx.strokeStyle = '#ffd32a';
        ctx.lineWidth = Math.max(2, pillarW * 0.15);
        ctx.strokeRect(leftPillarX, y, bannerW, bannerH);

        // 橫幅兩側嵌入該關卡的《合金彈頭》風格實景縮圖
        if (bannerW > 90 && bannerH >= 22) {
          const thumbW = Math.min(Math.floor(bannerW * 0.18), Math.floor(bannerH * 1.65));
          const thumbH = Math.max(12, bannerH - 6);
          this.drawStageLandmarkIcon(ctx, sp.stageId || 'fugang', leftPillarX + 5, y + 3, thumbW, thumbH);
          this.drawStageLandmarkIcon(ctx, sp.stageId || 'fugang', leftPillarX + bannerW - thumbW - 5, y + 3, thumbW, thumbH);
        }

        if (w > 16) {
          this.drawArcadeText(
            ctx,
            `📍 ${sp.stageName || '台灣景點'} ｜ ${sp.category || ''}`,
            screenX,
            y + bannerH * 0.68,
            `900 ${Math.max(10, Math.floor(bannerH * 0.44))}px sans-serif`,
            '#00f0ff',
            'center',
            2
          );
        }
        break;
      }

      case 'FINISH_LINE_ARCH': {
        // 【終點線拱門】橫跨道路正中央的黑白方格旗與大紅金牌樓，迎接終點衝線！
        const archHalfW = Math.max(w * 1.6, roadHalfWidth * 1.24);
        const leftX = Math.floor(screenX - archHalfW);
        const rightX = Math.floor(screenX + archHalfW);
        const totalW = rightX - leftX;
        const pillarW = Math.max(10, Math.floor(w * 0.36));
        const bannerH = Math.max(18, Math.floor(h * 0.34));

        // 地面黑白方格終點線 (繪製於路面上)
        const stripeH = Math.max(6, Math.floor(h * 0.10));
        const cellW = Math.max(8, Math.floor(totalW / 16));
        for (let c = 0; c < 16; c++) {
          ctx.fillStyle = (c % 2 === 0) ? '#ffffff' : '#111111';
          ctx.fillRect(leftX + c * cellW, screenY - stripeH, cellW, stripeH);
          ctx.fillStyle = (c % 2 === 1) ? '#ffffff' : '#111111';
          ctx.fillRect(leftX + c * cellW, screenY - stripeH * 2, cellW, stripeH);
        }

        // 左右大紅金邊龍柱
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(leftX, y, pillarW, h);
        ctx.fillRect(rightX - pillarW, y, pillarW, h);
        ctx.strokeStyle = '#ffd32a';
        ctx.lineWidth = 2;
        ctx.strokeRect(leftX, y, pillarW, h);
        ctx.strokeRect(rightX - pillarW, y, pillarW, h);

        // 頂部終點橫幅
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(leftX, y, totalW, bannerH);
        ctx.strokeRect(leftX, y, totalW, bannerH);

        if (w > 16) {
          this.drawArcadeText(
            ctx,
            `🏁 GOAL! 終點衝線：${sp.spotName || '環島終點'} 🏁`,
            screenX,
            y + bannerH * 0.70,
            `900 ${Math.max(11, Math.floor(bannerH * 0.56))}px sans-serif`,
            '#ffd32a',
            'center',
            2
          );
        }
        break;
      }

      case 'CHEER_CROWD': {
        // 【終點大道兩旁歡呼群眾】Q版群眾跳躍揮舞旗幟與拋灑彩帶！
        this.drawCheeringCrowdSprite(ctx, sp, screenX, screenY, w, h);
        break;
      }

      case 'FINALE_MONUMENT': {
        // 【8 大終點正中央巨型主建築地標】矗立於畫面正中央，氣勢磅礡！
        this.drawFinaleMonumentSprite(ctx, sp, screenX, screenY, w, h, roadHalfWidth);
        break;
      }

      case 'CHECKPOINT_ARCH': {
        // 【關卡分岔口龍門指標拱門：嵌入左右分支《合金彈頭》實景圖案】
        const archHalfW = Math.max(w * 1.4, roadHalfWidth * 1.18);
        const leftPillarX = Math.floor(screenX - archHalfW);
        const rightPillarX = Math.floor(screenX + archHalfW - w * 0.32);
        const pillarW = Math.max(6, Math.floor(w * 0.32));
        const bannerW = rightPillarX - leftPillarX + pillarW;
        const bannerH = Math.max(20, Math.floor(h * 0.38));

        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(leftPillarX, y, pillarW, h);
        ctx.fillRect(rightPillarX, y, pillarW, h);
        ctx.fillStyle = '#e74c3c';
        for (let r = 0; r < 4; r++) {
          ctx.fillRect(leftPillarX, y + r * (h / 4), pillarW, h / 8);
          ctx.fillRect(rightPillarX, y + r * (h / 4), pillarW, h / 8);
        }

        ctx.fillStyle = '#ffd12a';
        ctx.fillRect(leftPillarX, y, bannerW, bannerH);
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = Math.max(2, pillarW * 0.15);
        ctx.strokeRect(leftPillarX, y, bannerW, bannerH);

        if (bannerW > 100 && bannerH >= 20) {
          const thumbW = Math.min(Math.floor(bannerW * 0.18), Math.floor(bannerH * 1.65));
          const thumbH = Math.max(12, bannerH - 6);
          if (sp.leftStageId) {
            this.drawStageLandmarkIcon(ctx, sp.leftStageId, leftPillarX + 5, y + 3, thumbW, thumbH);
          }
          if (sp.rightStageId) {
            this.drawStageLandmarkIcon(ctx, sp.rightStageId, leftPillarX + bannerW - thumbW - 5, y + 3, thumbW, thumbH);
          }
        }

        if (w > 16) {
          this.drawArcadeText(
            ctx,
            '◄ 左道 ｜ CHECKPOINT 關卡分岔指標 ｜ 右道 ►',
            screenX,
            y + bannerH * 0.68,
            `900 ${Math.max(9, Math.floor(bannerH * 0.42))}px sans-serif`,
            '#c0392b',
            'center',
            1
          );
        }
        break;
      }

      case 'STONE_PILLAR': {
        ctx.fillStyle = '#d2c8b8';
        ctx.fillRect(x + w * 0.22, y + h * 0.1, w * 0.56, h * 0.9);
        ctx.fillStyle = '#a89e8e';
        ctx.fillRect(x + w * 0.52, y + h * 0.1, w * 0.26, h * 0.9);
        ctx.fillStyle = '#e8dfd1';
        ctx.fillRect(x + w * 0.12, y, w * 0.76, h * 0.12);
        ctx.fillRect(x + w * 0.12, y + h * 0.88, w * 0.76, h * 0.12);
        break;
      }

      case 'PALM_TREE': {
        const trunkW = Math.max(3, w * 0.16);
        ctx.fillStyle = '#78472a';
        ctx.fillRect(x + w * 0.42, y + h * 0.32, trunkW, h * 0.68);
        ctx.fillStyle = '#9c623e';
        ctx.fillRect(x + w * 0.42, y + h * 0.32, trunkW * 0.5, h * 0.68);
        ctx.fillStyle = '#16a085';
        ctx.fillRect(x - w * 0.25, y + h * 0.14, w * 1.5, h * 0.18);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(x - w * 0.1, y, w * 1.2, h * 0.22);
        ctx.fillRect(x - w * 0.35, y + h * 0.24, w * 0.4, h * 0.14);
        ctx.fillRect(x + w * 0.95, y + h * 0.24, w * 0.4, h * 0.14);
        break;
      }

      case 'BUSH': {
        const bw = w * 0.95;
        const bh = h * 0.36;
        const by = screenY - bh;
        ctx.fillStyle = '#1e8449';
        ctx.fillRect(screenX - bw / 2, by, bw, bh);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(screenX - bw * 0.38, by - bh * 0.25, bw * 0.76, bh * 0.85);
        break;
      }

      case 'NEON_SIGN': {
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(x + w * 0.42, y + h * 0.4, w * 0.16, h * 0.6);
        ctx.fillStyle = sp.bgColor || '#e84393';
        ctx.fillRect(x - w * 0.1, y, w * 1.2, h * 0.66);
        ctx.strokeStyle = '#ffd12a';
        ctx.lineWidth = Math.max(1, w * 0.06);
        ctx.strokeRect(x - w * 0.1, y, w * 1.2, h * 0.66);
        if (w > 14) {
          ctx.fillStyle = '#ffffff';
          ctx.font = `900 ${Math.max(8, Math.floor(w * 0.28))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(sp.label || '保力達B', x + w * 0.5, y + h * 0.4);
        }
        break;
      }

      case 'BETEL_BOOTH': {
        // 路邊障礙物：檳榔攤
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(x + w * 0.1, y + h * 0.25, w * 0.8, h * 0.75);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = Math.max(1.5, w * 0.03);
        ctx.strokeRect(x + w * 0.1, y + h * 0.25, w * 0.8, h * 0.75);
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(x + w * 0.18, y + h * 0.34, w * 0.64, h * 0.42);
        const blink = Math.floor(performance.now() / 120) % 2 === 0;
        ctx.fillStyle = blink ? '#ff0055' : '#2eff7b';
        ctx.fillRect(x + w * 0.20, y + h * 0.08, w * 0.60, h * 0.16);
        ctx.fillStyle = '#ffd32a';
        ctx.fillRect(x + w * 0.05, screenY - h * 0.14, w * 0.90, h * 0.14);
        ctx.fillStyle = '#d63031';
        ctx.fillRect(x + w * 0.25, screenY - h * 0.14, w * 0.20, h * 0.14);
        ctx.fillRect(x + w * 0.60, screenY - h * 0.14, w * 0.20, h * 0.14);
        if (w > 22) {
          this.drawArcadeText(ctx, '⚠️危險路障', screenX, screenY + Math.max(11, Math.floor(h * 0.10)), `900 ${Math.min(12, Math.max(8, Math.floor(w * 0.14)))}px sans-serif`, '#ffffff', 'center', 2);
        }
        break;
      }

      case 'LANTERN_POLE': {
        ctx.fillStyle = '#4a2e1b';
        ctx.fillRect(x + w * 0.44, y, w * 0.12, h);
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = '#ff1e1e';
          ctx.fillRect(x + w * 0.12, y + h * (0.1 + i * 0.24), w * 0.32, h * 0.17);
          ctx.fillStyle = '#ffd12a';
          ctx.fillRect(x + w * 0.16, y + h * (0.08 + i * 0.24), w * 0.24, h * 0.03);
        }
        ctx.fillStyle = '#ffd32a';
        ctx.fillRect(x + w * 0.34, screenY - h * 0.12, w * 0.32, h * 0.12);
        if (w > 22) {
          this.drawArcadeText(ctx, '⚠️危險電桿', screenX, screenY + Math.max(11, Math.floor(h * 0.10)), `900 ${Math.min(12, Math.max(8, Math.floor(w * 0.14)))}px sans-serif`, '#ffffff', 'center', 2);
        }
        break;
      }

      case 'CLIFF_ROCK': {
        ctx.fillStyle = '#485460';
        ctx.beginPath();
        ctx.moveTo(x - w * 0.10, screenY);
        ctx.lineTo(x + w * 0.05, y + h * 0.22);
        ctx.lineTo(x + w * 0.48, y + h * 0.08);
        ctx.lineTo(x + w * 0.95, y + h * 0.28);
        ctx.lineTo(x + w * 1.10, screenY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#111';
        ctx.lineWidth = Math.max(1.5, w * 0.03);
        ctx.stroke();

        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(x + w * 0.18, y + h * 0.30, w * 0.56, h * 0.46);
        if (w > 22) {
          this.drawArcadeText(ctx, '⚠️落石危險', screenX, screenY + Math.max(11, Math.floor(h * 0.10)), `900 ${Math.min(12, Math.max(8, Math.floor(w * 0.14)))}px sans-serif`, '#ffffff', 'center', 2);
        }
        break;
      }

      case 'CYPRESS_TREE': {
        ctx.fillStyle = '#5c2e14';
        ctx.fillRect(x + w * 0.3, y + h * 0.28, w * 0.4, h * 0.72);
        ctx.fillStyle = '#145a32';
        ctx.fillRect(x - w * 0.1, y, w * 1.2, h * 0.38);
        if (w > 22) {
          this.drawArcadeText(ctx, '⚠️神木小心', screenX, screenY + Math.max(11, Math.floor(h * 0.10)), `900 ${Math.min(12, Math.max(8, Math.floor(w * 0.14)))}px sans-serif`, '#ffffff', 'center', 2);
        }
        break;
      }

      case 'FORK_SIGN_LEFT':
      case 'FORK_SIGN_RIGHT': {
        // 【分岔中島關卡指標立牌：內嵌《合金彈頭》風格實景圖案 + 鉚釘鋼框】
        const sw = Math.floor(w * 1.45);
        const sh = Math.floor(h * 1.15);
        const sx = Math.floor(screenX - sw / 2);
        const sy = Math.floor(screenY - sh);
        const boardH = Math.floor(sh * 0.68);

        // 鋼鐵立柱
        ctx.fillStyle = '#576574';
        ctx.fillRect(screenX - Math.max(2, sw * 0.06), sy + boardH, Math.max(4, sw * 0.12), sh - boardH);
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(screenX - Math.max(2, sw * 0.06), sy + boardH, Math.max(4, sw * 0.12), sh - boardH);

        // 公路綠底金框指標牌
        ctx.fillStyle = '#006b3f';
        ctx.fillRect(sx, sy, sw, boardH);
        ctx.strokeStyle = '#ffd32a';
        ctx.lineWidth = Math.max(1.5, sw * 0.03);
        ctx.strokeRect(sx, sy, sw, boardH);

        // 內嵌該分支關卡的《合金彈頭》風格實景圖
        if (sw > 18 && boardH > 14) {
          const pad = Math.max(2, Math.floor(sw * 0.04));
          const artH = Math.max(8, Math.floor(boardH * 0.66));
          this.drawStageLandmarkIcon(ctx, sp.stageId || 'kenting_st', sx + pad, sy + pad, sw - pad * 2, artH);
        }

        if (sw > 22) {
          this.drawArcadeText(
            ctx,
            sp.label || '景點方向',
            screenX,
            sy + boardH * 0.90,
            `900 ${Math.min(11, Math.max(7, Math.floor(sw * 0.12)))}px sans-serif`,
            '#ffeaa7',
            'center',
            1
          );
        }
        break;
      }

      case 'OUTRUN_FORK_BILLBOARD': {
        // 【1986 SEGA OutRun 經典分岔點巨型路邊關卡指標立牌（含《合金彈頭》風格實景圖）】
        const bw = Math.floor(w * 1.68);
        const bh = Math.floor(h * 1.32);
        const bx = Math.floor(screenX - bw / 2);
        const by = Math.floor(screenY - bh);
        const isLeft = sp.dir === 'left';
        const flash = Math.floor(performance.now() / 110) % 2 === 0;

        // 地面立牌投射陰影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
        ctx.fillRect(bx + bw * 0.06, screenY - 5, bw * 0.88, 9);

        // 雙H型重鋼骨支撐立柱與底部紅白防撞座
        const legW = Math.max(4, Math.floor(bw * 0.085));
        const legH = Math.floor(bh * 0.32);
        const leftLegX = Math.floor(bx + bw * 0.18);
        const rightLegX = Math.floor(bx + bw * 0.82 - legW);
        const legTopY = screenY - legH;

        ctx.fillStyle = '#576574';
        ctx.fillRect(leftLegX, legTopY, legW, legH);
        ctx.fillRect(rightLegX, legTopY, legW, legH);
        ctx.fillStyle = '#dfe6e9';
        ctx.fillRect(leftLegX + 1, legTopY, Math.max(1, legW * 0.35), legH);
        ctx.fillRect(rightLegX + 1, legTopY, Math.max(1, legW * 0.35), legH);
        ctx.fillStyle = '#ffd32a';
        ctx.fillRect(leftLegX - 2, screenY - legH * 0.28, legW + 4, legH * 0.28);
        ctx.fillRect(rightLegX - 2, screenY - legH * 0.28, legW + 4, legH * 0.28);

        // 巨型風景立牌《合金彈頭》重裝鉚釘外框
        const boardH = Math.floor(bh * 0.72);
        ctx.fillStyle = '#111625';
        ctx.fillRect(bx, by, bw, boardH);
        ctx.strokeStyle = flash ? '#ffd32a' : (isLeft ? '#00f0ff' : '#ff2a85');
        ctx.lineWidth = Math.max(2, bw * 0.032);
        ctx.strokeRect(bx, by, bw, boardH);

        // 頂部投射探照燈組 (4 盞街機看板投射燈)
        for (let l = 0; l < 4; l++) {
          const lx = bx + bw * (0.16 + l * 0.22);
          ctx.fillStyle = '#2d3436';
          ctx.fillRect(lx - 4, by - 7, 8, 5);
          ctx.fillStyle = flash ? '#fff200' : '#ffffff';
          ctx.fillRect(lx - 3, by - 3, 6, 3);
        }

        // 立牌上方：OutRun 閃爍方向箭頭橫幅
        const headerH = Math.max(9, Math.floor(boardH * 0.20));
        ctx.fillStyle = isLeft ? '#006266' : '#833471';
        ctx.fillRect(bx + 2, by + 2, bw - 4, headerH);
        if (bw > 26) {
          const arrowStr = isLeft ? `◄◄ LEFT 往左` : `往右 RIGHT ►►`;
          this.drawArcadeText(
            ctx,
            arrowStr,
            screenX,
            by + headerH * 0.78,
            `900 ${Math.max(8, Math.floor(headerH * 0.64))}px sans-serif`,
            flash ? '#ffd32a' : '#ffffff',
            'center',
            1
          );
        }

        // 立牌中央：直接繪製該分支景點的《合金彈頭》風格實景插畫！
        const artPad = Math.max(2, Math.floor(bw * 0.035));
        const artX = bx + artPad;
        const artY = by + headerH + 2;
        const artW = Math.max(8, bw - artPad * 2);
        const artH = Math.max(8, Math.floor(boardH * 0.60));
        if (bw > 18 && artH > 8) {
          this.drawStageLandmarkIcon(ctx, sp.stageId || 'kenting_st', artX, artY, artW, artH);
        }

        // 立牌下方：台灣公路綠底金字景點名牌
        const footerY = artY + artH + 1;
        const footerH = Math.max(8, by + boardH - footerY - 2);
        ctx.fillStyle = '#006b3f';
        ctx.fillRect(bx + 2, footerY, bw - 4, footerH);
        if (bw > 26) {
          this.drawArcadeText(
            ctx,
            sp.label || '風景區',
            screenX,
            footerY + footerH * 0.76,
            `900 ${Math.max(8, Math.floor(footerH * 0.68))}px sans-serif`,
            '#ffeaa7',
            'center',
            1
          );
        }
        break;
      }

      case 'TRAFFIC_GRAVEL_TRUCK':
      case 'TRAFFIC_TRUCK': {
        // 【大車：台灣重型砂石車（寬度為使用者車輛的 2 倍大，高度 1.5 倍；無下方註解）】
        const cw = Math.max(3, Math.floor(playerUnitW * 2.0));
        const ch = Math.max(3, Math.floor(playerUnitH * 1.5));
        const cx = Math.floor(screenX - cw / 2);
        const cy = Math.floor(screenY - ch);

        // 底盤大陰影與雙排重型四巨輪
        ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
        ctx.fillRect(cx - cw * 0.04, screenY - 5, cw * 1.08, 7);
        ctx.fillStyle = '#111111';
        ctx.fillRect(cx + cw * 0.03, cy + ch * 0.72, cw * 0.22, ch * 0.28);
        ctx.fillRect(cx + cw * 0.75, cy + ch * 0.72, cw * 0.22, ch * 0.28);

        // 砂石車頂部滿載隆起的碎石堆
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath();
        ctx.moveTo(cx + cw * 0.06, cy + ch * 0.18);
        ctx.lineTo(cx + cw * 0.28, cy + ch * 0.02);
        ctx.lineTo(cx + cw * 0.56, cy + ch * 0.05);
        ctx.lineTo(cx + cw * 0.78, cy + ch * 0.01);
        ctx.lineTo(cx + cw * 0.94, cy + ch * 0.18);
        ctx.closePath();
        ctx.fill();

        // 重裝墨綠/深藍鋼鐵砂石車斗與垂直補強肋條
        ctx.fillStyle = '#1e3799';
        ctx.fillRect(cx, cy + ch * 0.16, cw, ch * 0.58);
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = Math.max(1.2, cw * 0.02);
        ctx.strokeRect(cx, cy + ch * 0.16, cw, ch * 0.58);
        ctx.fillStyle = '#0c2461';
        for (let r = 1; r <= 4; r++) {
          ctx.fillRect(cx + cw * (r * 0.20) - 2, cy + ch * 0.18, Math.max(2, cw * 0.04), ch * 0.52);
        }

        // 車尾黑底金框「保持距離・注意內輪差」標語
        ctx.fillStyle = '#111111';
        ctx.fillRect(cx + cw * 0.12, cy + ch * 0.34, cw * 0.76, ch * 0.22);
        ctx.strokeStyle = '#ffd32a';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(cx + cw * 0.12, cy + ch * 0.34, cw * 0.76, ch * 0.22);
        if (cw > 36) {
          ctx.fillStyle = '#ffd32a';
          ctx.font = `900 ${Math.min(11, Math.max(7, Math.floor(cw * 0.08)))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('砂石大車・注意內輪差', screenX, cy + ch * 0.49);
        }

        // 後保險桿黃黑反光斜紋防撞護欄與紅尾燈
        ctx.fillStyle = '#ffd32a';
        ctx.fillRect(cx + cw * 0.04, cy + ch * 0.68, cw * 0.92, ch * 0.09);
        ctx.fillStyle = '#111111';
        for (let s = 0; s < 5; s++) {
          ctx.fillRect(cx + cw * (0.08 + s * 0.18), cy + ch * 0.68, cw * 0.08, ch * 0.09);
        }
        ctx.fillStyle = '#ff3838';
        ctx.fillRect(cx + cw * 0.04, cy + ch * 0.59, cw * 0.18, ch * 0.08);
        ctx.fillRect(cx + cw * 0.78, cy + ch * 0.59, cw * 0.18, ch * 0.08);
        break;
      }

      case 'TRAFFIC_SEDAN': {
        // 【中車：一般轎車 / 小黃計程車（與使用者車輛維持 1:1 比例；無下方註解）】
        const cw = Math.max(2, Math.floor(playerUnitW * 1.0));
        const ch = Math.max(2, Math.floor(playerUnitH * 1.0));
        const cx = Math.floor(screenX - cw / 2);
        const cy = Math.floor(screenY - ch);
        const variant = (sp.variant || 0) % 3;
        const bodyCol = variant === 0 ? '#f1c40f' : (variant === 1 ? '#ecf0f1' : '#3498db');
        const roofCol = variant === 0 ? '#f39c12' : (variant === 1 ? '#dfe6e9' : '#2980b9');

        // 底盤陰影與雙輪
        ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
        ctx.fillRect(cx - cw * 0.04, screenY - 3, cw * 1.08, 5);
        ctx.fillStyle = '#111111';
        ctx.fillRect(cx + cw * 0.06, cy + ch * 0.74, cw * 0.18, ch * 0.26);
        ctx.fillRect(cx + cw * 0.76, cy + ch * 0.74, cw * 0.18, ch * 0.26);

        // 轎車下半車廂與上半車頂梯形座艙
        ctx.fillStyle = bodyCol;
        ctx.fillRect(cx, cy + ch * 0.40, cw, ch * 0.40);
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = Math.max(1.1, cw * 0.022);
        ctx.strokeRect(cx, cy + ch * 0.40, cw, ch * 0.40);

        ctx.fillStyle = roofCol;
        ctx.beginPath();
        ctx.moveTo(cx + cw * 0.12, cy + ch * 0.40);
        ctx.lineTo(cx + cw * 0.22, cy + ch * 0.08);
        ctx.lineTo(cx + cw * 0.78, cy + ch * 0.08);
        ctx.lineTo(cx + cw * 0.88, cy + ch * 0.40);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 後擋風玻璃
        ctx.fillStyle = '#1e272e';
        ctx.beginPath();
        ctx.moveTo(cx + cw * 0.18, cy + ch * 0.38);
        ctx.lineTo(cx + cw * 0.25, cy + ch * 0.14);
        ctx.lineTo(cx + cw * 0.75, cy + ch * 0.14);
        ctx.lineTo(cx + cw * 0.82, cy + ch * 0.38);
        ctx.closePath();
        ctx.fill();

        if (variant === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(screenX - cw * 0.18, cy - ch * 0.04, cw * 0.36, ch * 0.12);
          ctx.strokeRect(screenX - cw * 0.18, cy - ch * 0.04, cw * 0.36, ch * 0.12);
        }

        // 雙側紅尾燈與車牌
        ctx.fillStyle = '#ff3838';
        ctx.fillRect(cx + cw * 0.05, cy + ch * 0.50, cw * 0.22, ch * 0.14);
        ctx.fillRect(cx + cw * 0.73, cy + ch * 0.50, cw * 0.22, ch * 0.14);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + cw * 0.36, cy + ch * 0.54, cw * 0.28, ch * 0.14);
        break;
      }

      case 'POLICE_RED_ZEBRA': {
        // 【台灣國道公路警察局巡邏車「紅斑馬」：與使用者車輛維持 1:1 比例，無下方註解】
        const cw = Math.max(2, Math.floor(playerUnitW * 1.0));
        const ch = Math.max(2, Math.floor(playerUnitH * 1.0));
        const cx = Math.floor(screenX - cw / 2);
        const cy = Math.floor(screenY - ch);
        const flashRed = Math.floor(performance.now() / 85) % 2 === 0;

        // 地面紅藍爆閃警燈反射光圈
        ctx.fillStyle = flashRed ? 'rgba(255, 30, 50, 0.42)' : 'rgba(0, 140, 255, 0.42)';
        ctx.beginPath();
        ctx.ellipse(screenX, screenY - 3, cw * 0.68, Math.max(4, ch * 0.18), 0, 0, Math.PI * 2);
        ctx.fill();

        // 寬體跑胎
        ctx.fillStyle = '#111111';
        ctx.fillRect(cx + cw * 0.05, cy + ch * 0.74, cw * 0.20, ch * 0.26);
        ctx.fillRect(cx + cw * 0.75, cy + ch * 0.74, cw * 0.20, ch * 0.26);

        // 純白車身主體
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx, cy + ch * 0.38, cw, ch * 0.40);
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = Math.max(1.2, cw * 0.024);
        ctx.strokeRect(cx, cy + ch * 0.38, cw, ch * 0.40);

        // 車身兩側與車尾鮮紅色斜向斑馬條紋
        ctx.fillStyle = '#e74c3c';
        for (let z = 0; z < 6; z++) {
          const zx = cx + cw * (0.04 + z * 0.16);
          ctx.beginPath();
          ctx.moveTo(zx, cy + ch * 0.40);
          ctx.lineTo(zx + cw * 0.09, cy + ch * 0.40);
          ctx.lineTo(zx + cw * 0.04, cy + ch * 0.76);
          ctx.lineTo(zx - cw * 0.05, cy + ch * 0.76);
          ctx.closePath();
          ctx.fill();
        }

        // 車頂白底座艙與深黑防彈後擋風玻璃
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cx + cw * 0.12, cy + ch * 0.38);
        ctx.lineTo(cx + cw * 0.22, cy + ch * 0.10);
        ctx.lineTo(cx + cw * 0.78, cy + ch * 0.10);
        ctx.lineTo(cx + cw * 0.88, cy + ch * 0.38);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#141b29';
        ctx.beginPath();
        ctx.moveTo(cx + cw * 0.18, cy + ch * 0.36);
        ctx.lineTo(cx + cw * 0.25, cy + ch * 0.15);
        ctx.lineTo(cx + cw * 0.75, cy + ch * 0.15);
        ctx.lineTo(cx + cw * 0.82, cy + ch * 0.36);
        ctx.closePath();
        ctx.fill();

        // 車尾「國道警察」深藍金框飾板
        ctx.fillStyle = '#0c2461';
        ctx.fillRect(cx + cw * 0.24, cy + ch * 0.46, cw * 0.52, ch * 0.22);
        ctx.strokeStyle = '#ffd32a';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(cx + cw * 0.24, cy + ch * 0.46, cw * 0.52, ch * 0.22);
        if (cw > 24) {
          ctx.fillStyle = '#ffd32a';
          ctx.font = `900 ${Math.min(10, Math.max(6, Math.floor(cw * 0.12)))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('國道警察', screenX, cy + ch * 0.62);
        }

        // 車頂長排紅藍高亮度交替爆閃警示燈桿
        const barY = cy + ch * 0.01;
        ctx.fillStyle = flashRed ? '#ff1e1e' : '#00a8ff';
        ctx.fillRect(cx + cw * 0.20, barY, cw * 0.30, ch * 0.10);
        ctx.fillStyle = flashRed ? '#00a8ff' : '#ff1e1e';
        ctx.fillRect(cx + cw * 0.50, barY, cw * 0.30, ch * 0.10);
        ctx.strokeStyle = '#111111';
        ctx.strokeRect(cx + cw * 0.20, barY, cw * 0.60, ch * 0.10);

        // 急煞攔截時亮起超刺眼雙紅煞車尾燈光暈
        ctx.fillStyle = sp.brakeLightOn ? '#ff0000' : '#c0392b';
        ctx.fillRect(cx + cw * 0.03, cy + ch * 0.46, cw * 0.19, ch * 0.16);
        ctx.fillRect(cx + cw * 0.78, cy + ch * 0.46, cw * 0.19, ch * 0.16);
        if (sp.brakeLightOn) {
          ctx.fillStyle = 'rgba(255, 30, 30, 0.55)';
          ctx.beginPath();
          ctx.arc(cx + cw * 0.12, cy + ch * 0.54, cw * 0.16, 0, Math.PI * 2);
          ctx.arc(cx + cw * 0.88, cy + ch * 0.54, cw * 0.16, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'TRAFFIC_SCOOTER': {
        // 【小車：台灣在地「白吊嘎＋外八劈腿＋白長襪」機車騎士（參考實照繪製，車牌號碼：9GY-0878）】
        const sw = Math.max(4, Math.floor(playerUnitW * 0.64));
        const sh = Math.max(5, Math.floor(playerUnitH * 0.86));
        const sx = Math.floor(screenX - sw / 2);
        const sy = Math.floor(screenY - sh);
        const lineW = Math.max(1.1, sw * 0.022);
        ctx.lineWidth = lineW;
        ctx.strokeStyle = '#111111';

        // 1. 地面車底深色橢圓陰影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
        ctx.beginPath();
        ctx.ellipse(screenX, screenY - 2, sw * 0.44, Math.max(3, sh * 0.06), 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. 左右手把、黑色鏡桿與大橢圓形銀灰後照鏡
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = Math.max(1.2, sw * 0.026);
        ctx.beginPath();
        // 左鏡桿与手把
        ctx.moveTo(sx + sw * 0.25, sy + sh * 0.37);
        ctx.lineTo(sx + sw * 0.13, sy + sh * 0.27);
        // 右鏡桿与手把
        ctx.moveTo(sx + sw * 0.75, sy + sh * 0.37);
        ctx.lineTo(sx + sw * 0.87, sy + sh * 0.28);
        ctx.stroke();

        // 左右手把黑色開關總成與握把
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(sx + sw * 0.16, sy + sh * 0.35, sw * 0.14, sh * 0.045);
        ctx.fillRect(sx + sw * 0.66, sy + sh * 0.34, sw * 0.18, sh * 0.055);

        // 左、右大橢圓後照鏡（黑框 + 銀藍反光鏡面）
        [
          { mx: sx + sw * 0.10, my: sy + sh * 0.25, tilt: -0.25 },
          { mx: sx + sw * 0.90, my: sy + sh * 0.26, tilt: 0.25 }
        ].forEach((m) => {
          ctx.fillStyle = '#dfe6e9';
          ctx.beginPath();
          ctx.ellipse(m.mx, m.my, Math.max(2, sw * 0.085), Math.max(1.5, sh * 0.042), m.tilt, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });

        // 3. 豪邁外八劈腿雙腳：古銅色外張膝蓋 + 白色高筒運動長襪（含黑色勾勾）+ 白色球鞋
        // 左、右小腿白色高筒長襪（由外側膝蓋斜向內下方飛旋踏板）
        ctx.fillStyle = '#ffffff';
        // 左白長襪
        ctx.beginPath();
        ctx.moveTo(sx + sw * 0.08, sy + sh * 0.57);
        ctx.lineTo(sx + sw * 0.19, sy + sh * 0.55);
        ctx.lineTo(sx + sw * 0.31, sy + sh * 0.73);
        ctx.lineTo(sx + sw * 0.22, sy + sh * 0.76);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // 右白長襪
        ctx.beginPath();
        ctx.moveTo(sx + sw * 0.92, sy + sh * 0.57);
        ctx.lineTo(sx + sw * 0.81, sy + sh * 0.55);
        ctx.lineTo(sx + sw * 0.69, sy + sh * 0.73);
        ctx.lineTo(sx + sw * 0.78, sy + sh * 0.76);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 襪口黑色運動勾勾標誌
        if (sw > 22) {
          ctx.fillStyle = '#111111';
          ctx.fillRect(sx + sw * 0.12, sy + sh * 0.59, sw * 0.05, Math.max(1.2, sh * 0.018));
          ctx.fillRect(sx + sw * 0.83, sy + sh * 0.59, sw * 0.05, Math.max(1.2, sh * 0.018));
        }

        // 左右腳白色運動球鞋
        ctx.fillStyle = '#f5f6fa';
        ctx.beginPath();
        ctx.ellipse(sx + sw * 0.25, sy + sh * 0.76, Math.max(2, sw * 0.065), Math.max(1.5, sh * 0.032), -0.3, 0, Math.PI * 2);
        ctx.ellipse(sx + sw * 0.75, sy + sh * 0.76, Math.max(2, sw * 0.065), Math.max(1.5, sh * 0.032), 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 外八張開的古銅色膝蓋
        ctx.fillStyle = '#c68652';
        ctx.beginPath();
        ctx.arc(sx + sw * 0.11, sy + sh * 0.52, Math.max(2, sw * 0.065), 0, Math.PI * 2);
        ctx.arc(sx + sw * 0.89, sy + sh * 0.52, Math.max(2, sw * 0.065), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 深藍黑色寬鬆外八短褲與黑色皮帶
        ctx.fillStyle = '#1e272e';
        ctx.beginPath();
        ctx.moveTo(sx + sw * 0.26, sy + sh * 0.44);
        ctx.lineTo(sx + sw * 0.74, sy + sh * 0.44);
        ctx.lineTo(sx + sw * 0.88, sy + sh * 0.50);
        ctx.lineTo(sx + sw * 0.83, sy + sh * 0.58);
        ctx.lineTo(sx + sw * 0.62, sy + sh * 0.56);
        ctx.lineTo(sx + sw * 0.38, sy + sh * 0.56);
        ctx.lineTo(sx + sw * 0.17, sy + sh * 0.58);
        ctx.lineTo(sx + sw * 0.12, sy + sh * 0.50);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#111111';
        ctx.fillRect(sx + sw * 0.27, sy + sh * 0.43, sw * 0.46, sh * 0.028);

        // 4. 強壯古銅色雙臂與超顯眼「純白挖背吊嘎（汗衫背心）」
        ctx.fillStyle = '#c68652';
        // 左手臂與左肩
        ctx.beginPath();
        ctx.moveTo(sx + sw * 0.32, sy + sh * 0.20);
        ctx.lineTo(sx + sw * 0.21, sy + sh * 0.23);
        ctx.lineTo(sx + sw * 0.16, sy + sh * 0.36);
        ctx.lineTo(sx + sw * 0.25, sy + sh * 0.38);
        ctx.lineTo(sx + sw * 0.31, sy + sh * 0.30);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // 右手臂與右肩
        ctx.beginPath();
        ctx.moveTo(sx + sw * 0.68, sy + sh * 0.20);
        ctx.lineTo(sx + sw * 0.79, sy + sh * 0.23);
        ctx.lineTo(sx + sw * 0.84, sy + sh * 0.36);
        ctx.lineTo(sx + sw * 0.75, sy + sh * 0.38);
        ctx.lineTo(sx + sw * 0.69, sy + sh * 0.30);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 後頸古銅色肌膚
        ctx.fillStyle = '#c68652';
        ctx.fillRect(sx + sw * 0.40, sy + sh * 0.14, sw * 0.20, sh * 0.07);

        // 純白色挖背運動背心（白吊嘎）
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(sx + sw * 0.34, sy + sh * 0.19);
        ctx.quadraticCurveTo(screenX, sy + sh * 0.22, sx + sw * 0.66, sy + sh * 0.19);
        ctx.lineTo(sx + sw * 0.70, sy + sh * 0.30);
        ctx.lineTo(sx + sw * 0.73, sy + sh * 0.44);
        ctx.lineTo(sx + sw * 0.27, sy + sh * 0.44);
        ctx.lineTo(sx + sw * 0.30, sy + sh * 0.30);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // 背心立體衣褶陰影線
        if (sw > 24) {
          ctx.strokeStyle = '#dcdde1';
          ctx.beginPath();
          ctx.moveTo(sx + sw * 0.42, sy + sh * 0.24);
          ctx.lineTo(sx + sw * 0.39, sy + sh * 0.42);
          ctx.moveTo(sx + sw * 0.58, sy + sh * 0.24);
          ctx.lineTo(sx + sw * 0.61, sy + sh * 0.42);
          ctx.stroke();
          ctx.strokeStyle = '#111111';
        }

        // 5. 香檳銀灰半罩式安全帽（含頂部護目鏡深色邊、底部黑膠條與後方白貼紙）
        ctx.fillStyle = '#dcdde1';
        ctx.beginPath();
        ctx.ellipse(screenX, sy + sh * 0.095, Math.max(3, sw * 0.175), Math.max(3, sh * 0.085), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // 安全帽高光與頂部深色鏡片緣
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(screenX - sw * 0.04, sy + sh * 0.065, Math.max(1.5, sw * 0.07), Math.max(1.5, sh * 0.03), -0.2, 0, Math.PI * 2);
        ctx.fill();
        // 安全帽底部黑色膠條與後方小貼紙
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(sx + sw * 0.34, sy + sh * 0.13, sw * 0.32, sh * 0.026);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(screenX - sw * 0.045, sy + sh * 0.085, sw * 0.09, sh * 0.028);

        // 6. 銀灰色 125cc 速克達車尾、紅寶石尾燈、傳動箱、排氣管與【9GY-0878】白牌
        // 左側黑色傳動箱與空濾盒 + 右側黑色防燙蓋排氣管
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(sx + sw * 0.26, sy + sh * 0.72, sw * 0.13, sh * 0.17);
        ctx.strokeRect(sx + sw * 0.26, sy + sh * 0.72, sw * 0.13, sh * 0.17);
        ctx.fillRect(sx + sw * 0.59, sy + sh * 0.72, sw * 0.15, sh * 0.16);
        ctx.strokeRect(sx + sw * 0.59, sy + sh * 0.72, sw * 0.15, sh * 0.16);

        // 中央黑色寬後輪與深灰後擋泥板
        ctx.fillStyle = '#111111';
        ctx.fillRect(sx + sw * 0.41, sy + sh * 0.81, sw * 0.18, sh * 0.19);
        ctx.strokeRect(sx + sw * 0.41, sy + sh * 0.81, sw * 0.18, sh * 0.19);
        ctx.fillStyle = '#636e72';
        ctx.fillRect(sx + sw * 0.38, sy + sh * 0.74, sw * 0.24, sh * 0.11);
        ctx.strokeRect(sx + sw * 0.38, sy + sh * 0.74, sw * 0.24, sh * 0.11);

        // 銀灰色流線車尾殼與拱形後扶手
        ctx.fillStyle = '#b2bec3';
        ctx.beginPath();
        ctx.moveTo(sx + sw * 0.33, sy + sh * 0.49);
        ctx.lineTo(sx + sw * 0.67, sy + sh * 0.49);
        ctx.lineTo(sx + sw * 0.70, sy + sh * 0.73);
        ctx.lineTo(sx + sw * 0.30, sy + sh * 0.73);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 銀色拱形後扶手架
        ctx.strokeStyle = '#dfe6e9';
        ctx.lineWidth = Math.max(1.5, sw * 0.032);
        ctx.beginPath();
        ctx.arc(screenX, sy + sh * 0.54, sw * 0.13, Math.PI, 0);
        ctx.stroke();
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = lineW;

        // 紅寶石大尾燈 + 左右透明方向燈殼 + 下方紅色反光片
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(sx + sw * 0.32, sy + sh * 0.54, sw * 0.36, sh * 0.09);
        ctx.strokeRect(sx + sw * 0.32, sy + sh * 0.54, sw * 0.36, sh * 0.09);
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(sx + sw * 0.38, sy + sh * 0.535, sw * 0.24, sh * 0.095);
        ctx.fillStyle = '#ff1e1e';
        ctx.fillRect(sx + sw * 0.41, sy + sh * 0.55, sw * 0.18, sh * 0.06);
        // 小長方形紅反光片
        ctx.fillStyle = '#ff3838';
        ctx.fillRect(sx + sw * 0.44, sy + sh * 0.64, sw * 0.12, sh * 0.024);

        // 【白底黑字大型機車車牌：9GY-0878】
        const plateW = Math.max(8, Math.floor(sw * 0.48));
        const plateH = Math.max(5, Math.floor(sh * 0.115));
        const plateX = Math.floor(screenX - plateW / 2);
        const plateY = Math.floor(sy + sh * 0.665);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(plateX, plateY, plateW, plateH);
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = Math.max(1, sw * 0.02);
        ctx.strokeRect(plateX, plateY, plateW, plateH);

        if (plateW >= 18) {
          ctx.fillStyle = '#111111';
          const fontPx = Math.min(12, Math.max(6, Math.floor(plateW * 0.22)));
          ctx.font = `900 ${fontPx}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText('9GY-0878', screenX, plateY + plateH * 0.78);
        }
        break;
      }

      case 'FOOD_SAUSAGE':
      case 'FOOD_BURGER':
      case 'FOOD_VERMICELLI':
      case 'FOOD_ZONGZI':
      case 'FOOD_TOFU':
      case 'FOOD_BOBA': {
        // 【道路上的食物：與使用者車輛維持 1:1 比例，隨遠近由小到大平滑縮放】
        const fw = Math.max(2, Math.floor(playerUnitW * 1.0));
        const fh = Math.max(2, Math.floor(playerUnitH * 1.0));
        const floatY = Math.abs(Math.sin(performance.now() * 0.008 + screenX)) * (fh * 0.18);
        const fx = Math.floor(screenX - fw / 2);
        const fy = Math.floor(screenY - fh - floatY);

        // 地面金色發光美食光圈與白瓷圓盤底座
        ctx.fillStyle = 'rgba(255, 215, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(screenX, screenY - 3, fw * 0.56, Math.max(3, fh * 0.15), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffd32a';
        ctx.lineWidth = Math.max(1.2, fw * 0.035);
        ctx.stroke();

        ctx.lineWidth = Math.max(1.2, fw * 0.04);
        ctx.strokeStyle = '#111111';
        let foodLabel = '😋香腸+800';

        if (sp.type === 'FOOD_SAUSAGE') {
          foodLabel = '😋烤香腸 +800';
          ctx.fillStyle = '#f5cba7';
          ctx.fillRect(screenX - fw * 0.05, fy + fh * 0.55, fw * 0.10, fh * 0.44);
          ctx.strokeRect(screenX - fw * 0.05, fy + fh * 0.55, fw * 0.10, fh * 0.44);
          ctx.fillStyle = '#b33939';
          ctx.beginPath();
          ctx.roundRect(fx + fw * 0.22, fy + fh * 0.06, fw * 0.56, fh * 0.62, fw * 0.24);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#6d214f';
          ctx.fillRect(fx + fw * 0.28, fy + fh * 0.20, fw * 0.44, fh * 0.06);
          ctx.fillRect(fx + fw * 0.28, fy + fh * 0.36, fw * 0.44, fh * 0.06);
          ctx.fillRect(fx + fw * 0.28, fy + fh * 0.52, fw * 0.44, fh * 0.06);
          ctx.fillStyle = '#ffcccc';
          ctx.fillRect(fx + fw * 0.34, fy + fh * 0.12, fw * 0.10, fh * 0.07);
          ctx.fillRect(fx + fw * 0.52, fy + fh * 0.28, fw * 0.10, fh * 0.07);
        } else if (sp.type === 'FOOD_BURGER') {
          foodLabel = '😋大漢堡 +900';
          ctx.fillStyle = '#e67e22';
          ctx.fillRect(fx + fw * 0.12, fy + fh * 0.68, fw * 0.76, fh * 0.18);
          ctx.strokeRect(fx + fw * 0.12, fy + fh * 0.68, fw * 0.76, fh * 0.18);
          ctx.fillStyle = '#5c2c16';
          ctx.fillRect(fx + fw * 0.08, fy + fh * 0.52, fw * 0.84, fh * 0.16);
          ctx.strokeRect(fx + fw * 0.08, fy + fh * 0.52, fw * 0.84, fh * 0.16);
          ctx.fillStyle = '#ffd32a';
          ctx.fillRect(fx + fw * 0.10, fy + fh * 0.44, fw * 0.80, fh * 0.09);
          ctx.fillStyle = '#ff3838';
          ctx.fillRect(fx + fw * 0.14, fy + fh * 0.36, fw * 0.72, fh * 0.09);
          ctx.fillStyle = '#2ed573';
          ctx.fillRect(fx + fw * 0.06, fy + fh * 0.28, fw * 0.88, fh * 0.09);
          ctx.fillStyle = '#f39c12';
          ctx.beginPath();
          ctx.arc(screenX, fy + fh * 0.28, fw * 0.40, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.fillRect(screenX - fw * 0.18, fy + fh * 0.12, fw * 0.06, fh * 0.04);
          ctx.fillRect(screenX + fw * 0.08, fy + fh * 0.10, fw * 0.06, fh * 0.04);
          ctx.fillRect(screenX - fw * 0.04, fy + fh * 0.18, fw * 0.06, fh * 0.04);
        } else if (sp.type === 'FOOD_VERMICELLI') {
          foodLabel = '😋蚵仔麵線 +1000';
          ctx.fillStyle = '#ecf0f1';
          ctx.beginPath();
          ctx.arc(screenX, fy + fh * 0.48, fw * 0.44, 0, Math.PI);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#e74c3c';
          ctx.fillRect(fx + fw * 0.12, fy + fh * 0.52, fw * 0.76, fh * 0.08);
          ctx.fillStyle = '#a04000';
          ctx.beginPath();
          ctx.ellipse(screenX, fy + fh * 0.44, fw * 0.44, fh * 0.18, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#dfe6e9';
          ctx.fillRect(screenX - fw * 0.22, fy + fh * 0.36, fw * 0.16, fh * 0.12);
          ctx.fillStyle = '#6e2c00';
          ctx.fillRect(screenX + fw * 0.05, fy + fh * 0.38, fw * 0.18, fh * 0.12);
          ctx.fillStyle = '#2ecc71';
          ctx.fillRect(screenX - fw * 0.06, fy + fh * 0.32, fw * 0.14, fh * 0.09);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(screenX + fw * 0.18, fy + fh * 0.12, fw * 0.10, fh * 0.30);
          ctx.strokeRect(screenX + fw * 0.18, fy + fh * 0.12, fw * 0.10, fh * 0.30);
        } else if (sp.type === 'FOOD_ZONGZI') {
          foodLabel = '😋燒肉粽 +950';
          ctx.fillStyle = '#1e8449';
          ctx.beginPath();
          ctx.moveTo(screenX, fy + fh * 0.08);
          ctx.lineTo(fx + fw * 0.90, fy + fh * 0.82);
          ctx.lineTo(fx + fw * 0.10, fy + fh * 0.82);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#d35400';
          ctx.beginPath();
          ctx.moveTo(screenX, fy + fh * 0.12);
          ctx.lineTo(screenX + fw * 0.22, fy + fh * 0.48);
          ctx.lineTo(screenX - fw * 0.22, fy + fh * 0.48);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#ffd32a';
          ctx.fillRect(screenX - fw * 0.07, fy + fh * 0.28, fw * 0.14, fh * 0.12);
          ctx.fillStyle = '#f5f6fa';
          ctx.fillRect(fx + fw * 0.22, fy + fh * 0.56, fw * 0.56, fh * 0.07);
        } else if (sp.type === 'FOOD_TOFU') {
          foodLabel = '😋臭豆腐 +850';
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(fx + fw * 0.06, fy + fh * 0.68, fw * 0.88, fh * 0.16);
          ctx.strokeRect(fx + fw * 0.06, fy + fh * 0.68, fw * 0.88, fh * 0.16);
          [
            { tx: fx + fw * 0.12, ty: fy + fh * 0.36 },
            { tx: fx + fw * 0.50, ty: fy + fh * 0.36 },
            { tx: fx + fw * 0.31, ty: fy + fh * 0.14 }
          ].forEach((b) => {
            ctx.fillStyle = '#f39c12';
            ctx.fillRect(b.tx, b.ty, fw * 0.36, fh * 0.34);
            ctx.strokeRect(b.tx, b.ty, fw * 0.36, fh * 0.34);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(b.tx + fw * 0.08, b.ty + fh * 0.06, fw * 0.20, fh * 0.12);
            ctx.fillStyle = '#badc58';
            ctx.fillRect(b.tx + fw * 0.12, b.ty - fh * 0.04, fw * 0.14, fh * 0.10);
          });
        } else {
          foodLabel = '😋波霸珍奶 +750';
          ctx.fillStyle = '#f5cba7';
          ctx.fillRect(fx + fw * 0.22, fy + fh * 0.22, fw * 0.56, fh * 0.68);
          ctx.strokeRect(fx + fw * 0.22, fy + fh * 0.22, fw * 0.56, fh * 0.68);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(fx + fw * 0.18, fy + fh * 0.18, fw * 0.64, fh * 0.08);
          ctx.strokeRect(fx + fw * 0.18, fy + fh * 0.18, fw * 0.64, fh * 0.08);
          ctx.fillStyle = '#1e272e';
          for (let b = 0; b < 4; b++) {
            ctx.fillRect(fx + fw * (0.26 + b * 0.12), fy + fh * 0.72, fw * 0.09, fh * 0.12);
          }
          ctx.fillStyle = '#ff2a85';
          ctx.fillRect(fx + fw * 0.44, fy, fw * 0.14, fh * 0.28);
          ctx.strokeRect(fx + fw * 0.44, fy, fw * 0.14, fh * 0.28);
        }

        if (fw > 18) {
          this.drawArcadeText(
            ctx,
            foodLabel,
            screenX,
            screenY + Math.max(11, Math.floor(fh * 0.16)),
            `900 ${Math.min(12, Math.max(8, Math.floor(fw * 0.15)))}px sans-serif`,
            '#ffffff',
            'center',
            2
          );
        }
        break;
      }

      case 'NPC_MONKEY': {
        const mw = w * 0.68;
        const mh = h * 0.66;
        const mx = Math.floor(screenX - mw / 2);
        const my = Math.floor(screenY - mh);
        const hop = Math.abs(Math.sin(performance.now() * 0.012)) * (mh * 0.12);

        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(mx + mw * 0.35, screenY - mh * 0.35, mw * 0.30, mh * 0.35);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(mx + mw * 0.35, screenY - mh * 0.25, mw * 0.30, mh * 0.12);

        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(mx + mw * 0.22, my + mh * 0.28 - hop, mw * 0.56, mh * 0.44);
        ctx.strokeStyle = '#111';
        ctx.lineWidth = Math.max(1, mw * 0.03);
        ctx.strokeRect(mx + mw * 0.22, my + mh * 0.28 - hop, mw * 0.56, mh * 0.44);
        ctx.fillStyle = '#ff3838';
        ctx.fillRect(mx + mw * 0.62, my + mh * 0.48 - hop, mw * 0.20, mh * 0.18);
        ctx.fillRect(mx + mw * 0.28, my + mh * 0.06 - hop, mw * 0.44, mh * 0.24);
        ctx.fillStyle = '#111';
        ctx.fillRect(mx + mw * 0.35, my + mh * 0.12 - hop, mw * 0.08, mh * 0.08);
        ctx.fillRect(mx + mw * 0.55, my + mh * 0.12 - hop, mw * 0.08, mh * 0.08);
        ctx.fillStyle = '#ffd32a';
        ctx.fillRect(mx - mw * 0.08, my + mh * 0.10 - hop, mw * 0.32, mh * 0.16);
        break;
      }

      case 'BANANA_PEEL': {
        const bw = w * 0.56;
        const bh = h * 0.28;
        const bx = Math.floor(screenX - bw / 2);
        const by = Math.floor(screenY - bh);
        ctx.fillStyle = '#ffd32a';
        ctx.fillRect(bx, by + bh * 0.45, bw, bh * 0.55);
        ctx.fillRect(bx + bw * 0.28, by, bw * 0.44, bh * 0.55);
        ctx.strokeStyle = '#111';
        ctx.lineWidth = Math.max(1, bw * 0.04);
        ctx.strokeRect(bx, by + bh * 0.45, bw, bh * 0.55);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx + bw * 0.36, by + bh * 0.15, bw * 0.12, bh * 0.35);
        break;
      }

      case 'NPC_BEAR': {
        const bw = w * 0.88;
        const bh = h * 0.90;
        const bx = Math.floor(screenX - bw / 2);
        const by = Math.floor(screenY - bh);
        const wave = Math.sin(performance.now() * 0.015) * (bh * 0.08);

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(bx + bw * 0.1, screenY - 5, bw * 0.8, 7);

        ctx.fillStyle = '#1e272e';
        ctx.fillRect(bx + bw * 0.14, by + bh * 0.24, bw * 0.72, bh * 0.76);
        ctx.fillRect(bx + bw * 0.22, by + bh * 0.04, bw * 0.56, bh * 0.24);
        ctx.fillRect(bx + bw * 0.14, by, bw * 0.18, bh * 0.14);
        ctx.fillRect(bx + bw * 0.68, by, bw * 0.18, bh * 0.14);
        ctx.fillRect(bx - bw * 0.04, by + bh * 0.28 + wave, bw * 0.20, bh * 0.14);

        ctx.fillStyle = '#d35400';
        ctx.fillRect(bx + bw * 0.38, by + bh * 0.14, bw * 0.24, bh * 0.12);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx + bw * 0.32, by + bh * 0.09, bw * 0.08, bh * 0.06);
        ctx.fillRect(bx + bw * 0.60, by + bh * 0.09, bw * 0.08, bh * 0.06);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(3, bw * 0.11);
        ctx.beginPath();
        ctx.moveTo(bx + bw * 0.28, by + bh * 0.38);
        ctx.lineTo(bx + bw * 0.50, by + bh * 0.58);
        ctx.lineTo(bx + bw * 0.72, by + bh * 0.38);
        ctx.stroke();

        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(bx + bw * 0.74, by + bh * 0.36, bw * 0.28, bh * 0.26);
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx + bw * 0.74, by + bh * 0.36, bw * 0.28, bh * 0.26);
        break;
      }

      case 'NPC_PHEASANT': {
        const pw = w * 0.62;
        const ph = h * 0.55;
        const flyLift = sp.startled ? Math.abs(Math.sin(performance.now() * 0.025)) * (ph * 1.45) + ph * 0.65 : 0;
        const px = Math.floor(screenX - pw / 2);
        const py = Math.floor(screenY - ph - flyLift);

        ctx.fillStyle = '#192a56';
        ctx.fillRect(px + pw * 0.18, py + ph * 0.28, pw * 0.52, ph * 0.52);
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(px + pw * 0.24, py + ph * 0.34, pw * 0.36, ph * 0.26);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(px + pw * 0.22, py + ph * 0.08, pw * 0.26, ph * 0.22);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + pw * 0.66, py + ph * 0.42, pw * 0.62, ph * 0.18);
        ctx.fillStyle = '#111111';
        ctx.fillRect(px + pw * 0.82, py + ph * 0.42, pw * 0.12, ph * 0.18);
        ctx.fillRect(px + pw * 1.06, py + ph * 0.42, pw * 0.12, ph * 0.18);
        break;
      }

      case 'FALLING_ROCK': {
        const rw = w * 0.65;
        const rh = h * 0.48;
        const bounceY = Math.abs(Math.sin(performance.now() * 0.012 + screenX)) * (rh * 0.45);
        const rx = Math.floor(screenX - rw / 2);
        const ry = Math.floor(screenY - rh - bounceY);
        ctx.fillStyle = '#576574';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.fillStyle = '#8395a7';
        ctx.fillRect(rx + rw * 0.15, ry + rh * 0.15, rw * 0.6, rh * 0.55);
        break;
      }

      case 'NIGHT_MARKET_CROWD': {
        const cw = w * 0.78;
        const ch = h * 0.58;
        const cx = Math.floor(screenX - cw / 2);
        const cy = Math.floor(screenY - ch);
        ctx.fillStyle = '#ff7675';
        ctx.fillRect(cx + cw * 0.1, cy + ch * 0.35, cw * 0.25, ch * 0.65);
        ctx.fillStyle = '#74b9ff';
        ctx.fillRect(cx + cw * 0.42, cy + ch * 0.32, cw * 0.25, ch * 0.68);
        ctx.fillStyle = '#ffeaa7';
        ctx.fillRect(cx + cw * 0.12, cy + ch * 0.15, cw * 0.2, ch * 0.2);
        ctx.fillRect(cx + cw * 0.44, cy + ch * 0.12, cw * 0.2, ch * 0.2);
        break;
      }
    }
    ctx.restore();
  }

  /**
   * 取得 18 步「翻車 ➔ 高空完全分解 ➔ 神級空中抓車架重組 ➔ 重重落地 ➔ 奇蹟成功」對應的圖框與拋飛高度（不顯示文字註解，全由創意語音與音效表現）
   */
  getCrashStageInfo(player) {
    const elapsed = Math.max(0, player.crashDuration - player.crashTimer);
    const progress = Math.min(1, elapsed / Math.max(0.01, player.crashDuration));

    if (progress < 0.10) {
      return { frameKey: 'crash0', jumpY: -10 };
    } else if (progress < 0.21) {
      return { frameKey: 'crash1', jumpY: -46 };
    } else if (progress < 0.33) {
      return { frameKey: 'crash2', jumpY: -84 };
    } else if (progress < 0.49) {
      return { frameKey: 'crash3', jumpY: -94 };
    } else if (progress < 0.61) {
      return { frameKey: 'crash4', jumpY: -68 };
    } else if (progress < 0.73) {
      return { frameKey: 'crash5', jumpY: -44 };
    } else if (progress < 0.84) {
      return { frameKey: 'crash6', jumpY: -18 };
    } else if (progress < 0.92) {
      return { frameKey: 'crash7', jumpY: 0 };
    }
    return { frameKey: 'crash8', jumpY: 0 };
  }

  /**
   * 使用上傳的《合金彈頭》點陣圖集繪製「往左轉 (left_*)」與「往右轉 (right_*)」3/4 側面視角及推車狀態
   */
  drawAtlasDrivingSprite(ctx, centerX, baseY, player, dirPrefix) {
    const id = player.vehicle.id;
    const atlas = this.vehicleAtlases[id];
    if (!atlas || !atlas.loaded) return false;

    const time = performance.now() * 0.001;
    const speedFactor = Math.min(1.3, player.speed / player.maxSpeed);

    let baseKey = 'turn';
    if (player.isFatMode) {
      baseKey = player.isPushingCar ? 'fat_push' : 'fat';
    } else if (player.nitroTimer > 0) {
      baseKey = Math.floor(time * 12) % 2 === 0 ? 'nitro1' : 'nitro2';
    } else if (Math.abs(player.steer) > 0.35) {
      baseKey = 'turn';
    } else {
      baseKey = Math.floor(time * (8 + speedFactor * 14)) % 2 === 0 ? 'cruise1' : 'cruise2';
    }

    const fullKey = `${dirPrefix}_${baseKey}`;
    const frame = atlas.frames[fullKey] || atlas.frames[`${dirPrefix}_cruise1`] || atlas.frames.right_cruise1;
    if (!frame) return false;

    // 計算適合 3/4 車體比例的目標高度與寬度 (維持原始點陣圖長寬比與清晰像素邊緣)
    let targetH = 140;
    let maxW = 245;
    if (id === 'sausage') {
      if (baseKey === 'fat' || baseKey === 'fat_push') {
        targetH = 132;
        maxW = 255;
      } else {
        targetH = 158;
        maxW = 240;
      }
    } else if (baseKey === 'nitro1' || baseKey === 'nitro2') {
      targetH = 148;
      maxW = 290;
    } else if (baseKey === 'fat' || baseKey === 'fat_push') {
      targetH = 142;
      maxW = 275;
    }

    let scale = targetH / frame.h;
    if (frame.w * scale > maxW) {
      scale = maxW / frame.w;
    }

    const drawW = Math.round(frame.w * scale);
    const drawH = Math.round(frame.h * scale);

    const bounceFreq = player.isPushingCar ? 36 : (15 + speedFactor * 26);
    const bounceAmp = player.isPushingCar ? 2.8 : (1.5 + speedFactor * 2.0);
    const bounce = Math.sin(time * bounceFreq) * bounceAmp;
    const steerShift = Math.round(player.steer * 12);
    const tilt = player.steer * (id === 'grandma' ? 0.08 : 0.04);

    ctx.save();
    ctx.translate(centerX, baseY);

    // 車底陰影
    const shadowW = Math.min(180, Math.round(drawW * 0.78));
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(Math.floor(-shadowW / 2 + steerShift * 0.3), -9, shadowW, 13);

    ctx.translate(steerShift * 0.45, bounce);
    ctx.rotate(tilt);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      atlas.img,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      Math.floor(-drawW / 2),
      Math.floor(-drawH + 6),
      drawW,
      drawH
    );

    ctx.restore();
    return true;
  }

  /**
   * 總調度：繪製當前玩家所選載具的「正後方往前行駛視角 + 動態壓車左右傾斜 (OutRun Cornering Lean & Banking)」
   * - 車輛永遠朝正前方賽道行駛（不會變成橫向 90 度側面）
   * - 左右轉操作時 (player.steer)：以輪胎貼地接觸點為軸心，進行真實壓車傾斜 (Banking Rotate + 3D 透視切變 + 內側避震壓縮 + 壓彎磨地火花)
   */
  drawPlayerVehicle(ctx, centerX, baseY, player) {
    if (player.crashTimer <= 0 && player.crashInvincible > 0) {
      if (Math.floor(performance.now() / 55) % 2 === 0) {
        ctx.globalAlpha = 0.72;
      }
    }

    const id = player.vehicle.id;

    ctx.save();
    ctx.translate(centerX, baseY);
    ctx.scale(0.75, 0.75);

    if (player.spinTimer > 0) {
      const spinOffset = Math.sin(player.spinTimer * Math.PI * 6) * 42;
      const spinTilt = Math.cos(player.spinTimer * Math.PI * 6) * 0.38;
      ctx.translate(spinOffset, 0);
      ctx.rotate(spinTilt);
    }

    if (player.isFatMode) {
      const fatPulse = 1 + Math.sin(performance.now() * 0.018) * 0.04;
      ctx.scale(1.32 * fatPulse, 0.82 / fatPulse);
    }

    // 若處於撞車翻滾分解動畫，使用 18 步連續動畫演出
    if (player.crashTimer > 0) {
      ctx.translate(-centerX, -baseY);
      const stageInfo = this.getCrashStageInfo(player);
      this.drawCrashWipeoutScene(ctx, centerX, baseY, player, stageInfo);
      ctx.restore();
      ctx.globalAlpha = 1.0;
      return;
    }

    // 【核心修正：往前行駛動態壓車左右傾斜 (Cornering Lean / Banking)】
    // 以輪胎貼地點 (0, 0) 為基準，依據轉向幅度產生壓車傾角與 3D 車頂透視位移，絕不橫向轉身！
    const maxBankRad = (id === 'grandma') ? 0.24 : (id === 'sausage' ? 0.18 : 0.13);
    const bankAngle = player.steer * maxBankRad;
    const upperLeanShear = player.steer * ((id === 'grandma' || id === 'sausage') ? 0.16 : 0.11);

    ctx.rotate(bankAngle);
    ctx.transform(1, 0, upperLeanShear, 1, 0, 0);
    ctx.translate(-centerX, -baseY);

    // 【往前行駛正後方視角】6 款台灣神車精細正後方構圖 + 壓彎動態
    switch (id) {
      case 'garbage':
        this.drawGarbageTruck(ctx, centerX, baseY, player);
        break;
      case 'gravel':
        this.drawGravelTruck(ctx, centerX, baseY, player);
        break;
      case 'kinder':
        this.drawKinderBus(ctx, centerX, baseY, player);
        break;
      case 'grandma':
        this.drawGrandmaScooter(ctx, centerX, baseY, player);
        break;
      case 'train':
        this.drawSteamTrain(ctx, centerX, baseY, player);
        break;
      case 'sausage':
      default:
        this.drawSausageTricycle(ctx, centerX, baseY, player);
        break;
    }

    // 高速壓彎時（|steer| > 0.42），在壓車內側底部噴發 OutRun 街機磨地黃金火花！
    const absSteer = Math.abs(player.steer);
    const speedRatio = player.speed / Math.max(1, player.maxSpeed);
    if (absSteer > 0.42 && speedRatio > 0.35) {
      const sparkSide = player.steer < 0 ? -1 : 1;
      const sparkBaseX = centerX + sparkSide * (id === 'grandma' ? 24 : 58);
      const sparkFlash = Math.floor(performance.now() / 35) % 2 === 0;
      ctx.fillStyle = sparkFlash ? '#fff200' : '#ff793f';
      ctx.fillRect(sparkBaseX - 8, baseY - 10, 16, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sparkBaseX - 4, baseY - 9, 8, 4);
      if (Math.random() < 0.75) {
        this.spawnParticle(
          centerX + sparkSide * 38,
          baseY - 4,
          -sparkSide * (60 + Math.random() * 90),
          -25 - Math.random() * 55,
          3.5,
          sparkFlash ? '#ffd32a' : '#ff5252',
          0.22
        );
      }
    }

    if (player.isFatMode && player.isPushingCar) {
      this.drawPushingDriver(ctx, centerX, baseY);
    }

    ctx.restore();

    // 所有狀態對話框統一移到畫面最下方底邊 (邏輯高度 400 - 8 = 392)，完整呈現中央道路！
    const bottomY = 392;
    if (player.isFatMode) {
      this.drawNitroBanner(
        ctx,
        centerX,
        bottomY,
        player.isPushingCar
          ? '💦 死命推車燃燒卡路里中！繼續按住空白鍵！'
          : '🍔 發福狀態 FAT MODE！底盤磨地減速！快按[空白鍵]下車推車減肥！'
      );
    } else if (player.nitroTimer > 0) {
      this.drawNitroBanner(ctx, centerX, bottomY, player.vehicle.nitroShout);
    } else if (player.pickupPopupTimer > 0) {
      this.drawNitroBanner(ctx, centerX, bottomY, player.pickupPopupText);
    }

    ctx.globalAlpha = 1.0;
  }

  /**
   * 繪製發福狀態下司機跳下車在車尾「滿頭大汗死命推車狂奔」搞笑畫面
   */
  drawPushingDriver(ctx, centerX, baseY) {
    const time = performance.now() * 0.001;
    const legCycle = Math.sin(time * 48) * 12;

    ctx.save();
    ctx.translate(centerX, baseY + 6);

    ctx.fillStyle = '#192a56';
    ctx.fillRect(-14, -14 + legCycle * 0.5, 10, 16);
    ctx.fillRect(4, -14 - legCycle * 0.5, 10, 16);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-24, -42, 48, 28);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.strokeRect(-24, -42, 48, 28);
    ctx.fillStyle = '#e0ac69';
    ctx.fillRect(-28, -50, 56, 10);
    ctx.fillRect(-12, -58, 24, 16);
    ctx.fillStyle = '#ff1e1e';
    ctx.fillRect(-14, -56, 28, 4);

    ctx.fillStyle = '#00f0ff';
    const sweatY = -62 - ((time * 40) % 14);
    ctx.fillRect(-26, sweatY, 5, 8);
    ctx.fillRect(22, sweatY - 4, 5, 8);

    ctx.restore();
  }

  /**
   * 固定於畫面最下方的橫幅對話框（不遮擋中央道路視野）
   */
  drawNitroBanner(ctx, x, y, text, borderColor = '#00f0ff') {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.90)';
    ctx.fillRect(x - 230, y - 16, 460, 21);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(x - 230, y - 16, 460, 21);
    ctx.fillStyle = '#ffd32a';
    ctx.font = '900 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y - 2);
    ctx.restore();
  }

  /**
   * 《合金彈頭》重機械寬胎與避震器結構 (帶深黑像素外框、金屬輪框、立體胎紋與壓彎避震差動)
   */
  drawDualWheels(ctx, leftX, rightX, wheelW, wheelH, player, time, speedFactor) {
    const treadPhase = Math.floor(time * (14 + speedFactor * 36)) % 2;
    // 左轉壓車時左側(內側)避震壓縮、右側微抬；右轉壓車時右側(內側)避震壓縮、左側微抬
    const leftY = -wheelH - (player.steer < -0.08 ? Math.abs(player.steer) * 4.5 : -Math.max(0, player.steer) * 1.5);
    const rightY = -wheelH - (player.steer > 0.08 ? Math.abs(player.steer) * 4.5 : -Math.max(0, -player.steer) * 1.5);

    // 後軸重機械傳動連桿與避震彈簧圈
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(leftX + wheelW, -16, rightX - (leftX + wheelW), 8);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(leftX + wheelW, -16, rightX - (leftX + wheelW), 8);

    [
      { x: leftX, y: leftY, phase: treadPhase },
      { x: rightX, y: rightY, phase: !treadPhase }
    ].forEach((w) => {
      ctx.fillStyle = '#0f0f14';
      ctx.fillRect(w.x, w.y, wheelW, wheelH);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(w.x, w.y, wheelW, wheelH);

      ctx.fillStyle = '#2d3436';
      ctx.fillRect(w.x + 3, w.y + 3, wheelW - 6, wheelH - 6);
      // 滾動胎紋刻痕與側邊金屬鉚釘高光
      ctx.fillStyle = w.phase ? '#7f8c8d' : '#485460';
      ctx.fillRect(w.x + 4, w.y + 5, wheelW - 8, 4);
      ctx.fillRect(w.x + 4, w.y + 13, wheelW - 8, 4);
      ctx.fillRect(w.x + 4, w.y + wheelH - 8, wheelW - 8, 4);
    });
  }

  drawLicensePlate(ctx, x, y, text, bgColor = '#ffffff', textColor = '#111111') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(x - 24, y, 48, 12);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 24, y, 48, 12);
    ctx.fillStyle = textColor;
    ctx.font = '900 7.5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y + 9);
  }

  /**
   * 載具 1：香腸/臭豆腐三輪車 (《合金彈頭》重機械鉚釘鋼架 + 炭火烤網高光 + 十八仔紅碗 + 吊嘎老闆)
   */
  drawSausageTricycle(ctx, centerX, baseY, player) {
    const time = performance.now() * 0.001;
    const speedFactor = Math.min(1.3, player.speed / player.maxSpeed);
    const bounceFreq = 16 + speedFactor * 28;
    const chassisBounce = Math.sin(time * bounceFreq) * (1.8 + speedFactor * 2.4);
    const subBounce = Math.cos(time * bounceFreq * 1.25) * 2.2;
    const steerShift = Math.round(player.steer * 14);
    const tiltAngle = player.steer * 0.085;
    const wheelieLift = player.nitroTimer > 0 ? -9 - Math.sin(time * 45) * 2.5 : 0;

    ctx.save();
    ctx.translate(centerX, baseY);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(-68 + steerShift * 0.3, -8, 136, 12);

    ctx.translate(0, chassisBounce + wheelieLift);
    ctx.rotate(tiltAngle);

    this.drawDualWheels(ctx, -64, 40, 24, 28, player, time, speedFactor);

    const bodyX = steerShift * 0.45;
    // 後防撞紅鐵桿 + 黑色輪廓
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-52 + bodyX, -25, 104, 9);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-52 + bodyX, -25, 104, 9);
    this.drawLicensePlate(ctx, bodyX, -25, '十八仔-666');

    // 不鏽鋼餐車主體 (3層金屬高光與深黑像素描邊 + 四角鉚釘)
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(-50 + bodyX, -52, 100, 27);
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(-48 + bodyX, -50, 96, 18);
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(-48 + bodyX, -52, 96, 5);
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(-50 + bodyX, -52, 100, 27);
    // 合金彈頭風四角金屬鉚釘
    ctx.fillStyle = '#2d3436';
    [-46, 44].forEach((rx) => {
      ctx.fillRect(rx + bodyX, -49, 3, 3);
      ctx.fillRect(rx + bodyX, -30, 3, 3);
    });

    // 煞車尾燈
    ctx.fillStyle = player.isBraking ? '#ff1e1e' : '#780000';
    ctx.fillRect(-47 + bodyX, -44, 12, 10);
    ctx.fillRect(35 + bodyX, -44, 12, 10);
    ctx.strokeRect(-47 + bodyX, -44, 12, 10);
    ctx.strokeRect(35 + bodyX, -44, 12, 10);

    // 紅底金框招牌「正宗大腸包小腸」
    ctx.fillStyle = '#b31217';
    ctx.fillRect(-32 + bodyX, -45, 64, 16);
    ctx.strokeStyle = '#ffd12a';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(-32 + bodyX, -45, 64, 16);
    ctx.fillStyle = '#ffeaa7';
    ctx.font = '900 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('正宗大腸包小腸', bodyX, -34);

    // 炭火烤爐與油亮香腸
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(-42 + bodyX, -61, 44, 9);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-42 + bodyX, -61, 44, 9);
    ctx.fillStyle = (Math.floor(time * 12) % 2 === 0) ? '#ff5252' : '#ff793f';
    ctx.fillRect(-39 + bodyX, -58, 38, 4);
    for (let k = 0; k < 5; k++) {
      ctx.fillStyle = '#b33939';
      ctx.fillRect(-37 + k * 7 + bodyX, -64, 5, 6);
      ctx.fillStyle = '#ffcccc';
      ctx.fillRect(-36 + k * 7 + bodyX, -63, 2, 2); // 香腸油花高光
    }

    // 十八仔大碗公与跳動骰子
    ctx.fillStyle = '#f5f6fa';
    ctx.fillRect(10 + bodyX, -62 + subBounce * 0.5, 28, 10);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(10 + bodyX, -62 + subBounce * 0.5, 28, 10);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(12 + bodyX, -59 + subBounce * 0.5, 24, 4);

    // 左側外掛綠色液化瓦斯桶 (帶警戒紅字與黃銅閥門)
    const tankX = -62 + bodyX * 0.7;
    const tankY = -58 + subBounce;
    ctx.fillStyle = '#1e824c';
    ctx.fillRect(tankX, tankY, 16, 28);
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(tankX + 2, tankY + 2, 5, 24);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(tankX, tankY, 16, 28);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(tankX + 5, tankY - 6, 6, 5);

    // 白吊嘎熱血老闆與隨風狂飄紅頭巾
    const riderX = -10 + steerShift * 0.85;
    const riderY = -84;
    ctx.fillStyle = '#e0ac69';
    ctx.fillRect(riderX - 18, riderY + 12, 36, 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(riderX - 13, riderY + 6, 26, 18);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(riderX - 13, riderY + 6, 26, 18);
    ctx.fillStyle = '#e0ac69';
    ctx.fillRect(riderX - 10, riderY - 9, 20, 15);
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(riderX - 10, riderY - 11, 20, 8);
    ctx.fillStyle = '#ff1e1e';
    ctx.fillRect(riderX - 11, riderY - 6, 22, 4);
    const tailWave = Math.sin(time * 28) * 5 - player.steer * 6;
    ctx.fillRect(riderX + 10, riderY - 6 + tailWave * 0.3, 14, 4);

    // 右側紅燈籠
    const lx = 44 + bodyX + Math.sin(time * 14) * 4 - player.steer * 10;
    ctx.fillStyle = '#e61919';
    ctx.fillRect(lx, -82, 16, 20);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(lx, -82, 16, 20);
    ctx.fillStyle = '#ffd12a';
    ctx.fillRect(lx + 2, -84, 12, 3);
    ctx.fillRect(lx + 2, -63, 12, 3);

    // 紅白藍大遮陽傘 (含黑框線條與支架高光)
    const umbrellaFlap = Math.sin(time * 24) * 3.5;
    const ux = steerShift * 0.65;
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(ux - 2, -112, 5, 52);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(ux - 58, -116 + umbrellaFlap, 38, 13);
    ctx.strokeRect(ux - 58, -116 + umbrellaFlap, 38, 13);
    ctx.fillStyle = '#f5f6fa';
    ctx.fillRect(ux - 20, -120 - umbrellaFlap * 0.4, 40, 15);
    ctx.strokeRect(ux - 20, -120 - umbrellaFlap * 0.4, 40, 15);
    ctx.fillStyle = '#0984e3';
    ctx.fillRect(ux + 20, -116 + umbrellaFlap, 38, 13);
    ctx.strokeRect(ux + 20, -116 + umbrellaFlap, 38, 13);

    if (player.nitroTimer > 0) {
      const flameH = 30 + Math.random() * 26;
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(tankX + 1, tankY + 24, 14, flameH);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(tankX + 4, tankY + 24, 8, flameH * 0.65);
    }

    ctx.restore();
  }

  /**
   * 載具 2：黃色環保局垃圾車 (《合金彈頭》重裝甲油壓槽 + 隨車搖晃清潔隊員 + 少女的祈禱音符)
   */
  drawGarbageTruck(ctx, centerX, baseY, player) {
    const time = performance.now() * 0.001;
    const speedFactor = Math.min(1.3, player.speed / player.maxSpeed);
    const bounce = Math.sin(time * (14 + speedFactor * 22)) * 2.5;
    const steerShift = Math.round(player.steer * 12);
    const tilt = player.steer * 0.06;

    ctx.save();
    ctx.translate(centerX, baseY);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(-76, -8, 152, 14);

    ctx.translate(0, bounce);
    ctx.rotate(tilt);

    this.drawDualWheels(ctx, -72, 46, 26, 30, player, time, speedFactor);

    const bx = steerShift * 0.4;
    // 黃色巨大環保局裝甲車身 + 粗黑像素外框 + 側邊強化金屬肋條
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(-66 + bx, -106, 132, 82);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-62 + bx, -102, 124, 74);
    ctx.fillStyle = '#fff200';
    ctx.fillRect(-62 + bx, -102, 124, 6); // 頂部高光
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.2;
    ctx.strokeRect(-66 + bx, -106, 132, 82);

    // 後方深色壓縮槽開口 (看得到裡面塞滿彩色垃圾袋翻滾)
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(-50 + bx, -74, 100, 38);
    ctx.strokeRect(-50 + bx, -74, 100, 38);
    const bagBounce = Math.sin(time * 18) * 3;
    ctx.fillStyle = '#fd79a8';
    ctx.fillRect(-42 + bx, -58 + bagBounce, 24, 18);
    ctx.strokeRect(-42 + bx, -58 + bagBounce, 24, 18);
    ctx.fillStyle = '#74b9ff';
    ctx.fillRect(-14 + bx, -60 - bagBounce, 26, 20);
    ctx.strokeRect(-14 + bx, -60 - bagBounce, 26, 20);
    ctx.fillStyle = '#55efc4';
    ctx.fillRect(16 + bx, -56 + bagBounce, 24, 17);
    ctx.strokeRect(16 + bx, -56 + bagBounce, 24, 17);
    // 油壓壓縮鐵板 (帶黑黃斜紋警示與鉚釘)
    ctx.fillStyle = '#d35400';
    ctx.fillRect(-48 + bx, -74 + Math.abs(bagBounce) * 2, 96, 10);
    ctx.strokeRect(-48 + bx, -74 + Math.abs(bagBounce) * 2, 96, 10);

    // 車頂「環保局 ‧ 少女的祈禱」綠字橫幅與雙紅黃爆閃警示燈
    ctx.fillStyle = '#006b3f';
    ctx.fillRect(-46 + bx, -96, 92, 16);
    ctx.strokeRect(-46 + bx, -96, 92, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('環保局 ‧ 少女的祈禱', bx, -84);

    const flash = Math.floor(time * (player.nitroTimer > 0 ? 22 : 8)) % 2 === 0;
    ctx.fillStyle = flash ? '#ff0000' : '#ffd32a';
    ctx.fillRect(-52 + bx, -114, 14, 8);
    ctx.strokeRect(-52 + bx, -114, 14, 8);
    ctx.fillStyle = !flash ? '#ff0000' : '#ffd32a';
    ctx.fillRect(38 + bx, -114, 14, 8);
    ctx.strokeRect(38 + bx, -114, 14, 8);

    // 後保桿與車牌
    ctx.fillStyle = '#d35400';
    ctx.fillRect(-64 + bx, -26, 128, 10);
    ctx.strokeRect(-64 + bx, -26, 128, 10);
    this.drawLicensePlate(ctx, bx, -26, '清潔-9487', '#27ae60', '#ffffff');

    // 車尾左右踏板站著兩位穿螢光背心的清潔隊員
    const crewSwing = -player.steer * 14 + Math.sin(time * 15) * 3;
    [-58, 48].forEach((sideX, idx) => {
      const cx = sideX + bx + crewSwing * (idx === 0 ? 0.6 : 1.0);
      const cy = -58;
      ctx.fillStyle = '#192a56';
      ctx.fillRect(cx, cy + 18, 12, 16);
      ctx.fillStyle = '#badc58';
      ctx.fillRect(cx - 1, cy + 2, 14, 16);
      ctx.strokeRect(cx - 1, cy + 2, 14, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 1, cy + 8, 14, 3);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(cx, cy - 8, 12, 8);
      ctx.strokeRect(cx, cy - 8, 12, 8);
    });

    if (player.nitroTimer > 0) {
      ctx.fillStyle = '#00f0ff';
      ctx.font = '900 16px sans-serif';
      const noteY = -118 - ((time * 40) % 20);
      ctx.fillText('♪', -68, noteY);
      ctx.fillStyle = '#ff2a85';
      ctx.fillText('♫', 68, noteY - 6);
      ctx.fillStyle = '#ffd32a';
      ctx.fillText('♬', 0, noteY - 10);

      // 右後方拎著兩包垃圾袋狂奔追車的阿伯搞笑彩蛋
      const uncleRun = Math.sin(time * 35) * 6;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(82, -42 + uncleRun, 14, 16);
      ctx.strokeRect(82, -42 + uncleRun, 14, 16);
      ctx.fillStyle = '#e0ac69';
      ctx.fillRect(84, -52 + uncleRun, 10, 10);
      ctx.fillStyle = '#fd79a8';
      ctx.fillRect(72, -36 - uncleRun, 10, 12);
      ctx.fillStyle = '#ffeaa7';
      ctx.font = '900 9px sans-serif';
      ctx.fillText('等我啦!', 88, -58 + uncleRun);
    }

    ctx.restore();
  }

  /**
   * 載具 3：砂石車（《合金彈頭》重裝甲傾卸鐵斗 + 學長叼菸單手跨窗 + 保力達B雙聯裝火箭）
   */
  drawGravelTruck(ctx, centerX, baseY, player) {
    const time = performance.now() * 0.001;
    const speedFactor = Math.min(1.3, player.speed / player.maxSpeed);
    const bounce = Math.sin(time * (18 + speedFactor * 26)) * 2.8;
    const steerShift = Math.round(player.steer * 12);

    ctx.save();
    ctx.translate(centerX, baseY);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(-82, -8, 164, 14);

    ctx.translate(0, bounce);
    ctx.rotate(player.steer * 0.055);

    this.drawDualWheels(ctx, -78, 48, 30, 32, player, time, speedFactor);

    const bx = steerShift * 0.4;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    // 擋泥板紅底白字：「恨天高 ‧ 閃遠點」
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-76 + bx, -18, 28, 10);
    ctx.strokeRect(-76 + bx, -18, 28, 10);
    ctx.fillRect(48 + bx, -18, 28, 10);
    ctx.strokeRect(48 + bx, -18, 28, 10);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('恨天高', -62 + bx, -10);
    ctx.fillText('閃遠點', 62 + bx, -10);

    // 深綠色重裝鐵砂斗 (立體肋條 + 黑框 + 鉚釘)
    ctx.fillStyle = '#1e5631';
    ctx.fillRect(-70 + bx, -98, 140, 74);
    ctx.strokeRect(-70 + bx, -98, 140, 74);
    for (let r = -56; r <= 56; r += 28) {
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(r + bx - 3, -96, 6, 70);
      ctx.strokeRect(r + bx - 3, -96, 6, 70);
    }

    // 車斗頂部凸出的滿滿灰色砂石堆 (雙色立體陰影)
    ctx.fillStyle = '#7f8c8d';
    ctx.beginPath();
    ctx.moveTo(-66 + bx, -98);
    ctx.lineTo(-32 + bx, -114);
    ctx.lineTo(18 + bx, -116);
    ctx.lineTo(66 + bx, -98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 車尾大字：「砂石霸王 ‧ 學長號」
    ctx.fillStyle = '#111';
    ctx.fillRect(-48 + bx, -68, 96, 22);
    ctx.strokeStyle = '#ffd32a';
    ctx.strokeRect(-48 + bx, -68, 96, 22);
    ctx.fillStyle = '#ffd32a';
    ctx.font = '900 11px sans-serif';
    ctx.fillText('砂石霸王 ‧ 學長號', bx, -53);

    this.drawLicensePlate(ctx, bx, -28, '霸王-8888', '#f1c40f', '#111');

    // 左側駕駛室伸出學長黝黑單手 + 夾著冒煙香菸
    ctx.fillStyle = '#e0ac69';
    ctx.fillRect(-84 + bx, -84, 16, 7);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(-84 + bx, -84, 16, 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-90 + bx, -86, 7, 3);
    ctx.fillStyle = '#ff3838';
    ctx.fillRect(-92 + bx, -86, 2, 3);

    // 氮氣大招：車身兩側展開巨型「保力達B / 維士比」褐色玻璃瓶火箭引擎！
    if (player.nitroTimer > 0) {
      [-86 + bx, 68 + bx].forEach((rx) => {
        ctx.fillStyle = '#5c2c16';
        ctx.fillRect(rx, -78, 18, 42);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(rx, -78, 18, 42);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(rx + 1, -66, 16, 18);
        ctx.fillStyle = '#ffd32a';
        ctx.font = '900 7px sans-serif';
        ctx.fillText('保力達', rx + 9, -54);
        const fLen = 32 + Math.random() * 24;
        ctx.fillStyle = '#ff9f43';
        ctx.fillRect(rx + 2, -36, 14, fLen);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(rx + 5, -36, 8, fLen * 0.6);
      });
    }

    ctx.restore();
  }

  /**
   * 載具 4：黃綠幼稚園娃娃車 (後窗擠滿變形Q版小朋友 + ㄅㄆㄇ注音音波 + 合金彈頭Q彈黑框)
   */
  drawKinderBus(ctx, centerX, baseY, player) {
    const time = performance.now() * 0.001;
    const speedFactor = Math.min(1.3, player.speed / player.maxSpeed);
    const bounce = Math.sin(time * (18 + speedFactor * 30)) * 4.2;
    const squash = 1 + Math.sin(time * 22) * 0.04;
    const steerShift = Math.round(player.steer * 14);

    ctx.save();
    ctx.translate(centerX, baseY);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(-62, -7, 124, 11);

    ctx.translate(0, bounce);
    ctx.rotate(player.steer * 0.11);
    ctx.scale(squash, 2 - squash);

    this.drawDualWheels(ctx, -56, 36, 20, 24, player, time, speedFactor);

    const bx = steerShift * 0.45;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.2;

    // 鵝黃色圓潤小巴車體 + 經典綠色橫條紋 + 頂部高光
    ctx.fillStyle = '#ffdd59';
    ctx.fillRect(-54 + bx, -94, 108, 72);
    ctx.fillStyle = '#fff7a3';
    ctx.fillRect(-52 + bx, -92, 104, 6);
    ctx.fillStyle = '#05c46b';
    ctx.fillRect(-54 + bx, -52, 108, 16);
    ctx.strokeRect(-54 + bx, -94, 108, 72);

    // 後車窗玻璃
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(-46 + bx, -86, 92, 30);
    ctx.strokeRect(-46 + bx, -86, 92, 30);

    // 4 個臉貼後擋風玻璃被擠扁的 Q 版小朋友！
    const kidColors = ['#ff7675', '#74b9ff', '#55efc4', '#a29bfe'];
    for (let k = 0; k < 4; k++) {
      const kx = -35 + k * 23 + bx + Math.sin(time * 12 + k) * 2;
      const ky = -78;
      ctx.fillStyle = kidColors[k];
      ctx.fillRect(kx - 7, ky - 5, 14, 6);
      ctx.fillStyle = '#ffeaa7';
      ctx.fillRect(kx - 8, ky, 16, 13);
      ctx.fillStyle = '#111';
      ctx.fillRect(kx - 5, ky + 3, 2, 2);
      ctx.fillRect(kx + 3, ky + 3, 2, 2);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(kx - 3, ky + 8, 6, 3);
      if (k === 1) {
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(kx + 1, ky + 6, 2, 6);
      }
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌻 向日葵幼稚園 ‧ 幼童專用', bx, -40);
    this.drawLicensePlate(ctx, bx, -24, '娃娃-100');

    if (player.nitroTimer > 0) {
      ctx.fillStyle = '#ffeaa7';
      ctx.fillRect(-10 + bx, -110, 20, 16);
      ctx.strokeRect(-10 + bx, -110, 20, 16);
      ctx.fillStyle = '#ff5252';
      ctx.fillRect(-12 + bx, -115, 24, 6);

      const bopomofo = ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', '100分'];
      ctx.font = '900 13px sans-serif';
      for (let i = 0; i < bopomofo.length; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#00f0ff' : '#ffd32a';
        const ox = (i - 2) * 28 + Math.sin(time * 20 + i) * 6;
        const oy = -114 - ((time * 55 + i * 12) % 24);
        ctx.fillText(bopomofo[i], ox + bx, oy);
      }
    }

    ctx.restore();
  }

  /**
   * 載具 5：阿嬤的豪邁 125 (褪色紫斜板 + 鐵絲菜籃塞爆三星蔥白蘿蔔 + 大甲鎮瀾宮平安符 + 極限壓車磨膝蓋)
   */
  drawGrandmaScooter(ctx, centerX, baseY, player) {
    const time = performance.now() * 0.001;
    const speedFactor = Math.min(1.3, player.speed / player.maxSpeed);
    const bounce = Math.sin(time * (20 + speedFactor * 32)) * 2.2;
    const isNitro = player.nitroTimer > 0;
    const leanAngle = player.steer * 0.22 + (isNitro ? (player.steer >= 0 ? 0.28 : -0.28) : 0);

    ctx.save();
    ctx.translate(centerX, baseY);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(-38, -6, 76, 10);

    ctx.translate(0, bounce);
    ctx.rotate(leanAngle);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    // 單顆寬後輪 + 二行程排氣管
    ctx.fillStyle = '#141418';
    ctx.fillRect(-10, -28, 20, 28);
    ctx.strokeRect(-10, -28, 20, 28);
    ctx.fillStyle = '#636e72';
    ctx.fillRect(10, -18, 9, 9);
    ctx.strokeRect(10, -18, 9, 9);

    // 豪邁 125 經典紫紅褪色寬尾殼與方形大尾燈
    ctx.fillStyle = '#6c5ce7';
    ctx.fillRect(-24, -52, 48, 26);
    ctx.strokeRect(-24, -52, 48, 26);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-18, -46, 36, 9);
    ctx.strokeRect(-18, -46, 36, 9);
    this.drawLicensePlate(ctx, 0, -34, '買菜-0857');

    // 後座大鐵絲菜籃 (塞爆白蘿蔔、高麗菜與三星蔥)
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(-26, -72, 52, 20);
    ctx.strokeRect(-26, -72, 52, 20);
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(-22, -80, 18, 12);
    ctx.strokeRect(-22, -80, 18, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -84, 10, 14);
    ctx.strokeRect(-2, -84, 10, 14);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, -90, 6, 6);
    const scallionWave = Math.sin(time * 26) * 4;
    ctx.fillStyle = '#00b894';
    ctx.fillRect(10, -88 + scallionWave * 0.4, 14, 18);
    ctx.strokeRect(10, -88 + scallionWave * 0.4, 14, 18);

    // 阿嬤本尊 (台灣經典碎花阿嬤襯衫 + 遮陽花布大帽)
    ctx.fillStyle = '#fd79a8';
    ctx.fillRect(-18, -98, 36, 26);
    ctx.strokeRect(-18, -98, 36, 26);
    ctx.fillStyle = '#ffeaa7';
    ctx.fillRect(-10, -92, 4, 4);
    ctx.fillRect(6, -88, 4, 4);
    ctx.fillRect(-4, -82, 4, 4);

    // 阿嬤遮陽花布帽
    ctx.fillStyle = '#e84393';
    ctx.fillRect(-20, -114, 40, 14);
    ctx.strokeRect(-20, -114, 40, 14);
    ctx.fillStyle = '#f5f6fa';
    ctx.fillRect(-24, -104, 48, 5);
    ctx.strokeRect(-24, -104, 48, 5);

    // 左後照鏡懸掛：大甲鎮瀾宮紅布平安符
    const charmSwing = Math.sin(time * 20) * 6 - player.steer * 10;
    ctx.fillStyle = '#e61919';
    ctx.fillRect(-36 + charmSwing, -88, 10, 15);
    ctx.strokeRect(-36 + charmSwing, -88, 10, 15);
    ctx.fillStyle = '#ffd32a';
    ctx.fillRect(-34 + charmSwing, -85, 6, 9);

    if (isNitro) {
      const sparkX = leanAngle >= 0 ? 28 : -28;
      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(sparkX - 8, -14, 16, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sparkX - 4, -10, 8, 6);
    }

    ctx.restore();
  }

  /**
   * 載具 6：CK-124 百年蒸汽火車 (《合金彈頭》黑金鉚釘鋼鐵鍋爐 + 增產報國金牌 + 左右連動桿活塞往復運動)
   */
  drawSteamTrain(ctx, centerX, baseY, player) {
    const time = performance.now() * 0.001;
    const speedFactor = Math.min(1.3, player.speed / player.maxSpeed);
    const bounce = Math.sin(time * (22 + speedFactor * 30)) * 2.0;
    const steerShift = Math.round(player.steer * 10);
    const wheelie = player.nitroTimer > 0 ? -8 : 0;

    ctx.save();
    ctx.translate(centerX, baseY);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(-84, -8, 168, 14);

    ctx.translate(0, bounce + wheelie);
    ctx.rotate(player.steer * 0.05);

    this.drawDualWheels(ctx, -74, 48, 26, 30, player, time, speedFactor);

    const bx = steerShift * 0.35;
    // 左右兩側巨大蒸汽連動桿與活塞 (隨車速高速上下往復運動！)
    const pistonY = Math.sin(time * (16 + speedFactor * 35)) * 12;
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(-82 + bx, -36 + pistonY, 10, 26);
    ctx.fillRect(72 + bx, -36 - pistonY, 10, 26);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-82 + bx, -36 + pistonY, 10, 26);
    ctx.strokeRect(72 + bx, -36 - pistonY, 10, 26);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(-84 + bx, -26 + pistonY, 14, 6);
    ctx.fillRect(70 + bx, -26 - pistonY, 14, 6);

    // 厚重黑金鉚釘鋼鐵煤水車與鍋爐車體
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(-68 + bx, -106, 136, 82);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-68 + bx, -106, 136, 82);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.strokeRect(-65 + bx, -103, 130, 76);

    // 鍋爐鋼板金色鉚釘群
    ctx.fillStyle = '#d4af37';
    for (let rx = -58; rx <= 58; rx += 29) {
      ctx.fillRect(rx + bx, -98, 3, 3);
      ctx.fillRect(rx + bx, -34, 3, 3);
    }

    // 鍋爐火門透出熊熊紅蓮烈火
    ctx.fillStyle = (Math.floor(time * 18) % 2 === 0) ? '#ff3838' : '#ff9f43';
    ctx.fillRect(-26 + bx, -48, 52, 16);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(-26 + bx, -48, 52, 16);

    // 車尾金字紅底鐵牌：【CK-124 增產報國】
    ctx.fillStyle = '#b31217';
    ctx.fillRect(-46 + bx, -84, 92, 24);
    ctx.strokeStyle = '#ffd32a';
    ctx.strokeRect(-46 + bx, -84, 92, 24);
    ctx.fillStyle = '#ffd32a';
    ctx.font = '900 12px serif';
    ctx.textAlign = 'center';
    ctx.fillText('CK124 增產報國', bx, -68);

    // 車頂巨大蒸汽煙囪與黃銅汽笛
    ctx.fillStyle = '#111';
    ctx.fillRect(-14 + bx, -128, 28, 22);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(-14 + bx, -128, 28, 22);
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(-18 + bx, -132, 36, 5);
    ctx.fillRect(24 + bx, -120, 10, 14);

    if (player.nitroTimer > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(20 + bx, -148, 18, 28);
      ctx.fillRect(-22 + bx, -155, 44, 22);
      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(-78 + bx, -8, 32, 14);
      ctx.fillRect(46 + bx, -8, 32, 14);
    }

    ctx.restore();
  }

  /**
   * 繪製《合金彈頭》風格「撞車翻車 ➔ 高空完全分解 ➔ 神級空中抓車架重組 ➔ 重重落地 ➔ 奇蹟成功」18 步連續動畫
   */
  drawCrashWipeoutScene(ctx, centerX, baseY, player, stageInfo) {
    const elapsed = player.crashDuration - player.crashTimer;
    const progress = elapsed / player.crashDuration;
    const id = player.vehicle.id;
    const info = stageInfo || this.getCrashStageInfo(player);

    ctx.save();
    ctx.translate(centerX, baseY);

    // 若已載入上傳的像素圖集，使用 9 階段 (對應 18 步分解與空中神技重組) 連續動畫圖框
    if (this.hasAtlas(id)) {
      const atlas = this.vehicleAtlases[id];
      const frame = atlas.frames[info.frameKey] || atlas.frames.crash0;
      if (frame) {
        // 1. 地面陰影（隨車子拋飛高度縮小、重重落地時擴大）
        const airRatio = Math.min(1, Math.abs(info.jumpY) / 100);
        const shadowW = Math.round(170 * (1 - airRatio * 0.45));
        ctx.fillStyle = `rgba(0, 0, 0, ${(0.65 - airRatio * 0.3).toFixed(2)})`;
        ctx.fillRect(Math.floor(-shadowW / 2), -10, shadowW, 15);

        // 2. 在前半段 (撞擊 ~ 高空分解) 附加動態飛散碎片粒子襯托張力
        if (progress < 0.55) {
          for (let i = 0; i < player.crashProps.length; i += 2) {
            const p = player.crashProps[i];
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = ['#ffd32a', '#ff5252', '#00f0ff', '#ffffff'][p.variant % 4];
            ctx.fillRect(-5, -5, 10, 10);
            ctx.restore();
          }
        }

        // 3. 繪製當前階段的像素動畫圖框 (crash0..crash8)
        const isWidePanorama = info.frameKey === 'crash3';
        const targetH = isWidePanorama ? 152 : 138;
        const maxW = isWidePanorama ? 355 : 240;
        let scale = targetH / frame.h;
        if (frame.w * scale > maxW) {
          scale = maxW / frame.w;
        }
        const drawW = Math.round(frame.w * scale);
        const drawH = Math.round(frame.h * scale);

        // 空中組裝階段加入微幅神技震動感
        const shakeX = (info.frameKey === 'crash4' || info.frameKey === 'crash5' || info.frameKey === 'crash7')
          ? Math.sin(performance.now() * 0.08) * 3
          : 0;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          atlas.img,
          frame.x,
          frame.y,
          frame.w,
          frame.h,
          Math.floor(-drawW / 2 + shakeX),
          Math.floor(-drawH + 6 + info.jumpY),
          drawW,
          drawH
        );

        // 4. 階段 7 (重重落地) 底部噴發落地雙輪火花特效
        if (info.frameKey === 'crash7') {
          ctx.fillStyle = '#ffd32a';
          ctx.fillRect(-68, -8, 28, 10);
          ctx.fillRect(40, -8, 28, 10);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-60, -6, 14, 6);
          ctx.fillRect(46, -6, 14, 6);
        }

        ctx.restore();
        return;
      }
    }

    // 備用程序化繪製 (圖集載入前)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(-85, -10, 170, 16);

    const jumpY = -Math.sin(progress * Math.PI) * 95;
    const spinAngle = progress * Math.PI * 4;
    ctx.save();
    ctx.translate(-35, -35 + jumpY);
    ctx.rotate(spinAngle);
    ctx.fillStyle = id === 'garbage' ? '#f39c12' : (id === 'gravel' ? '#1e5631' : (id === 'kinder' ? '#ffdd59' : '#7f8c8d'));
    ctx.fillRect(-32, -22, 64, 44);
    ctx.fillStyle = '#111';
    ctx.fillRect(-28, 16, 16, 12);
    ctx.fillRect(12, 16, 16, 12);
    ctx.restore();

    ctx.restore();
  }

  /**
   * 繪製 1986 SEGA OutRun 經典街機介面（計量表集中在上方兩側，下方中央完整保留給道路與底部對話框）
   */
  drawOutRunHUD(ctx, width, height, state) {
    this.drawArcadeText(ctx, 'TIME', 18, 24, '900 16px monospace', '#48dbfb', 'left', 2);
    this.drawArcadeText(
      ctx,
      Math.ceil(state.timeLeft).toString().padStart(2, '0'),
      24,
      50,
      '900 26px monospace',
      '#ffd32a',
      'left',
      3
    );

    const kmh = state.kmh;
    this.drawArcadeText(ctx, `${kmh}`, 68, 76, '900 22px monospace', '#ff3838', 'right', 2);
    this.drawArcadeText(ctx, 'km/h', 74, 76, '900 13px monospace', '#ff3838', 'left', 2);

    this.drawArcadeText(ctx, 'SCORE', width * 0.36, 24, '900 16px monospace', '#e056fd', 'left', 2);
    this.drawArcadeText(
      ctx,
      Math.floor(state.score).toString().padStart(7, '0'),
      width * 0.47,
      24,
      '900 18px monospace',
      '#ffffff',
      'left',
      2
    );

    const wMeta = (window.WEATHER_TYPES_META && state.weatherId && window.WEATHER_TYPES_META[state.weatherId])
      || { icon: '☀️', label: '盛夏晴天' };
    const weatherBadge = state.weatherTransitioning
      ? `${wMeta.icon} 天候轉變：${wMeta.label}`
      : `${wMeta.icon} ${wMeta.label}`;

    this.drawArcadeText(
      ctx,
      `${state.stageName} ｜ ${weatherBadge} ｜ 載具：${state.vehicleName}`,
      width * 0.5,
      44,
      '900 11px sans-serif',
      '#ffeaa7',
      'center',
      2
    );

    this.drawArcadeText(ctx, 'LAP', width - 165, 24, '900 16px monospace', '#2ed573', 'left', 2);
    this.drawArcadeText(
      ctx,
      state.lapFormatted,
      width - 112,
      24,
      '900 17px monospace',
      '#ffffff',
      'left',
      2
    );

    // 左上角 (km/h 下方)：卡路里條 & 必殺噴射條，完全不遮擋下方道路
    ctx.save();
    const calPct = Math.min(1, (state.calories || 0) / 100);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.fillRect(16, 84, 144, 14);
    ctx.strokeStyle = state.isFatMode ? '#ff3838' : '#ffd32a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(16, 84, 144, 14);

    ctx.fillStyle = state.isFatMode
      ? ((Math.floor(performance.now() / 120) % 2 === 0) ? '#ff3838' : '#ff9f43')
      : '#ff9f43';
    ctx.fillRect(18, 86, Math.floor(140 * calPct), 10);
    this.drawArcadeText(
      ctx,
      state.isFatMode
        ? '🍔 發福中! 按SPACE推車'
        : `🍗 卡路里: ${Math.round(state.calories || 0)}%`,
      22,
      95,
      '900 9px sans-serif',
      '#ffffff',
      'left',
      1
    );

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(16, 102, 144, 14);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(16, 102, 144, 14);

    const nitroPct = state.nitroPercent;
    ctx.fillStyle = state.isFatMode
      ? '#e84393'
      : (state.isNitro ? '#00f0ff' : (nitroPct >= 1 ? '#2ed573' : '#ff9f43'));
    ctx.fillRect(18, 104, Math.floor(140 * nitroPct), 10);
    this.drawArcadeText(
      ctx,
      state.isFatMode
        ? '💦 空白鍵: 推車減肥!'
        : (state.isNitro ? '🔥 必殺噴射中!' : (nitroPct >= 1 ? 'SPACE 必殺就緒' : '瓦斯回充中...')),
      22,
      113,
      '900 9px sans-serif',
      '#ffffff',
      'left',
      1
    );

    // 左上角第 3 列：國道紅斑馬肇事累計 (0/5) 與 中車二次撞擊翻車 5 秒警戒倒數
    const hitCount = state.trafficHitCount || 0;
    const policeActive = Boolean(state.policeActive);
    const flashAlert = Math.floor(performance.now() / 110) % 2 === 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.fillRect(16, 120, 144, 14);
    ctx.strokeStyle = policeActive ? (flashAlert ? '#ff1e1e' : '#00a8ff') : '#ffd32a';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(16, 120, 144, 14);
    ctx.fillStyle = policeActive ? (flashAlert ? '#ff1e1e' : '#006266') : '#e74c3c';
    ctx.fillRect(18, 122, policeActive ? 140 : Math.floor(140 * Math.min(1, hitCount / 5)), 10);
    this.drawArcadeText(
      ctx,
      policeActive ? '🚓 國道紅斑馬攔截中!' : `🚨 紅斑馬警戒: ${hitCount}/5 次撞車`,
      22,
      131,
      '900 8.8px sans-serif',
      '#ffffff',
      'left',
      1
    );

    if ((state.sedanHitTimer || 0) > 0) {
      ctx.fillStyle = flashAlert ? 'rgba(231, 76, 60, 0.92)' : 'rgba(44, 62, 80, 0.92)';
      ctx.fillRect(16, 138, 168, 16);
      ctx.strokeStyle = '#ffd32a';
      ctx.strokeRect(16, 138, 168, 16);
      this.drawArcadeText(
        ctx,
        `⚠️ 5秒內再撞轎車翻車: ${state.sedanHitTimer.toFixed(1)}s`,
        22,
        149,
        '900 9px sans-serif',
        '#fff200',
        'left',
        1
      );
    }
    ctx.restore();

    // 右上角 (LAP 下方)：15 關環島路線進度表 (1:富岡起點 ➔ 2~14:中途13景點 ➔ 15:終點，全程 5 分鐘)
    const totalStages = (window.routeManager && window.routeManager.totalStages) || 15;
    const cellW = 11;
    const gap = 12.5;
    const stageBoxX = Math.floor(width - totalStages * gap - 8);
    const stageBoxY = 34;
    this.drawArcadeText(ctx, '15關', stageBoxX - 30, 44, '900 9.5px sans-serif', '#7bed9f', 'left', 2);

    for (let s = 1; s <= totalStages; s++) {
      const bx = Math.floor(stageBoxX + (s - 1) * gap);
      const isCurrent = s === state.stageNumber;
      const isPassed = s < state.stageNumber;
      ctx.fillStyle = isCurrent
        ? '#ff3838'
        : (isPassed ? '#2ed573' : (s === totalStages ? '#f39c12' : 'rgba(20, 20, 35, 0.85)'));
      ctx.fillRect(bx, stageBoxY, cellW, 13);
      ctx.strokeStyle = isCurrent ? '#ffd32a' : '#ffffff';
      ctx.lineWidth = isCurrent ? 1.6 : 0.9;
      ctx.strokeRect(bx, stageBoxY, cellW, 13);
      const label = s === 1 ? '起' : (s === totalStages ? '終' : `${s - 1}`);
      this.drawArcadeText(ctx, label, bx + cellW / 2, stageBoxY + 10, '900 7.5px sans-serif', '#ffffff', 'center', 1);
    }

    // 右上角關卡進度表下方：當前關卡《合金彈頭》風格實景指標小圖卡
    if (!state.inFork) {
      const badgeW = 92;
      const badgeH = 38;
      const badgeX = width - badgeW - 10;
      const badgeY = 51;
      ctx.fillStyle = '#141b29';
      ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
      ctx.strokeStyle = '#ffd32a';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);
      this.drawStageLandmarkIcon(ctx, state.stageId || 'fugang', badgeX + 2, badgeY + 2, badgeW - 4, badgeH - 4);
      // 四角合金彈頭鉚釘
      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(badgeX + 1, badgeY + 1, 2, 2);
      ctx.fillRect(badgeX + badgeW - 3, badgeY + 1, 2, 2);
      ctx.fillRect(badgeX + 1, badgeY + badgeH - 3, 2, 2);
      ctx.fillRect(badgeX + badgeW - 3, badgeY + badgeH - 3, 2, 2);
    }

    // 關卡轉換分岔路口：左右兩側顯示「大大的閃爍提示箭頭 + 該景點專屬《合金彈頭》實景圖案卡片」！
    if (state.inFork) {
      const isChoosingLeft = (state.playerX || 0) < 0;
      const leftTitle = state.leftBranchRegion
        ? `[${state.leftBranchRegion}] ${state.leftBranchName}`
        : (state.leftBranchName || '左道景點');
      const rightTitle = state.rightBranchRegion
        ? `[${state.rightBranchRegion}] ${state.rightBranchName}`
        : (state.rightBranchName || '右道景點');

      this.drawForkDestinationCard(
        ctx,
        118,
        120,
        'left',
        state.leftBranchId || 'jiufen',
        leftTitle,
        isChoosingLeft
      );
      this.drawForkDestinationCard(
        ctx,
        width - 118,
        120,
        'right',
        state.rightBranchId || 'alishan',
        rightTitle,
        !isChoosingLeft
      );

      this.drawNitroBanner(
        ctx,
        width / 2,
        height - 8,
        `⬅ 左轉：${leftTitle}  ｜🏁 第 ${state.stageNumber + 1}/${totalStages} 關路線選擇｜  右轉：${rightTitle} ➡`,
        '#00f0ff'
      );
    } else if (Math.abs(state.upcomingCurve || 0) >= 2.6) {
      // 一般急彎：畫面中上方顯示大大的閃爍左右轉彎提示箭頭
      this.drawCurveWarningArrow(ctx, width / 2, 76, state.upcomingCurve);
    }
  }

  /**
   * 繪製【小車：機車】被撞後的搞笑拋物線飛天動畫（720度大風車旋轉 + 飛散藍白拖/西瓜皮安全帽/高麗菜 + 「💥 按陰陽～！！」字卡 + 遠方化作閃亮星星 ★）
   */
  drawFlyingScooters(ctx, flyingScooters) {
    if (!flyingScooters || flyingScooters.length === 0) return;

    for (let i = 0; i < flyingScooters.length; i++) {
      const fs = flyingScooters[i];
      const progress = fs.timer / Math.max(0.1, fs.maxTime);

      ctx.save();
      ctx.translate(fs.x, fs.y);

      if (progress > 0.82) {
        // 飛到天際盡頭化為一顆搞笑閃亮大星星 ★ („叮！“)
        const starScale = (1 - (progress - 0.82) / 0.18) * 1.4;
        ctx.scale(starScale, starScale);
        ctx.fillStyle = '#fff200';
        ctx.beginPath();
        for (let p = 0; p < 8; p++) {
          const r = (p % 2 === 0) ? 22 : 7;
          const ang = (p * Math.PI) / 4 + fs.timer * 8;
          if (p === 0) ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r);
          else ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        continue;
      }

      // 1. 四散飛出的搞笑配件（香檳銀灰安全帽、白色運動鞋、後照鏡）
      const spread = fs.timer * 85;
      // 香檳銀灰半罩安全帽飛出
      ctx.fillStyle = '#dcdde1';
      ctx.beginPath();
      ctx.arc(-spread * 0.65, -spread * 0.45, 9 * fs.scale, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(-spread * 0.65 - 9 * fs.scale, -spread * 0.45 - 2 * fs.scale, 18 * fs.scale, 3 * fs.scale);

      // 飛脫的白色運動球鞋與白長襪
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(spread * 0.72, -spread * 0.30, 11 * fs.scale, 6 * fs.scale);
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1;
      ctx.strokeRect(spread * 0.72, -spread * 0.30, 11 * fs.scale, 6 * fs.scale);

      // 飛散的橢圓後照鏡
      ctx.fillStyle = '#dfe6e9';
      ctx.beginPath();
      ctx.ellipse(spread * 0.35, -spread * 0.75, 8 * fs.scale, 5 * fs.scale, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 3. 720 度大風車旋轉的銀灰速克達（9GY-0878）與白吊嘎外八劈腿騎士
      ctx.scale(fs.scale, fs.scale);
      ctx.rotate(fs.rot);

      // 銀灰色機車車尾與紅寶石尾燈 + 9GY-0878 車牌
      ctx.fillStyle = '#b2bec3';
      ctx.fillRect(-20, -4, 40, 22);
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-20, -4, 40, 22);
      ctx.fillStyle = '#ff1e1e';
      ctx.fillRect(-10, -2, 20, 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-16, 7, 32, 9);
      ctx.strokeRect(-16, 7, 32, 9);
      ctx.fillStyle = '#111111';
      ctx.font = '900 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('9GY-0878', 0, 14);
      ctx.fillRect(-6, 18, 12, 10);

      // 驚慌張開外八雙腿（白長襪）與白吊嘎背心的騎士
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(-18, -10, 36, 8);
      // 外八張開的白長襪雙腿
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-16, -6);
      ctx.lineTo(-28, 8);
      ctx.moveTo(16, -6);
      ctx.lineTo(28, 8);
      ctx.stroke();
      // 純白吊嘎背心與古銅色揮舞雙臂
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-12, -28, 24, 18);
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-12, -28, 24, 18);
      ctx.strokeStyle = '#c68652';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(-12, -24);
      ctx.lineTo(-26, -36);
      ctx.moveTo(12, -24);
      ctx.lineTo(26, -36);
      ctx.stroke();

      ctx.restore();
    }
  }

  /**
   * 繪製一般急彎時的大尺寸閃爍方向箭頭提示
   */
  drawCurveWarningArrow(ctx, centerX, centerY, curve) {
    const isRight = curve > 0;
    const flash = Math.floor(performance.now() / 110) % 2 === 0;
    const shift = Math.sin(performance.now() * 0.018) * 6 * (isRight ? 1 : -1);

    ctx.save();
    ctx.translate(centerX + shift, centerY);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
    ctx.fillRect(-78, -18, 156, 34);
    ctx.strokeStyle = flash ? '#ffd32a' : '#ff3838';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-78, -18, 156, 34);

    const arrowColor = flash ? '#ffd32a' : '#00f0ff';
    this.drawArcadeText(
      ctx,
      isRight ? '右急彎 ►►►' : '◄◄◄ 左急彎',
      0,
      5,
      '900 18px sans-serif',
      arrowColor,
      'center',
      2
    );
    ctx.restore();
  }

  /**
   * 繪製關卡轉換時的「巨型閃爍方向箭頭 + 景點專屬圖案面板」
   */
  drawForkDestinationCard(ctx, centerX, topY, dir, stageId, stageTitle, isSelected) {
    const time = performance.now();
    const fastFlash = Math.floor(time / 95) % 2 === 0;
    const pulse = isSelected ? 1 + Math.sin(time * 0.015) * 0.045 : 0.96;
    const arrowBounce = Math.sin(time * 0.018) * 7 * (dir === 'left' ? -1 : 1);

    ctx.save();
    ctx.translate(centerX, topY);
    ctx.scale(pulse, pulse);

    // 1. 頂部超大型閃爍霓虹方向箭頭 (◄◄◄ 左轉 / 右轉 ►►►)
    ctx.save();
    ctx.translate(arrowBounce, 0);
    const arrowColor = fastFlash ? '#ffd32a' : (isSelected ? '#00f0ff' : '#ff2a85');
    ctx.fillStyle = arrowColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;

    ctx.beginPath();
    if (dir === 'left') {
      ctx.moveTo(-78, 18);
      ctx.lineTo(-34, -4);
      ctx.lineTo(-34, 9);
      ctx.lineTo(68, 9);
      ctx.lineTo(68, 27);
      ctx.lineTo(-34, 27);
      ctx.lineTo(-34, 40);
    } else {
      ctx.moveTo(78, 18);
      ctx.lineTo(34, -4);
      ctx.lineTo(34, 9);
      ctx.lineTo(-68, 9);
      ctx.lineTo(-68, 27);
      ctx.lineTo(34, 27);
      ctx.lineTo(34, 40);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    this.drawArcadeText(
      ctx,
      dir === 'left' ? '◄◄ 左轉景點' : '右轉景點 ►►',
      dir === 'left' ? 8 : -8,
      23,
      '900 13px sans-serif',
      '#ffffff',
      'center',
      2
    );
    ctx.restore();

    // 2. 景點專屬《合金彈頭》重機械鉚釘鋼框面板
    const cardW = 174;
    const cardH = 104;
    const cardX = -cardW / 2;
    const cardY = 42;

    ctx.fillStyle = '#141a29';
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(cardX, cardY, cardW, cardH);
    ctx.strokeStyle = isSelected ? (fastFlash ? '#ffd32a' : '#2ed573') : '#7f8c8d';
    ctx.lineWidth = isSelected ? 2.4 : 1.5;
    ctx.strokeRect(cardX + 2, cardY + 2, cardW - 4, cardH - 4);

    // 四角《合金彈頭》黃銅裝甲鉚釘
    ctx.fillStyle = '#ffd32a';
    [
      [cardX + 4, cardY + 4],
      [cardX + cardW - 7, cardY + 4],
      [cardX + 4, cardY + cardH - 7],
      [cardX + cardW - 7, cardY + cardH - 7]
    ].forEach(([rx, ry]) => {
      ctx.fillRect(rx, ry, 3, 3);
    });

    // 3. 繪製該關卡的《合金彈頭》風格實景圖案
    this.drawStageLandmarkIcon(ctx, stageId, cardX + 6, cardY + 6, cardW - 12, 64);

    // 4. 景點名稱與鎖定提示
    this.drawArcadeText(
      ctx,
      stageTitle,
      0,
      cardY + 83,
      '900 10.5px sans-serif',
      isSelected ? '#ffd32a' : '#ffffff',
      'center',
      2
    );
    this.drawArcadeText(
      ctx,
      isSelected ? '✨ 目前車頭鎖定此景點！' : (dir === 'left' ? '按 ◀ 左鍵切入' : '按 ▶ 右鍵切入'),
      0,
      cardY + 97,
      '900 9px sans-serif',
      isSelected ? '#2ed573' : '#00f0ff',
      'center',
      1
    );

    ctx.restore();
  }

  /**
   * 繪製全台灣 38 個途經景點、起點與 8 大終點的《合金彈頭》(Metal Slug) 風格實景圖案
   * 特色：厚黑像素輪廓描邊 (#111111)、多層次天空雲彩光影、真實地標建築細節（磚瓦、拱門、斜張鋼索、海浪、火車）與街機金屬邊框！
   */
  drawStageLandmarkIcon(ctx, stageId, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    // 若該關卡對應使用者上傳的 8 大終點精緻《合金彈頭》實景構圖，直接呈現原圖
    if (this.hasFinaleImage(stageId)) {
      const fImg = this.finaleImages[stageId].img;
      ctx.drawImage(fImg, x, y, w, h);
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(255, 211, 42, 0.88)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      ctx.restore();
      return;
    }

    const st = (window.STAGE_TREE && window.STAGE_TREE[stageId]) || null;
    const skyGrad = ctx.createLinearGradient(x, y, x, y + h * 0.75);
    skyGrad.addColorStop(0, st ? st.skyTop : '#0a3d62');
    skyGrad.addColorStop(0.58, st ? (st.skyMid || st.skyBottom) : '#0097e6');
    skyGrad.addColorStop(1, st ? st.skyBottom : '#fbc531');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(x, y, w, h);

    // 《合金彈頭》風格天際雲帶與烈日/明月光暈
    ctx.fillStyle = (st && st.sunColor) || '#fff200';
    ctx.beginPath();
    ctx.arc(x + w * 0.80, y + h * 0.24, Math.max(4, h * 0.14), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fillRect(x + w * 0.08, y + h * 0.16, w * 0.28, Math.max(2, h * 0.06));
    ctx.fillRect(x + w * 0.48, y + h * 0.10, w * 0.22, Math.max(2, h * 0.05));

    // 遠景層疊山脈剪影 + 稜線高光 + 粗黑描邊
    ctx.fillStyle = (st && st.mountainFar) || '#2c3e50';
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.72);
    ctx.lineTo(x + w * 0.20, y + h * 0.38);
    ctx.lineTo(x + w * 0.44, y + h * 0.56);
    ctx.lineTo(x + w * 0.72, y + h * 0.34);
    ctx.lineTo(x + w, y + h * 0.54);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();

    ctx.lineWidth = Math.max(1.2, Math.min(2.0, w * 0.015));
    ctx.strokeStyle = '#111111';

    if (stageId === 'fugang') {
      // 【桃園富岡火車站 & 1929 呂家聲洋樓實景】左側藍白台鐵站體 + 右側紅磚五開間與拜占庭「鑊嫲篤」圓頂
      ctx.fillStyle = '#576574';
      ctx.fillRect(x, y + h * 0.78, w, h * 0.22);
      // 左側富岡車站
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(x + w * 0.05, y + h * 0.44, w * 0.40, h * 0.40);
      ctx.strokeRect(x + w * 0.05, y + h * 0.44, w * 0.40, h * 0.40);
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(x + w * 0.05, y + h * 0.64, w * 0.40, h * 0.20);
      ctx.fillStyle = '#0038a8';
      ctx.fillRect(x + w * 0.03, y + h * 0.34, w * 0.44, h * 0.12);
      ctx.strokeRect(x + w * 0.03, y + h * 0.34, w * 0.44, h * 0.12);
      // 右側呂家聲巴洛克洋樓（鑊嫲篤圓頂 + 紅磚拱廊）
      ctx.fillStyle = '#7f8c8d';
      ctx.beginPath();
      ctx.arc(x + w * 0.73, y + h * 0.32, w * 0.13, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#a04000';
      ctx.fillRect(x + w * 0.52, y + h * 0.32, w * 0.42, h * 0.52);
      ctx.strokeRect(x + w * 0.52, y + h * 0.32, w * 0.42, h * 0.52);
      ctx.fillStyle = '#141b24';
      [0.58, 0.71, 0.84].forEach((ax) => {
        ctx.fillRect(x + w * ax - w * 0.04, y + h * 0.62, w * 0.08, h * 0.22);
      });
    } else if (stageId === 'yehliu') {
      // 【野柳地質公園實景】碧藍海浪 + 黃褐色傾斜單面山海蝕平台 + 女王頭蕈狀岩與燭臺石
      ctx.fillStyle = '#0052a5';
      ctx.fillRect(x, y + h * 0.58, w, h * 0.42);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + w * 0.06, y + h * 0.64, w * 0.88, h * 0.04);
      // 黃褐砂岩海蝕平台
      ctx.fillStyle = '#d1b26f';
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w * 0.08, y + h * 0.68);
      ctx.lineTo(x + w * 0.92, y + h * 0.72);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 女王頭高聳挽髻側臉與修長頸部
      ctx.fillStyle = '#c29b53';
      ctx.beginPath();
      ctx.ellipse(x + w * 0.50, y + h * 0.32, w * 0.12, h * 0.20, -0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#9c7834';
      ctx.fillRect(x + w * 0.46, y + h * 0.46, w * 0.07, h * 0.26);
      ctx.strokeRect(x + w * 0.46, y + h * 0.46, w * 0.07, h * 0.26);
    } else if (stageId === 'yangmingshan') {
      // 【陽明山小油坑實景】七星山崩塌硫磺噴氣孔 + 濃白蒸氣雲 + 滿坡金黃秋芒與花鐘
      ctx.fillStyle = '#485460';
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w * 0.32, y + h * 0.24);
      ctx.lineTo(x + w * 0.68, y + h * 0.36);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 硫磺結晶黃斑與噴氣白煙
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(x + w * 0.28, y + h * 0.48, w * 0.24, h * 0.22);
      ctx.strokeRect(x + w * 0.28, y + h * 0.48, w * 0.24, h * 0.22);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';
      ctx.beginPath();
      ctx.arc(x + w * 0.40, y + h * 0.34, h * 0.18, 0, Math.PI * 2);
      ctx.arc(x + w * 0.48, y + h * 0.20, h * 0.15, 0, Math.PI * 2);
      ctx.fill();
      // 前景金黃秋芒草浪
      ctx.fillStyle = '#e1b12c';
      ctx.fillRect(x, y + h * 0.78, w, h * 0.22);
    } else if (stageId === 'npm') {
      // 【台北國立故宮博物院實景】翠綠外雙溪山谷 + 白牆鵝黃琉璃瓦重簷大殿 + 天下為公漢白玉牌坊
      ctx.fillStyle = '#1e8449';
      ctx.fillRect(x, y + h * 0.56, w, h * 0.44);
      // 主館白石基座與黃瓦宮殿
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(x + w * 0.16, y + h * 0.38, w * 0.68, h * 0.42);
      ctx.strokeRect(x + w * 0.16, y + h * 0.38, w * 0.68, h * 0.42);
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.10, y + h * 0.40);
      ctx.lineTo(x + w * 0.50, y + h * 0.14);
      ctx.lineTo(x + w * 0.90, y + h * 0.40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 前方白石五孔牌坊
      ctx.fillStyle = '#ffffff';
      [0.28, 0.42, 0.58, 0.72].forEach((px) => {
        ctx.fillRect(x + w * px - 2, y + h * 0.60, 4, h * 0.36);
      });
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(x + w * 0.24, y + h * 0.58, w * 0.52, h * 0.08);
    } else if (stageId === 'jiufen') {
      // 【九份山城阿妹茶樓實景】深紫夜霧山海 + 三層木造茶樓紅瓦飛簷 + 豎崎路石階成串大紅燈籠
      ctx.fillStyle = '#140d26';
      ctx.fillRect(x, y, w, h);
      // 阿妹茶樓三層木造主體
      ctx.fillStyle = '#5c2c16';
      ctx.fillRect(x + w * 0.18, y + h * 0.20, w * 0.64, h * 0.76);
      ctx.strokeRect(x + w * 0.18, y + h * 0.20, w * 0.64, h * 0.76);
      // 暖黃茶樓格窗
      ctx.fillStyle = '#ffd32a';
      [0.28, 0.52].forEach((ry) => {
        ctx.fillRect(x + w * 0.24, y + h * ry, w * 0.52, h * 0.14);
        ctx.strokeRect(x + w * 0.24, y + h * ry, w * 0.52, h * 0.14);
      });
      // 成排鮮紅發光燈籠串
      ctx.fillStyle = '#ff1e1e';
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(x + w * (0.12 + i * 0.14), y + h * 0.44, w * 0.08, h * 0.12);
        ctx.fillRect(x + w * (0.12 + i * 0.14), y + h * 0.70, w * 0.08, h * 0.12);
      }
    } else if (stageId === 'shifen') {
      // 【平溪十分大瀑布與天燈實景】左側寬闊白色水簾瀑布與碧潭 + 右側冉冉升空的祈福紅天燈
      ctx.fillStyle = '#0097e6';
      ctx.fillRect(x, y + h * 0.68, w, h * 0.32);
      // 十分大瀑布岩壁與白水簾
      ctx.fillStyle = '#576574';
      ctx.fillRect(x + w * 0.06, y + h * 0.32, w * 0.52, h * 0.42);
      ctx.strokeRect(x + w * 0.06, y + h * 0.32, w * 0.52, h * 0.42);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + w * 0.12, y + h * 0.34, w * 0.40, h * 0.40);
      // 冉冉升空的紅天燈與底部金火光
      [
        { lx: 0.72, ly: 0.16, s: 1.0 },
        { lx: 0.86, ly: 0.36, s: 0.75 }
      ].forEach((lt) => {
        ctx.fillStyle = '#ff3838';
        ctx.fillRect(x + w * lt.lx, y + h * lt.ly, w * 0.12 * lt.s, h * 0.28 * lt.s);
        ctx.strokeRect(x + w * lt.lx, y + h * lt.ly, w * 0.12 * lt.s, h * 0.28 * lt.s);
        ctx.fillStyle = '#fff200';
        ctx.fillRect(x + w * (lt.lx + 0.03 * lt.s), y + h * (lt.ly + 0.24 * lt.s), w * 0.06 * lt.s, h * 0.07 * lt.s);
      });
    } else if (stageId === 'taipingshan') {
      // 【宜蘭太平山蹦蹦車與雲海實景】千年紅檜巨木林 + 亮黃色森林蹦蹦車行駛於木棧鐵橋
      ctx.fillStyle = '#145a32';
      ctx.fillRect(x, y + h * 0.20, w, h * 0.80);
      // 檜木巨幹
      ctx.fillStyle = '#5c2e14';
      [0.12, 0.32, 0.82].forEach((tx) => {
        ctx.fillRect(x + w * tx, y, w * 0.09, h);
        ctx.strokeRect(x + w * tx, y, w * 0.09, h);
      });
      // 高架木棧鐵道與亮黃色太平山蹦蹦車
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(x, y + h * 0.74, w, h * 0.14);
      ctx.strokeRect(x, y + h * 0.74, w, h * 0.14);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(x + w * 0.42, y + h * 0.46, w * 0.36, h * 0.28);
      ctx.strokeRect(x + w * 0.42, y + h * 0.46, w * 0.36, h * 0.28);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(x + w * 0.40, y + h * 0.40, w * 0.40, h * 0.08);
    } else if (stageId === 'gaomei') {
      // 【台中高美濕地實景】紫橘漸層火燒雲夕陽 + 鏡面濕地倒影 + 3 座高聳白色風力發電機與彎曲木棧道
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(x, y + h * 0.56, w, h * 0.44);
      ctx.fillStyle = '#ffbe76';
      ctx.fillRect(x + w * 0.55, y + h * 0.56, w * 0.30, h * 0.44);
      // 彎曲木棧道
      ctx.fillStyle = '#6e2c00';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.15, y + h);
      ctx.lineTo(x + w * 0.48, y + h * 0.64);
      ctx.lineTo(x + w * 0.60, y + h * 0.64);
      ctx.lineTo(x + w * 0.38, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 3 座巨型白色風車
      [0.22, 0.50, 0.78].forEach((wx) => {
        const cx = x + w * wx;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 2, y + h * 0.18, 4, h * 0.52);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        for (let b = 0; b < 3; b++) {
          const ang = (b * Math.PI * 2) / 3 + 0.4;
          ctx.beginPath();
          ctx.moveTo(cx, y + h * 0.18);
          ctx.lineTo(cx + Math.cos(ang) * h * 0.22, y + h * 0.18 + Math.sin(ang) * h * 0.22);
          ctx.stroke();
        }
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 1.4;
      });
    } else if (stageId === 'hehuanshan') {
      // 【合歡山武嶺 3275M 實景】深藍璀璨銀河星空 + 翠綠箭竹山坡 + 石造武嶺觀景台與 3275M 金字木碑
      ctx.fillStyle = '#070b24';
      ctx.fillRect(x, y, w, h);
      // 璀璨銀河星帶
      ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.beginPath();
      ctx.moveTo(x, y + h * 0.36);
      ctx.lineTo(x + w, y + h * 0.06);
      ctx.lineTo(x + w, y + h * 0.26);
      ctx.lineTo(x, y + h * 0.56);
      ctx.closePath();
      ctx.fill();
      // 箭竹高山稜線与石造觀景台
      ctx.fillStyle = '#1e5631';
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w * 0.24, y + h * 0.48);
      ctx.lineTo(x + w * 0.78, y + h * 0.52);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(x + w * 0.26, y + h * 0.62, w * 0.48, h * 0.38);
      ctx.strokeRect(x + w * 0.26, y + h * 0.62, w * 0.48, h * 0.38);
      // 武嶺 3275M 立碑
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(x + w * 0.40, y + h * 0.20, w * 0.20, h * 0.44);
      ctx.strokeRect(x + w * 0.40, y + h * 0.20, w * 0.20, h * 0.44);
      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(x + w * 0.43, y + h * 0.28, w * 0.14, h * 0.22);
    } else if (stageId === 'cingjing') {
      // 【南投清境農場實景】翠綠青青草原斜坡 + 歐式紅頂綿羊城堡 + 白色木柵欄與成群綿羊
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.moveTo(x, y + h * 0.46);
      ctx.lineTo(x + w, y + h * 0.58);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 歐式綿羊城堡
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(x + w * 0.14, y + h * 0.28, w * 0.28, h * 0.42);
      ctx.strokeRect(x + w * 0.14, y + h * 0.28, w * 0.28, h * 0.42);
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.10, y + h * 0.30);
      ctx.lineTo(x + w * 0.28, y + h * 0.08);
      ctx.lineTo(x + w * 0.46, y + h * 0.30);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 白色綿羊群
      [0.62, 0.80].forEach((sx) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + w * sx, y + h * 0.74, h * 0.14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(x + w * sx + 3, y + h * 0.68, 5, 5);
      });
    } else if (stageId === 'sunmoonlake') {
      // 【日月潭實景】翡翠綠湖面與拉魯島 + 山巔慈恩塔八角寶塔 + 跨湖紅黃藍高空纜車
      ctx.fillStyle = '#00a896';
      ctx.fillRect(x, y + h * 0.60, w, h * 0.40);
      // 拉魯島
      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.ellipse(x + w * 0.36, y + h * 0.72, w * 0.18, h * 0.10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // 慈恩塔
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(x + w * 0.70, y + h * 0.16, w * 0.12, h * 0.44);
      ctx.strokeRect(x + w * 0.70, y + h * 0.16, w * 0.12, h * 0.44);
      // 高空纜車索道與紅藍車廂
      ctx.strokeStyle = '#111111';
      ctx.beginPath();
      ctx.moveTo(x, y + h * 0.32);
      ctx.lineTo(x + w * 0.68, y + h * 0.14);
      ctx.stroke();
      ctx.fillStyle = '#ff3838';
      ctx.fillRect(x + w * 0.24, y + h * 0.26, w * 0.09, h * 0.14);
      ctx.strokeRect(x + w * 0.24, y + h * 0.26, w * 0.09, h * 0.14);
    } else if (stageId === 'xitou') {
      // 【溪頭孟宗竹海與大學池竹拱橋實景】高聳翠綠孟宗竹林 + 濃霧山嵐 + 彎曲孟宗竹拱橋與池水倒影
      ctx.fillStyle = '#1e5631';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#2ecc71';
      for (let b = 0; b < 7; b++) {
        ctx.fillRect(x + w * (0.06 + b * 0.14), y, w * 0.05, h * 0.70);
      }
      ctx.fillStyle = '#006266';
      ctx.fillRect(x, y + h * 0.68, w, h * 0.32);
      // 大學池竹拱橋
      ctx.strokeStyle = '#d4ac0d';
      ctx.lineWidth = Math.max(3, h * 0.09);
      ctx.beginPath();
      ctx.arc(x + w * 0.50, y + h * 0.82, w * 0.34, Math.PI, 0);
      ctx.stroke();
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1.4;
    } else if (stageId === 'alishan' || stageId === 'end_alishan') {
      // 【嘉義阿里山日出雲海與森林小火車實景】翻騰白雲海 + 祝山金色日出 + 千年紅檜神木 + 阿里山紅色柴油小火車
      ctx.fillStyle = '#ffffff';
      for (let c = 0; c < 5; c++) {
        ctx.beginPath();
        ctx.arc(x + w * (0.12 + c * 0.20), y + h * 0.62, h * 0.20, 0, Math.PI * 2);
        ctx.fill();
      }
      // 千年紅檜神木
      ctx.fillStyle = '#5c2e14';
      ctx.fillRect(x + w * 0.12, y + h * 0.12, w * 0.14, h * 0.88);
      ctx.strokeRect(x + w * 0.12, y + h * 0.12, w * 0.14, h * 0.88);
      ctx.fillStyle = '#145a32';
      ctx.beginPath();
      ctx.arc(x + w * 0.19, y + h * 0.14, w * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // 阿里山紅色森林小火車
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(x + w * 0.42, y + h * 0.54, w * 0.48, h * 0.34);
      ctx.strokeRect(x + w * 0.42, y + h * 0.54, w * 0.48, h * 0.34);
      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(x + w * 0.42, y + h * 0.72, w * 0.48, h * 0.06);
      ctx.fillStyle = '#dff9fb';
      ctx.fillRect(x + w * 0.48, y + h * 0.60, w * 0.14, h * 0.10);
      ctx.fillRect(x + w * 0.68, y + h * 0.60, w * 0.14, h * 0.10);
    } else if (stageId === 'taroko' || stageId === 'end_taroko') {
      // 【花蓮太魯閣峽谷・九曲洞・立霧溪絕景實景】千仞大理石絕壁 + 立霧溪碧水 + 九曲洞天然石碑與橫貫公路吊橋
      // 天空背景
      ctx.fillStyle = '#81ecec';
      ctx.fillRect(x, y, w, h);
      // 左右垂直大理石峽谷絕壁（一線天）
      ctx.fillStyle = '#2d3436';
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y);
      ctx.lineTo(x + w * 0.32, y);
      ctx.lineTo(x + w * 0.38, y + h * 0.70);
      ctx.lineTo(x + w * 0.30, y + h);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#34495e';
      ctx.beginPath();
      ctx.moveTo(x + w, y + h);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w * 0.68, y);
      ctx.lineTo(x + w * 0.62, y + h * 0.70);
      ctx.lineTo(x + w * 0.70, y + h);
      ctx.closePath();
      ctx.fill();

      // 大理石灰白岩脈紋理
      ctx.strokeStyle = '#dfe6e9';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.10, y + h * 0.20);
      ctx.lineTo(x + w * 0.28, y + h * 0.65);
      ctx.moveTo(x + w * 0.90, y + h * 0.18);
      ctx.lineTo(x + w * 0.70, y + h * 0.62);
      ctx.stroke();

      // 峭壁懸掛綠意
      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.arc(x + w * 0.28, y + h * 0.40, w * 0.08, 0, Math.PI * 2);
      ctx.arc(x + w * 0.72, y + h * 0.35, w * 0.08, 0, Math.PI * 2);
      ctx.fill();

      // 立霧溪碧綠湍流
      ctx.fillStyle = '#00cec9';
      ctx.fillRect(x + w * 0.30, y + h * 0.72, w * 0.40, h * 0.28);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + w * 0.38, y + h * 0.82, w * 0.12, 2);

      // 高空紅色懸索吊橋
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.30, y + h * 0.32);
      ctx.quadraticCurveTo(x + w * 0.50, y + h * 0.40, x + w * 0.70, y + h * 0.32);
      ctx.stroke();

      // 中央九曲洞大理石天然巨石碑（紅字刻印）
      ctx.fillStyle = '#95a5a6';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.42, y + h);
      ctx.lineTo(x + w * 0.40, y + h * 0.64);
      ctx.lineTo(x + w * 0.48, y + h * 0.54);
      ctx.lineTo(x + w * 0.58, y + h * 0.58);
      ctx.lineTo(x + w * 0.60, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(x + w * 0.48, y + h * 0.64, w * 0.04, h * 0.18);
    } else if (stageId === 'qingshui') {
      // 【蘇花公路清水斷崖實景】左側千公尺垂直大理石斷崖絕壁與臨海明隧道 + 右側蒂芬妮藍漸層太平洋
      ctx.fillStyle = '#0052a5';
      ctx.fillRect(x, y + h * 0.52, w, h * 0.48);
      ctx.fillStyle = '#00d2d3';
      ctx.fillRect(x + w * 0.30, y + h * 0.58, w * 0.70, h * 0.42);
      // 左側垂直入海大理石斷崖與明隧道斜撐柱
      ctx.fillStyle = '#7f8c8d';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w * 0.44, y);
      ctx.lineTo(x + w * 0.58, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 臨海明隧道窗口
      ctx.fillStyle = '#141b24';
      ctx.fillRect(x + w * 0.12, y + h * 0.54, w * 0.34, h * 0.26);
      ctx.fillStyle = '#dfe6e9';
      [0.16, 0.26, 0.36].forEach((cx) => {
        ctx.fillRect(x + w * cx, y + h * 0.54, 4, h * 0.26);
      });
    } else if (stageId === 'qixingtan') {
      // 【花蓮七星潭月牙灣實景】優美弧形鵝卵石海灣 + 蒂芬妮藍海浪白沫 + 遠方清水大山與白色燈塔
      ctx.fillStyle = '#0077b6';
      ctx.fillRect(x, y + h * 0.48, w, h * 0.52);
      ctx.fillStyle = '#48dbfb';
      ctx.fillRect(x, y + h * 0.62, w, h * 0.38);
      // 月牙形鵝卵石海灘與白色浪花弧線
      ctx.fillStyle = '#bdc3c7';
      ctx.beginPath();
      ctx.moveTo(x, y + h * 0.50);
      ctx.quadraticCurveTo(x + w * 0.45, y + h * 0.92, x + w, y + h * 0.86);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (stageId === 'liyutan') {
      // 【花蓮鯉魚潭紅面鴨實景】翠綠鯉魚山與湖面 + 巨型 Q 版「紅面番鴨」水上充氣吉祥物
      ctx.fillStyle = '#0097e6';
      ctx.fillRect(x, y + h * 0.58, w, h * 0.42);
      // 巨型黑羽紅面番鴨
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.ellipse(x + w * 0.52, y + h * 0.64, w * 0.22, h * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + w * 0.40, y + h * 0.40, h * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ff3838';
      ctx.beginPath();
      ctx.arc(x + w * 0.36, y + h * 0.40, h * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(x + w * 0.22, y + h * 0.38, w * 0.12, h * 0.08);
    } else if (stageId === 'chishang' || stageId === 'guanshan') {
      // 【台東池上伯朗大道金城武樹 / 關山花海實景】無電線桿金黃稻浪 + 濃密翠綠「金城武樹」與奉茶亭
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(x, y + h * 0.54, w, h * 0.46);
      // 蜿蜒田間小路
      ctx.fillStyle = '#dcdde1';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.38, y + h);
      ctx.lineTo(x + w * 0.48, y + h * 0.54);
      ctx.lineTo(x + w * 0.56, y + h * 0.54);
      ctx.lineTo(x + w * 0.68, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 金城武樹
      ctx.fillStyle = '#5c2e14';
      ctx.fillRect(x + w * 0.26, y + h * 0.38, w * 0.08, h * 0.34);
      ctx.strokeRect(x + w * 0.26, y + h * 0.38, w * 0.08, h * 0.34);
      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.arc(x + w * 0.30, y + h * 0.28, h * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (stageId === 'sanxiantai' || stageId === 'end_sanxiantai') {
      // 【台東三仙台八拱跨海步橋實景】湛藍太平洋 + 波浪造型八拱跨海步橋 + 離岸火山角礫岩三仙島
      ctx.fillStyle = '#0052a5';
      ctx.fillRect(x, y + h * 0.60, w, h * 0.40);
      ctx.fillStyle = '#2d3436';
      ctx.beginPath();
      ctx.arc(x + w * 0.82, y + h * 0.64, h * 0.28, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      for (let a = 0; a < 5; a++) {
        const ax = x + w * (0.14 + a * 0.13);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(ax, y + h * 0.64, w * 0.065, Math.PI, 0);
        ctx.stroke();
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(ax, y + h * 0.60, w * 0.065, Math.PI, 0);
        ctx.stroke();
      }
    } else if (stageId === 'duoliang') {
      // 【台東多良火車站實景】太平洋蔚藍海面 + 鮮紅欄杆高架月台 + 藍白莒光號火車出山洞
      ctx.fillStyle = '#0077b6';
      ctx.fillRect(x, y + h * 0.56, w, h * 0.44);
      // 高架水泥橋墩
      ctx.fillStyle = '#95a5a6';
      [0.16, 0.42, 0.68, 0.88].forEach((px) => {
        ctx.fillRect(x + w * px, y + h * 0.58, w * 0.07, h * 0.42);
        ctx.strokeRect(x + w * px, y + h * 0.58, w * 0.07, h * 0.42);
      });
      // 藍白火車車廂
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(x + w * 0.12, y + h * 0.34, w * 0.72, h * 0.22);
      ctx.strokeRect(x + w * 0.12, y + h * 0.34, w * 0.72, h * 0.22);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + w * 0.12, y + h * 0.44, w * 0.72, h * 0.05);
      // 多良招牌鮮紅欄杆
      ctx.fillStyle = '#ff1e1e';
      ctx.fillRect(x + w * 0.04, y + h * 0.52, w * 0.92, h * 0.08);
      ctx.strokeRect(x + w * 0.04, y + h * 0.52, w * 0.92, h * 0.08);
    } else if (stageId === 'ruisui') {
      // 【花蓮瑞穗北回歸線標塔與牧場實景】純白鶴立北回歸線日晷標塔 + 翠綠牧場黑白乳牛
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(x, y + h * 0.58, w, h * 0.42);
      // 純白北回歸線標誌塔
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.36, y + h * 0.88);
      ctx.lineTo(x + w * 0.47, y + h * 0.10);
      ctx.lineTo(x + w * 0.53, y + h * 0.10);
      ctx.lineTo(x + w * 0.64, y + h * 0.88);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#00a8ff';
      ctx.fillRect(x + w * 0.32, y + h * 0.28, w * 0.36, h * 0.08);
      ctx.strokeRect(x + w * 0.32, y + h * 0.28, w * 0.36, h * 0.08);
    } else if (stageId === 'shitiping') {
      // 【花蓮豐濱石梯坪實景】灰白傾斜單面山層狀海蝕階地 + 太平洋激浪白沫
      ctx.fillStyle = '#0052a5';
      ctx.fillRect(x, y + h * 0.56, w, h * 0.44);
      ctx.fillStyle = '#dfe6e9';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.06, y + h * 0.86);
      ctx.lineTo(x + w * 0.64, y + h * 0.18);
      ctx.lineTo(x + w * 0.88, y + h * 0.86);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 階梯狀岩層刻線
      ctx.beginPath();
      ctx.moveTo(x + w * 0.20, y + h * 0.70);
      ctx.lineTo(x + w * 0.78, y + h * 0.70);
      ctx.moveTo(x + w * 0.36, y + h * 0.50);
      ctx.lineTo(x + w * 0.72, y + h * 0.50);
      ctx.stroke();
    } else if (stageId === 'longteng') {
      // 【苗栗三義龍騰斷橋實景】蒼翠山谷 + 雙座斑駁紅磚拱形殘墩與花崗岩白飾帶
      ctx.fillStyle = '#1e8449';
      ctx.fillRect(x, y + h * 0.52, w, h * 0.48);
      [0.22, 0.64].forEach((bx) => {
        ctx.fillStyle = '#a04000';
        ctx.fillRect(x + w * bx, y + h * 0.22, w * 0.18, h * 0.74);
        ctx.strokeRect(x + w * bx, y + h * 0.22, w * 0.18, h * 0.74);
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(x + w * bx - 1, y + h * 0.42, w * 0.18 + 2, h * 0.06);
        ctx.fillRect(x + w * bx - 1, y + h * 0.64, w * 0.18 + 2, h * 0.06);
      });
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = Math.max(3, h * 0.09);
      ctx.beginPath();
      ctx.arc(x + w * 0.50, y + h * 0.44, w * 0.18, Math.PI, Math.PI * 1.75);
      ctx.stroke();
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1.4;
    } else if (stageId === 'hsinchu_moat') {
      // 【新竹東門城迎曦門與護城河實景】清澈護城河 + 紅磚圓拱城座 + 重簷歇山雙層城樓
      ctx.fillStyle = '#0097e6';
      ctx.fillRect(x, y + h * 0.72, w, h * 0.28);
      ctx.fillStyle = '#a04000';
      ctx.fillRect(x + w * 0.16, y + h * 0.46, w * 0.68, h * 0.34);
      ctx.strokeRect(x + w * 0.16, y + h * 0.46, w * 0.68, h * 0.34);
      ctx.fillStyle = '#141b24';
      ctx.beginPath();
      ctx.arc(x + w * 0.50, y + h * 0.80, w * 0.10, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.12, y + h * 0.46);
      ctx.lineTo(x + w * 0.50, y + h * 0.14);
      ctx.lineTo(x + w * 0.88, y + h * 0.46);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (stageId === 'tamsui') {
      // 【淡水紅毛城與漁人碼頭情人橋實景】左側朱紅雉堞紅毛城古堡 + 右側夕陽海面純白單塔斜張情人橋
      ctx.fillStyle = '#006266';
      ctx.fillRect(x, y + h * 0.64, w, h * 0.36);
      // 左側紅毛城
      ctx.fillStyle = '#b33939';
      ctx.fillRect(x + w * 0.08, y + h * 0.28, w * 0.34, h * 0.46);
      ctx.strokeRect(x + w * 0.08, y + h * 0.28, w * 0.34, h * 0.46);
      // 右側白色單塔斜張情人橋
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.68, y + h * 0.12);
      ctx.lineTo(x + w * 0.48, y + h * 0.66);
      ctx.moveTo(x + w * 0.68, y + h * 0.12);
      ctx.lineTo(x + w * 0.92, y + h * 0.66);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + w * 0.65, y + h * 0.10, w * 0.05, h * 0.64);
      ctx.fillRect(x + w * 0.44, y + h * 0.64, w * 0.52, h * 0.06);
      ctx.strokeStyle = '#111111';
    } else if (stageId === 'dapengbay') {
      // 【屏東東港大鵬灣跨海大橋實景】金橘夕陽瀉湖 + 純白單塔風帆造型斜張跨海大橋與放射鋼索
      ctx.fillStyle = '#0077b6';
      ctx.fillRect(x, y + h * 0.64, w, h * 0.36);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      for (let c = 1; c <= 3; c++) {
        ctx.beginPath();
        ctx.moveTo(x + w * 0.44, y + h * 0.12);
        ctx.lineTo(x + w * (0.44 + c * 0.14), y + h * 0.64);
        ctx.moveTo(x + w * 0.44, y + h * 0.12);
        ctx.lineTo(x + w * (0.44 - c * 0.11), y + h * 0.64);
        ctx.stroke();
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + w * 0.41, y + h * 0.08, w * 0.06, h * 0.66);
      ctx.fillRect(x + w * 0.06, y + h * 0.62, w * 0.88, h * 0.07);
      ctx.strokeStyle = '#111111';
      ctx.strokeRect(x + w * 0.06, y + h * 0.62, w * 0.88, h * 0.07);
    } else if (stageId === 'lotuspond') {
      // 【高雄左營蓮池潭龍虎雙塔實景】碧綠蓮池潭水與白色九曲橋 + 左右對稱七層黃牆紅簷雙塔与青龍猛虎
      ctx.fillStyle = '#0097e6';
      ctx.fillRect(x, y + h * 0.64, w, h * 0.36);
      [0.26, 0.74].forEach((tx) => {
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(x + w * tx - w * 0.08, y + h * 0.14, w * 0.16, h * 0.56);
        ctx.strokeRect(x + w * tx - w * 0.08, y + h * 0.14, w * 0.16, h * 0.56);
        ctx.fillStyle = '#c0392b';
        for (let r = 0; r < 4; r++) {
          ctx.fillRect(x + w * tx - w * 0.11, y + h * (0.16 + r * 0.13), w * 0.22, h * 0.05);
        }
      });
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(x + w * 0.14, y + h * 0.56, w * 0.22, h * 0.14);
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(x + w * 0.64, y + h * 0.56, w * 0.22, h * 0.14);
    } else if (stageId === 'qigu') {
      // 【台南七股鹽山與黑面琵鷺實景】粉橘夕陽滷水鹽田倒影 + 高聳雪白七股鹽山金字塔
      ctx.fillStyle = '#e17055';
      ctx.fillRect(x, y + h * 0.64, w, h * 0.36);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.12, y + h * 0.78);
      ctx.lineTo(x + w * 0.52, y + h * 0.12);
      ctx.lineTo(x + w * 0.88, y + h * 0.78);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#dfe6e9';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.52, y + h * 0.12);
      ctx.lineTo(x + w * 0.88, y + h * 0.78);
      ctx.lineTo(x + w * 0.56, y + h * 0.78);
      ctx.closePath();
      ctx.fill();
    } else if (stageId === 'npmsouth') {
      // 【嘉義故宮南院與至美橋實景】墨韻流線型黑色玻璃帷幕主館 + 跨湖鮮紅雙弧「至美橋」
      ctx.fillStyle = '#0077b6';
      ctx.fillRect(x, y + h * 0.62, w, h * 0.38);
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.12, y + h * 0.64);
      ctx.quadraticCurveTo(x + w * 0.46, y + h * 0.14, x + w * 0.86, y + h * 0.64);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#ff3838';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.arc(x + w * 0.50, y + h * 0.82, w * 0.36, Math.PI, 0);
      ctx.stroke();
      ctx.strokeStyle = '#111111';
    } else if (stageId === 'beigang') {
      // 【雲林北港朝天宮與西螺紅橋實景】左側金瓦飛簷朝天宮媽祖廟 + 右側鮮紅鋼鐵桁架西螺大橋
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(x + w * 0.06, y + h * 0.38, w * 0.40, h * 0.52);
      ctx.strokeRect(x + w * 0.06, y + h * 0.38, w * 0.40, h * 0.52);
      ctx.fillStyle = '#ffd32a';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.02, y + h * 0.40);
      ctx.lineTo(x + w * 0.26, y + h * 0.14);
      ctx.lineTo(x + w * 0.50, y + h * 0.40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 右側西螺紅橋桁架
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 2.2;
      ctx.strokeRect(x + w * 0.52, y + h * 0.36, w * 0.44, h * 0.38);
      ctx.beginPath();
      ctx.moveTo(x + w * 0.52, y + h * 0.74);
      ctx.lineTo(x + w * 0.74, y + h * 0.36);
      ctx.lineTo(x + w * 0.96, y + h * 0.74);
      ctx.stroke();
      ctx.strokeStyle = '#111111';
    } else if (stageId === 'tainan' || stageId === 'end_chihkan') {
      // 【台南安平古堡・赤嵌樓・林百貨實景】左側安平古堡紅磚城垛與紅頂白塔 + 右側1932林百貨五層昭和大樓
      ctx.fillStyle = '#b03a2e';
      ctx.fillRect(x + w * 0.06, y + h * 0.48, w * 0.42, h * 0.46);
      ctx.strokeRect(x + w * 0.06, y + h * 0.48, w * 0.42, h * 0.46);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + w * 0.20, y + h * 0.18, w * 0.14, h * 0.32);
      ctx.strokeRect(x + w * 0.20, y + h * 0.18, w * 0.14, h * 0.32);
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.16, y + h * 0.20);
      ctx.lineTo(x + w * 0.27, y + h * 0.08);
      ctx.lineTo(x + w * 0.38, y + h * 0.20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 右側林百貨五層黃褐溝面磚洋樓
      ctx.fillStyle = '#c89d66';
      ctx.fillRect(x + w * 0.56, y + h * 0.22, w * 0.36, h * 0.72);
      ctx.strokeRect(x + w * 0.56, y + h * 0.22, w * 0.36, h * 0.72);
    } else if (stageId === 'foguangshan') {
      // 【高雄佛光山大佛與八寶塔實景】萬丈金色佛光 + 中央 108m 佛光大佛 + 左右對稱中國式寶塔
      ctx.fillStyle = 'rgba(255, 242, 0, 0.38)';
      ctx.beginPath();
      ctx.arc(x + w * 0.50, y + h * 0.36, h * 0.36, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd32a';
      ctx.beginPath();
      ctx.arc(x + w * 0.50, y + h * 0.24, h * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillRect(x + w * 0.38, y + h * 0.38, w * 0.24, h * 0.50);
      ctx.strokeRect(x + w * 0.38, y + h * 0.38, w * 0.24, h * 0.50);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(x + w * 0.10, y + h * 0.28, w * 0.14, h * 0.62);
      ctx.strokeRect(x + w * 0.10, y + h * 0.28, w * 0.14, h * 0.62);
      ctx.fillRect(x + w * 0.76, y + h * 0.28, w * 0.14, h * 0.62);
      ctx.strokeRect(x + w * 0.76, y + h * 0.28, w * 0.14, h * 0.62);
    } else if (stageId === 'matsu') {
      // 【馬祖芹壁石頭屋與藍眼淚實景】深藍夜海發光螢光藍眼淚 + 依山勢排列的花崗岩閩東印章石屋
      ctx.fillStyle = '#040b1e';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#95a5a6';
      ctx.fillRect(x + w * 0.12, y + h * 0.28, w * 0.32, h * 0.34);
      ctx.strokeRect(x + w * 0.12, y + h * 0.28, w * 0.32, h * 0.34);
      ctx.fillRect(x + w * 0.48, y + h * 0.36, w * 0.30, h * 0.30);
      ctx.strokeRect(x + w * 0.48, y + h * 0.36, w * 0.30, h * 0.30);
      // 螢光藍眼淚海浪
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(x + w * 0.08, y + h * 0.70, w * 0.84, h * 0.08);
      ctx.fillRect(x + w * 0.20, y + h * 0.84, w * 0.72, h * 0.07);
    } else if (stageId === 'qimei') {
      // 【澎湖七美雙心石滬實景】翡翠珊瑚淺海 + 玄武岩堆砌的浪漫「雙心石滬」完整雙心造型
      ctx.fillStyle = '#0077b6';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#ecf0f1';
      ctx.lineWidth = 2.6;
      [
        { cx: x + w * 0.42, cy: y + h * 0.46, r: w * 0.18 },
        { cx: x + w * 0.58, cy: y + h * 0.56, r: w * 0.18 }
      ].forEach((ht) => {
        ctx.beginPath();
        ctx.moveTo(ht.cx, ht.cy + ht.r * 0.9);
        ctx.lineTo(ht.cx - ht.r, ht.cy - ht.r * 0.2);
        ctx.arc(ht.cx - ht.r * 0.5, ht.cy - ht.r * 0.2, ht.r * 0.5, Math.PI, 0);
        ctx.arc(ht.cx + ht.r * 0.5, ht.cy - ht.r * 0.2, ht.r * 0.5, Math.PI, 0);
        ctx.closePath();
        ctx.stroke();
      });
    } else if (stageId === 'liuqiu') {
      // 【屏東小琉球花瓶岩實景】清澈蒂芬妮藍珊瑚海 + 上寬下窄頭長翠綠植物的海蝕「花瓶岩」
      ctx.fillStyle = '#00a8e8';
      ctx.fillRect(x, y + h * 0.58, w, h * 0.42);
      ctx.fillStyle = '#c29b53';
      ctx.fillRect(x + w * 0.44, y + h * 0.44, w * 0.12, h * 0.34);
      ctx.strokeRect(x + w * 0.44, y + h * 0.44, w * 0.12, h * 0.34);
      ctx.beginPath();
      ctx.ellipse(x + w * 0.50, y + h * 0.34, w * 0.20, h * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.arc(x + w * 0.50, y + h * 0.20, w * 0.16, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
    } else if (stageId === 'kenting_st') {
      // 【屏東墾丁大街與大尖山實景】紫紅熱帶晚霞 + 墾丁牧場大尖山尖峰 + 兩側搖曳椰子樹與霓虹招牌
      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.24, y + h * 0.76);
      ctx.lineTo(x + w * 0.50, y + h * 0.14);
      ctx.lineTo(x + w * 0.76, y + h * 0.76);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(x + w * 0.08, y + h * 0.40, w * 0.24, h * 0.48);
      ctx.strokeRect(x + w * 0.08, y + h * 0.40, w * 0.24, h * 0.48);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(x + w * 0.68, y + h * 0.44, w * 0.24, h * 0.44);
      ctx.strokeRect(x + w * 0.68, y + h * 0.44, w * 0.24, h * 0.44);
    } else if (stageId === 'longpan') {
      // 【墾丁龍磐公園崩崖實景】壯闊太平洋弧形白浪海岸 + 紅土石灰岩崩崖與翠綠大草原木棧道
      ctx.fillStyle = '#0052a5';
      ctx.fillRect(x + w * 0.36, y + h * 0.48, w * 0.64, h * 0.52);
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.moveTo(x, y + h * 0.36);
      ctx.lineTo(x + w * 0.62, y + h * 0.56);
      ctx.lineTo(x + w * 0.44, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.moveTo(x, y + h * 0.34);
      ctx.lineTo(x + w * 0.58, y + h * 0.52);
      ctx.lineTo(x, y + h * 0.72);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // 【鵝鑾鼻武裝燈塔與南國椰林海岸實景】巴士海峽碧海 + 翠綠椰林草原 + 純白圓柱燈塔與旋轉金色光束
      ctx.fillStyle = '#0077b6';
      ctx.fillRect(x, y + h * 0.54, w, h * 0.46);
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(x, y + h * 0.68, w, h * 0.32);
      ctx.fillStyle = 'rgba(255, 242, 0, 0.42)';
      ctx.beginPath();
      ctx.moveTo(x + w * 0.58, y + h * 0.22);
      ctx.lineTo(x, y + h * 0.04);
      ctx.lineTo(x, y + h * 0.36);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + w * 0.50, y + h * 0.20, w * 0.16, h * 0.64);
      ctx.strokeRect(x + w * 0.50, y + h * 0.20, w * 0.16, h * 0.64);
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(x + w * 0.58, y + h * 0.20, w * 0.10, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
    }

    // 《合金彈頭》街機像素掃描線質感與雙層邊框
    ctx.fillStyle = 'rgba(0, 0, 0, 0.10)';
    for (let sy = y; sy < y + h; sy += 3) {
      ctx.fillRect(x, sy, w, 1);
    }
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    ctx.restore();
  }

  /**
   * 繪製沿途依序展現的《合金彈頭》風格街景建築與地質奇觀 (`STREET_*` 與 `PROP_*`，拉到最近時高度佔畫面 75% ≈ 300px)
   */
  drawSequentialStreetProp(ctx, sp, screenX, screenY, w, h) {
    const pw = Math.min(290, Math.max(3, Math.floor(w * 1.15)));
    const ph = Math.min(330, Math.max(4, Math.floor(h * 1.15)));
    const px = Math.floor(screenX - pw / 2);
    const py = Math.floor(screenY - ph);
    const type = sp.type;

    ctx.lineWidth = Math.max(1.5, pw * 0.025);
    ctx.strokeStyle = '#111111';
    let label = '';

    if (type === 'STREET_FUGANG_PLAZA') {
      // 【富岡街景 1：富岡車站站前廣場、海線平交道號誌桿與客家紅燈籠】
      label = '🚉 富岡站前廣場';
      // 平交道黑白條紋號誌桿与閃爍紅燈
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + pw * 0.44, py + ph * 0.15, pw * 0.12, ph * 0.85);
      ctx.strokeRect(px + pw * 0.44, py + ph * 0.15, pw * 0.12, ph * 0.85);
      ctx.fillStyle = '#ffd32a';
      for (let s = 0; s < 4; s++) {
        ctx.fillRect(px + pw * 0.44, py + ph * (0.25 + s * 0.18), pw * 0.12, ph * 0.08);
      }
      // 平交道交叉牌与閃爍雙紅燈
      const flash = Math.floor(performance.now() / 180) % 2 === 0;
      ctx.fillStyle = '#111111';
      ctx.fillRect(px + pw * 0.24, py + ph * 0.22, pw * 0.52, ph * 0.14);
      ctx.fillStyle = flash ? '#ff1e1e' : '#5c0000';
      ctx.beginPath();
      ctx.arc(px + pw * 0.35, py + ph * 0.29, pw * 0.07, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = !flash ? '#ff1e1e' : '#5c0000';
      ctx.beginPath();
      ctx.arc(px + pw * 0.65, py + ph * 0.29, pw * 0.07, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'STREET_FUGANG_LYU_MANSION') {
      // 【富岡街景 2：中正路「呂家聲洋樓」（1929 昭和巴洛克五開間洋樓、拜占庭半圓穹頂「鑊嫲篤」、希臘三角山牆、羅馬雙柱）】
      label = '🏛️ 富岡・呂家聲洋樓';
      // 紅磚與洗石子二層洋樓主體
      ctx.fillStyle = '#a04000';
      ctx.fillRect(px + pw * 0.06, py + ph * 0.32, pw * 0.88, ph * 0.68);
      ctx.strokeRect(px + pw * 0.06, py + ph * 0.32, pw * 0.88, ph * 0.68);

      // 正中央拜占庭式半圓形穹頂（客家話「鑊嫲篤」鍋蓋頂！）
      ctx.fillStyle = '#7f8c8d';
      ctx.beginPath();
      ctx.arc(screenX, py + ph * 0.24, pw * 0.24, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 希臘三角形巴洛克山牆與勳章浮雕
      ctx.fillStyle = '#d5dbdb';
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.16, py + ph * 0.32);
      ctx.lineTo(screenX, py + ph * 0.14);
      ctx.lineTo(px + pw * 0.84, py + ph * 0.32);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffd32a';
      ctx.beginPath();
      ctx.arc(screenX, py + ph * 0.25, pw * 0.06, 0, Math.PI * 2);
      ctx.fill();

      // 二樓羅馬雙柱列柱與拱窗
      ctx.fillStyle = '#ecf0f1';
      [0.14, 0.24, 0.72, 0.82].forEach((cx) => {
        ctx.fillRect(px + pw * cx, py + ph * 0.34, pw * 0.05, ph * 0.28);
      });
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(px + pw * 0.36, py + ph * 0.38, pw * 0.28, ph * 0.22);

      // 一樓紅磚拱廊（亭仔腳）三拱門
      ctx.fillStyle = '#1e272e';
      [-0.26, 0, 0.26].forEach((ox) => {
        ctx.beginPath();
        ctx.arc(screenX + pw * ox, py + ph * 0.78, pw * 0.10, Math.PI, 0);
        ctx.lineTo(screenX + pw * (ox + 0.10), py + ph);
        ctx.lineTo(screenX + pw * (ox - 0.10), py + ph);
        ctx.closePath();
        ctx.fill();
      });
    } else if (type === 'STREET_FUGANG_ARCADE' || type === 'PROP_LUKANG_OLD_ARCADE' || type === 'PROP_TOUCHENG_ARCADE') {
      // 【富岡街景 3 / 鹿港 / 頭城：昭和紅磚拱廊街屋（亭仔腳）、永昌碾米廠磚塔與紅燈籠】
      label = type === 'STREET_FUGANG_ARCADE' ? '🏮 富岡信義街紅磚拱廊' : '🏮 古鎮紅磚拱廊老街';
      ctx.fillStyle = '#b03a2e';
      ctx.fillRect(px + pw * 0.10, py + ph * 0.26, pw * 0.80, ph * 0.74);
      ctx.strokeRect(px + pw * 0.10, py + ph * 0.26, pw * 0.80, ph * 0.74);
      ctx.fillStyle = '#d5dbdb';
      ctx.fillRect(px + pw * 0.08, py + ph * 0.20, pw * 0.84, ph * 0.08);
      ctx.strokeRect(px + pw * 0.08, py + ph * 0.20, pw * 0.84, ph * 0.08);
      // 拱門與紅燈籠
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.arc(screenX, py + ph * 0.74, pw * 0.20, Math.PI, 0);
      ctx.lineTo(screenX + pw * 0.20, py + ph);
      ctx.lineTo(screenX - pw * 0.20, py + ph);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ff1e1e';
      ctx.fillRect(screenX - pw * 0.07, py + ph * 0.56, pw * 0.14, ph * 0.14);
    } else if (type === 'PROP_QUEEN_HEAD' || type === 'PROP_FAIRY_SHOE' || type === 'PROP_CANDLE_ROCK' || type === 'PROP_VASE_CORAL_ROCK') {
      // 【野柳女王頭 / 仙女鞋 / 燭臺石 / 小琉球花瓶岩】
      label = type === 'PROP_QUEEN_HEAD' ? '👑 野柳女王頭' : (type === 'PROP_VASE_CORAL_ROCK' ? '🌿 小琉球花瓶岩' : '🪨 海蝕奇岩地景');
      ctx.fillStyle = '#d1b26f';
      ctx.beginPath();
      ctx.ellipse(screenX, py + ph * 0.34, pw * 0.28, ph * 0.24, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#b89856';
      ctx.fillRect(screenX - pw * 0.10, py + ph * 0.52, pw * 0.20, ph * 0.26);
      ctx.fillRect(screenX - pw * 0.30, py + ph * 0.76, pw * 0.60, ph * 0.24);
      ctx.strokeRect(screenX - pw * 0.30, py + ph * 0.76, pw * 0.60, ph * 0.24);
      if (type === 'PROP_VASE_CORAL_ROCK') {
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.arc(screenX, py + ph * 0.16, pw * 0.24, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'PROP_SULFUR_VENT' || type === 'PROP_SILVERGRASS_WAVE') {
      // 【陽明山小油坑硫磺噴氣口與芒草浪】
      label = type === 'PROP_SULFUR_VENT' ? '🌋 硫磺噴氣孔' : '🌾 金黃芒草浪';
      ctx.fillStyle = '#576574';
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.1, screenY);
      ctx.lineTo(screenX, py + ph * 0.42);
      ctx.lineTo(px + pw * 0.9, screenY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(screenX - pw * 0.16, py + ph * 0.50, pw * 0.32, ph * 0.22);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      const lift = (performance.now() * 0.04) % (ph * 0.32);
      ctx.beginPath();
      ctx.arc(screenX, py + ph * 0.40 - lift, pw * 0.18, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'PROP_WIND_TURBINE') {
      // 【高美濕地巨型白色風力發電機】
      label = '🌬️ 高美風力發電機';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(screenX - pw * 0.05, py + ph * 0.22, pw * 0.10, ph * 0.78);
      ctx.strokeRect(screenX - pw * 0.05, py + ph * 0.22, pw * 0.10, ph * 0.78);
      const ang = performance.now() * 0.0035;
      for (let b = 0; b < 3; b++) {
        const a = ang + (b * Math.PI * 2) / 3;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, pw * 0.05);
        ctx.beginPath();
        ctx.moveTo(screenX, py + ph * 0.22);
        ctx.lineTo(screenX + Math.cos(a) * pw * 0.44, py + ph * 0.22 + Math.sin(a) * pw * 0.44);
        ctx.stroke();
      }
    } else if (type === 'PROP_WULING_3275_SIGN') {
      // 【合歡山武嶺 3275 公尺標誌亭台】
      label = '⛰️ 武嶺 3275M 標誌';
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(px + pw * 0.18, py + ph * 0.52, pw * 0.64, ph * 0.48);
      ctx.strokeRect(px + pw * 0.18, py + ph * 0.52, pw * 0.64, ph * 0.48);
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(screenX - pw * 0.16, py + ph * 0.14, pw * 0.32, ph * 0.42);
      ctx.strokeRect(screenX - pw * 0.16, py + ph * 0.14, pw * 0.32, ph * 0.42);
      if (pw > 28) {
        this.drawArcadeText(ctx, '武嶺3275m', screenX, py + ph * 0.36, `900 ${Math.max(8, Math.floor(pw * 0.11))}px sans-serif`, '#ffd32a', 'center', 1);
      }
    } else if (type === 'PROP_SHEEP_CASTLE' || type === 'PROP_TUDOR_MANOR' || type === 'PROP_GRAZING_SHEEP') {
      // 【清境農場綿羊城堡與漫步綿羊群】
      label = type === 'PROP_GRAZING_SHEEP' ? '🐑 青青草原綿羊群' : '🏰 清境綿羊城堡';
      if (type === 'PROP_GRAZING_SHEEP') {
        ctx.fillStyle = '#ffffff';
        [-0.22, 0.18].forEach((ox) => {
          ctx.beginPath();
          ctx.arc(screenX + pw * ox, screenY - ph * 0.22, pw * 0.18, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#2d3436';
          ctx.fillRect(screenX + pw * (ox + 0.10), screenY - ph * 0.28, pw * 0.10, ph * 0.10);
          ctx.fillStyle = '#ffffff';
        });
      } else {
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(px + pw * 0.16, py + ph * 0.34, pw * 0.68, ph * 0.66);
        ctx.strokeRect(px + pw * 0.16, py + ph * 0.34, pw * 0.68, ph * 0.66);
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.moveTo(px + pw * 0.10, py + ph * 0.34);
        ctx.lineTo(screenX, py + ph * 0.08);
        ctx.lineTo(px + pw * 0.90, py + ph * 0.34);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (type === 'PROP_PINK_SUPERCAR_PALANQUIN' || type === 'PROP_PILGRIM_FLAG_SEA') {
      // 【白沙屯沿途街景：粉紅超跑媽祖神轎 & 橘帽香燈腳旗海】
      label = type === 'PROP_PINK_SUPERCAR_PALANQUIN' ? '🌸 白沙屯粉紅超跑神轎' : '🚩 橘帽香燈腳旗海';
      // 粉紅車頂神轎與金色轎身
      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(px + pw * 0.20, py + ph * 0.36, pw * 0.60, ph * 0.46);
      ctx.strokeRect(px + pw * 0.20, py + ph * 0.36, pw * 0.60, ph * 0.46);
      ctx.fillStyle = '#ff6b81';
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.14, py + ph * 0.38);
      ctx.lineTo(screenX, py + ph * 0.14);
      ctx.lineTo(px + pw * 0.86, py + ph * 0.38);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 橘帽香燈腳信眾
      ctx.fillStyle = '#ff7f50';
      ctx.fillRect(px + pw * 0.08, py + ph * 0.58, pw * 0.14, ph * 0.10);
      ctx.fillRect(px + pw * 0.78, py + ph * 0.58, pw * 0.14, ph * 0.10);
    } else if (type === 'PROP_GIANT_GOLDEN_BUDDHA' || type === 'PROP_EIGHT_PAGODAS') {
      // 【佛光山 108 公尺金色佛光大佛與八寶塔】
      label = type === 'PROP_GIANT_GOLDEN_BUDDHA' ? '🙏 108m 佛光大佛' : '🏯 成佛大道八寶塔';
      ctx.fillStyle = '#ffd32a';
      ctx.beginPath();
      ctx.arc(screenX, py + ph * 0.22, pw * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillRect(px + pw * 0.24, py + ph * 0.36, pw * 0.52, ph * 0.64);
      ctx.strokeRect(px + pw * 0.24, py + ph * 0.36, pw * 0.52, ph * 0.64);
    } else if (type === 'PROP_TAKESHI_TREE' || type === 'PROP_GOLDEN_RICE_WAVE') {
      // 【池上伯朗大道金城武樹與奉茶亭】
      label = '🌳 池上金城武樹';
      ctx.fillStyle = '#5c2e14';
      ctx.fillRect(screenX - pw * 0.08, py + ph * 0.48, pw * 0.16, ph * 0.52);
      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.arc(screenX, py + ph * 0.34, pw * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // 通用經典古蹟樓閣 / 牌坊 / 燈塔 / 自然步道景觀
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(px + pw * 0.18, py + ph * 0.34, pw * 0.64, ph * 0.66);
      ctx.strokeRect(px + pw * 0.18, py + ph * 0.34, pw * 0.64, ph * 0.66);
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.08, py + ph * 0.36);
      ctx.lineTo(screenX, py + ph * 0.14);
      ctx.lineTo(px + pw * 0.92, py + ph * 0.36);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    if (label && pw > 34) {
      this.drawArcadeText(
        ctx,
        label,
        screenX,
        screenY + Math.max(12, Math.floor(ph * 0.10)),
        `900 ${Math.max(8, Math.floor(pw * 0.105))}px sans-serif`,
        '#ffffff',
        'center',
        2
      );
    }
  }

  /**
   * 繪製終點大道兩旁熱情揮旗、跳躍歡呼的《合金彈頭》Q版群眾 (`CHEER_CROWD`)
   */
  drawCheeringCrowdSprite(ctx, sp, screenX, screenY, w, h) {
    const cw = Math.floor(w * 1.15);
    const ch = Math.floor(h * 0.82);
    const cx = Math.floor(screenX - cw / 2);
    const cy = Math.floor(screenY - ch);
    const time = performance.now() * 0.014;

    const shirtColors = ['#ff3838', '#00f0ff', '#ffd32a', '#2ed573'];
    for (let p = 0; p < 3; p++) {
      const hop = Math.abs(Math.sin(time + p * 1.7 + (sp.variant || 0))) * (ch * 0.18);
      const px = cx + p * (cw * 0.32);
      const py = cy + ch * 0.30 - hop;
      const pw = cw * 0.28;
      const ph = ch * 0.70;

      // 身體與高舉雙手
      ctx.fillStyle = shirtColors[(p + (sp.variant || 0)) % shirtColors.length];
      ctx.fillRect(px, py + ph * 0.32, pw, ph * 0.68);
      ctx.strokeStyle = '#111';
      ctx.lineWidth = Math.max(1, pw * 0.08);
      ctx.strokeRect(px, py + ph * 0.32, pw, ph * 0.68);

      // 頭部與歡呼張嘴
      ctx.fillStyle = '#f5cba7';
      ctx.fillRect(px + pw * 0.12, py, pw * 0.76, ph * 0.32);
      ctx.strokeRect(px + pw * 0.12, py, pw * 0.76, ph * 0.32);

      // 揮舞應援旗幟
      if (p === 1) {
        const waveX = Math.sin(time * 1.5) * (pw * 0.35);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(px + pw * 0.5 + waveX, py - ph * 0.38, pw * 0.95, ph * 0.26);
        ctx.strokeRect(px + pw * 0.5 + waveX, py - ph * 0.38, pw * 0.95, ph * 0.26);
      }
    }

    if (w > 26) {
      this.drawArcadeText(
        ctx,
        '🎉 歡呼！！',
        screenX,
        screenY + Math.max(11, Math.floor(ch * 0.12)),
        `900 ${Math.max(9, Math.floor(w * 0.15))}px sans-serif`,
        '#ffffff',
        'center',
        2
      );
    }
  }

  /**
   * 繪製 8 大終點正中央的《合金彈頭》巨型主建築地標 (`FINALE_MONUMENT`)
   * 矗立於道路盡頭正中央（screenX 為道路正中心），旁邊群眾夾道歡呼！
   */
  drawFinaleMonumentSprite(ctx, sp, screenX, screenY, w, h, roadHalfWidth) {
    const mw = Math.min(360, Math.max(w * 2.6, Math.min(320, roadHalfWidth * 1.45)));
    const mh = Math.min(240, Math.max(h * 1.8, mw * 0.68));
    const mx = Math.floor(screenX - mw / 2);
    const my = Math.floor(screenY - mh);
    const id = sp.monumentId || 'MONUMENT_BAISHATUN';

    ctx.lineWidth = Math.max(2, mw * 0.012);
    ctx.strokeStyle = '#111111';

    if (id === 'MONUMENT_BAISHATUN' || id === 'MONUMENT_LUKANG') {
      const isBaishatun = id === 'MONUMENT_BAISHATUN';
      ctx.fillStyle = '#b03a2e';
      ctx.fillRect(mx + mw * 0.10, my + mh * 0.38, mw * 0.80, mh * 0.62);
      ctx.strokeRect(mx + mw * 0.10, my + mh * 0.38, mw * 0.80, mh * 0.62);

      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.moveTo(mx, my + mh * 0.42);
      ctx.lineTo(screenX, my + mh * 0.12);
      ctx.lineTo(mx + mw, my + mh * 0.42);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(screenX, my + mh * 0.10, mw * 0.045, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1e272e';
      ctx.fillRect(screenX - mw * 0.16, my + mh * 0.56, mw * 0.32, mh * 0.44);
      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(screenX - mw * 0.22, my + mh * 0.40, mw * 0.44, mh * 0.12);
      ctx.strokeRect(screenX - mw * 0.22, my + mh * 0.40, mw * 0.44, mh * 0.12);

      if (mw > 60) {
        this.drawArcadeText(
          ctx,
          isBaishatun ? '🏮 白沙屯拱天宮 🏮' : '🏮 鹿港天后宮 🏮',
          screenX,
          my + mh * 0.49,
          `900 ${Math.max(11, Math.floor(mw * 0.065))}px sans-serif`,
          '#c0392b',
          'center',
          1
        );
      }
    } else if (id === 'MONUMENT_CHIHKAN') {
      ctx.fillStyle = '#a04000';
      ctx.fillRect(mx + mw * 0.08, my + mh * 0.52, mw * 0.84, mh * 0.48);
      ctx.strokeRect(mx + mw * 0.08, my + mh * 0.52, mw * 0.84, mh * 0.48);
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(mx + mw * 0.22, my + mh * 0.26, mw * 0.56, mh * 0.28);
      ctx.strokeRect(mx + mw * 0.22, my + mh * 0.26, mw * 0.56, mh * 0.28);
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.moveTo(mx + mw * 0.14, my + mh * 0.28);
      ctx.lineTo(screenX, my + mh * 0.08);
      ctx.lineTo(mx + mw * 0.86, my + mh * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#7f8c8d';
      for (let t = -2; t <= 2; t++) {
        ctx.fillRect(screenX + t * (mw * 0.11) - mw * 0.03, my + mh * 0.72, mw * 0.06, mh * 0.24);
      }
    } else if (id === 'MONUMENT_ELUANBI') {
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(mx + mw * 0.14, my + mh * 0.68, mw * 0.72, mh * 0.32);
      ctx.strokeRect(mx + mw * 0.14, my + mh * 0.68, mw * 0.72, mh * 0.32);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(screenX - mw * 0.12, my + mh * 0.16, mw * 0.24, mh * 0.64);
      ctx.strokeRect(screenX - mw * 0.12, my + mh * 0.16, mw * 0.24, mh * 0.64);
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(screenX, my + mh * 0.16, mw * 0.14, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 242, 0, 0.45)';
      ctx.beginPath();
      ctx.moveTo(screenX, my + mh * 0.18);
      ctx.lineTo(mx, my);
      ctx.lineTo(mx + mw, my);
      ctx.closePath();
      ctx.fill();
    } else if (id === 'MONUMENT_SANXIANTAI') {
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.arc(screenX, screenY, mw * 0.28, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(4, mw * 0.025);
      for (let a = -3; a <= 3; a++) {
        ctx.beginPath();
        ctx.arc(screenX + a * (mw * 0.11), screenY - mh * 0.24, mw * 0.06, Math.PI, 0);
        ctx.stroke();
      }
    } else if (id === 'MONUMENT_TAROKO_ARCH') {
      ctx.fillStyle = '#c0392b';
      [-0.38, -0.16, 0.16, 0.38].forEach((ox) => {
        ctx.fillRect(screenX + mw * ox - mw * 0.03, my + mh * 0.24, mw * 0.06, mh * 0.76);
        ctx.strokeRect(screenX + mw * ox - mw * 0.03, my + mh * 0.24, mw * 0.06, mh * 0.76);
      });
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(mx + mw * 0.06, my + mh * 0.16, mw * 0.88, mh * 0.14);
      ctx.strokeRect(mx + mw * 0.06, my + mh * 0.16, mw * 0.88, mh * 0.14);
      if (mw > 60) {
        this.drawArcadeText(ctx, '東西橫貫公路・太魯閣', screenX, my + mh * 0.26, `900 ${Math.max(10, Math.floor(mw * 0.055))}px serif`, '#b31217', 'center', 1);
      }
    } else if (id === 'MONUMENT_LANYANG_MUSEUM') {
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.moveTo(mx + mw * 0.08, screenY);
      ctx.lineTo(screenX + mw * 0.10, my + mh * 0.08);
      ctx.lineTo(mx + mw * 0.88, screenY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.moveTo(screenX - mw * 0.08, screenY);
      ctx.lineTo(screenX + mw * 0.10, my + mh * 0.12);
      ctx.lineTo(screenX + mw * 0.28, screenY);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(10, mw * 0.065);
      ctx.beginPath();
      ctx.arc(screenX, screenY, mw * 0.38, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(screenX - mw * 0.24, my + mh * 0.18, mw * 0.48, mh * 0.14);
      ctx.strokeRect(screenX - mw * 0.24, my + mh * 0.18, mw * 0.48, mh * 0.14);
      if (mw > 60) {
        this.drawArcadeText(ctx, '澎湖跨海大橋', screenX, my + mh * 0.28, `900 ${Math.max(11, Math.floor(mw * 0.06))}px serif`, '#e74c3c', 'center', 1);
      }
    }

    if (mw > 50) {
      this.drawArcadeText(
        ctx,
        `🏆 終點地標：${sp.spotName || '台灣終點'} 🏆`,
        screenX,
        screenY + Math.max(14, Math.floor(mh * 0.10)),
        `900 ${Math.max(12, Math.floor(mw * 0.06))}px sans-serif`,
        '#ffffff',
        'center',
        2
      );
    }
  }

  /**
   * 繪製全關卡沿途 6 段式真實台灣地標與左右街景 (`SUBSPOT_SCENERY`)：
   * 1. 依透視比例由遠到近平滑放大（移除過早的尺寸上限，讓遠方微小輪廓自然逼近放大至近景）。
   * 2. 參考台灣真實景點構圖細膩重繪：安平古堡階梯紅磚城台與白色瞭望塔、台南林百貨五層樓昭和摩登大樓與頂樓鳥居、
   *    赤嵌樓/迎曦門重簷歇山古樓閣、淡水紅毛城、蘭陽博物館單面山、故宮南院、蓮池潭龍虎雙塔、西螺紅橋、三義龍騰斷橋、
   *    多良臨海紅欄杆月台、七股鹽山、武嶺3275m標誌、巴洛克洋樓、紅磚拱廊亭仔腳與夜市名店攤車。
   * 3. 旁邊街景介紹統一「白字、黑框、無黑色長方形底框」，全部移至該物體正下方，畫面清爽通透！
   */
  drawSubSpotScenerySprite(ctx, sp, screenX, screenY, w, h) {
    const sub = sp.subSpot || { kind: 'PAIFANG', title: '台灣景點', sign: '特色街景', color: '#c0392b', accent: '#ffd32a' };
    // 拉到最近時，兩邊景物高度可佔整個畫面高度 (400px) 的 75% (約 300px)
    const mult = sp.isBackdrop ? 1.05 : 1.15;
    const pw = Math.min(290, Math.max(3, Math.floor(w * mult)));
    const ph = Math.min(330, Math.max(4, Math.floor(h * mult)));
    const px = Math.floor(screenX - pw / 2);
    const py = Math.floor(screenY - ph);
    const kind = sub.kind || 'PAIFANG';
    const textInfo = `${sub.title || ''} ${sub.sign || ''}`;
    const stageId = sp.stageId || (sub && sub.stageId) || '';
    const mainCol = sub.color || '#c0392b';
    const accCol = sub.accent || '#ffd32a';
    const time = performance.now() * 0.004;

    // 地面立體投影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(screenX, screenY - 2, pw * 0.46, Math.max(3, ph * 0.055), 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = Math.max(1.2, pw * 0.018);
    ctx.strokeStyle = '#111111';

    // ================= 優先針對台灣代表性真實地標建築進行 1:1 考究像素繪製 =================
    if (textInfo.includes('安平古堡') || textInfo.includes('熱蘭遮城') || textInfo.includes('普羅民遮')) {
      // 【台南安平古堡（熱蘭遮城）真實構圖】三層紅磚階梯城基與雉堞女牆 + 古砲 + 中央高聳純白方圓瞭望塔與紅頂！
      // 第一層紅磚大城基
      ctx.fillStyle = '#8e281c';
      ctx.fillRect(px + pw * 0.04, py + ph * 0.74, pw * 0.92, ph * 0.26);
      ctx.strokeRect(px + pw * 0.04, py + ph * 0.74, pw * 0.92, ph * 0.26);
      // 第二層紅磚階梯平台与拱門
      ctx.fillStyle = '#b03a2e';
      ctx.fillRect(px + pw * 0.14, py + ph * 0.56, pw * 0.72, ph * 0.18);
      ctx.strokeRect(px + pw * 0.14, py + ph * 0.56, pw * 0.72, ph * 0.18);
      // 第三層紅磚雉堞女牆與石階
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(px + pw * 0.22, py + ph * 0.44, pw * 0.56, ph * 0.12);
      ctx.strokeRect(px + pw * 0.22, py + ph * 0.44, pw * 0.56, ph * 0.12);
      // 紅磚水平磚縫紋理與中央石階
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(screenX - pw * 0.10, py + ph * 0.56, pw * 0.20, ph * 0.44);
      ctx.strokeRect(screenX - pw * 0.10, py + ph * 0.56, pw * 0.20, ph * 0.44);
      // 城牆上方白色/紅磚雉堞與清代古砲
      ctx.fillStyle = '#ecf0f1';
      for (let m = 0; m < 5; m++) {
        ctx.fillRect(px + pw * (0.16 + m * 0.15), py + ph * 0.52, pw * 0.08, ph * 0.04);
      }
      // 中央純白高聳安平古堡瞭望塔 + 觀景窗 + 紅色尖頂
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(screenX - pw * 0.12, py + ph * 0.10, pw * 0.24, ph * 0.36);
      ctx.strokeRect(screenX - pw * 0.12, py + ph * 0.10, pw * 0.24, ph * 0.36);
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(screenX - pw * 0.09, py + ph * 0.15, pw * 0.18, ph * 0.07);
      ctx.fillRect(screenX - pw * 0.05, py + ph * 0.27, pw * 0.10, ph * 0.06);
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.moveTo(screenX - pw * 0.16, py + ph * 0.11);
      ctx.lineTo(screenX, py + ph * 0.01);
      ctx.lineTo(screenX + pw * 0.16, py + ph * 0.11);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (textInfo.includes('林百貨') || textInfo.includes('五層樓仔')) {
      // 【1932 台南林百貨（五層樓仔）真實構圖】五層樓黃褐色溝面磚立面 + 轉角八角圓塔 + 圓形牛眼窗 + 一樓拱廊亭仔腳 + 頂樓神社鳥居！
      // 五層樓主體（黃褐色溝面磚）
      ctx.fillStyle = '#a04000';
      ctx.fillRect(px + pw * 0.08, py + ph * 0.16, pw * 0.84, ph * 0.84);
      ctx.strokeRect(px + pw * 0.08, py + ph * 0.16, pw * 0.84, ph * 0.84);
      // 中央轉角高聳塔樓
      ctx.fillStyle = '#b84d00';
      ctx.fillRect(screenX - pw * 0.16, py + ph * 0.10, pw * 0.32, ph * 0.90);
      ctx.strokeRect(screenX - pw * 0.16, py + ph * 0.10, pw * 0.32, ph * 0.90);
      // 五層樓洗石子水平窗帶與暖黃方窗
      for (let fl = 0; fl < 4; fl++) {
        const fy = py + ph * (0.22 + fl * 0.14);
        ctx.fillStyle = '#dfe6e9';
        ctx.fillRect(px + pw * 0.08, fy + ph * 0.09, pw * 0.84, ph * 0.03);
        ctx.fillStyle = '#ffeaa7';
        [-0.31, -0.21, 0.21, 0.31].forEach((wx) => {
          ctx.fillRect(screenX + pw * wx - pw * 0.035, fy, pw * 0.07, ph * 0.08);
          ctx.strokeRect(screenX + pw * wx - pw * 0.035, fy, pw * 0.07, ph * 0.08);
        });
      }
      // 轉角塔樓標誌性「圓形牛眼窗」與垂直長窗
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(screenX, py + ph * 0.20, pw * 0.055, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffeaa7';
      ctx.fillRect(screenX - pw * 0.05, py + ph * 0.30, pw * 0.10, ph * 0.42);
      ctx.strokeRect(screenX - pw * 0.05, py + ph * 0.30, pw * 0.10, ph * 0.42);
      // 一樓三連拱復古亭仔腳騎樓
      ctx.fillStyle = '#141b24';
      [-0.26, 0, 0.26].forEach((ox) => {
        ctx.beginPath();
        ctx.arc(screenX + pw * ox, py + ph * 0.85, pw * 0.09, Math.PI, 0);
        ctx.lineTo(screenX + pw * (ox + 0.09), py + ph);
        ctx.lineTo(screenX + pw * (ox - 0.09), py + ph);
        ctx.closePath();
        ctx.fill();
      });
      // 頂樓「末廣社」紅色神社鳥居與旗桿
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(screenX + pw * 0.16, py + ph * 0.04, pw * 0.03, ph * 0.12);
      ctx.fillRect(screenX + pw * 0.32, py + ph * 0.04, pw * 0.03, ph * 0.12);
      ctx.fillRect(screenX + pw * 0.13, py + ph * 0.03, pw * 0.25, ph * 0.03);
      ctx.fillRect(screenX + pw * 0.15, py + ph * 0.07, pw * 0.21, ph * 0.02);
    } else if (textInfo.includes('赤嵌樓') || textInfo.includes('迎曦門') || textInfo.includes('拱辰門') || textInfo.includes('舊城')) {
      // 【台南赤嵌樓海神廟 / 新竹東門迎曦門 / 左營舊城北門】紅磚石砌圓拱城座 + 綠釉花瓶欄杆 + 重簷歇山飛簷雙層樓閣！
      // 紅磚石砌城牆高台基座與圓拱門洞
      ctx.fillStyle = '#935116';
      ctx.fillRect(px + pw * 0.06, py + ph * 0.60, pw * 0.88, ph * 0.40);
      ctx.strokeRect(px + pw * 0.06, py + ph * 0.60, pw * 0.88, ph * 0.40);
      ctx.fillStyle = '#141b24';
      ctx.beginPath();
      ctx.arc(screenX, py + ph * 0.84, pw * 0.14, Math.PI, 0);
      ctx.lineTo(screenX + pw * 0.14, py + ph);
      ctx.lineTo(screenX - pw * 0.14, py + ph);
      ctx.closePath();
      ctx.fill();
      // 綠釉花瓶欄杆平台
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(px + pw * 0.08, py + ph * 0.54, pw * 0.84, ph * 0.06);
      ctx.strokeRect(px + pw * 0.08, py + ph * 0.54, pw * 0.84, ph * 0.06);
      // 上層白牆朱柱閣樓本體
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(px + pw * 0.18, py + ph * 0.28, pw * 0.64, ph * 0.26);
      ctx.strokeRect(px + pw * 0.18, py + ph * 0.28, pw * 0.64, ph * 0.26);
      ctx.fillStyle = '#c0392b';
      [-0.24, -0.10, 0.10, 0.24].forEach((cx) => {
        ctx.fillRect(screenX + pw * cx - pw * 0.02, py + ph * 0.28, pw * 0.04, ph * 0.26);
      });
      // 下簷與上簷燕尾翹脊金紅屋頂
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.06, py + ph * 0.34);
      ctx.quadraticCurveTo(screenX, py + ph * 0.18, px + pw * 0.94, py + ph * 0.34);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.14, py + ph * 0.20);
      ctx.quadraticCurveTo(screenX, py + ph * 0.03, px + pw * 0.86, py + ph * 0.20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (textInfo.includes('紅毛城')) {
      // 【淡水紅毛城＆英國領事館】1644年方正朱紅荷蘭城砦主堡 + 雉堞女牆 + 雙拱廊紅磚領事館
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(px + pw * 0.04, py + ph * 0.82, pw * 0.92, ph * 0.18);
      ctx.fillStyle = '#b03a2e';
      ctx.fillRect(px + pw * 0.12, py + ph * 0.24, pw * 0.56, ph * 0.60);
      ctx.strokeRect(px + pw * 0.12, py + ph * 0.24, pw * 0.56, ph * 0.60);
      // 城頂雉堞女牆与國旗桿
      for (let m = 0; m < 5; m++) {
        ctx.fillRect(px + pw * (0.12 + m * 0.12), py + ph * 0.17, pw * 0.08, ph * 0.07);
        ctx.strokeRect(px + pw * (0.12 + m * 0.12), py + ph * 0.17, pw * 0.08, ph * 0.07);
      }
      // 英國領事館雙層紅磚拱廊側翼
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(px + pw * 0.64, py + ph * 0.42, pw * 0.28, ph * 0.42);
      ctx.strokeRect(px + pw * 0.64, py + ph * 0.42, pw * 0.28, ph * 0.42);
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(px + pw * 0.26, py + ph * 0.42, pw * 0.10, ph * 0.14);
      ctx.fillRect(px + pw * 0.44, py + ph * 0.42, pw * 0.10, ph * 0.14);
    } else if (textInfo.includes('蘭陽博物館')) {
      // 【宜蘭蘭陽博物館】20度斜角拔地而起的東北角單面山幾何建築 + 玻璃帷幕與石材交錯 + 烏石港濕地倒影
      ctx.fillStyle = '#006266';
      ctx.fillRect(px + pw * 0.04, py + ph * 0.82, pw * 0.92, ph * 0.18);
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.06, py + ph * 0.84);
      ctx.lineTo(px + pw * 0.64, py + ph * 0.08);
      ctx.lineTo(px + pw * 0.92, py + ph * 0.84);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.36, py + ph * 0.84);
      ctx.lineTo(px + pw * 0.64, py + ph * 0.12);
      ctx.lineTo(px + pw * 0.78, py + ph * 0.84);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (textInfo.includes('龍塔') || textInfo.includes('虎塔') || textInfo.includes('龍虎') || textInfo.includes('八塔') || textInfo.includes('慈恩塔')) {
      // 【蓮池潭龍虎雙塔 / 佛光山八寶塔 / 日月潭慈恩塔】七層八角彩繪寶塔 + 九曲橋 + 龍虎張口瑞獸
      ctx.fillStyle = '#009432';
      ctx.fillRect(px + pw * 0.06, py + ph * 0.84, pw * 0.88, ph * 0.16);
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(px + pw * 0.10, py + ph * 0.82, pw * 0.80, ph * 0.06);
      [-0.22, 0.22].forEach((ox, idx) => {
        const tx = screenX + pw * ox;
        for (let f = 0; f < 6; f++) {
          const fy = py + ph * (0.72 - f * 0.11);
          const fw = pw * (0.28 - f * 0.02);
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(tx - fw / 2, fy, fw, ph * 0.10);
          ctx.strokeRect(tx - fw / 2, fy, fw, ph * 0.10);
          ctx.fillStyle = idx === 0 ? '#27ae60' : '#e67e22';
          ctx.fillRect(tx - fw / 2 - 3, fy - 2, fw + 6, ph * 0.03);
        }
        ctx.fillStyle = idx === 0 ? '#2ecc71' : '#f39c12';
        ctx.beginPath();
        ctx.arc(tx, py + ph * 0.82, pw * 0.11, Math.PI, 0);
        ctx.fill();
        ctx.stroke();
      });
    } else if (kind === 'WULING' || textInfo.includes('武嶺')) {
      // 【合歡山武嶺 3275M 標誌亭】高山岩壁觀景台 + 經典直立「武嶺 3275M」海拔標誌石碑
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(px + pw * 0.10, py + ph * 0.64, pw * 0.80, ph * 0.36);
      ctx.strokeRect(px + pw * 0.10, py + ph * 0.64, pw * 0.80, ph * 0.36);
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(screenX - pw * 0.14, py + ph * 0.12, pw * 0.28, ph * 0.54);
      ctx.strokeRect(screenX - pw * 0.14, py + ph * 0.12, pw * 0.28, ph * 0.54);
      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(screenX - pw * 0.09, py + ph * 0.18, pw * 0.18, ph * 0.38);
    } else if (textInfo.includes('九曲洞')) {
      // 【花蓮太魯閣九曲洞真實石碑與峽谷絕景】（考究自使用者上傳實景圖 Photo 2）
      // 1. 背景千仞大理石深谷絕壁與青翠綠意
      ctx.fillStyle = '#34495e';
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.05, screenY);
      ctx.lineTo(px + pw * 0.15, py + ph * 0.08);
      ctx.lineTo(px + pw * 0.45, py + ph * 0.22);
      ctx.lineTo(px + pw * 0.85, py + ph * 0.06);
      ctx.lineTo(px + pw * 0.95, screenY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 大理石紋理與深色節理
      ctx.fillStyle = '#7f8c8d';
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.10, screenY);
      ctx.lineTo(px + pw * 0.22, py + ph * 0.20);
      ctx.lineTo(px + pw * 0.42, py + ph * 0.30);
      ctx.lineTo(px + pw * 0.38, screenY);
      ctx.closePath();
      ctx.fill();

      // 峭壁垂懸的原生灌木植被
      ctx.fillStyle = '#27ae60';
      ctx.beginPath();
      ctx.arc(px + pw * 0.16, py + ph * 0.15, pw * 0.08, 0, Math.PI * 2);
      ctx.arc(px + pw * 0.82, py + ph * 0.12, pw * 0.09, 0, Math.PI * 2);
      ctx.fill();

      // 2. 觀景步道深色金屬鋼管護欄（橫向兩道粗管＋垂直金屬立柱）
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(px + pw * 0.02, py + ph * 0.70, pw * 0.96, ph * 0.04);
      ctx.fillRect(px + pw * 0.02, py + ph * 0.79, pw * 0.96, ph * 0.04);
      [0.05, 0.25, 0.50, 0.75, 0.93].forEach((rx) => {
        ctx.fillRect(px + pw * rx - pw * 0.015, py + ph * 0.68, pw * 0.03, ph * 0.32);
      });

      // 3. 標誌性「九曲洞大理石天然巨石碑」（實景實體）
      const mx = screenX;
      const my = py + ph * 0.38;
      const mw = pw * 0.46;
      const mh = ph * 0.58;

      // 天然灰白大理石巨石碑本體（不規則天然原石巨碑輪廓）
      ctx.fillStyle = '#95a5a6';
      ctx.beginPath();
      ctx.moveTo(mx - mw * 0.42, screenY);
      ctx.lineTo(mx - mw * 0.46, my + mh * 0.65);
      ctx.lineTo(mx - mw * 0.38, my + mh * 0.25);
      ctx.lineTo(mx - mw * 0.12, my + mh * 0.02);
      ctx.lineTo(mx + mw * 0.20, my + mh * 0.05);
      ctx.lineTo(mx + mw * 0.44, my + mh * 0.32);
      ctx.lineTo(mx + mw * 0.46, my + mh * 0.75);
      ctx.lineTo(mx + mw * 0.40, screenY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 大理石天然褶皺斜紋與受光面陰影
      ctx.fillStyle = '#7f8c8d';
      ctx.beginPath();
      ctx.moveTo(mx - mw * 0.30, screenY);
      ctx.lineTo(mx - mw * 0.20, my + mh * 0.45);
      ctx.lineTo(mx + mw * 0.10, my + mh * 0.15);
      ctx.lineTo(mx + mw * 0.30, my + mh * 0.25);
      ctx.lineTo(mx + mw * 0.36, screenY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ecf0f1';
      ctx.lineWidth = Math.max(1, pw * 0.012);
      ctx.beginPath();
      ctx.moveTo(mx - mw * 0.32, my + mh * 0.60);
      ctx.lineTo(mx - mw * 0.05, my + mh * 0.30);
      ctx.lineTo(mx + mw * 0.25, my + mh * 0.40);
      ctx.stroke();
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = Math.max(1.2, pw * 0.018);

      // 右上方垂直朱紅小字「太魯閣國家公園」
      ctx.fillStyle = '#b71540';
      const smallFontSize = Math.max(7, Math.floor(mh * 0.08));
      ctx.font = `900 ${smallFontSize}px "Noto Sans TC", sans-serif`;
      ctx.textAlign = 'center';
      const labelChars1 = ['太', '魯', '閣', '國', '家', '公', '園'];
      const stY = my + mh * 0.22;
      const spacing1 = mh * 0.085;
      labelChars1.forEach((ch, idx) => {
        ctx.fillText(ch, mx + mw * 0.22, stY + idx * spacing1);
      });

      // 中央正宗直書大紅色隸書「九曲洞」三個大字（帶陰刻雕刻立體質感）
      const bigFontSize = Math.max(11, Math.floor(mh * 0.20));
      ctx.font = `900 ${bigFontSize}px "Noto Serif TC", "Songti TC", serif`;
      const bigChars = ['九', '曲', '洞'];
      const bStY = my + mh * 0.32;
      const bSpacing = mh * 0.22;
      bigChars.forEach((ch, idx) => {
        ctx.fillStyle = '#630e17';
        ctx.fillText(ch, mx - mw * 0.04 + 1.2, bStY + idx * bSpacing + 1.2);
        ctx.fillStyle = '#e74c3c';
        ctx.fillText(ch, mx - mw * 0.04, bStY + idx * bSpacing);
      });
    } else if (textInfo.includes('燕子口') || (stageId === 'taroko' && textInfo.includes('隧道'))) {
      // 【花蓮太魯閣燕子口明隧道／峽谷開鑿洞穴與懸挑拱門】（考究自使用者實景圖 Photo 1, 3, 4）
      // 1. 上方千仞大理石垂直絕壁與山壁茂密植物（Photo 4）
      ctx.fillStyle = '#34495e';
      ctx.beginPath();
      ctx.moveTo(px, screenY);
      ctx.lineTo(px + pw * 0.04, py + ph * 0.02);
      ctx.lineTo(px + pw * 0.88, py + ph * 0.08);
      ctx.lineTo(px + pw, screenY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 絕壁層疊大理石紋理
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(px + pw * 0.12, py + ph * 0.10, pw * 0.72, ph * 0.16);
      ctx.fillStyle = '#1e824c';
      // 洞頂上方生長繁盛的懸崖灌木林
      for (let g = 0; g < 7; g++) {
        ctx.beginPath();
        ctx.arc(px + pw * (0.08 + g * 0.13), py + ph * 0.20, pw * 0.07, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. 經典白色流線型混凝土懸挑明隧道拱門主體（Photo 4）
      ctx.fillStyle = '#f5f6fa';
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.06, screenY);
      ctx.lineTo(px + pw * 0.10, py + ph * 0.28);
      ctx.quadraticCurveTo(screenX, py + ph * 0.16, px + pw * 0.78, py + ph * 0.32);
      ctx.lineTo(px + pw * 0.86, py + ph * 0.40);
      ctx.lineTo(px + pw * 0.78, screenY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 白色拱門懸挑斜撐與加強肋造型
      ctx.strokeStyle = '#dcdde1';
      ctx.lineWidth = Math.max(1.5, pw * 0.02);
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.24, py + ph * 0.25);
      ctx.lineTo(px + pw * 0.24, screenY);
      ctx.moveTo(px + pw * 0.44, py + ph * 0.22);
      ctx.lineTo(px + pw * 0.44, screenY);
      ctx.moveTo(px + pw * 0.64, py + ph * 0.26);
      ctx.lineTo(px + pw * 0.64, screenY);
      ctx.stroke();
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = Math.max(1.2, pw * 0.018);

      // 3. 洞內深邃岩石通道（Photo 1 & 3 天然鑿岩拱頂）
      ctx.fillStyle = '#181a1b';
      ctx.beginPath();
      ctx.arc(screenX - pw * 0.05, py + ph * 0.64, pw * 0.26, Math.PI, 0);
      ctx.lineTo(screenX + pw * 0.21, screenY);
      ctx.lineTo(screenX - pw * 0.31, screenY);
      ctx.closePath();
      ctx.fill();

      // 洞頂照明投射燈與地面暖黃色光暈（Photo 1 & 3 實景特色）
      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(screenX - pw * 0.08, py + ph * 0.40, pw * 0.06, ph * 0.03);
      // 地面扇形暖光
      ctx.fillStyle = 'rgba(243, 156, 18, 0.45)';
      ctx.beginPath();
      ctx.moveTo(screenX - pw * 0.05, py + ph * 0.43);
      ctx.lineTo(screenX + pw * 0.14, screenY);
      ctx.lineTo(screenX - pw * 0.24, screenY);
      ctx.closePath();
      ctx.fill();

      // 4. 外側峽谷深色金屬防護欄杆與遠處立霧溪谷深壑
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(px + pw * 0.72, py + ph * 0.62, pw * 0.26, ph * 0.04);
      ctx.fillRect(px + pw * 0.72, py + ph * 0.74, pw * 0.26, ph * 0.04);
      for (let r = 0; r < 3; r++) {
        ctx.fillRect(px + pw * (0.75 + r * 0.08), py + ph * 0.58, pw * 0.025, ph * 0.42);
      }

      // 5. 實景標誌性紅色三角「慢」字警示牌與「⚠️落石」牌（Photo 4 右側標誌）
      const sx = px + pw * 0.86;
      const sy = py + ph * 0.48;
      // 標誌立柱
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(sx - 1.5, sy, 3, ph * 0.52);
      // 上方警告標誌（紅邊白底三角）
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.moveTo(sx, sy - ph * 0.15);
      ctx.lineTo(sx - pw * 0.07, sy);
      ctx.lineTo(sx + pw * 0.07, sy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(sx, sy - ph * 0.11);
      ctx.lineTo(sx - pw * 0.045, sy - ph * 0.02);
      ctx.lineTo(sx + pw * 0.045, sy - ph * 0.02);
      ctx.closePath();
      ctx.fill();
      // 下方「慢」字菱形警告牌
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.moveTo(sx, sy + ph * 0.02);
      ctx.lineTo(sx + pw * 0.065, sy + ph * 0.10);
      ctx.lineTo(sx, sy + ph * 0.18);
      ctx.lineTo(sx - pw * 0.065, sy + ph * 0.10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(sx, sy + ph * 0.04);
      ctx.lineTo(sx + pw * 0.045, sy + ph * 0.10);
      ctx.lineTo(sx, sy + ph * 0.16);
      ctx.lineTo(sx - pw * 0.045, sy + ph * 0.10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e74c3c';
      ctx.font = `900 ${Math.max(7, Math.floor(pw * 0.06))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('慢', sx, sy + ph * 0.13);

      // 路口紅白交通錐（Photo 4 經典紅色三角錐）
      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.moveTo(sx - pw * 0.03, screenY);
      ctx.lineTo(sx, screenY - ph * 0.10);
      ctx.lineTo(sx + pw * 0.03, screenY);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx - pw * 0.015, screenY - ph * 0.06, pw * 0.03, ph * 0.02);
    } else if (textInfo.includes('長春祠')) {
      // 【花蓮太魯閣長春祠】千仞斷崖絕壁湧泉飛瀑＋古典唐式金瓦紅柱祠堂
      // 1. 千仞灰黑大理石斷崖峭壁
      ctx.fillStyle = '#3d4d5c';
      ctx.fillRect(px + pw * 0.06, py + ph * 0.06, pw * 0.88, ph * 0.94);
      ctx.strokeRect(px + pw * 0.06, py + ph * 0.06, pw * 0.88, ph * 0.94);

      // 峭壁大理石岩脈
      ctx.fillStyle = '#7f8c8d';
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.10, screenY);
      ctx.lineTo(px + pw * 0.25, py + ph * 0.20);
      ctx.lineTo(px + pw * 0.55, py + ph * 0.10);
      ctx.lineTo(px + pw * 0.40, screenY);
      ctx.closePath();
      ctx.fill();

      // 2. 山壁湧泉瀑布（長春飛瀑注入谷底立霧溪）
      ctx.fillStyle = '#00d2d3';
      ctx.fillRect(px + pw * 0.24, py + ph * 0.44, pw * 0.16, ph * 0.56);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + pw * 0.28, py + ph * 0.48, pw * 0.04, ph * 0.52);
      ctx.fillRect(px + pw * 0.34, py + ph * 0.54, pw * 0.03, ph * 0.46);

      // 3. 懸空凌駕於瀑布之上的唐式長春祠主殿（金瓦紅柱重簷歇山頂）
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(px + pw * 0.38, py + ph * 0.36, pw * 0.46, ph * 0.32);
      ctx.strokeRect(px + pw * 0.38, py + ph * 0.36, pw * 0.46, ph * 0.32);
      // 朱紅立柱
      ctx.fillStyle = '#e74c3c';
      [-0.18, 0, 0.18].forEach((ox) => {
        ctx.fillRect(px + pw * 0.61 + pw * ox - 2, py + ph * 0.38, 4, ph * 0.30);
      });
      // 金黃琉璃瓦重簷歇山頂
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.32, py + ph * 0.38);
      ctx.quadraticCurveTo(px + pw * 0.61, py + ph * 0.20, px + pw * 0.90, py + ph * 0.38);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.42, py + ph * 0.24);
      ctx.quadraticCurveTo(px + pw * 0.61, py + ph * 0.12, px + pw * 0.80, py + ph * 0.24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 谷底立霧溪湍流
      ctx.fillStyle = '#00cec9';
      ctx.fillRect(px + pw * 0.06, py + ph * 0.86, pw * 0.88, ph * 0.14);
    } else if (kind === 'CLIFF_TUNNEL' || textInfo.includes('明隧道') || textInfo.includes('親不知子') || textInfo.includes('山洞')) {
      // 【蘇花清水斷崖明隧道 / 多良一號隧道 / 親不知子玻璃棧道】千仞灰岩絕壁 + 臨海半開放拱形明隧道與粗獷石柱
      ctx.fillStyle = '#485460';
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.04, screenY);
      ctx.lineTo(px + pw * 0.12, py + ph * 0.04);
      ctx.lineTo(px + pw * 0.68, py + ph * 0.14);
      ctx.lineTo(px + pw * 0.94, screenY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 明隧道混凝土頂板與外侧支撐斜柱
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(px + pw * 0.16, py + ph * 0.42, pw * 0.72, ph * 0.10);
      ctx.strokeRect(px + pw * 0.16, py + ph * 0.42, pw * 0.72, ph * 0.10);
      ctx.fillStyle = '#141b24';
      ctx.fillRect(px + pw * 0.20, py + ph * 0.52, pw * 0.62, ph * 0.48);
      ctx.fillStyle = '#dfe6e9';
      for (let c = 0; c < 4; c++) {
        ctx.fillRect(px + pw * (0.22 + c * 0.18), py + ph * 0.52, pw * 0.06, ph * 0.48);
      }
      // 隧道口黃黑反光警示條
      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(px + pw * 0.16, py + ph * 0.48, pw * 0.72, ph * 0.04);
    } else if (kind === 'PAIFANG' || kind === 'TEMPLE') {
      // 【1. 台灣名廟三川殿 / 四柱三間重簷飛簷大牌樓】青斗石雕龍柱 + 重簷燕尾飛脊 + 雙龍搶珠 + 金框匾額 + 搖曳紅燈籠
      ctx.fillStyle = '#95a5a6';
      [0.12, 0.30, 0.70, 0.88].forEach((cx) => {
        ctx.fillRect(px + pw * (cx - 0.06), py + ph * 0.86, pw * 0.12, ph * 0.14);
        ctx.strokeRect(px + pw * (cx - 0.06), py + ph * 0.86, pw * 0.12, ph * 0.14);
      });
      if (kind === 'TEMPLE') {
        // 廟宇紅磚殿身與三川雕花門
        ctx.fillStyle = mainCol;
        ctx.fillRect(px + pw * 0.12, py + ph * 0.34, pw * 0.76, ph * 0.54);
        ctx.strokeRect(px + pw * 0.12, py + ph * 0.34, pw * 0.76, ph * 0.54);
        ctx.fillStyle = '#141b24';
        ctx.fillRect(screenX - pw * 0.14, py + ph * 0.52, pw * 0.28, ph * 0.36);
      }
      // 朱紅鑲金四立柱
      ctx.fillStyle = mainCol;
      [0.12, 0.30, 0.70, 0.88].forEach((cx) => {
        ctx.fillRect(px + pw * (cx - 0.04), py + ph * 0.26, pw * 0.08, ph * 0.62);
        ctx.strokeRect(px + pw * (cx - 0.04), py + ph * 0.26, pw * 0.08, ph * 0.62);
      });
      // 下層與上層燕尾翹脊飛簷屋頂
      ctx.fillStyle = accCol;
      ctx.beginPath();
      ctx.moveTo(px - pw * 0.06, py + ph * 0.32);
      ctx.quadraticCurveTo(screenX, py + ph * 0.15, px + pw * 1.06, py + ph * 0.32);
      ctx.lineTo(px + pw * 0.96, py + ph * 0.38);
      ctx.lineTo(px + pw * 0.04, py + ph * 0.38);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(px + pw * 0.10, py + ph * 0.19);
      ctx.quadraticCurveTo(screenX, py + ph * 0.03, px + pw * 0.90, py + ph * 0.19);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 屋脊正中央雙龍搶珠寶珠
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(screenX, py + ph * 0.07, pw * 0.045, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 金框牌樓橫匾
      ctx.fillStyle = '#141b24';
      ctx.fillRect(px + pw * 0.18, py + ph * 0.25, pw * 0.64, ph * 0.13);
      ctx.strokeStyle = '#ffd32a';
      ctx.strokeRect(px + pw * 0.18, py + ph * 0.25, pw * 0.64, ph * 0.13);
      ctx.strokeStyle = '#111111';

      // 兩側搖曳紅燈籠與金穗
      const swing = Math.sin(time * 1.6) * (pw * 0.022);
      ctx.fillStyle = '#ff1e1e';
      ctx.fillRect(px + pw * 0.19 + swing, py + ph * 0.42, pw * 0.10, ph * 0.13);
      ctx.fillRect(px + pw * 0.71 + swing, py + ph * 0.42, pw * 0.10, ph * 0.13);
      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(px + pw * 0.22 + swing, py + ph * 0.55, pw * 0.04, ph * 0.06);
      ctx.fillRect(px + pw * 0.74 + swing, py + ph * 0.55, pw * 0.04, ph * 0.06);
    } else if (kind === 'SNACK') {
      // 【2. 台灣各地名店小吃攤車】復古木造/白鐵攤車 + 條紋帆布遮陽棚 + 暖黃燈泡串 + 鐵板高湯蒸氣 + 紅色塑膠椅与直立招牌
      ctx.fillStyle = '#dfe6e9';
      ctx.fillRect(px + pw * 0.10, py + ph * 0.52, pw * 0.70, ph * 0.48);
      ctx.strokeRect(px + pw * 0.10, py + ph * 0.52, pw * 0.70, ph * 0.48);
      ctx.fillStyle = mainCol;
      ctx.fillRect(px + pw * 0.12, py + ph * 0.64, pw * 0.66, ph * 0.34);
      // 攤車車輪与前排台灣夜市紅色塑膠椅
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.arc(px + pw * 0.24, screenY - ph * 0.06, pw * 0.07, 0, Math.PI * 2);
      ctx.arc(px + pw * 0.66, screenY - ph * 0.06, pw * 0.07, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(px + pw * 0.38, py + ph * 0.80, pw * 0.14, ph * 0.18);
      ctx.strokeRect(px + pw * 0.38, py + ph * 0.80, pw * 0.14, ph * 0.18);

      // 支架與紅藍白條紋遮陽帆布棚
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + pw * 0.14, py + ph * 0.24, pw * 0.04, ph * 0.30);
      ctx.fillRect(px + pw * 0.72, py + ph * 0.24, pw * 0.04, ph * 0.30);
      for (let s = 0; s < 5; s++) {
        ctx.fillStyle = (s % 2 === 0) ? mainCol : accCol;
        ctx.fillRect(px + pw * (0.06 + s * 0.155), py + ph * 0.16, pw * 0.155, ph * 0.13);
        ctx.strokeRect(px + pw * (0.06 + s * 0.155), py + ph * 0.16, pw * 0.155, ph * 0.13);
      }
      // 棚下暖黃夜市燈泡
      ctx.fillStyle = '#fff200';
      [0.24, 0.45, 0.64].forEach((bx) => {
        ctx.beginPath();
        ctx.arc(px + pw * bx, py + ph * 0.31, pw * 0.03, 0, Math.PI * 2);
        ctx.fill();
      });

      // 料理台大滷鍋、竹蒸籠與裊裊白煙蒸氣
      ctx.fillStyle = '#d35400';
      ctx.fillRect(px + pw * 0.20, py + ph * 0.42, pw * 0.22, ph * 0.11);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(px + pw * 0.46, py + ph * 0.40, pw * 0.22, ph * 0.13);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      const steamY = (performance.now() * 0.032) % (ph * 0.18);
      ctx.beginPath();
      ctx.arc(px + pw * 0.32, py + ph * 0.38 - steamY, pw * 0.075, 0, Math.PI * 2);
      ctx.arc(px + pw * 0.54, py + ph * 0.35 - steamY * 0.85, pw * 0.065, 0, Math.PI * 2);
      ctx.fill();

      // 攤車旁直立白底紅框老店燈箱招牌
      ctx.fillStyle = '#fff9e6';
      ctx.fillRect(px + pw * 0.82, py + ph * 0.28, pw * 0.16, ph * 0.70);
      ctx.strokeRect(px + pw * 0.82, py + ph * 0.28, pw * 0.16, ph * 0.70);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(px + pw * 0.85, py + ph * 0.34, pw * 0.10, ph * 0.56);
    } else if (kind === 'BAROQUE') {
      // 【3. 昭和巴洛克洋樓（富岡呂家聲洋樓鑊嫲篤穹頂 / 鹿港中山路 / 西螺延平老街 / 芹壁石屋）】
      ctx.fillStyle = mainCol;
      ctx.fillRect(px + pw * 0.06, py + ph * 0.28, pw * 0.88, ph * 0.72);
      ctx.strokeRect(px + pw * 0.06, py + ph * 0.28, pw * 0.88, ph * 0.72);
      // 磚牆水平洗石子飾帶與羅馬雙柱
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(px + pw * 0.06, py + ph * 0.44, pw * 0.88, ph * 0.045);
      ctx.fillRect(px + pw * 0.06, py + ph * 0.68, pw * 0.88, ph * 0.045);
      [0.10, 0.36, 0.60, 0.86].forEach((cx) => {
        ctx.fillRect(px + pw * cx, py + ph * 0.30, pw * 0.04, ph * 0.68);
      });
      // 拜占庭半圓銅綠穹頂「鑊嫲篤」與山牆浮雕
      ctx.fillStyle = '#576574';
      ctx.beginPath();
      ctx.arc(screenX, py + ph * 0.22, pw * 0.22, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = accCol;
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.14, py + ph * 0.28);
      ctx.lineTo(screenX, py + ph * 0.10);
      ctx.lineTo(px + pw * 0.86, py + ph * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffd32a';
      ctx.beginPath();
      ctx.arc(screenX, py + ph * 0.21, pw * 0.05, 0, Math.PI * 2);
      ctx.fill();
      // 二樓古典拱窗（暖黃室內燈光）
      ctx.fillStyle = '#ffeaa7';
      [-0.24, 0, 0.24].forEach((ox) => {
        ctx.fillRect(screenX + pw * (ox - 0.065), py + ph * 0.50, pw * 0.13, ph * 0.16);
        ctx.strokeRect(screenX + pw * (ox - 0.065), py + ph * 0.50, pw * 0.13, ph * 0.16);
      });
      // 一樓三連拱紅磚亭仔腳
      ctx.fillStyle = '#141b24';
      [-0.25, 0, 0.25].forEach((ox) => {
        ctx.beginPath();
        ctx.arc(screenX + pw * ox, py + ph * 0.82, pw * 0.095, Math.PI, 0);
        ctx.lineTo(screenX + pw * (ox + 0.095), py + ph);
        ctx.lineTo(screenX + pw * (ox - 0.095), py + ph);
        ctx.closePath();
        ctx.fill();
      });
    } else if (kind === 'ARCADE') {
      // 【4. 紅磚拱廊亭仔腳老街與燈籠串（富岡信義街 / 九份豎崎路 / 鹿港半邊井 / 頭城老街）】
      ctx.fillStyle = mainCol;
      ctx.fillRect(px + pw * 0.08, py + ph * 0.22, pw * 0.84, ph * 0.78);
      ctx.strokeRect(px + pw * 0.08, py + ph * 0.22, pw * 0.84, ph * 0.78);
      // 傳統紅瓦斜屋頂與洗石子牌樓女兒牆
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(px + pw * 0.05, py + ph * 0.14, pw * 0.90, ph * 0.08);
      ctx.strokeRect(px + pw * 0.05, py + ph * 0.14, pw * 0.90, ph * 0.08);
      ctx.fillStyle = '#dfe6e9';
      ctx.fillRect(px + pw * 0.12, py + ph * 0.22, pw * 0.76, ph * 0.08);
      // 二樓木格花窗與暖黃燈光
      ctx.fillStyle = '#ffeaa7';
      ctx.fillRect(px + pw * 0.18, py + ph * 0.36, pw * 0.22, ph * 0.18);
      ctx.fillRect(px + pw * 0.60, py + ph * 0.36, pw * 0.22, ph * 0.18);
      ctx.strokeRect(px + pw * 0.18, py + ph * 0.36, pw * 0.22, ph * 0.18);
      ctx.strokeRect(px + pw * 0.60, py + ph * 0.36, pw * 0.22, ph * 0.18);
      // 一樓雙連拱亭仔腳走廊
      ctx.fillStyle = '#141b24';
      [-0.20, 0.20].forEach((ox) => {
        ctx.beginPath();
        ctx.arc(screenX + pw * ox, py + ph * 0.76, pw * 0.13, Math.PI, 0);
        ctx.lineTo(screenX + pw * (ox + 0.13), py + ph);
        ctx.lineTo(screenX + pw * (ox - 0.13), py + ph);
        ctx.closePath();
        ctx.fill();
      });
      // 成串發光紅燈籠
      ctx.fillStyle = '#ff1e1e';
      [-0.24, 0, 0.24].forEach((lx) => {
        ctx.beginPath();
        ctx.arc(screenX + pw * lx, py + ph * 0.44, pw * 0.055, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    } else if (kind === 'MOUNTAIN' || kind === 'SULFUR') {
      // 【5. 台灣壯麗山景 / 七股鹽山 / 石梯坪單面山 / 峽谷飛瀑 / 硫磺噴氣口】
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.06, screenY);
      ctx.lineTo(px + pw * 0.24, py + ph * 0.22);
      ctx.lineTo(px + pw * 0.52, py + ph * 0.06);
      ctx.lineTo(px + pw * 0.88, py + ph * 0.26);
      ctx.lineTo(px + pw * 0.96, screenY);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = mainCol;
      ctx.beginPath();
      ctx.moveTo(px, screenY);
      ctx.lineTo(px + pw * 0.28, py + ph * 0.16);
      ctx.lineTo(px + pw * 0.54, py + ph * 0.36);
      ctx.lineTo(px + pw * 0.78, py + ph * 0.10);
      ctx.lineTo(px + pw, screenY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = accCol;
      ctx.fillRect(px + pw * 0.42, py + ph * 0.30, pw * 0.16, ph * 0.66);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + pw * 0.46, py + ph * 0.32, pw * 0.06, ph * 0.62);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.86)';
      const drift = Math.sin(time) * (pw * 0.05);
      ctx.beginPath();
      ctx.arc(px + pw * 0.32 + drift, py + ph * 0.44, pw * 0.15, 0, Math.PI * 2);
      ctx.arc(px + pw * 0.68 - drift, py + ph * 0.38, pw * 0.16, 0, Math.PI * 2);
      ctx.arc(px + pw * 0.50, screenY - ph * 0.08, pw * 0.22, Math.PI, 0);
      ctx.fill();
    } else if (kind === 'OCEAN') {
      // 【6. 蔚藍海岸海景 / 漁港漁船 / 雙心石滬 / 藍眼淚 / 綠蠵龜海灣】
      ctx.fillStyle = mainCol;
      ctx.fillRect(px + pw * 0.02, py + ph * 0.56, pw * 0.96, ph * 0.44);
      ctx.strokeRect(px + pw * 0.02, py + ph * 0.56, pw * 0.96, ph * 0.44);
      ctx.fillStyle = accCol;
      const waveShift = Math.sin(time * 2.2) * (pw * 0.05);
      ctx.fillRect(px + pw * 0.10 + waveShift, py + ph * 0.66, pw * 0.80, ph * 0.07);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + pw * 0.16 - waveShift, py + ph * 0.80, pw * 0.68, ph * 0.06);

      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.moveTo(screenX - pw * 0.28, py + ph * 0.58);
      ctx.lineTo(screenX + pw * 0.28, py + ph * 0.58);
      ctx.lineTo(screenX + pw * 0.20, py + ph * 0.70);
      ctx.lineTo(screenX - pw * 0.20, py + ph * 0.70);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(screenX, py + ph * 0.16);
      ctx.lineTo(screenX + pw * 0.22, py + ph * 0.56);
      ctx.lineTo(screenX, py + ph * 0.56);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (kind === 'QUEEN_HEAD' || kind === 'ROCK_GEO') {
      // 【7. 野柳女王頭 / 小琉球花瓶岩 / 船帆石 / 龍磐崩崖 / 奇岩地景】
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(px + pw * 0.06, py + ph * 0.84, pw * 0.88, ph * 0.16);
      ctx.fillStyle = '#d1b26f';
      ctx.fillRect(px + pw * 0.14, py + ph * 0.74, pw * 0.72, ph * 0.22);
      ctx.strokeRect(px + pw * 0.14, py + ph * 0.74, pw * 0.72, ph * 0.22);

      ctx.fillStyle = mainCol;
      ctx.beginPath();
      ctx.ellipse(screenX, py + ph * 0.34, pw * 0.28, ph * 0.24, -0.20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillRect(screenX - pw * 0.10, py + ph * 0.52, pw * 0.20, ph * 0.24);
      ctx.strokeRect(screenX - pw * 0.10, py + ph * 0.52, pw * 0.20, ph * 0.24);
      if (kind === 'QUEEN_HEAD') {
        ctx.fillStyle = accCol;
        ctx.beginPath();
        ctx.arc(screenX - pw * 0.04, py + ph * 0.16, pw * 0.18, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (kind === 'LIGHTHOUSE') {
      // 【8. 台灣海岸燈塔（鵝鑾鼻武裝燈塔 / 高美紅白燈塔 / 東引燈塔 / 七美燈塔）】
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(px + pw * 0.08, py + ph * 0.84, pw * 0.84, ph * 0.16);
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(px + pw * 0.18, py + ph * 0.70, pw * 0.64, ph * 0.22);
      ctx.strokeRect(px + pw * 0.18, py + ph * 0.70, pw * 0.64, ph * 0.22);
      ctx.fillStyle = mainCol;
      ctx.fillRect(screenX - pw * 0.13, py + ph * 0.20, pw * 0.26, ph * 0.52);
      ctx.strokeRect(screenX - pw * 0.13, py + ph * 0.20, pw * 0.26, ph * 0.52);
      ctx.fillStyle = accCol;
      ctx.beginPath();
      ctx.arc(screenX, py + ph * 0.20, pw * 0.15, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 242, 0, 0.45)';
      ctx.beginPath();
      ctx.moveTo(screenX, py + ph * 0.18);
      ctx.lineTo(px - pw * 0.12, py + ph * 0.04);
      ctx.lineTo(px + pw * 1.12, py + ph * 0.04);
      ctx.closePath();
      ctx.fill();
    } else if (kind === 'WINDMILL') {
      // 【9. 高美/通霄巨型旋轉白色風力發電機】
      ctx.fillStyle = '#ff9966';
      ctx.fillRect(px + pw * 0.10, py + ph * 0.86, pw * 0.80, ph * 0.14);
      ctx.fillStyle = mainCol;
      ctx.fillRect(screenX - pw * 0.05, py + ph * 0.24, pw * 0.10, ph * 0.70);
      ctx.strokeRect(screenX - pw * 0.05, py + ph * 0.24, pw * 0.10, ph * 0.70);
      const ang = performance.now() * 0.0038;
      for (let b = 0; b < 3; b++) {
        const a = ang + (b * Math.PI * 2) / 3;
        ctx.strokeStyle = accCol;
        ctx.lineWidth = Math.max(2.5, pw * 0.048);
        ctx.beginPath();
        ctx.moveTo(screenX, py + ph * 0.24);
        ctx.lineTo(screenX + Math.cos(a) * pw * 0.42, py + ph * 0.24 + Math.sin(a) * pw * 0.42);
        ctx.stroke();
      }
      ctx.strokeStyle = '#111111';
    } else if (kind === 'RAILWAY') {
      // 【10. 台灣鐵道與森林小火車（阿里山紅火車 / 平溪線黃火車 / 多良臨海紅欄杆月台藍皮火車）】
      ctx.fillStyle = '#576574';
      ctx.fillRect(px + pw * 0.04, py + ph * 0.84, pw * 0.92, ph * 0.16);
      ctx.fillStyle = '#8d6e63';
      for (let t = 0; t < 6; t++) {
        ctx.fillRect(px + pw * (0.10 + t * 0.14), py + ph * 0.86, pw * 0.08, ph * 0.12);
      }
      if (textInfo.includes('多良')) {
        // 多良車站鮮紅臨海欄杆與高架水泥柱
        ctx.fillStyle = '#ff3838';
        ctx.fillRect(px + pw * 0.04, py + ph * 0.74, pw * 0.92, ph * 0.08);
        ctx.strokeRect(px + pw * 0.04, py + ph * 0.74, pw * 0.92, ph * 0.08);
      }
      ctx.fillStyle = mainCol;
      ctx.fillRect(px + pw * 0.12, py + ph * 0.32, pw * 0.76, ph * 0.50);
      ctx.strokeRect(px + pw * 0.12, py + ph * 0.32, pw * 0.76, ph * 0.50);
      ctx.fillStyle = accCol;
      ctx.fillRect(px + pw * 0.12, py + ph * 0.64, pw * 0.76, ph * 0.08);
      ctx.fillStyle = '#dff9fb';
      ctx.fillRect(px + pw * 0.18, py + ph * 0.40, pw * 0.26, ph * 0.18);
      ctx.fillRect(px + pw * 0.54, py + ph * 0.40, pw * 0.26, ph * 0.18);
      ctx.strokeRect(px + pw * 0.18, py + ph * 0.40, pw * 0.26, ph * 0.18);
      ctx.strokeRect(px + pw * 0.54, py + ph * 0.40, pw * 0.26, ph * 0.18);
      ctx.fillStyle = '#fff200';
      ctx.beginPath();
      ctx.arc(screenX, py + ph * 0.26, pw * 0.075, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (kind === 'BRIDGE') {
      if (textInfo.includes('龍騰斷橋') || textInfo.includes('魚藤坪')) {
        // 【苗栗三義・龍騰紅磚斷橋真實構圖】雙座斑駁紅磚拱橋墩 + 白色花崗岩水平飾帶 + 上方斷裂殘拱與綠藤
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(px + pw * 0.04, py + ph * 0.86, pw * 0.92, ph * 0.14);
        [-0.24, 0.24].forEach((ox) => {
          const bx = screenX + pw * ox;
          ctx.fillStyle = '#a04000';
          ctx.fillRect(bx - pw * 0.13, py + ph * 0.22, pw * 0.26, ph * 0.76);
          ctx.strokeRect(bx - pw * 0.13, py + ph * 0.22, pw * 0.26, ph * 0.76);
          ctx.fillStyle = '#ecf0f1';
          ctx.fillRect(bx - pw * 0.14, py + ph * 0.40, pw * 0.28, ph * 0.05);
          ctx.fillRect(bx - pw * 0.14, py + ph * 0.62, pw * 0.28, ph * 0.05);
        });
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = Math.max(4, pw * 0.08);
        ctx.beginPath();
        ctx.arc(screenX, py + ph * 0.44, pw * 0.24, Math.PI, Math.PI * 1.72);
        ctx.stroke();
        ctx.strokeStyle = '#111111';
      } else if (textInfo.includes('西螺大橋')) {
        // 【雲林西螺大橋】鮮紅華倫氏鋼鐵桁架連拱大橋
        ctx.fillStyle = '#0097e6';
        ctx.fillRect(px + pw * 0.04, py + ph * 0.80, pw * 0.92, ph * 0.20);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = Math.max(2.5, pw * 0.045);
        ctx.strokeRect(px + pw * 0.08, py + ph * 0.30, pw * 0.84, ph * 0.46);
        ctx.beginPath();
        ctx.moveTo(px + pw * 0.08, py + ph * 0.76);
        ctx.lineTo(px + pw * 0.30, py + ph * 0.30);
        ctx.lineTo(px + pw * 0.50, py + ph * 0.76);
        ctx.lineTo(px + pw * 0.70, py + ph * 0.30);
        ctx.lineTo(px + pw * 0.92, py + ph * 0.76);
        ctx.stroke();
        ctx.strokeStyle = '#111111';
      } else if (textInfo.includes('斜張') || textInfo.includes('鵬灣') || textInfo.includes('情人橋')) {
        // 【大鵬灣跨海大橋 / 淡水情人橋】純白單塔風帆斜張大橋與放射鋼索
        ctx.fillStyle = '#0077b6';
        ctx.fillRect(px + pw * 0.04, py + ph * 0.80, pw * 0.92, ph * 0.20);
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = Math.max(1.2, pw * 0.018);
        for (let c = 1; c <= 4; c++) {
          ctx.beginPath();
          ctx.moveTo(screenX - pw * 0.10, py + ph * 0.14);
          ctx.lineTo(screenX - pw * 0.10 + c * pw * 0.18, py + ph * 0.72);
          ctx.moveTo(screenX - pw * 0.10, py + ph * 0.14);
          ctx.lineTo(screenX - pw * 0.10 - c * pw * 0.10, py + ph * 0.72);
          ctx.stroke();
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(screenX - pw * 0.14, py + ph * 0.08, pw * 0.09, ph * 0.82);
        ctx.fillRect(px + pw * 0.04, py + ph * 0.70, pw * 0.92, ph * 0.08);
      } else {
        // 【景觀吊橋 / 八拱跨海步橋 / 竹拱橋 / 紅色錦文橋】
        ctx.fillStyle = '#00a8e8';
        ctx.fillRect(px + pw * 0.06, py + ph * 0.76, pw * 0.88, ph * 0.24);
        ctx.fillStyle = mainCol;
        ctx.fillRect(px + pw * 0.08, py + ph * 0.26, pw * 0.10, ph * 0.70);
        ctx.fillRect(px + pw * 0.82, py + ph * 0.26, pw * 0.10, ph * 0.70);
        ctx.fillRect(px + pw * 0.06, py + ph * 0.54, pw * 0.88, ph * 0.12);
        ctx.strokeRect(px + pw * 0.06, py + ph * 0.54, pw * 0.88, ph * 0.12);
        ctx.strokeStyle = accCol;
        ctx.lineWidth = Math.max(2.5, pw * 0.04);
        for (let a = -1; a <= 1; a++) {
          ctx.beginPath();
          ctx.arc(screenX + a * (pw * 0.24), py + ph * 0.54, pw * 0.12, Math.PI, 0);
          ctx.stroke();
        }
        ctx.strokeStyle = '#111111';
      }
    } else if (kind === 'FOREST' || kind === 'TAKESHI_TREE' || kind === 'NATURE_WAVE') {
      // 【12. 千年紅檜神木 / 池上金城武樹 / 通梁古榕 / 安平樹屋 / 黃金稻浪】
      ctx.fillStyle = accCol;
      ctx.fillRect(px + pw * 0.08, py + ph * 0.78, pw * 0.84, ph * 0.22);
      ctx.fillStyle = '#6e2c00';
      ctx.beginPath();
      ctx.moveTo(screenX - pw * 0.16, screenY);
      ctx.lineTo(screenX - pw * 0.09, py + ph * 0.42);
      ctx.lineTo(screenX + pw * 0.09, py + ph * 0.42);
      ctx.lineTo(screenX + pw * 0.16, screenY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = mainCol;
      ctx.beginPath();
      ctx.arc(screenX, py + ph * 0.28, pw * 0.34, 0, Math.PI * 2);
      ctx.arc(screenX - pw * 0.20, py + ph * 0.38, pw * 0.22, 0, Math.PI * 2);
      ctx.arc(screenX + pw * 0.20, py + ph * 0.38, pw * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.beginPath();
      ctx.arc(screenX - pw * 0.10, py + ph * 0.22, pw * 0.16, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'SHEEP') {
      // 【13. 清境綿羊群 / 瑞穗乳牛群 / 水蛙窟梅花鹿】
      ctx.fillStyle = mainCol;
      ctx.fillRect(px + pw * 0.06, py + ph * 0.68, pw * 0.88, ph * 0.32);
      ctx.fillStyle = '#dfe6e9';
      ctx.fillRect(px + pw * 0.10, py + ph * 0.56, pw * 0.80, ph * 0.05);
      ctx.fillStyle = accCol;
      [-0.20, 0.20].forEach((ox) => {
        ctx.beginPath();
        ctx.arc(screenX + pw * ox, py + ph * 0.64, pw * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(screenX + pw * (ox + 0.08), py + ph * 0.58, pw * 0.08, ph * 0.08);
        ctx.fillStyle = accCol;
      });
    } else if (kind === 'PALANQUIN' || kind === 'FESTIVAL') {
      // 【14. 白沙屯粉紅超跑媽祖神轎 / 香燈腳旗海 / 平溪天燈升空】
      ctx.fillStyle = accCol;
      ctx.fillRect(px + pw * 0.18, py + ph * 0.38, pw * 0.64, ph * 0.50);
      ctx.strokeRect(px + pw * 0.18, py + ph * 0.38, pw * 0.64, ph * 0.50);
      ctx.fillStyle = mainCol;
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.08, py + ph * 0.40);
      ctx.lineTo(screenX, py + ph * 0.12);
      ctx.lineTo(px + pw * 0.92, py + ph * 0.40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ff1e1e';
      ctx.fillRect(screenX - pw * 0.10, py + ph * 0.48, pw * 0.20, ph * 0.24);
    } else if (kind === 'BUDDHA') {
      // 【15. 佛光山 108 公尺金色大佛與萬道佛光】
      ctx.fillStyle = 'rgba(255, 242, 0, 0.42)';
      ctx.beginPath();
      ctx.arc(screenX, py + ph * 0.34, pw * 0.44, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd32a';
      ctx.beginPath();
      ctx.arc(screenX, py + ph * 0.22, pw * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillRect(px + pw * 0.24, py + ph * 0.36, pw * 0.52, ph * 0.52);
      ctx.strokeRect(px + pw * 0.24, py + ph * 0.36, pw * 0.52, ph * 0.52);
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(px + pw * 0.16, py + ph * 0.86, pw * 0.68, ph * 0.14);
      ctx.strokeRect(px + pw * 0.16, py + ph * 0.86, pw * 0.68, ph * 0.14);
    } else {
      // 【16. 台灣古典歷史官廳 / 故宮南院流線館閣 / 日治木造驛站 / 文化古蹟樓閣 (HERITAGE / PAVILION)】
      // 花崗岩三階基座
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(px + pw * 0.04, py + ph * 0.84, pw * 0.92, ph * 0.16);
      ctx.strokeRect(px + pw * 0.04, py + ph * 0.84, pw * 0.92, ph * 0.16);
      // 二層古蹟磚石立面與長廊列柱
      ctx.fillStyle = mainCol;
      ctx.fillRect(px + pw * 0.10, py + ph * 0.36, pw * 0.80, ph * 0.48);
      ctx.strokeRect(px + pw * 0.10, py + ph * 0.36, pw * 0.80, ph * 0.48);
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(px + pw * 0.10, py + ph * 0.56, pw * 0.80, ph * 0.05);
      [-0.30, -0.15, 0.15, 0.30].forEach((cx) => {
        ctx.fillRect(screenX + pw * cx - pw * 0.025, py + ph * 0.38, pw * 0.05, ph * 0.46);
      });
      // 重簷歇山弧形飛簷屋頂與中央氣勢山牆
      ctx.fillStyle = accCol;
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.02, py + ph * 0.38);
      ctx.quadraticCurveTo(screenX, py + ph * 0.16, px + pw * 0.98, py + ph * 0.38);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.18, py + ph * 0.24);
      ctx.quadraticCurveTo(screenX, py + ph * 0.06, px + pw * 0.82, py + ph * 0.24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 拱門與木格窗
      ctx.fillStyle = '#141b24';
      ctx.beginPath();
      ctx.arc(screenX, py + ph * 0.70, pw * 0.11, Math.PI, 0);
      ctx.lineTo(screenX + pw * 0.11, py + ph * 0.84);
      ctx.lineTo(screenX - pw * 0.11, py + ph * 0.84);
      ctx.closePath();
      ctx.fill();
    }

    // 【統一白字、黑框、無黑色長方形底框，全部移至該物體正下方】
    if (pw > 38 && !sp.isBackdrop) {
      const fontSize = Math.min(14, Math.max(9, Math.floor(pw * 0.095)));
      const bottomCaption = sub.sign || sub.title || '台灣特色街景';
      this.drawArcadeText(
        ctx,
        bottomCaption,
        screenX,
        screenY + Math.max(13, Math.floor(ph * 0.10)),
        `900 ${fontSize}px "Noto Sans TC", sans-serif`,
        '#ffffff',
        'center',
        2
      );
    }
  }

  /**
   * 【通關終點全景凱旋畫面】(`drawFinaleVictoryScene`)：
   * 1. 終點的風景佔滿整個全螢幕畫面（完整呈現 8 大終點《合金彈頭》風格全景地標、牌樓、山海背景與高空慶祝煙火，自適應任意寬螢幕）！
   * 2. 車輛通過終點線後停在正中央（選用一張清晰的騎車/駕駛像素圖，車子只佔畫面 1/4 大小，絕不遮擋後方終點風景）！
   * 3. 道路與廣場兩旁站滿熱情跳躍、揮舞旗幟的歡呼群眾！
   */
  drawFinaleVictoryScene(ctx, width, height, stage, player, victoryStats) {
    ctx.save();
    const time = performance.now() * 0.001;
    const stageId = (stage && stage.id) || 'end_lukang';
    const cx = Math.floor(width / 2);
    const hasCustomFinaleArt = this.hasFinaleImage(stageId);

    if (hasCustomFinaleArt) {
      // 【優先繪製使用者上傳的 8 大終點全螢幕《合金彈頭》像素構圖】
      // 構圖內含：地標全景、GOAL! 終點線、兩旁夾道歡呼群眾、地面甩尾煞車痕與底部景點金匾
      const fImg = this.finaleImages[stageId].img;
      ctx.drawImage(fImg, 0, 0, width, height);

      // 疊加動態閃爍的高空慶祝煙火亮點，增添街機完賽動態感
      const dynamicFireworks = [
        { fx: width * 0.14, fy: height * 0.14, col: '#ff3838', phase: 0.0 },
        { fx: width * 0.86, fy: height * 0.14, col: '#00f0ff', phase: 1.1 },
        { fx: width * 0.28, fy: height * 0.10, col: '#ffd32a', phase: 2.2 },
        { fx: width * 0.72, fy: height * 0.10, col: '#7bed9f', phase: 3.3 }
      ];
      dynamicFireworks.forEach((fw) => {
        const burst = ((time * 1.4 + fw.phase) % 2.0) / 2.0;
        const radius = 8 + burst * 28;
        ctx.fillStyle = fw.col;
        for (let a = 0; a < 10; a++) {
          const ang = (a / 10) * Math.PI * 2 + time * 0.35;
          const px = fw.fx + Math.cos(ang) * radius;
          const py = fw.fy + Math.sin(ang) * radius * 0.75;
          ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
        }
      });
    } else {
      // 1. 全畫面多層次漸層天空、太陽/明月光暈與慶祝煙火 (y = 0 .. 285)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 290);
      skyGrad.addColorStop(0, (stage && stage.skyTop) || '#2c1654');
      skyGrad.addColorStop(0.55, (stage && stage.skyMid) || '#b33939');
      skyGrad.addColorStop(1, (stage && stage.skyBottom) || '#ffb142');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, 290);

      // 遠景金色日落/月光神聖光暈
      const sunHalo = ctx.createRadialGradient(cx, 130, 15, cx, 130, 220);
      sunHalo.addColorStop(0, 'rgba(255, 242, 0, 0.45)');
      sunHalo.addColorStop(0.5, 'rgba(255, 165, 2, 0.18)');
      sunHalo.addColorStop(1, 'rgba(255, 165, 2, 0)');
      ctx.fillStyle = sunHalo;
      ctx.fillRect(0, 0, width, 290);

      // 高空慶祝煙火綻放 (依全螢幕寬度動態分佈)
      const fireworks = [
        { fx: width * 0.16, fy: 68, col: '#ff3838', phase: 0.0 },
        { fx: width * 0.84, fy: 64, col: '#00f0ff', phase: 1.2 },
        { fx: width * 0.32, fy: 48, col: '#ffd32a', phase: 2.4 },
        { fx: width * 0.68, fy: 52, col: '#7bed9f', phase: 3.6 }
      ];
      fireworks.forEach((fw) => {
        const burst = ((time * 1.4 + fw.phase) % 2.0) / 2.0;
        const radius = 10 + burst * 36;
        ctx.fillStyle = fw.col;
      for (let r = 0; r < 12; r++) {
        const ang = (r * Math.PI * 2) / 12;
        const rx = fw.fx + Math.cos(ang) * radius;
        const ry = fw.fy + Math.sin(ang) * radius;
        ctx.fillRect(rx - 2, ry - 2, 4, 4);
      }
    });

    // 2. 地面終點凱旋廣場與黑白方格終點線 (y = 285 .. height)
    ctx.fillStyle = '#3d3d46';
    ctx.fillRect(0, 285, width, height - 285);
    ctx.fillStyle = '#4f4f5a';
    ctx.beginPath();
    ctx.moveTo(cx - 190, 285);
    ctx.lineTo(cx + 190, 285);
    ctx.lineTo(width - 20, height);
    ctx.lineTo(20, height);
    ctx.closePath();
    ctx.fill();

    // 廣場地面黑白方格終點線 (位於 y = 352..368)
    const checkerY = 354;
    const cellW = 24;
    for (let c = 0; c < Math.ceil(width / cellW); c++) {
      ctx.fillStyle = (c % 2 === 0) ? '#ffffff' : '#111111';
      ctx.fillRect(c * cellW, checkerY, cellW, 7);
      ctx.fillStyle = (c % 2 === 1) ? '#ffffff' : '#111111';
      ctx.fillRect(c * cellW, checkerY + 7, cellW, 7);
    }

    // 3. 繪製佔滿整個畫面的 8 大終點《合金彈頭》風格全景風景 (以 cx 為中心自適應全螢幕展開)
    ctx.save();
    ctx.translate(cx - 320, 0);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#111111';

    if (stageId === 'end_baishatun' || stageId === 'end_lukang') {
      const isBaishatun = stageId === 'end_baishatun';
      // 兩側延伸紅磚古街屋與燈籠廊道
      ctx.fillStyle = '#922b21';
      ctx.fillRect(-70, 135, 216, 152);
      ctx.strokeRect(-70, 135, 216, 152);
      ctx.fillRect(494, 135, 216, 152);
      ctx.strokeRect(494, 135, 216, 152);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(-74, 122, 224, 16);
      ctx.strokeRect(-74, 122, 224, 16);
      ctx.fillRect(490, 122, 224, 16);
      ctx.strokeRect(490, 122, 224, 16);

      if (isBaishatun) {
        // 白沙屯專屬：左側停駐「粉紅超跑」媽祖神轎、右側橘帽香燈腳「勇」字旗海
        ctx.fillStyle = '#ff6b81';
        ctx.beginPath();
        ctx.moveTo(22, 215);
        ctx.lineTo(75, 174);
        ctx.lineTo(128, 215);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffd32a';
        ctx.fillRect(36, 215, 78, 60);
        ctx.strokeRect(36, 215, 78, 60);
        this.drawArcadeText(ctx, '🌸粉紅超跑神轎', 75, 168, '900 11px sans-serif', '#ffeaa7', 'center', 2);
      } else {
        this.drawArcadeText(ctx, '🏮鹿港中山路老街', 75, 168, '900 11px sans-serif', '#ffeaa7', 'center', 2);
      }

      // 正中央佔滿畫面的金碧輝煌大廟（三川殿 + 重簷歇山雙層金瓦 + 雙龍搶珠寶塔 + 蟠龍石柱）
      ctx.fillStyle = '#b03a2e';
      ctx.fillRect(142, 118, 356, 170);
      ctx.strokeRect(142, 118, 356, 170);

      // 下層飛簷金瓦
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.moveTo(106, 132);
      ctx.lineTo(320, 66);
      ctx.lineTo(534, 132);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 上層重簷歇山金瓦與翹脊剪黏
      ctx.fillStyle = '#ffd32a';
      ctx.beginPath();
      ctx.moveTo(152, 98);
      ctx.lineTo(320, 36);
      ctx.lineTo(488, 98);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 屋頂正中央雙龍搶珠與護法青龍
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(320, 32, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(246, 50, 28, 16);
      ctx.fillRect(366, 50, 28, 16);

      // 六根青斗石雕蟠龍柱與三川門
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(268, 176, 104, 112);
      ctx.fillRect(176, 188, 56, 100);
      ctx.fillRect(408, 188, 56, 100);
      ctx.fillStyle = '#d5dbdb';
      [164, 244, 274, 366, 396, 472].forEach((colX) => {
        ctx.fillRect(colX - 7, 134, 14, 154);
        ctx.strokeRect(colX - 7, 134, 14, 154);
      });

      // 廟門上方金箔御匾
      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(224, 126, 192, 38);
      ctx.strokeRect(224, 126, 192, 38);
      this.drawArcadeText(
        ctx,
        isBaishatun ? '🏮 白沙屯拱天宮 🏮' : '🏮 鹿港天后宮 🏮',
        320,
        152,
        '900 20px "Noto Sans TC", serif',
        '#b31217',
        'center',
        1
      );
    } else if (stageId === 'end_chihkan') {
      // 【台南赤嵌樓全景】荷蘭普羅民遮城紅磚高台稜堡 + 海神廟＆文昌閣雙飛簷古閣 + 九座石龜贔屭御碑！
      ctx.fillStyle = '#a04000';
      ctx.fillRect(-40, 175, 720, 112);
      ctx.strokeRect(-40, 175, 720, 112);
      for (let b = -30; b < 670; b += 28) {
        ctx.fillStyle = '#b03a2e';
        ctx.fillRect(b, 165, 18, 12);
        ctx.strokeRect(b, 165, 18, 12);
      }
      [195, 445].forEach((bx, idx) => {
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(bx - 88, 92, 176, 84);
        ctx.strokeRect(bx - 88, 92, 176, 84);
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.moveTo(bx - 112, 118);
        ctx.lineTo(bx, 64);
        ctx.lineTo(bx + 112, 118);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx - 94, 86);
        ctx.lineTo(bx, 38);
        ctx.lineTo(bx + 94, 86);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        this.drawArcadeText(ctx, idx === 0 ? '赤嵌樓・海神廟' : '赤嵌樓・文昌閣', bx, 142, '900 14px serif', '#ffd32a', 'center', 2);
      });
      for (let t = -4; t <= 4; t++) {
        const tx = 320 + t * 44;
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(tx - 10, 218, 20, 48);
        ctx.strokeRect(tx - 10, 218, 20, 48);
        ctx.fillStyle = '#95a5a6';
        ctx.beginPath();
        ctx.arc(tx, 270, 13, Math.PI, 0);
        ctx.fill();
        ctx.stroke();
      }
    } else if (stageId === 'end_eluanbi') {
      // 【墾丁鵝鑾鼻燈塔全景】巴士海峽與太平洋湛藍全海景 + 珊瑚礁椰林大草原 + 純白圓形武裝燈塔與旋轉光束！
      ctx.fillStyle = '#0052a5';
      ctx.fillRect(-120, 188, 880, 56);
      ctx.fillStyle = '#00a8e8';
      ctx.fillRect(-120, 212, 880, 24);
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(-120, 235, 880, 52);

      const beamSwing = Math.sin(time * 2.2) * 40;
      ctx.fillStyle = 'rgba(255, 242, 0, 0.35)';
      ctx.beginPath();
      ctx.moveTo(320, 72);
      ctx.lineTo(-100, 16 + beamSwing);
      ctx.lineTo(-100, 112 + beamSwing);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(320, 72);
      ctx.lineTo(740, 16 - beamSwing);
      ctx.lineTo(740, 112 - beamSwing);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(135, 216, 370, 70);
      ctx.strokeRect(135, 216, 370, 70);
      ctx.fillStyle = '#2d3436';
      for (let gx = 155; gx <= 485; gx += 34) {
        ctx.fillRect(gx, 236, 10, 14);
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(274, 66, 92, 170);
      ctx.strokeRect(274, 66, 92, 170);
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(320, 66, 50, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      this.drawArcadeText(ctx, '🗼 台灣極南・鵝鑾鼻武裝燈塔', 320, 265, '900 16px sans-serif', '#c0392b', 'center', 1);
    } else if (stageId === 'end_sanxiantai') {
      // 【台東三仙台全景】太平洋白浪 + 橫跨全畫面的「八拱跨海波浪步橋」+ 離岸黑色火山角礫岩三仙島！
      ctx.fillStyle = '#0052a5';
      ctx.fillRect(-120, 192, 880, 95);
      ctx.fillStyle = '#00a8e8';
      ctx.fillRect(-120, 232, 880, 55);
      ctx.fillStyle = '#2d3436';
      ctx.beginPath();
      ctx.arc(510, 215, 78, Math.PI, 0);
      ctx.arc(435, 220, 56, Math.PI, 0);
      ctx.arc(575, 225, 52, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(506, 105, 8, 36);
      for (let a = 0; a < 8; a++) {
        const ax = 68 + a * 52;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(ax, 218, 26, Math.PI, 0);
        ctx.stroke();
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ax, 212, 26, Math.PI, 0);
        ctx.stroke();
        ctx.fillStyle = '#dfe6e9';
        ctx.fillRect(ax - 28, 216, 8, 42);
      }
      this.drawArcadeText(ctx, '🌉 台東成功・三仙台八拱跨海步橋', 320, 152, '900 18px sans-serif', '#ffd32a', 'center', 2);
    } else if (stageId === 'end_taroko') {
      // 【花蓮太魯閣牌坊全景】兩側千仞大理石峽谷絕壁 + 立霧溪碧水 + 正中央「東西橫貫公路」宮殿牌坊！
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(-120, 20, 238, 268);
      ctx.strokeRect(-120, 20, 238, 268);
      ctx.fillRect(522, 20, 238, 268);
      ctx.strokeRect(522, 20, 238, 268);
      ctx.fillStyle = '#00cec9';
      ctx.fillRect(118, 232, 404, 54);
      ctx.fillStyle = '#c0392b';
      [148, 236, 404, 492].forEach((px) => {
        ctx.fillRect(px - 10, 78, 20, 210);
        ctx.strokeRect(px - 10, 78, 20, 210);
      });
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(138, 86, 364, 34);
      ctx.strokeRect(138, 86, 364, 34);
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.moveTo(116, 88);
      ctx.lineTo(320, 40);
      ctx.lineTo(524, 88);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      this.drawArcadeText(ctx, '東西橫貫公路・太魯閣', 320, 109, '900 20px serif', '#ffd32a', 'center', 2);
    } else if (stageId === 'end_lanyang') {
      // 【宜蘭蘭陽博物館全景】外海龜山島 + 烏石港鏡面濕地 + 20度傾斜單面山幾何玻璃石材博物館佔滿畫面！
      ctx.fillStyle = '#1e5631';
      ctx.beginPath();
      ctx.arc(525, 195, 58, Math.PI, 0);
      ctx.arc(465, 195, 24, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      this.drawArcadeText(ctx, '🐢 龜山島', 515, 130, '900 12px sans-serif', '#7bed9f', 'center', 2);

      ctx.fillStyle = '#006266';
      ctx.fillRect(-120, 215, 880, 72);
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.moveTo(75, 255);
      ctx.lineTo(365, 44);
      ctx.lineTo(510, 255);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.moveTo(220, 255);
      ctx.lineTo(365, 52);
      ctx.lineTo(445, 255);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      this.drawArcadeText(ctx, '📐 宜蘭頭城・蘭陽博物館', 320, 242, '900 18px sans-serif', '#ffd32a', 'center', 2);
    } else {
      // 【澎湖跨海大橋全景】吼門水道碧藍大海 + 通梁古榕與仙人掌 + 橫跨全畫面的純白跨海大橋拱門！
      ctx.fillStyle = '#0077b6';
      ctx.fillRect(-120, 192, 880, 95);
      ctx.fillStyle = '#00b4d8';
      ctx.fillRect(-120, 235, 880, 52);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 22;
      ctx.beginPath();
      ctx.arc(320, 285, 185, Math.PI, 0);
      ctx.stroke();
      ctx.lineWidth = 2.5;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(205, 84, 230, 42);
      ctx.strokeStyle = '#111111';
      ctx.strokeRect(205, 84, 230, 42);
      this.drawArcadeText(ctx, '澎湖跨海大橋', 320, 113, '900 22px serif', '#e74c3c', 'center', 1);
    }
    ctx.restore();

    // 4. 繪製廣場兩旁夾道歡呼、跳躍揮旗的群眾 (`兩旁人群歡呼`: 依全螢幕寬度自動列隊於車子左右兩側)
    const crowdPositions = [
      { x: cx - 265, y: 342, v: 0 },
      { x: cx - 205, y: 356, v: 1 },
      { x: cx - 145, y: 368, v: 2 },
      { x: cx + 145, y: 368, v: 0 },
      { x: cx + 205, y: 356, v: 1 },
      { x: cx + 265, y: 342, v: 2 }
    ];
    crowdPositions.forEach((cp) => {
      this.drawCheeringCrowdSprite(ctx, { variant: cp.v }, cp.x, cp.y, 54, 68);
    });
    }

    // 5. 繪製停在終點線正中央的騎車/駕駛像素圖（車子只佔畫面 1/4 大小，完整呈現後方終點風景！）
    ctx.save();
    const vehicleCenterX = Math.floor(width / 2);
    // 若使用上傳的 8 大終點全景構圖，車子精準停在構圖中央的 GOAL! 終點線與甩尾胎痕廣場上 (y ≈ 85.5%)，不遮擋下方景點金匾與上方古蹟地標！
    const vehicleBaseY = hasCustomFinaleArt ? Math.floor(height * 0.855) : 386;
    const id = player.vehicle.id;
    const atlas = this.vehicleAtlases[id];

    // 車底陰影与停車光環
    ctx.fillStyle = 'rgba(255, 211, 42, 0.28)';
    ctx.beginPath();
    ctx.ellipse(vehicleCenterX, vehicleBaseY - 6, 76, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    if (atlas && atlas.loaded && (atlas.frames.right_cruise1 || atlas.frames.crash8)) {
      // 選用一張清晰的騎車/完賽歡呼像素圖，嚴格控制在畫面 1/4 高度 (~94px) 與寬度 (~150px)
      const frame = atlas.frames.right_cruise1 || atlas.frames.crash8;
      const targetH = 92; // 92 / 400 ≈ 畫面高度 1/4
      const maxW = 152;   // 152 / 640 ≈ 畫面寬度 1/4
      let scale = targetH / frame.h;
      if (frame.w * scale > maxW) {
        scale = maxW / frame.w;
      }
      const drawW = Math.round(frame.w * scale);
      const drawH = Math.round(frame.h * scale);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        atlas.img,
        frame.x,
        frame.y,
        frame.w,
        frame.h,
        Math.floor(vehicleCenterX - drawW / 2),
        Math.floor(vehicleBaseY - drawH),
        drawW,
        drawH
      );
    } else {
      ctx.translate(vehicleCenterX, vehicleBaseY);
      ctx.scale(0.58, 0.58);
      this.drawPlayerVehicle(ctx, 0, 0, player);
    }
    ctx.restore();

    // 6. 頂部精巧不擋景的「終點制霸・分數＆卡路里即時橫幅」
    ctx.fillStyle = 'rgba(10, 12, 24, 0.78)';
    ctx.fillRect(8, 6, width - 16, 28);
    ctx.strokeStyle = '#ffd32a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(8, 6, width - 16, 28);

    const totalScore = victoryStats ? victoryStats.totalScore : 0;
    const totalKcal = victoryStats ? victoryStats.totalKcal : 0;
    const burnedKcal = victoryStats ? victoryStats.burnedKcal : 0;
    this.drawArcadeText(
      ctx,
      `🏁 終點制霸：【${stage ? stage.spotName : '台灣終點'}】｜ 總分 ${totalScore} ｜ 攝取 ${totalKcal} kcal (燃脂 ${burnedKcal} kcal)`,
      width / 2,
      25,
      '900 12px "Noto Sans TC", sans-serif',
      '#ffd32a',
      'center',
      2
    );

    ctx.restore();
  }
}

window.spriteRenderer = new SpriteRenderer();

