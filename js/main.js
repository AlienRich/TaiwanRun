/**
 * TaiwanOutRun - 主迴圈、車庫 6 大神車選擇器、變胖與推車系統及跨平台控制
 */
(function () {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const screenContainerEl = document.getElementById('screen-container');

  // SEGA Super-Scaler 街機高畫質超採樣倍率（邏輯高度維持 400，內部緩衝區提升 1.65 倍，大幅提升畫質與銳利度）
  const RENDER_SCALE = 1.65;
  let logicalWidth = 720;
  const logicalHeight = 400;
  window.logicalCanvasWidth = logicalWidth;
  window.logicalCanvasHeight = logicalHeight;

  /**
   * 跨裝置全螢幕自適應縮放系統（電腦、手機、平板自動調整放到最大，維持邏輯垂直基準 400px 並以 1.65x 高畫質渲染）
   */
  function resizeCanvasToFullScreen() {
    if (!canvas) return;
    const rect = screenContainerEl
      ? screenContainerEl.getBoundingClientRect()
      : { width: window.innerWidth, height: window.innerHeight };
    const vw = Math.max(320, rect.width || window.innerWidth);
    const vh = Math.max(240, rect.height || window.innerHeight);
    const aspect = vw / vh;
    const targetW = Math.round(Math.max(560, Math.min(860, logicalHeight * aspect)));
    logicalWidth = targetW;
    window.logicalCanvasWidth = logicalWidth;
    window.logicalCanvasHeight = logicalHeight;

    const scaledW = Math.round(logicalWidth * RENDER_SCALE);
    const scaledH = Math.round(logicalHeight * RENDER_SCALE);
    if (canvas.width !== scaledW || canvas.height !== scaledH) {
      canvas.width = scaledW;
      canvas.height = scaledH;
    }
  }

  window.addEventListener('resize', resizeCanvasToFullScreen);
  window.addEventListener('orientationchange', () => setTimeout(resizeCanvasToFullScreen, 120));
  document.addEventListener('fullscreenchange', () => {
    resizeCanvasToFullScreen();
    const btnFs = document.getElementById('btn-fullscreen');
    if (btnFs) {
      btnFs.textContent = document.fullscreenElement ? '🗗 退出全螢幕' : '⛶ 全螢幕放大';
    }
  });
  resizeCanvasToFullScreen();

  const overlayEl = document.getElementById('overlay-screen');
  const overlayTitleEl = document.getElementById('overlay-title');
  const overlaySubtitleEl = document.getElementById('overlay-subtitle');
  const vehicleGridEl = document.getElementById('vehicle-grid');
  const detailNameEl = document.getElementById('detail-name');
  const detailPlateEl = document.getElementById('detail-plate');
  const detailDescEl = document.getElementById('detail-desc');
  const detailNitroEl = document.getElementById('detail-nitro');
  const detailCrashEl = document.getElementById('detail-crash');

  const btnStart = document.getElementById('btn-start');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnGarage = document.getElementById('btn-garage');
  const btnFatTest = document.getElementById('btn-fat-test');
  const btnCrashTest = document.getElementById('btn-crash-test');
  const btnFinaleTest = document.getElementById('btn-finale-test');
  const btnSound = document.getElementById('btn-sound');

  const victoryScreenEl = document.getElementById('victory-screen');
  const victoryFloatingBarEl = document.getElementById('victory-floating-bar');
  const victoryTitleEl = document.getElementById('victory-title');
  const vBaseScoreEl = document.getElementById('v-base-score');
  const vTimeBonusEl = document.getElementById('v-time-bonus');
  const vClearBonusEl = document.getElementById('v-clear-bonus');
  const vTotalScoreEl = document.getElementById('v-total-score');
  const vFoodCountEl = document.getElementById('v-food-count');
  const vCalIntakeEl = document.getElementById('v-cal-intake');
  const vCalBurnedEl = document.getElementById('v-cal-burned');
  const vBodyRankEl = document.getElementById('v-body-rank');
  const vFoodListEl = document.getElementById('v-food-list');
  const scenicReviewGridEl = document.getElementById('scenic-review-grid');

  const btnShowVictoryModal = document.getElementById('btn-show-victory-modal');
  const btnHideVictoryModal = document.getElementById('btn-hide-victory-modal');
  const btnAdmireFinale = document.getElementById('btn-admire-finale');
  const btnNextFinalePreview = document.getElementById('btn-next-finale-preview');
  const btnVictoryRestart = document.getElementById('btn-victory-restart');
  const btnVictoryRestartFloat = document.getElementById('btn-victory-restart-float');

  const road = new window.Pseudo3DRoad();
  const player = new window.PlayerVehicle();
  const collision = new window.CollisionSystem();

  const input = {
    left: false,
    right: false,
    brake: false,
    nitro: false
  };

  let gameState = 'TITLE'; // TITLE | PLAYING | GAMEOVER | VICTORY
  let score = 0;
  let timeLeft = 30;
  let lapTime = 0;
  let bannerTimer = 0;
  let bannerText = '';
  let lastTime = performance.now();

  let currentVictoryStage = null;
  let currentVictoryStats = null;
  let victoryModalTimer = 0;
  let victoryModalAutoShown = false;
  let finalePreviewIndex = 0;

  function renderStars(count) {
    return '★'.repeat(count) + '☆'.repeat(5 - count);
  }

  function renderVehicleGarage() {
    if (!vehicleGridEl) return;
    vehicleGridEl.innerHTML = '';

    window.VEHICLE_ROSTER.forEach((v, idx) => {
      const card = document.createElement('div');
      card.className = 'vehicle-card' + (idx === player.selectedIndex ? ' selected' : '');
      card.innerHTML = `
        <div class="vcard-row">
          <canvas class="vcard-preview" width="52" height="36"></canvas>
          <div class="vcard-info">
            <div class="vcard-title">${idx + 1}. ${v.name}</div>
            <div class="vcard-tag">${v.tag}</div>
            <div class="vcard-stats">極速 ${renderStars(v.stats.speed)}</div>
          </div>
        </div>
      `;
      const previewCanvas = card.querySelector('.vcard-preview');
      if (window.spriteRenderer && previewCanvas) {
        window.spriteRenderer.drawVehicleCardPreview(previewCanvas, v.id);
      }
      card.addEventListener('click', () => {
        window.arcadeAudio.init();
        window.arcadeAudio.playSelectBeep();
        player.selectVehicle(idx);
        player.crashTimer = 0;
        renderVehicleGarage();
      });
      vehicleGridEl.appendChild(card);
    });

    const curr = player.vehicle;
    if (detailNameEl) detailNameEl.textContent = curr.name;
    if (detailPlateEl) detailPlateEl.textContent = curr.plate;
    if (detailDescEl) detailDescEl.textContent = curr.desc;
    if (detailNitroEl) detailNitroEl.textContent = `🔥 空白鍵必殺：${curr.nitroName}`;
    if (detailCrashEl) detailCrashEl.textContent = `💥 翻車空中重組：${curr.crashQuote}`;
  }

  window.onVehicleAtlasLoaded = function () {
    if (gameState !== 'PLAYING') {
      renderVehicleGarage();
    }
  };

  renderVehicleGarage();

  function formatLapTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    const hundredths = Math.floor((seconds * 100) % 100).toString().padStart(2, '0');
    return `${mins}'${secs}"${hundredths}`;
  }

  function showStageBanner(text) {
    bannerText = text;
    bannerTimer = 3.0;
  }

  window.onWeatherChanged = function (weatherId, isDynamic, stage) {
    if (!isDynamic || gameState !== 'PLAYING') return;
    const wMeta = (window.WEATHER_TYPES_META && window.WEATHER_TYPES_META[weatherId])
      || { icon: '🌤️', label: '晴天', desc: '光影變化' };
    showStageBanner(`${wMeta.icon} 天候隨時間動態變化：進入【${wMeta.label}】（${wMeta.desc}）`);
  };

  function hideVictoryUI() {
    if (victoryScreenEl) victoryScreenEl.classList.add('hidden');
    if (victoryFloatingBarEl) victoryFloatingBarEl.classList.add('hidden');
  }

  function showVictoryModal() {
    if (victoryScreenEl) victoryScreenEl.classList.remove('hidden');
    if (victoryFloatingBarEl) victoryFloatingBarEl.classList.add('hidden');
  }

  function hideVictoryModalToAdmirePanorama() {
    if (victoryScreenEl) victoryScreenEl.classList.add('hidden');
    if (victoryFloatingBarEl) victoryFloatingBarEl.classList.remove('hidden');
    showStageBanner(`🏞️ 終點全景模式：${currentVictoryStage ? currentVictoryStage.spotName : ''}（車佔1/4＋兩旁歡呼）`);
  }

  function startGame() {
    window.arcadeAudio.init();
    if (window.routeManager) {
      window.routeManager.resetRoute();
    }
    road.buildStageTrack('fugang', 1);
    player.reset();
    score = 0;
    timeLeft = road.currentStage.timeLimit || 30; // 起點富岡火車站限時 30 秒
    lapTime = 0;
    gameState = 'PLAYING';
    hideVictoryUI();
    overlayEl.classList.add('hidden');
    showStageBanner(`🚂 起點：桃園楊梅・富岡火車站（限時30秒，10秒後進入分岔點！）`);
    window.arcadeAudio.playCheckpoint();
  }

  function openGarage() {
    gameState = 'TITLE';
    window.arcadeAudio.stopEngine();
    hideVictoryUI();
    overlayTitleEl.innerHTML = 'TAIWAN <span>OUTRUN</span>';
    overlaySubtitleEl.textContent = '從【富岡火車站】衝出！沿途欣賞牌樓、小吃攤、山景海景，直奔8大終點全景！';
    btnStart.textContent = 'INSERT COIN ‧ 從富岡火車站出發！';
    renderVehicleGarage();
    overlayEl.classList.remove('hidden');
  }

  function endGame() {
    gameState = 'GAMEOVER';
    window.arcadeAudio.stopEngine();
    hideVictoryUI();
    const historyArr = (window.routeManager && (window.routeManager.visitedHistory || window.routeManager.visitedIds)) || ['fugang'];
    const visitedStr = historyArr
      .map((id) => (window.STAGE_TREE[id] ? window.STAGE_TREE[id].spotName || window.STAGE_TREE[id].name : id))
      .join(' ➔ ');
    const totalStagesCount = (window.routeManager && window.routeManager.totalStages) || 15;
    overlayTitleEl.innerHTML = 'TIME OVER <span>挑戰結束</span>';
    overlaySubtitleEl.innerHTML = `駕駛 <b>${player.vehicle.name}</b> 抵達第 ${road.stageNumber}/${totalStagesCount} 關 <b>${road.currentStage.name}</b> ｜ 總分：<b>${Math.floor(score).toLocaleString()}</b> ｜ 攝取熱量：<b>${player.totalCaloriesKcal} kcal</b><br><span style="font-size:11px;color:#ffd32a;">本趟足跡：${visitedStr}</span>`;
    btnStart.textContent = 'INSERT COIN ‧ 重新從富岡車站出發';
    renderVehicleGarage();
    overlayEl.classList.remove('hidden');
  }

  /**
   * 建立並渲染「通關結算：計算分數、卡路里統計、10關景點回顧」
   */
  function populateVictorySettlementUI(finaleStage) {
    const baseScore = Math.floor(score);
    const timeBonus = Math.floor(Math.max(0, timeLeft) * 1500);
    const clearBonus = 50000;
    const totalScore = baseScore + timeBonus + clearBonus;
    score = totalScore;

    const totalKcal = player.totalCaloriesKcal || 0;
    const burnedKcal = player.totalCaloriesBurnedKcal || 0;
    const foodsCount = player.foodsEatenCount || 0;
    const netKcal = Math.max(0, totalKcal - burnedKcal);

    let bodyRank = '⚡ 精實破風車神';
    if (player.fatTriggerCount >= 2 || netKcal >= 1600) {
      bodyRank = '🫃 夜市發福大胃王';
    } else if (foodsCount >= 3 || totalKcal >= 800) {
      bodyRank = '🍖 台灣美食老饕車手';
    } else if (burnedKcal >= 400) {
      bodyRank = '🔥 推車燃脂鐵人';
    }

    currentVictoryStats = {
      baseScore: baseScore.toLocaleString(),
      timeBonus: timeBonus.toLocaleString(),
      clearBonus: clearBonus.toLocaleString(),
      totalScore: totalScore.toLocaleString(),
      totalKcal,
      burnedKcal,
      foodsCount,
      bodyRank
    };

    if (victoryTitleEl) {
      victoryTitleEl.innerHTML = `🏆 環島終點制霸：<span>${finaleStage.spotName || finaleStage.name}</span>（耗時 ${formatLapTime(lapTime)}）`;
    }
    if (vBaseScoreEl) vBaseScoreEl.textContent = currentVictoryStats.baseScore;
    if (vTimeBonusEl) vTimeBonusEl.textContent = `+${currentVictoryStats.timeBonus}`;
    if (vClearBonusEl) vClearBonusEl.textContent = `+${currentVictoryStats.clearBonus}`;
    if (vTotalScoreEl) vTotalScoreEl.textContent = currentVictoryStats.totalScore;

    if (vFoodCountEl) vFoodCountEl.textContent = `${foodsCount} 份台灣小吃`;
    if (vCalIntakeEl) vCalIntakeEl.textContent = `${totalKcal} kcal`;
    if (vCalBurnedEl) vCalBurnedEl.textContent = `-${burnedKcal} kcal`;
    if (vBodyRankEl) vBodyRankEl.textContent = bodyRank;
    if (vFoodListEl) {
      const uniqueFoods = Array.from(new Set(player.foodsEatenHistory || []));
      vFoodListEl.textContent = uniqueFoods.length > 0
        ? `😋 已品嚐：${uniqueFoods.join('、')}`
        : '😋 清新無負擔完賽（沿途未拾取夜市小吃）';
    }

    // 建構 15 關景點回顧畫廊（若透過預覽鍵觸發不足 15 關，自動補齊本趟隨機路線供完整回顧）
    if (scenicReviewGridEl) {
      scenicReviewGridEl.innerHTML = '';
      const totalStagesCount = (window.routeManager && window.routeManager.totalStages) || 15;
      const rawHistory = (window.routeManager && (window.routeManager.visitedHistory || window.routeManager.visitedIds))
        ? (window.routeManager.visitedHistory || window.routeManager.visitedIds).slice()
        : ['fugang'];

      while (rawHistory.length < totalStagesCount - 1 && window.routeManager && window.routeManager.scenicPool) {
        const candidate = window.routeManager.scenicPool[rawHistory.length];
        if (candidate && !rawHistory.includes(candidate)) {
          rawHistory.push(candidate);
        } else {
          break;
        }
      }
      if (rawHistory[rawHistory.length - 1] !== finaleStage.id) {
        rawHistory[totalStagesCount - 1] = finaleStage.id;
      }

      rawHistory.slice(0, totalStagesCount).forEach((stId, idx) => {
        const st = window.STAGE_TREE[stId] || finaleStage;
        const item = document.createElement('div');
        item.className = 'scenic-review-item' + (st.isFinale ? ' is-finale' : '');

        const wMeta = (window.WEATHER_TYPES_META && st.weather && window.WEATHER_TYPES_META[st.weather])
          || { icon: '☀️', label: '晴天' };
        const stepLabel = idx === 0
          ? `起點 (第1關) ${wMeta.icon}`
          : (idx === totalStagesCount - 1 || st.isFinale
            ? `🏁 終點 (第${totalStagesCount}關) ${wMeta.icon}`
            : `第 ${idx + 1} 關 ‧ ${st.region} ${wMeta.icon}`);
        const subSpotsText = (st.subSpots && st.subSpots.length >= 2)
          ? `${st.subSpots[1].sign}・${st.subSpots[2].sign}`
          : st.category;

        item.innerHTML = `
          <canvas class="sreview-canvas" width="112" height="42"></canvas>
          <div class="sreview-step">${stepLabel}</div>
          <div class="sreview-name">${st.spotName || st.name}</div>
          <div class="sreview-sub">${subSpotsText}</div>
        `;
        scenicReviewGridEl.appendChild(item);

        const c = item.querySelector('.sreview-canvas');
        if (c && window.spriteRenderer) {
          const sctx = c.getContext('2d');
          window.spriteRenderer.drawStageLandmarkIcon(sctx, st.id, 0, 0, 112, 42);
        }
      });
    }
  }

  function victoryGame(finaleStage) {
    gameState = 'VICTORY';
    window.arcadeAudio.stopEngine();
    overlayEl.classList.add('hidden');

    // 車輛通過終點線後立即停下來 (speed = 0)，於終點全景正中央展示 1/4 比例騎車圖與兩旁歡呼群眾！
    player.speed = 0;
    player.steer = 0;
    player.isPushingCar = false;
    player.nitroTimer = 0;
    player.crashTimer = 0;

    currentVictoryStage = finaleStage || road.currentStage;
    populateVictorySettlementUI(currentVictoryStage);

    // 先讓玩家無遮擋欣賞 2.4 秒「終點全景（風景佔滿畫面＋車子1/4＋兩旁歡呼）」，再自動彈出通關結算與景點回顧面板
    if (victoryScreenEl) victoryScreenEl.classList.add('hidden');
    if (victoryFloatingBarEl) victoryFloatingBarEl.classList.remove('hidden');
    victoryModalTimer = 2.4;
    victoryModalAutoShown = false;

    showStageBanner(`🎉 通過終點線停駐！【${currentVictoryStage.spotName}】全景歡呼！（即將展開分數/卡路里/景點回顧）`);
  }

  window.addEventListener('keydown', (e) => {
    if (gameState !== 'PLAYING') {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        window.arcadeAudio.init();
        window.arcadeAudio.playSelectBeep();
        player.selectVehicle(player.selectedIndex - 1);
        renderVehicleGarage();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        window.arcadeAudio.init();
        window.arcadeAudio.playSelectBeep();
        player.selectVehicle(player.selectedIndex + 1);
        renderVehicleGarage();
      } else if (e.code === 'Enter') {
        startGame();
      }
    }

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        input.left = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        input.right = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        e.preventDefault();
        input.brake = true;
        break;
      case 'Space':
      case 'KeyZ':
        e.preventDefault();
        input.nitro = true;
        break;
    }
  });

  window.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        input.left = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        input.right = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        input.brake = false;
        break;
      case 'Space':
      case 'KeyZ':
        input.nitro = false;
        break;
    }
  });

  function bindHoldButton(btnId, keyName) {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    const press = (e) => {
      e.preventDefault();
      window.arcadeAudio.init();
      input[keyName] = true;
      btn.classList.add('active');
    };

    const release = (e) => {
      e.preventDefault();
      input[keyName] = false;
      btn.classList.remove('active');
    };

    btn.addEventListener('pointerdown', press);
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointerleave', release);
    btn.addEventListener('pointercancel', release);
  }

  bindHoldButton('btn-left', 'left');
  bindHoldButton('btn-right', 'right');
  bindHoldButton('btn-brake', 'brake');
  bindHoldButton('btn-nitro', 'nitro');

  btnStart.addEventListener('click', startGame);
  if (btnVictoryRestart) btnVictoryRestart.addEventListener('click', startGame);
  if (btnVictoryRestartFloat) btnVictoryRestartFloat.addEventListener('click', startGame);

  if (btnShowVictoryModal) {
    btnShowVictoryModal.addEventListener('click', () => {
      window.arcadeAudio.init();
      window.arcadeAudio.playSelectBeep();
      showVictoryModal();
    });
  }

  if (btnHideVictoryModal) {
    btnHideVictoryModal.addEventListener('click', () => {
      window.arcadeAudio.init();
      window.arcadeAudio.playSelectBeep();
      hideVictoryModalToAdmirePanorama();
    });
  }

  if (btnAdmireFinale) {
    btnAdmireFinale.addEventListener('click', () => {
      window.arcadeAudio.init();
      window.arcadeAudio.playSelectBeep();
      hideVictoryModalToAdmirePanorama();
    });
  }

  function triggerFinalePanoramaPreview() {
    window.arcadeAudio.init();
    window.arcadeAudio.playCheckpoint();
    const finales = window.FINALE_STAGES_LIST || [];
    if (finales.length === 0) return;
    const chosenFinale = finales[finalePreviewIndex % finales.length];
    finalePreviewIndex = (finalePreviewIndex + 1) % finales.length;
    if (score < 10000) {
      score = 98500;
      player.totalCaloriesKcal = 1260;
      player.totalCaloriesBurnedKcal = 420;
      player.foodsEatenCount = 3;
      player.foodsEatenHistory = ['炭烤大香腸', '大腸蚵仔麵線', '古早味燒肉粽'];
    }
    victoryGame(chosenFinale);
  }

  if (btnFinaleTest) {
    btnFinaleTest.addEventListener('click', triggerFinalePanoramaPreview);
  }
  if (btnNextFinalePreview) {
    btnNextFinalePreview.addEventListener('click', () => {
      triggerFinalePanoramaPreview();
      hideVictoryModalToAdmirePanorama();
    });
  }

  if (btnGarage) {
    btnGarage.addEventListener('click', openGarage);
  }

  const routeMapScreenEl = document.getElementById('route-map-screen');
  const routeMapContentEl = document.getElementById('route-map-content');
  const btnRouteMap = document.getElementById('btn-route-map');
  const btnCloseRouteMap = document.getElementById('btn-close-route-map');

  function renderFullRouteMapModal() {
    if (!routeMapContentEl) return;
    routeMapContentEl.innerHTML = '';

    const tiers = [
      {
        title: '🚂 第一階段（第 1 關・固定起點・約 20 秒後抵達第一個 OutRun 分岔口）',
        stages: [window.START_STAGE_DATA]
      },
      {
        title: '🏞️ 第二階段（第 2 ～ 14 關・依地理【由南至北、由西到東】排序之 38 大台灣中途景點・每關約 20 秒＋專屬天氣與動態變化）',
        stages: window.SCENIC_STAGES_LIST || []
      },
      {
        title: '🏁 第三階段（第 15 關・依地理【由南至北、由西到東】排序之 8 大終點・全程共 5 分鐘完賽）',
        stages: window.FINALE_STAGES_LIST || []
      }
    ];

    tiers.forEach((t) => {
      const box = document.createElement('div');
      box.className = 'rmap-tier';
      box.innerHTML = `<div class="rmap-tier-title">${t.title}</div><div class="rmap-grid"></div>`;
      const grid = box.querySelector('.rmap-grid');

      t.stages.forEach((st, idx) => {
        if (!st) return;
        const node = document.createElement('div');
        node.className = 'rmap-node';
        const subs = (st.subSpots || []).map((s) => s.title).join(' ➔ ');
        const wMeta = (window.WEATHER_TYPES_META && st.weather && window.WEATHER_TYPES_META[st.weather])
          || { icon: '☀️', label: '盛夏晴天' };
        node.innerHTML = `
          <div class="rmap-node-head">
            <canvas class="rmap-thumb" width="76" height="32"></canvas>
            <div>
              <div class="rmap-node-region">[${st.region}] ${st.category} ｜ ${wMeta.icon}${wMeta.label}</div>
              <div class="rmap-node-title">${idx + 1}. ${st.spotName}</div>
            </div>
          </div>
          <div class="rmap-subspots">沿途6小景：${subs}</div>
        `;
        grid.appendChild(node);

        const c = node.querySelector('.rmap-thumb');
        if (c && window.spriteRenderer) {
          window.spriteRenderer.drawStageLandmarkIcon(c.getContext('2d'), st.id, 0, 0, 76, 32);
        }
      });

      routeMapContentEl.appendChild(box);
    });
  }

  if (btnRouteMap) {
    btnRouteMap.addEventListener('click', () => {
      window.arcadeAudio.init();
      window.arcadeAudio.playSelectBeep();
      renderFullRouteMapModal();
      if (routeMapScreenEl) routeMapScreenEl.classList.remove('hidden');
    });
  }

  if (btnCloseRouteMap) {
    btnCloseRouteMap.addEventListener('click', () => {
      window.arcadeAudio.init();
      window.arcadeAudio.playSelectBeep();
      if (routeMapScreenEl) routeMapScreenEl.classList.add('hidden');
    });
  }

  if (btnFatTest) {
    btnFatTest.addEventListener('click', () => {
      window.arcadeAudio.init();
      if (!player.isFatMode) {
        player.enterFatMode();
      } else {
        player.calories = 0;
        player.isFatMode = false;
        player.isPushingCar = false;
        window.arcadeAudio.playDietPop();
      }
    });
  }

  if (btnCrashTest) {
    btnCrashTest.addEventListener('click', () => {
      window.arcadeAudio.init();
      player.crashInvincible = 0;
      player.crashTimer = 0;
      player.triggerCrash(1);
    });
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      window.arcadeAudio.init();
      window.arcadeAudio.playSelectBeep();
      const docEl = document.documentElement;
      if (!document.fullscreenElement) {
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {});
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
        }
      } else if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setTimeout(resizeCanvasToFullScreen, 150);
    });
  }

  if (btnSound) {
    btnSound.addEventListener('click', () => {
      window.arcadeAudio.init();
      const on = window.arcadeAudio.toggle();
      btnSound.textContent = on ? '🔊 音樂/音效: 開' : '🔇 音樂/音效: 關';
    });
  }

  function update(dt) {
    if (bannerTimer > 0) {
      bannerTimer = Math.max(0, bannerTimer - dt);
    }

    // 【終點通關狀態 VICTORY】：車子停在終點線後 (speed = 0)，不繼續往前衝，並在欣賞終點全景後自動顯示結算面板
    if (gameState === 'VICTORY') {
      player.speed = 0;
      player.steer = 0;
      if (!victoryModalAutoShown && victoryModalTimer > 0) {
        victoryModalTimer = Math.max(0, victoryModalTimer - dt);
        if (victoryModalTimer <= 0) {
          victoryModalAutoShown = true;
          showVictoryModal();
        }
      }
      return;
    }

    road.updateTraffic(dt, player, showStageBanner);

    if (gameState === 'TITLE' || gameState === 'GAMEOVER') {
      if (player.crashTimer > 0) {
        player.update(dt, input, road);
      } else {
        player.speed = 9600;
        player.z = (player.z + player.speed * dt) % road.trackLength;
        const seg = road.findSegment(player.z);
        road.skyOffset += seg.curve * 1.1;
        // 標題背景自動輪流展示「往前、往左、往右」三個視角
        const demoWave = Math.sin(performance.now() * 0.0016);
        player.steer = Math.abs(demoWave) < 0.42 ? 0 : (demoWave > 0 ? 0.55 : -0.55);
        if (player.isFatMode && input.nitro) {
          player.isPushingCar = true;
          player.calories = Math.max(0, player.calories - 60 * dt);
          if (player.calories <= 0) {
            player.isFatMode = false;
            player.isPushingCar = false;
            window.arcadeAudio.playDietPop();
          }
        } else {
          player.isPushingCar = false;
          if (input.nitro && !player.isFatMode) {
            player.triggerNitro();
          }
        }
        if (player.nitroTimer > 0) {
          player.nitroTimer = Math.max(0, player.nitroTimer - dt);
        }
        if (player.nitroCooldown > 0) {
          player.nitroCooldown = Math.max(0, player.nitroCooldown - dt);
        }
      }
      return;
    }

    timeLeft -= dt;
    lapTime += dt;
    if (timeLeft <= 0) {
      timeLeft = 0;
      endGame();
      return;
    }

    player.update(dt, input, road);
    const stageProgress = road.trackLength > 0 ? (player.z / road.trackLength) : 0;
    road.updateWeatherProgress(stageProgress, dt);

    collision.checkTrafficAndObstacleCollision(player, road, (bonus) => {
      score += bonus;
    }, showStageBanner);

    collision.checkForkAndStageTransition(
      player,
      road,
      (newStage) => {
        const totalStagesCount = (window.routeManager && window.routeManager.totalStages) || 15;
        const wMeta = (window.WEATHER_TYPES_META && newStage.weather && window.WEATHER_TYPES_META[newStage.weather])
          || { icon: '☀️', label: '盛夏晴天' };
        timeLeft = newStage.timeLimit || 60;
        score += 10000;
        if (newStage.isFinale) {
          showStageBanner(`🏁 最終關 (${totalStagesCount}/${totalStagesCount})：${newStage.name}（${wMeta.icon}${wMeta.label}）！衝向正中央終點線！`);
        } else {
          showStageBanner(`STAGE ${road.stageNumber}/${totalStagesCount} ‧ 進入【${newStage.region}】${newStage.name}（${wMeta.icon}${wMeta.label}）`);
        }
      },
      (finaleStage) => {
        victoryGame(finaleStage);
      }
    );

    score += (player.speed / 65) * dt;
  }

  function drawArcadeCabinetPostProcess(ctx, w, h) {
    // 1986 SEGA Super-Scaler 街機 CRT 螢幕微暗角與高對比街機光澤層
    const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.35, w * 0.5, h * 0.5, w * 0.68);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(0, 4, 15, 0.24)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }

  function render(dt) {
    ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    // 若已衝過終點線進入 VICTORY：繪製「終點風景佔滿全畫面 ＋ 兩旁人群歡呼 ＋ 1/4 比例騎車圖停駐正中央」
    if (gameState === 'VICTORY') {
      window.spriteRenderer.drawFinaleVictoryScene(
        ctx,
        logicalWidth,
        logicalHeight,
        currentVictoryStage || road.currentStage,
        player,
        currentVictoryStats
      );
      if (bannerTimer > 0) {
        window.spriteRenderer.drawNitroBanner(
          ctx,
          logicalWidth / 2,
          logicalHeight - 8,
          bannerText,
          '#ffd32a'
        );
      }
      drawArcadeCabinetPostProcess(ctx, logicalWidth, logicalHeight);
      return;
    }

    // 1. 繪製偽 3D 公路、各地沿途牌樓/小吃/山景/海景、OutRun 巨型風景立牌、特色美食與車流
    road.render(ctx, logicalWidth, logicalHeight, player);

    // 2. 繪製煙霧、底盤磨地火花與推車汗水粒子
    window.spriteRenderer.updateAndDrawParticles(ctx, dt);

    // 3. 繪製當前選擇的台灣神車（正後方往前行駛視角 + 動態壓車左右傾斜，位於 logicalHeight - 36）
    window.spriteRenderer.drawPlayerVehicle(
      ctx,
      logicalWidth / 2,
      logicalHeight - 36,
      player
    );

    const aheadSeg = road.findSegment(player.z + 900);

    // 4. 繪製 1986 SEGA OutRun 街機 HUD（含關卡轉換巨型閃爍箭頭與景點插畫）
    window.spriteRenderer.drawOutRunHUD(ctx, logicalWidth, logicalHeight, {
      timeLeft: timeLeft,
      kmh: player.getDisplayKmh(),
      score: score,
      stageId: road.currentStage.id,
      stageName: road.currentStage.name,
      vehicleName: player.vehicle.name,
      lapFormatted: formatLapTime(lapTime),
      stageNumber: road.stageNumber,
      isNitro: player.nitroTimer > 0,
      nitroPercent: player.getNitroReadyRatio(),
      calories: player.calories,
      isFatMode: player.isFatMode,
      inFork: collision.inForkZone,
      leftBranchId: collision.leftBranchId,
      rightBranchId: collision.rightBranchId,
      leftBranchName: collision.leftBranchName,
      rightBranchName: collision.rightBranchName,
      leftBranchRegion: collision.leftBranchRegion,
      rightBranchRegion: collision.rightBranchRegion,
      playerX: player.x,
      upcomingCurve: aheadSeg ? aheadSeg.curve : 0,
      weatherId: road.weatherState ? road.weatherState.active : 'sunny',
      weatherTransitioning: road.weatherState ? (road.weatherState.hasTriggeredDynamic && road.weatherState.blend < 1) : false,
      trafficHitCount: player.trafficHitCount || 0,
      sedanHitTimer: player.sedanHitTimer || 0,
      policeActive: Boolean(road.policeChase && road.policeChase.active)
    });

    if (bannerTimer > 0) {
      window.spriteRenderer.drawNitroBanner(
        ctx,
        logicalWidth / 2,
        logicalHeight - 8,
        bannerText,
        '#ffd32a'
      );
    }

    drawArcadeCabinetPostProcess(ctx, logicalWidth, logicalHeight);
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    update(dt);
    render(dt);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
