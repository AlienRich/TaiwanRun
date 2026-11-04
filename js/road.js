/**
 * TaiwanOutRun - 偽 3D 道路、富岡火車站起點、26 大隨機景點沿途街景與 8 大終點中央地標引擎 (Milestone 5.0)
 * 1. 起點固定從「桃園楊梅・富岡火車站」衝出，依序展現：站前廣場平交道 ➔ 呂家聲巴洛克洋樓 ➔ 信義街紅磚拱廊與永昌碾米廠，10 秒後抵達第一個左右分岔點。
 * 2. 中間途經 8 個隨機排列的台灣景點（共 26 處自然地質與人文古蹟），行駛時依序展現各景點 3 階段核心建築與地貌街景。
 * 3. 第 10 關為 8 大終點之一，行駛時依序展現沿途街景，最終抵達正中央的終點線與終點主建築，道路兩旁群眾熱情歡呼！
 */

class Pseudo3DRoad {
  constructor() {
    this.segmentLength = 200;
    this.rumbleLength = 3;
    this.roadWidth = 2400;
    this.lanes = 4;
    this.fieldOfView = 102;
    this.cameraHeight = 1020;
    this.cameraDepth = 1 / Math.tan((this.fieldOfView / 2) * Math.PI / 180);
    this.drawDistance = 165;

    this.segments = [];
    this.traffic = [];
    this.flyingScooters = [];
    this.policeChase = {
      active: false,
      phase: 'IDLE', // OVERTAKE | AIMING | BRAKE_CHECK | RECOVER | DEPART
      attemptsDone: 0,
      maxAttempts: 3,
      z: 0,
      offset: 0.45,
      targetOffset: 0,
      phaseTimer: 0,
      brakeLightOn: false,
      type: 'POLICE_RED_ZEBRA'
    };
    this.trackLength = 0;
    this.currentStage = window.START_STAGE_DATA;
    this.stageNumber = 1;
    this.skyOffset = 0;

    this.forkStartSegment = 0;
    this.forkDecisionSegment = 0;
    this.forkEndSegment = 0;
    this.forkBranchLocked = false;
    this.chosenForkDir = -1;
    this.lastForkCenterOffset = 0;
    this.finishLineSegment = 0;

    // 5 大天氣與光影系統（綁定景點主天氣 + 行駛途中隨機動態過渡）
    this.weatherState = {
      primary: 'sunny',
      target: 'sunset',
      active: 'sunny',
      blend: 0,
      hasTriggeredDynamic: false,
      triggerProgress: 0.42,
      lightningTimer: 0,
      lightningAlpha: 0,
      rainParticles: []
    };
    for (let r = 0; r < 110; r++) {
      this.weatherState.rainParticles.push({
        x: Math.random(),
        y: Math.random(),
        len: 12 + Math.random() * 16,
        speed: 0.85 + Math.random() * 0.55,
        layer: r % 2
      });
    }

    this.buildStageTrack('fugang', 1);
  }

  initStageWeather(stage) {
    const primary = (stage && stage.weather) || 'sunny';
    const pool = (stage && stage.dynamicWeathers && stage.dynamicWeathers.length > 0)
      ? stage.dynamicWeathers
      : ['sunset', 'rainy', 'foggy'];
    const target = pool[Math.floor(Math.random() * pool.length)] || primary;

    this.weatherState.primary = primary;
    this.weatherState.target = target;
    this.weatherState.active = primary;
    this.weatherState.blend = 0;
    this.weatherState.hasTriggeredDynamic = false;
    // 在單關行駛至 38% ~ 50% 進度時觸發動態天氣變化（例如晴天開進山區漸漸起霧或下雨）
    this.weatherState.triggerProgress = 0.38 + Math.random() * 0.12;
    this.weatherState.lightningTimer = 2.5 + Math.random() * 3.5;
    this.weatherState.lightningAlpha = 0;

    if (typeof window.onWeatherChanged === 'function') {
      window.onWeatherChanged(this.weatherState.active, false, stage);
    }
  }

  /**
   * 隨行駛進度與時間更新天氣狀態與動態光影過渡
   */
  updateWeatherProgress(progressRatio, dt = 0.016) {
    const ws = this.weatherState;
    if (!ws) return;

    if (!ws.hasTriggeredDynamic && progressRatio >= ws.triggerProgress && ws.target !== ws.primary) {
      ws.hasTriggeredDynamic = true;
      ws.active = ws.target;
      if (typeof window.onWeatherChanged === 'function') {
        window.onWeatherChanged(ws.active, true, this.currentStage);
      }
    }

    if (ws.hasTriggeredDynamic && ws.blend < 1) {
      ws.blend = Math.min(1, ws.blend + dt * 0.24); // 約 4.2 秒平滑過渡光影與天候
    }

    // 雨天偶發閃電雷光計時
    const rainWeight = this.getWeatherWeight('rainy');
    if (rainWeight > 0.25) {
      ws.lightningTimer -= dt;
      if (ws.lightningTimer <= 0) {
        ws.lightningAlpha = 0.72 * rainWeight;
        ws.lightningTimer = 3.8 + Math.random() * 4.5;
      }
    }
    if (ws.lightningAlpha > 0) {
      ws.lightningAlpha = Math.max(0, ws.lightningAlpha - dt * 2.6);
    }
  }

  getWeatherWeight(weatherId) {
    const ws = this.weatherState;
    if (!ws) return weatherId === 'sunny' ? 1 : 0;
    let w = 0;
    if (ws.primary === weatherId) w += (1 - ws.blend);
    if (ws.target === weatherId) w += ws.blend;
    return Math.max(0, Math.min(1, w));
  }

  easeIn(a, b, percent) {
    return a + (b - a) * Math.pow(percent, 2);
  }

  easeOut(a, b, percent) {
    return a + (b - a) * (1 - Math.pow(1 - percent, 2));
  }

  easeInOut(a, b, percent) {
    return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5);
  }

  lastY() {
    return this.segments.length === 0 ? 0 : this.segments[this.segments.length - 1].p2.world.y;
  }

  addSegment(curve, y, forkSplit = 0, forkPhase = 'none', realignProgress = 0) {
    const n = this.segments.length;
    this.segments.push({
      index: n,
      p1: {
        world: { x: 0, y: this.lastY(), z: n * this.segmentLength },
        camera: {},
        screen: {}
      },
      p2: {
        world: { x: 0, y: y, z: (n + 1) * this.segmentLength },
        camera: {},
        screen: {}
      },
      curve: curve,
      forkOffset: forkSplit,
      forkPhase: forkPhase,
      realignProgress: realignProgress,
      sprites: [],
      cars: [],
      color: Math.floor(n / this.rumbleLength) % 2 ? 'dark' : 'light'
    });
  }

  addRoad(enter, hold, leave, curve, y, forkMode = false) {
    const startY = this.lastY();
    const endY = startY + (y * this.segmentLength);
    const total = enter + hold + leave;
    for (let n = 0; n < enter; n++) {
      const splitRatio = forkMode ? this.easeInOut(0, 1.18, n / total) : 0;
      this.addSegment(
        this.easeIn(0, curve, n / enter),
        this.easeInOut(startY, endY, n / total),
        splitRatio,
        forkMode ? 'split' : 'none',
        0
      );
    }
    for (let n = 0; n < hold; n++) {
      const idx = enter + n;
      const splitRatio = forkMode ? this.easeInOut(0, 1.18, idx / total) : 0;
      this.addSegment(
        curve,
        this.easeInOut(startY, endY, idx / total),
        splitRatio,
        forkMode ? 'split' : 'none',
        0
      );
    }
    for (let n = 0; n < leave; n++) {
      const idx = enter + hold + n;
      const splitRatio = forkMode ? 1.18 : 0;
      this.addSegment(
        this.easeInOut(curve, 0, n / leave),
        this.easeInOut(startY, endY, idx / total),
        splitRatio,
        forkMode ? 'split' : 'none',
        0
      );
    }
  }

  /**
   * 建構 1986 SEGA OutRun 經典 Y 字型分岔賽道與「順著左/右分支開出去 ➔ 畫面平滑導正跑道」過渡區段
   * - Phase A (split, 85 節)：主跑道一分為二（左道 -1.18、右道 +1.18），中央形成三角綠地安全島與巨型風景立牌群
   * - Phase B (realign, 85 節)：車子順著所選左/右分支向外彎出，接著反向回正並將跑道平滑導正回畫面正中央 (offset -> 0)
   */
  addOutRunForkSection() {
    this.forkStartSegment = this.segments.length;
    this.forkBranchLocked = false;
    this.lastForkCenterOffset = 0;

    const splitCount = 85;
    const realignCount = 85;
    const baseY = this.lastY();

    for (let i = 0; i < splitCount; i++) {
      const t = i / splitCount;
      const splitOffset = this.easeInOut(0, 1.18, t);
      this.addSegment(0, baseY, splitOffset, 'split', 0);
    }

    this.forkDecisionSegment = this.segments.length;

    for (let i = 0; i < realignCount; i++) {
      const u = i / realignCount;
      const remainingOffset = 1.18 * (1 - this.easeInOut(0, 1, u));
      this.addSegment(0, baseY, remainingOffset, 'realign', u);
    }

    this.forkEndSegment = this.segments.length - 8;
    this.addRoad(12, 16, 12, 0, 0, false);
  }

  buildStageTrack(stageId, stageNum = null) {
    this.currentStage = window.STAGE_TREE[stageId] || window.START_STAGE_DATA;
    if (stageNum !== null) {
      this.stageNumber = stageNum;
    }

    // 綁定當前關卡的左右分岔路目標（由 TaiwanRouteManager 隨機無重複抽出）
    if (window.routeManager && !this.currentStage.isFinale) {
      const pair = window.routeManager.currentForkPair;
      this.currentStage.leftBranch = pair.leftId;
      this.currentStage.rightBranch = pair.rightId;
    }

    this.segments = [];

    if (this.currentStage.isStart) {
      // 【第 1 關：起點 富岡火車站（單關約 20 秒，15 關合計 5 分鐘）】
      // 車輛從富岡火車站大門衝出，沿途依序展現富岡老街與呂家聲洋樓，最後進入 OutRun Y 字分岔點！
      this.addRoad(28, 76, 28, 0, 0);           // Phase 1: 富岡火車站站前廣場與海線平交道直路
      this.addRoad(34, 108, 34, 2.2, 16);       // Phase 2: 中正路「呂家聲洋樓」巴洛克五開間老街緩彎
      this.addRoad(34, 108, 34, -2.4, -16);     // Phase 2-3: 信義街昭和紅磚拱廊亭仔腳
      this.addRoad(34, 108, 34, 2.0, 12);       // Phase 3: 永昌碾米廠磚塔與大井頭福德宮
      this.addRoad(28, 72, 28, -1.8, -12);      // Phase 4: 伯公岡鐵道園區與台鐵區間車平行路段

      this.finishLineSegment = 0;
      this.addOutRunForkSection();
    } else if (this.currentStage.isFinale) {
      // 【第 15 關：8 大終點關卡（單關約 20 秒）】
      // 前段依序展現該終點沿途 6 段街景，最後一段為筆直寬闊的「終點凱旋大道」，正中央矗立終點主建築與終點線，兩旁群眾歡呼！
      this.addRoad(28, 68, 28, 0, 0);
      this.addRoad(34, 96, 34, 2.8, 22);
      this.addRoad(34, 96, 34, -2.8, -22);
      this.addRoad(34, 92, 34, 2.4, 16);
      this.addRoad(28, 68, 28, 0, -16);

      // 終點前筆直的凱旋歡呼大道（無分岔，正中央迎接終點線與終點地標！）
      this.forkStartSegment = 999999;
      this.forkDecisionSegment = 999999;
      this.forkEndSegment = 999999;
      this.finaleAvenueStart = this.segments.length;
      this.addRoad(30, 105, 40, 0, 0, false);
      this.finishLineSegment = this.segments.length - 48;
    } else {
      // 【第 2 ~ 14 關：由南至北、由西到東排列的 13 個台灣經典中途景點關卡（每關約 20 秒，共 960+ 節道路）】
      this.addRoad(20, 36, 20, 0, 0);

      const region = this.currentStage.region;
      const stageId = this.currentStage.id;
      const isMountain = region === '山區' || stageId === 'taroko' || stageId === 'end_taroko' ||
        stageId === 'jiufen' || stageId === 'taipingshan' || stageId === 'longteng' ||
        stageId === 'yangmingshan' || stageId === 'alishan' || stageId === 'end_alishan' ||
        stageId === 'meishan' || stageId === 'hehuanshan';

      if (stageId === 'taroko' || stageId === 'end_taroko') {
        // 【太魯閣國家公園・中橫峽谷：高高低低峭壁起伏、九曲迴腸左拐右彎髮夾彎】
        this.addRoad(18, 32, 18, -5.6, 68);    // 陡坡攀爬大理石峭壁
        this.addRoad(18, 30, 18, 6.2, -72);    // 險降俯衝立霧溪深谷
        this.addRoad(16, 28, 16, -5.0, 56);    // 穿入燕子口岩壁快速爬升
        this.addRoad(18, 32, 18, 5.8, -60);    // 九曲洞半穿鑿隧道波浪下切
        this.addRoad(16, 26, 16, -6.6, 52);    // 緊湊連續左髮夾彎
        this.addRoad(16, 28, 16, 6.4, -48);    // 緊湊連續右髮夾彎
        this.addRoad(18, 34, 18, -4.8, 54);    // 翻越峽谷岩脊
        this.addRoad(18, 30, 18, 5.2, -50);    // 俯衝立霧溪急流
        this.addRoad(16, 28, 16, -3.8, 28);    // 平緩導向分岔路
      } else if (isMountain) {
        // 【山區名勝（合歡山、清境、阿里山、溪頭、九份、陽明山、太平山）：高高低低波浪坡道與連環急彎】
        this.addRoad(20, 38, 20, -5.2, 60);    // 連續大坡道攀爬山嶺
        this.addRoad(18, 34, 18, 5.6, -64);    // 翻過山頂急衝下坡
        this.addRoad(20, 36, 20, -4.8, 56);    // 波浪起伏第二峰
        this.addRoad(18, 32, 18, 5.2, -58);    // 衝入山谷大急彎
        this.addRoad(18, 30, 18, -5.8, 48);    // S彎左拐連續過彎
        this.addRoad(18, 30, 18, 5.4, -46);    // S彎右拐下切
        this.addRoad(20, 34, 20, -3.6, 32);    // 平緩銜接
      } else if (region === '東部') {
        this.addRoad(24, 52, 24, 4.2, 42);
        this.addRoad(22, 48, 22, -4.5, -44);
        this.addRoad(24, 54, 24, 4.8, 36);
        this.addRoad(22, 46, 22, -3.8, -34);
        this.addRoad(20, 42, 20, 3.2, 22);
      } else {
        this.addRoad(24, 54, 24, 3.4, 32);
        this.addRoad(22, 48, 22, -3.6, -30);
        this.addRoad(24, 52, 24, 3.8, 28);
        this.addRoad(22, 46, 22, -3.0, -26);
        this.addRoad(20, 40, 20, 2.5, 16);
      }

      this.finishLineSegment = 0;
      this.addOutRunForkSection();
    }

    this.trackLength = this.segments.length * this.segmentLength;
    this.initStageWeather(this.currentStage);
    this.populateRoadsideSprites(this.currentStage.id);
    this.spawnTrafficCars();
  }

  /**
   * 賽道沿途小景點（牌樓、在地小吃、山景、海景、核心街景）、特色美食與終點歡呼群眾配置：
   * 1. 起點「富岡火車站」：起跑線正上方矗立《合金彈頭》風【富岡火車站】站體大門，衝出後依序展現 6 段富岡街景。
   * 2. 途經景點（26 處）與 8 大終點：依賽道進度分為 6 個階段，每 5 節道路在左右兩側連續生成該景點真實的
   *    【入口牌樓 ➔ 在地小吃攤 ➔ 山景/海景 ➔ 沿途小景點 ➔ 核心建築 ➔ 壓軸奇景】，由遠到近逼近、擦身而過後離開！
   * 3. 8 大終點：進入終點凱旋大道後，兩旁排滿歡呼群眾，正中央矗立「終點線」與該終點巨型主建築地標！
   */
  populateRoadsideSprites(stageId) {
    const foodTypes = [
      'FOOD_SAUSAGE',    // 炭烤大香腸
      'FOOD_VERMICELLI', // 大腸蚵仔麵線
      'FOOD_ZONGZI',     // 古早味燒肉粽
      'FOOD_TOFU',       // 脆皮黃金臭豆腐
      'FOOD_BURGER',     // 雙層起司大漢堡
      'FOOD_BOBA'        // 黑糖珍珠奶茶
    ];

    const stage = this.currentStage;
    const subSpots = stage.subSpots || (window.STAGE_SUBSPOTS_MAP && window.STAGE_SUBSPOTS_MAP[stage.id]) || [];

    // (A) 起點關卡：車輛直接從「富岡火車站」大門與月台天橋下衝出！
    if (stage.isStart) {
      if (this.segments[5]) {
        this.segments[5].sprites.push({
          type: 'FUGANG_STATION_GATE',
          offset: 0
        });
      }
      if (this.segments[10]) {
        this.segments[10].sprites.push({
          type: 'STREET_FUGANG_PLAZA',
          offset: -1.34
        });
        this.segments[10].sprites.push({
          type: 'STREET_FUGANG_PLAZA',
          offset: 1.34
        });
      }
    } else if (this.segments[9]) {
      this.segments[9].sprites.push({
        type: 'STAGE_WELCOME_ARCH',
        offset: 0,
        stageId: stage.id,
        stageName: stage.spotName,
        category: stage.category
      });
    }

    const mainRoadEnd = stage.isFinale
      ? this.finaleAvenueStart - 6
      : this.forkStartSegment - 14;

    // (B) 沿途依序展現 6 段式小景點（牌樓、在地小吃、山景、海景、歷史街景）：拉開合理景深間距，由遠到近清晰逼近，然後離開！
    for (let i = 14; i < mainRoadEnd; i += 13) {
      const seg = this.segments[i];
      if (!seg || subSpots.length === 0) continue;

      const progressRatio = (i - 14) / Math.max(1, mainRoadEnd - 14);
      const phaseIdx = Math.min(subSpots.length - 1, Math.floor(progressRatio * subSpots.length));
      const spotData = subSpots[phaseIdx];
      const nextSpotData = subSpots[(phaseIdx + 1) % subSpots.length];
      const stepIdx = Math.floor((i - 14) / 13);

      // 近景路肩外側 (±1.38)：左右交錯展現當前階段的牌樓、小吃攤、巴洛克洋樓或特色地標，避免同棟建築重疊堆疊
      const primarySide = (stepIdx % 2 === 0) ? -1.38 : 1.38;
      seg.sprites.push({
        type: 'SUBSPOT_SCENERY',
        offset: primarySide,
        subSpot: spotData,
        stageId: stage.id,
        phaseIndex: phaseIdx,
        side: primarySide < 0 ? 'left' : 'right'
      });

      // 對側搭配下一階段特色景物或遠景襯景，讓左右兩邊景象豐富且不重複堆疊
      const oppositeSeg = this.segments[Math.min(mainRoadEnd - 1, i + 6)];
      if (oppositeSeg) {
        oppositeSeg.sprites.push({
          type: 'SUBSPOT_SCENERY',
          offset: -primarySide,
          subSpot: nextSpotData,
          stageId: stage.id,
          phaseIndex: (phaseIdx + 1) % subSpots.length,
          side: -primarySide < 0 ? 'left' : 'right'
        });
      }
    }

    // (C) 車道上的台灣特色美食與低頻率路肩危險障礙物（由遠到近平滑放大）
    for (let i = 20; i < mainRoadEnd; i += 18) {
      const seg = this.segments[i];
      if (!seg) continue;

      const step = Math.floor((i - 20) / 18);
      const mode = step % 5;

      if (mode === 0 || mode === 2 || mode === 4) {
        const fType = foodTypes[step % foodTypes.length];
        const lanePos = [-0.42, 0.0, 0.42][step % 3];
        seg.sprites.push({
          type: fType,
          offset: lanePos,
          collected: false
        });
      } else if (mode === 1) {
        const side = (step % 2 === 0) ? -1.06 : 1.06;
        seg.sprites.push({
          type: stage.obstacleType || 'CLIFF_ROCK',
          offset: side,
          isObstacle: true
        });
      } else if (mode === 3) {
        const npcKind = step % 3;
        if (npcKind === 0) {
          seg.sprites.push({
            type: 'NPC_BEAR',
            offset: (step % 2 === 0) ? -1.14 : 1.14
          });
        } else if (npcKind === 1) {
          const monkeySide = (step % 2 === 0) ? 1.12 : -1.12;
          seg.sprites.push({
            type: 'NPC_MONKEY',
            offset: monkeySide
          });
          if (this.segments[i + 3]) {
            this.segments[i + 3].sprites.push({
              type: 'BANANA_PEEL',
              offset: monkeySide > 0 ? 0.25 : -0.25,
              used: false
            });
          }
        } else {
          seg.sprites.push({
            type: 'NPC_PHEASANT',
            offset: 0.0,
            startled: false
          });
        }
      }
    }

    // (D) 若為第 1 ~ 14 關：配置 1986 SEGA OutRun 風格分岔路口拱門與巨型路邊風景立牌 (OUTRUN_FORK_BILLBOARD)
    if (!stage.isFinale) {
      const leftStage = window.STAGE_TREE[stage.leftBranch] || window.START_STAGE_DATA;
      const rightStage = window.STAGE_TREE[stage.rightBranch] || window.START_STAGE_DATA;

      if (this.segments[this.forkStartSegment - 6]) {
        this.segments[this.forkStartSegment - 6].sprites.push({
          type: 'CHECKPOINT_ARCH',
          offset: 0,
          leftStageId: leftStage.id,
          rightStageId: rightStage.id,
          leftLabel: leftStage.spotName,
          rightLabel: rightStage.spotName
        });
      }

      // 在分岔路段兩側外路肩與中央三角安全島密集豎立 OutRun 巨型風景立牌
      for (let i = this.forkStartSegment - 12; i < this.forkDecisionSegment; i += 14) {
        const seg = this.segments[i];
        if (!seg) continue;
        const split = seg.forkOffset || 0;

        // 左右兩側路肩外側巨型風景立牌
        seg.sprites.push({
          type: 'OUTRUN_FORK_BILLBOARD',
          dir: 'left',
          stageId: leftStage.id,
          offset: -1.48 - split * 0.85,
          label: leftStage.spotName
        });
        seg.sprites.push({
          type: 'OUTRUN_FORK_BILLBOARD',
          dir: 'right',
          stageId: rightStage.id,
          offset: 1.48 + split * 0.85,
          label: rightStage.spotName
        });

        // 當中央三角綠島展開時，在中央分流島增設雙向導引立牌，完全重現街機 OutRun 岔路視覺！
        if (split > 0.42 && ((i - this.forkStartSegment) % 28 === 0)) {
          seg.sprites.push({
            type: 'FORK_SIGN_LEFT',
            stageId: leftStage.id,
            offset: -split * 0.34,
            label: '⬅ ' + leftStage.spotName
          });
          seg.sprites.push({
            type: 'FORK_SIGN_RIGHT',
            stageId: rightStage.id,
            offset: split * 0.34,
            label: rightStage.spotName + ' ➡'
          });
        }
      }
    } else {
      // (E) 第 10 關（8 大終點關卡）：終點凱旋大道兩旁排滿歡呼群眾，正中央矗立終點線與終點主建築！
      for (let i = this.finaleAvenueStart; i <= this.finishLineSegment + 14; i += 3) {
        const seg = this.segments[i];
        if (!seg) continue;
        seg.sprites.push({
          type: 'CHEER_CROWD',
          offset: -1.18,
          side: 'left',
          variant: i % 3
        });
        seg.sprites.push({
          type: 'CHEER_CROWD',
          offset: 1.18,
          side: 'right',
          variant: (i + 1) % 3
        });
      }

      // 終點線拱門（正中央 offset: 0）
      if (this.segments[this.finishLineSegment]) {
        this.segments[this.finishLineSegment].sprites.push({
          type: 'FINISH_LINE_ARCH',
          offset: 0,
          spotName: stage.spotName
        });
      }

      // 終點正中央巨型地標主建築（保持安全遠景距離 +22 節，衝過終點線瞬間即切換為全畫面終點全景！）
      const monumentSeg = this.segments[this.finishLineSegment + 22] || this.segments[this.segments.length - 10];
      if (monumentSeg) {
        monumentSeg.sprites.push({
          type: 'FINALE_MONUMENT',
          offset: 0,
          monumentId: stage.finaleMonument,
          spotName: stage.spotName
        });
      }
    }
  }

  /**
   * 路上奔跑的車輛分為【大、中、小】三級（總密度維持 40%，間距 9000）：
   * - 小車（機車 TRAFFIC_SCOOTER，約 45%）：撞到飛出去喊「按陰陽～！」，車速 -30%
   * - 中車（一般轎車 TRAFFIC_SEDAN，約 40%）：撞到減速至 50KM，5 秒內撞第 2 次觸發翻車
   * - 大車（砂石車 TRAFFIC_GRAVEL_TRUCK，約 15%）：撞到立刻觸發大翻車
   */
  spawnTrafficCars() {
    this.traffic = [];
    this.flyingScooters = [];
    const limitSeg = this.currentStage.isFinale
      ? this.finaleAvenueStart - 15
      : this.forkStartSegment - 20;
    const maxZ = Math.max(6000, limitSeg * this.segmentLength);
    const lanes = [-0.54, -0.18, 0.18, 0.54];
    // 20 車循環配比：9 輛小車(機車 45%)、8 輛中車(一般轎車 40%)、3 輛大車(砂石車 15%)
    const pattern = [
      'TRAFFIC_SCOOTER', 'TRAFFIC_SEDAN', 'TRAFFIC_SCOOTER', 'TRAFFIC_SEDAN', 'TRAFFIC_GRAVEL_TRUCK',
      'TRAFFIC_SCOOTER', 'TRAFFIC_SEDAN', 'TRAFFIC_SCOOTER', 'TRAFFIC_SEDAN', 'TRAFFIC_SCOOTER',
      'TRAFFIC_SEDAN', 'TRAFFIC_GRAVEL_TRUCK', 'TRAFFIC_SCOOTER', 'TRAFFIC_SEDAN', 'TRAFFIC_SCOOTER',
      'TRAFFIC_SEDAN', 'TRAFFIC_SCOOTER', 'TRAFFIC_SEDAN', 'TRAFFIC_GRAVEL_TRUCK', 'TRAFFIC_SCOOTER'
    ];
    let idx = 0;
    for (let z = 4800; z < maxZ; z += 9000) {
      const laneOffset = lanes[(idx * 3 + Math.floor(Math.random() * 2)) % lanes.length];
      const carType = pattern[idx % pattern.length];
      let carSpeed = 4100;
      let sizeClass = 'SMALL';
      if (carType === 'TRAFFIC_SEDAN') {
        carSpeed = 3650;
        sizeClass = 'MEDIUM';
      } else if (carType === 'TRAFFIC_GRAVEL_TRUCK') {
        carSpeed = 3150;
        sizeClass = 'LARGE';
      }
      this.traffic.push({
        offset: laneOffset,
        z: z,
        speed: carSpeed,
        type: carType,
        sizeClass: sizeClass,
        variant: idx % 3,
        hitCooldown: 0
      });
      idx++;
    }
  }

  /**
   * 觸發小車（機車）被撞後的搞笑拋物線飛天動畫（「按陰陽～！」720度大風車旋轉飛向天際化為星星 ★）
   */
  launchFlyingScooter(car, impactDir = 1) {
    const w = window.logicalCanvasWidth || 720;
    const h = window.logicalCanvasHeight || 400;
    const startX = (w / 2) + (car ? (car.offset * 140) : 0);
    const startY = h - 74;
    this.flyingScooters.push({
      x: startX,
      y: startY,
      vx: (impactDir >= 0 ? 1 : -1) * (170 + Math.random() * 90),
      vy: -360 - Math.random() * 80,
      rot: 0,
      vRot: (impactDir >= 0 ? 1 : -1) * 16.5,
      scale: 1.0,
      timer: 0,
      maxTime: 1.35,
      shoutText: '💥 按陰陽～！！'
    });
  }

  /**
   * 累計撞擊任何車輛滿 5 次：觸發台灣國道警車「紅斑馬」從後方鳴笛追上並進行 3 次急煞攔截！
   */
  triggerPoliceChase(player, onBanner) {
    const pc = this.policeChase;
    if (!pc || pc.active) return;

    pc.active = true;
    pc.phase = 'OVERTAKE';
    pc.attemptsDone = 0;
    pc.maxAttempts = 3;
    // 從畫面底端（玩家車尾後方可視起點 player.z + 800）鳴笛衝出，一路超車衝到更前方遠處車道
    pc.z = player.z + 800;
    // 從玩家車道側邊高速超車上前
    pc.offset = player.x > 0 ? Math.max(-0.65, player.x - 0.52) : Math.min(0.65, player.x + 0.52);
    pc.targetOffset = player.x;
    pc.phaseTimer = 0;
    pc.brakeLightOn = false;

    if (window.arcadeAudio) {
      window.arcadeAudio.playPoliceDispatchSiren();
    }
    if (typeof onBanner === 'function') {
      onBanner('🚨 累計肇事 5 次！國道警車【紅斑馬】從後方鳴笛追上攔截（共 3 次急煞撞擊，快變換車道閃避！）');
    }
  }

  updatePoliceChase(dt, player, onBanner) {
    const pc = this.policeChase;
    if (!pc || !pc.active || !player) return;

    pc.phaseTimer += dt;

    if (pc.phase === 'OVERTAKE') {
      // 階段 1：從玩家後方高速鳴笛追上，一路衝到更前方遠處車道（約 player.z + 4200，約 21 節車道遠方）！
      const targetZ = player.z + 4200;
      pc.z += (player.speed + 5200) * dt;
      if (pc.z >= targetZ) {
        pc.z = targetZ;
        pc.phase = 'AIMING';
        pc.phaseTimer = 0;
        pc.brakeLightOn = false;
      }
    } else if (pc.phase === 'AIMING') {
      // 階段 2：在更前方遠處車道保持距離並橫向對準玩家的車道，亮起紅煞車燈預警即將急煞！
      pc.z = player.z + 4200;
      const diffX = player.x - pc.offset;
      pc.offset += Math.sign(diffX) * Math.min(Math.abs(diffX), dt * 1.65);
      pc.brakeLightOn = pc.phaseTimer > 0.55; // 急煞前先閃亮刺眼紅煞車燈預警

      if (pc.phaseTimer >= 1.05) {
        pc.phase = 'BRAKE_CHECK';
        pc.phaseTimer = 0;
        pc.brakeLightOn = true;
        if (window.arcadeAudio) {
          window.arcadeAudio.playPoliceBrakeScreech();
        }
        if (typeof onBanner === 'function') {
          onBanner(`🚨 紅斑馬在前方遠處急煞攔截 (${pc.attemptsDone + 1}/${pc.maxAttempts})！快按 ◀ ▶ 偏移車道閃避！`);
        }
      }
    } else if (pc.phase === 'BRAKE_CHECK') {
      // 階段 3：紅斑馬從更前方遠處重踩煞車減速，由遠到近急速向後迎面逼近撞向玩家車頭！
      pc.brakeLightOn = true;
      // 微幅追蹤但留給玩家充足變換車道閃避空間
      const trackDiff = player.x - pc.offset;
      pc.offset += Math.sign(trackDiff) * Math.min(Math.abs(trackDiff), dt * 0.24);

      const closingSpeed = Math.max(2250, player.speed * 0.45 + 1750);
      pc.z = Math.max(player.z + 860, pc.z - closingSpeed * dt);

      // 當紅斑馬逼近至玩家車頭實際畫面深度 (player.z + 980, screenY ≈ 364) 時進行撞擊或閃避判定
      if (pc.z <= player.z + 980) {
        pc.attemptsDone += 1;
        const lateralDist = Math.abs(player.x - pc.offset);

        if (lateralDist < 0.34 && player.crashTimer <= 0) {
          // 玩家未躲開：遭紅斑馬車尾減速撞擊，車速減少 30%！
          player.applyPercentSlowdown(0.30);
          player.pickupPopupText = `💥 遭紅斑馬攔截撞擊 (${pc.attemptsDone}/3)！車速 -30%！`;
          player.pickupPopupTimer = 1.8;
          if (window.arcadeAudio) {
            window.arcadeAudio.playPoliceRamHit();
          }
          if (typeof onBanner === 'function') {
            onBanner(`💥 遭【國道紅斑馬】第 ${pc.attemptsDone}/${pc.maxAttempts} 次減速撞擊命中！車速 -30%！`);
          }
        } else {
          // 玩家偏移車道成功躲開！
          player.pickupPopupText = `✨ 漂亮閃過紅斑馬第 ${pc.attemptsDone}/3 次急煞攔截！`;
          player.pickupPopupTimer = 1.6;
          if (window.arcadeAudio) {
            window.arcadeAudio.playForkSelect();
          }
          if (typeof onBanner === 'function') {
            onBanner(`✨ 帥氣變換車道！成功閃避紅斑馬第 ${pc.attemptsDone}/${pc.maxAttempts} 次攔截！`);
          }
        }

        if (pc.attemptsDone >= pc.maxAttempts) {
          pc.phase = 'DEPART';
          pc.phaseTimer = 0;
          pc.brakeLightOn = false;
        } else {
          pc.phase = 'RECOVER';
          pc.phaseTimer = 0;
          pc.brakeLightOn = false;
        }
      }
    } else if (pc.phase === 'RECOVER') {
      // 階段 4：重新加速衝回更前方遠處車道 (player.z + 4200) 準備下一次急煞攔截
      pc.z += (player.speed + 4800) * dt;
      if (pc.z >= player.z + 4200) {
        pc.z = player.z + 4200;
        pc.phase = 'AIMING';
        pc.phaseTimer = 0;
      }
    } else if (pc.phase === 'DEPART') {
      // 階段 5：3 次攔截完畢，紅斑馬鳴笛加速向遠方地平線駛離
      pc.z += (player.speed + 4800) * dt;
      if (pc.phaseTimer >= 1.6) {
        pc.active = false;
        pc.phase = 'IDLE';
        if (typeof onBanner === 'function') {
          onBanner('🚓 國道紅斑馬完成 3 次攔截勤務加速駛離！請注意行車安全！');
        }
      }
    }
  }

  updateTraffic(dt, player = null, onBanner = null) {
    const limitSeg = this.currentStage.isFinale
      ? this.finaleAvenueStart - 15
      : this.forkStartSegment - 20;
    const maxZ = Math.max(6000, limitSeg * this.segmentLength);
    for (let i = 0; i < this.segments.length; i++) {
      this.segments[i].cars.length = 0;
    }

    for (let i = 0; i < this.traffic.length; i++) {
      const car = this.traffic[i];
      if (car.hitCooldown > 0) {
        car.hitCooldown = Math.max(0, car.hitCooldown - dt);
      }
      // 確保一般車流速度永遠低於玩家當前車速，使路上所有車輛始終保持「由遠到近」迎面逼近，絕不倒退超車
      const maxAllowedSpeed = player ? Math.max(0, player.speed * 0.48) : car.speed;
      const effectiveSpeed = Math.min(car.speed, maxAllowedSpeed);
      car.z += effectiveSpeed * dt;

      // 若車輛被玩家超越並離開畫面底端 (player.z + 760)，立即重設至前方遠處地平線，維持源源不絕「由遠到近」的車流視覺
      if (player && car.z < player.z + 760) {
        const respawnZ = player.z + 22000 + ((i * 2900) % 10000);
        if (respawnZ < maxZ) {
          car.z = respawnZ;
        }
      }
      if (car.z >= maxZ) {
        car.z = player ? Math.min(maxZ - 1200, player.z + 18000 + (i % 5) * 2400) : 3600;
      }
      const seg = this.findSegment(car.z);
      if (seg) {
        seg.cars.push(car);
      }
    }

    // 更新國道紅斑馬警車追緝狀態並掛載至對應道路節段
    if (this.policeChase && this.policeChase.active) {
      this.updatePoliceChase(dt, player, onBanner);
      if (this.policeChase.active) {
        const pSeg = this.findSegment(this.policeChase.z);
        if (pSeg) {
          pSeg.cars.push(this.policeChase);
        }
      }
    }

    // 更新被撞飛的搞笑機車拋物線動畫
    for (let i = this.flyingScooters.length - 1; i >= 0; i--) {
      const fs = this.flyingScooters[i];
      fs.timer += dt;
      fs.x += fs.vx * dt;
      fs.y += fs.vy * dt;
      fs.vy += 420 * dt; // 拋物線重力
      fs.rot += fs.vRot * dt;
      fs.scale = Math.max(0.22, 1.0 - (fs.timer / fs.maxTime) * 0.72);
      if (fs.timer >= fs.maxTime) {
        this.flyingScooters.splice(i, 1);
      }
    }
  }

  findSegment(z) {
    const index = Math.floor(z / this.segmentLength) % this.segments.length;
    return this.segments[(index + this.segments.length) % this.segments.length];
  }

  project(p, cameraX, cameraY, cameraZ, width, height, horizonOffset = 0) {
    p.camera.x = (p.world.x || 0) - cameraX;
    p.camera.y = (p.world.y || 0) - cameraY;
    p.camera.z = (p.world.z || 0) - cameraZ;

    const safeZ = Math.max(1, p.camera.z);
    p.screen.scale = this.cameraDepth / safeZ;
    p.screen.x = Math.round((width / 2) + (p.screen.scale * p.camera.x * width / 2));
    p.screen.y = Math.round((height * 0.50 + horizonOffset) - (p.screen.scale * p.camera.y * height / 2));
    p.screen.w = Math.round(p.screen.scale * this.roadWidth * width / 2);
  }

  drawPolygon(ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 根據各關卡真實台灣地理景觀（sideTheme），繪製道路左右兩側貼切地貌
   */
  drawStageRoadsideSlice(ctx, width, segment, x1, y1, w1, x2, y2, w2) {
    const theme = this.currentStage.sideTheme || 'fugang_street';
    const isLight = segment.color === 'light';
    const sliceH = Math.max(1, y1 - y2);
    const r1 = w1 / 7.5;
    const r2 = w2 / 7.5;
    const leftEdge1 = x1 - w1 - r1 * 1.6;
    const leftEdge2 = x2 - w2 - r2 * 1.6;
    const rightEdge1 = x1 + w1 + r1 * 1.6;
    const rightEdge2 = x2 + w2 + r2 * 1.6;

    if (theme === 'fugang_street' || theme === 'red_brick_fort') {
      // 【富岡老街 / 台南古蹟 / 鹿港 / 白沙屯】復古紅磚拱廊步道與洗石子街屋基座
      ctx.fillStyle = isLight ? '#8c4627' : '#6e351c';
      ctx.fillRect(0, y2, width, sliceH);
      const walk1 = w1 * 0.28;
      const walk2 = w2 * 0.28;
      const tileColor = isLight ? '#c0392b' : '#962d22';
      this.drawPolygon(ctx, leftEdge1 - walk1, y1, leftEdge1, y1, leftEdge2, y2, leftEdge2 - walk2, y2, tileColor);
      this.drawPolygon(ctx, rightEdge1, y1, rightEdge1 + walk1, y1, rightEdge2 + walk2, y2, rightEdge2, y2, tileColor);
      return;
    }

    if (theme === 'suhua' || theme === 'yehliu_coast') {
      // 【清水斷崖 / 七星潭 / 三仙台 / 龍磐 / 野柳】左側陡峭山岩壁、右側太平洋海景與拍岸白浪花
      const cliffColor = theme === 'yehliu_coast' ? (isLight ? '#d1b26f' : '#b89856') : (isLight ? '#576574' : '#485460');
      ctx.fillStyle = cliffColor;
      ctx.fillRect(0, y2, Math.max(0, leftEdge1), sliceH);

      const seaColor = isLight ? '#0077b6' : '#023e8a';
      ctx.fillStyle = seaColor;
      ctx.fillRect(Math.max(0, rightEdge2), y2, width - Math.max(0, rightEdge2), sliceH);

      const waveShift = Math.sin(performance.now() * 0.006 + segment.index * 0.5) * (w1 * 0.06);
      const ledge1 = rightEdge1 + w1 * 0.14;
      const ledge2 = rightEdge2 + w2 * 0.14;
      this.drawPolygon(ctx, rightEdge1, y1, ledge1, y1, ledge2, y2, rightEdge2, y2, cliffColor);

      const surf1 = ledge1 + w1 * 0.12 + waveShift;
      const surf2 = ledge2 + w2 * 0.12 + waveShift;
      this.drawPolygon(ctx, ledge1, y1, surf1, y1, surf2, y2, ledge2, y2, isLight ? '#ffffff' : '#90e0ef');
      this.drawPolygon(ctx, surf1, y1, surf1 + w1 * 0.25, y1, surf2 + w2 * 0.25, y2, surf2, y2, isLight ? '#00b4d8' : '#0096c7');
      return;
    }

    if (theme === 'blue_tears') {
      // 【馬祖藍眼淚】左側閩東花崗岩崖、右側夜晚發光幽藍冷光海浪！
      ctx.fillStyle = isLight ? '#334155' : '#1e293b';
      ctx.fillRect(0, y2, Math.max(0, leftEdge1), sliceH);
      ctx.fillStyle = isLight ? '#0f172a' : '#020617';
      ctx.fillRect(Math.max(0, rightEdge2), y2, width - Math.max(0, rightEdge2), sliceH);

      const waveShift = Math.sin(performance.now() * 0.007 + segment.index * 0.6) * (w1 * 0.08);
      const glow1 = rightEdge1 + w1 * 0.12;
      const glow2 = rightEdge2 + w2 * 0.12;
      this.drawPolygon(
        ctx,
        glow1, y1,
        glow1 + w1 * 0.18 + waveShift, y1,
        glow2 + w2 * 0.18 + waveShift, y2,
        glow2, y2,
        isLight ? '#00f0ff' : '#38bdf8'
      );
      return;
    }

    if (theme === 'penghu_bridge_sea') {
      // 【澎湖跨海大橋】左右兩側皆為波濤洶湧的吼門水道蔚藍大海與白色橋樑護欄！
      const seaColor = isLight ? '#0077b6' : '#0052a5';
      ctx.fillStyle = seaColor;
      ctx.fillRect(0, y2, width, sliceH);
      const rail1 = w1 * 0.12;
      const rail2 = w2 * 0.12;
      this.drawPolygon(ctx, leftEdge1 - rail1, y1, leftEdge1, y1, leftEdge2, y2, leftEdge2 - rail2, y2, isLight ? '#ffffff' : '#dfe6e9');
      this.drawPolygon(ctx, rightEdge1, y1, rightEdge1 + rail1, y1, rightEdge2 + rail2, y2, rightEdge2, y2, isLight ? '#ffffff' : '#dfe6e9');
      return;
    }

    if (theme === 'gaomei_mirror') {
      // 【高美濕地】夕陽金紫天空之鏡泥灘倒影與木棧道色帶
      const mirrorColor = isLight ? '#e08283' : '#c27ba0';
      ctx.fillStyle = mirrorColor;
      ctx.fillRect(0, y2, width, sliceH);
      const boardwalk1 = w1 * 0.22;
      const boardwalk2 = w2 * 0.22;
      this.drawPolygon(ctx, rightEdge1, y1, rightEdge1 + boardwalk1, y1, rightEdge2 + boardwalk2, y2, rightEdge2, y2, isLight ? '#8d6e63' : '#6d4c41');
      return;
    }

    if (theme === 'golden_rice') {
      // 【池上伯朗大道】左右兩側一望無際隨風搖曳的金黃稻浪田疇！
      ctx.fillStyle = isLight ? '#f1c40f' : '#d4ac0d';
      ctx.fillRect(0, y2, width, sliceH);
      const ridge1 = w1 * 0.15;
      const ridge2 = w2 * 0.15;
      this.drawPolygon(ctx, leftEdge1 - ridge1, y1, leftEdge1, y1, leftEdge2, y2, leftEdge2 - ridge2, y2, isLight ? '#27ae60' : '#1e8449');
      this.drawPolygon(ctx, rightEdge1, y1, rightEdge1 + ridge1, y1, rightEdge2 + ridge2, y2, rightEdge2, y2, isLight ? '#27ae60' : '#1e8449');
      return;
    }

    if (theme === 'volcano_sulfur') {
      // 【陽明山小油坑】左側硫磺結晶黃褐色崩壁、右側金黃芒草山坡
      ctx.fillStyle = isLight ? '#9a7d0a' : '#7d6608';
      ctx.fillRect(0, y2, Math.max(0, leftEdge1), sliceH);
      ctx.fillStyle = isLight ? '#d4ac0d' : '#85929e';
      ctx.fillRect(Math.max(0, rightEdge2), y2, width - Math.max(0, rightEdge2), sliceH);
      return;
    }

    if (theme === 'taroko') {
      // 【花蓮太魯閣國家公園・九曲洞 / 燕子口・世界級大理岩絕壁峽谷與立霧溪急流】
      const cliffDark = isLight ? '#2f3640' : '#1e272e';
      const cliffMid = isLight ? '#57606f' : '#47535e';
      const marbleWhite = isLight ? '#f1f2f6' : '#ced6e0';
      const mossGreen = isLight ? '#10ac84' : '#0a7558';

      // 1. 左側：直插雲霄的千仞大理石變質岩峭壁 + 褶皺岩紋 + 懸壁青蘚
      ctx.fillStyle = cliffDark;
      ctx.fillRect(0, y2, Math.max(0, leftEdge1), sliceH);

      // 大理石變質岩斜向褶皺條理（層次條帶紋理）
      const marbleW = w1 * 0.44;
      this.drawPolygon(
        ctx,
        Math.max(0, leftEdge1 - marbleW), y1,
        leftEdge1, y1,
        leftEdge2, y2,
        Math.max(0, leftEdge2 - w2 * 0.44), y2,
        cliffMid
      );
      this.drawPolygon(
        ctx,
        Math.max(0, leftEdge1 - marbleW * 0.58), y1,
        Math.max(0, leftEdge1 - marbleW * 0.22), y1,
        Math.max(0, leftEdge2 - w2 * 0.44 * 0.22), y2,
        Math.max(0, leftEdge2 - w2 * 0.44 * 0.58), y2,
        marbleWhite
      );

      // 石縫頑強攀附的高山蘚苔與蕨類植物
      if (isLight) {
        this.drawPolygon(
          ctx,
          Math.max(0, leftEdge1 - w1 * 0.16), y1,
          leftEdge1, y1,
          leftEdge2, y2,
          Math.max(0, leftEdge2 - w2 * 0.16), y2,
          mossGreen
        );
      }

      // 九曲洞/燕子口天然半穿鑿式岩石挑簷與隧道拱頂（岩頂向路面正上方延伸）
      const isTunnelSection = (segment.index % 80) < 48;
      if (isTunnelSection) {
        const roofOverhang1 = w1 * 0.48;
        const roofOverhang2 = w2 * 0.48;
        this.drawPolygon(
          ctx,
          leftEdge1, y1 - sliceH * 1.8,
          leftEdge1 + roofOverhang1, y1 - sliceH * 2.2,
          leftEdge2 + roofOverhang2, y2 - sliceH * 2.2,
          leftEdge2, y2 - sliceH * 1.8,
          cliffDark
        );
        // 岩石挑簷頂部暖黃照明燈光
        if (segment.index % 6 === 0) {
          ctx.fillStyle = '#ffd32a';
          ctx.beginPath();
          ctx.arc(leftEdge1 + roofOverhang1 * 0.72, y1 - sliceH * 1.5, Math.max(1.8, w1 * 0.022), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. 右側：深邃立霧溪峽谷 + 對岸直插天際的大理岩壁 + 碧藍激流
      const riverWater = isLight ? '#00cec9' : '#01a3a4';
      const riverDeep = isLight ? '#0984e3' : '#0052a5';
      const oppositeCliff = isLight ? '#3d4852' : '#2f3542';

      // 右側對岸千仞絕壁山體（營造峽谷深邃「一線天」氣勢）
      ctx.fillStyle = oppositeCliff;
      ctx.fillRect(Math.max(0, rightEdge2 + w2 * 0.65), y2, width - Math.max(0, rightEdge2 + w2 * 0.65), sliceH);

      // 峽谷深淵與立霧溪水
      ctx.fillStyle = riverDeep;
      ctx.fillRect(Math.max(0, rightEdge2), y2, Math.max(0, w2 * 0.70), sliceH);

      // 立霧溪激流白沫與翡翠色水流
      const waveShift = Math.sin(performance.now() * 0.008 + segment.index * 0.6) * (w1 * 0.05);
      const waterLine1 = rightEdge1 + w1 * 0.16 + waveShift;
      const waterLine2 = rightEdge2 + w2 * 0.16 + waveShift;
      this.drawPolygon(
        ctx,
        rightEdge1 + w1 * 0.08, y1,
        waterLine1 + w1 * 0.22, y1,
        waterLine2 + w2 * 0.22, y2,
        rightEdge2 + w2 * 0.08, y2,
        riverWater
      );

      // 3. 右側公路沿邊：太魯閣九曲洞經典深色仿木安全護欄
      const railH = Math.max(3.5, w1 * 0.085);
      const railColor = isLight ? '#5d4037' : '#3e2723';
      const railTop = isLight ? '#8d6e63' : '#6d4c41';
      this.drawPolygon(
        ctx,
        rightEdge1, y1 - railH,
        rightEdge1 + w1 * 0.05, y1 - railH,
        rightEdge2 + w2 * 0.05, y2 - Math.max(2.5, w2 * 0.085),
        rightEdge2, y2 - Math.max(2.5, w2 * 0.085),
        railTop
      );
      // 護欄立柱 (每 3 節一根立柱)
      if (segment.index % 3 === 0) {
        ctx.fillStyle = railColor;
        ctx.fillRect(rightEdge1 - 1, y1 - railH * 1.15, Math.max(2, w1 * 0.038), railH * 1.15);
      }
      return;
    }

    if (theme === 'alishan') {
      // 【阿里山 / 太平山 / 溪頭】左側紅檜柳杉山林；右側翻騰白色雲海
      ctx.fillStyle = isLight ? '#1e4d2b' : '#14361d';
      ctx.fillRect(0, y2, Math.max(0, leftEdge1), sliceH);
      const cloudWave = Math.sin(performance.now() * 0.004 + segment.index * 0.4) * (w1 * 0.08);
      ctx.fillStyle = isLight ? '#f5f6fa' : '#dcdde1';
      ctx.fillRect(Math.max(0, rightEdge2), y2, width - Math.max(0, rightEdge2), sliceH);
      const slope1 = rightEdge1 + w1 * 0.14;
      const slope2 = rightEdge2 + w2 * 0.14;
      this.drawPolygon(ctx, rightEdge1, y1, slope1, y1, slope2, y2, rightEdge2, y2, isLight ? '#265c3a' : '#1e492e');
      this.drawPolygon(
        ctx,
        slope1, y1,
        slope1 + w1 * 0.22 + cloudWave, y1,
        slope2 + w2 * 0.22 + cloudWave, y2,
        slope2, y2,
        isLight ? '#ffeaa7' : '#ffffff'
      );
      return;
    }

    if (theme === 'lake_emerald') {
      // 【日月潭 / 鯉魚潭 / 蘭陽博物館】左側環湖綠林木棧道；右側翠綠如鏡湖水
      ctx.fillStyle = isLight ? '#1e8449' : '#145a32';
      ctx.fillRect(0, y2, Math.max(0, leftEdge1), sliceH);
      ctx.fillStyle = isLight ? '#1abc9c' : '#16a085';
      ctx.fillRect(Math.max(0, rightEdge2), y2, width - Math.max(0, rightEdge2), sliceH);
      const deck1 = rightEdge1 + w1 * 0.14;
      const deck2 = rightEdge2 + w2 * 0.14;
      this.drawPolygon(ctx, rightEdge1, y1, deck1, y1, deck2, y2, rightEdge2, y2, isLight ? '#a1887f' : '#795548');
      return;
    }

    if (theme === 'kenting') {
      // 【墾丁 / 鵝鑾鼻 / 七美 / 小琉球】左側熱帶草坡與金黃沙灘；右側碧藍珊瑚海與碎浪
      ctx.fillStyle = isLight ? '#f6e58d' : '#f0932b';
      ctx.fillRect(0, y2, Math.max(0, leftEdge1), sliceH);
      this.drawPolygon(ctx, 0, y1, leftEdge1 * 0.65, y1, leftEdge2 * 0.65, y2, 0, y2, isLight ? '#6ab04c' : '#badc58');

      ctx.fillStyle = isLight ? '#00a8ff' : '#0097e6';
      ctx.fillRect(Math.max(0, rightEdge2), y2, width - Math.max(0, rightEdge2), sliceH);
      const beach1 = rightEdge1 + w1 * 0.22;
      const beach2 = rightEdge2 + w2 * 0.22;
      this.drawPolygon(ctx, rightEdge1, y1, beach1, y1, beach2, y2, rightEdge2, y2, isLight ? '#f6e58d' : '#ffbe76');
      const surf1 = beach1 + w1 * 0.10;
      const surf2 = beach2 + w2 * 0.10;
      this.drawPolygon(ctx, beach1, y1, surf1, y1, surf2, y2, beach2, y2, isLight ? '#ffffff' : '#7ed6df');
      return;
    }

    if (theme === 'yunshanshui_cypress') {
      // 【花蓮壽豐 雲山水夢幻湖】左側翠綠草坪與落羽松森林；右側蒂芬妮藍清澈湖水與跳石水圳
      ctx.fillStyle = isLight ? '#2ed573' : '#26af61';
      ctx.fillRect(0, y2, Math.max(0, leftEdge1), sliceH);
      // 落羽松金黃與翠綠林帶
      const cypress1 = leftEdge1 - w1 * 0.22;
      const cypress2 = leftEdge2 - w2 * 0.22;
      this.drawPolygon(ctx, Math.max(0, cypress1), y1, leftEdge1, y1, leftEdge2, y2, Math.max(0, cypress2), y2, isLight ? '#f39c12' : '#27ae60');

      // 右側蒂芬妮藍夢幻湖水
      const lakeWater = isLight ? '#00d2d3' : '#00cec9';
      ctx.fillStyle = lakeWater;
      ctx.fillRect(Math.max(0, rightEdge2), y2, width - Math.max(0, rightEdge2), sliceH);
      // 湖岸白色石砌護欄與跳石步道
      const weir1 = rightEdge1 + w1 * 0.16;
      const weir2 = rightEdge2 + w2 * 0.16;
      this.drawPolygon(ctx, rightEdge1, y1, weir1, y1, weir2, y2, rightEdge2, y2, isLight ? '#ffffff' : '#dfe6e9');
      return;
    }

    if (theme === 'meishan_tea') {
      // 【嘉義梅山 太平雲梯】左側高山梯田翠綠茶園步道；右側深谷雲海與高空吊橋白色纜索
      ctx.fillStyle = isLight ? '#2ecc71' : '#27ae60';
      ctx.fillRect(0, y2, Math.max(0, leftEdge1), sliceH);
      // 階梯狀茶園深淺相間茶樹波浪
      const teaLedge1 = leftEdge1 - w1 * 0.24;
      const teaLedge2 = leftEdge2 - w2 * 0.24;
      this.drawPolygon(ctx, Math.max(0, teaLedge1), y1, leftEdge1, y1, leftEdge2, y2, Math.max(0, teaLedge2), y2, isLight ? '#1e8449' : '#145a32');

      // 右側俯瞰嘉南平原萬丈深谷與翻騰雲海
      ctx.fillStyle = isLight ? '#f9ca24' : '#e67e22';
      ctx.fillRect(Math.max(0, rightEdge2), y2, width - Math.max(0, rightEdge2), sliceH);
      const cloud1 = rightEdge1 + w1 * 0.18;
      const cloud2 = rightEdge2 + w2 * 0.18;
      this.drawPolygon(ctx, rightEdge1, y1, cloud1, y1, cloud2, y2, rightEdge2, y2, isLight ? '#ffffff' : '#f5f6fa');
      return;
    }

    if (theme === 'jialulan_coast') {
      // 【台東卑南 加路蘭海岸】左側綠色大草原與椰子樹；右側浩瀚太平洋湛藍海浪與拍岸白浪花
      ctx.fillStyle = isLight ? '#00b894' : '#00947a';
      ctx.fillRect(0, y2, Math.max(0, leftEdge1), sliceH);

      const seaColor = isLight ? '#0984e3' : '#0052a5';
      ctx.fillStyle = seaColor;
      ctx.fillRect(Math.max(0, rightEdge2), y2, width - Math.max(0, rightEdge2), sliceH);
      // 沿岸火山礁岩與白浪花
      const surfShift = Math.sin(performance.now() * 0.007 + segment.index * 0.5) * (w1 * 0.05);
      const reef1 = rightEdge1 + w1 * 0.14;
      const reef2 = rightEdge2 + w2 * 0.14;
      this.drawPolygon(ctx, rightEdge1, y1, reef1, y1, reef2, y2, rightEdge2, y2, isLight ? '#2d3436' : '#1e272e');
      this.drawPolygon(ctx, reef1, y1, reef1 + w1 * 0.12 + surfShift, y1, reef2 + w2 * 0.12 + surfShift, y2, reef2, y2, '#ffffff');
      return;
    }

    if (theme === 'nanwan_sand') {
      // 【屏東墾丁 南灣遊憩區】左側熱帶椰林與金黃沙丘；右側金黃細沙海灘、彩色陽傘與碧藍海浪
      ctx.fillStyle = isLight ? '#f1c40f' : '#e67e22';
      ctx.fillRect(0, y2, Math.max(0, leftEdge1), sliceH);

      const bayWater = isLight ? '#00a8ff' : '#0097e6';
      ctx.fillStyle = bayWater;
      ctx.fillRect(Math.max(0, rightEdge2), y2, width - Math.max(0, rightEdge2), sliceH);
      const sand1 = rightEdge1 + w1 * 0.24;
      const sand2 = rightEdge2 + w2 * 0.24;
      this.drawPolygon(ctx, rightEdge1, y1, sand1, y1, sand2, y2, rightEdge2, y2, isLight ? '#f6e58d' : '#f1c40f');
      const whiteSurf1 = sand1 + w1 * 0.10;
      const whiteSurf2 = sand2 + w2 * 0.10;
      this.drawPolygon(ctx, sand1, y1, whiteSurf1, y1, whiteSurf2, y2, sand2, y2, isLight ? '#ffffff' : '#7ed6df');
      return;
    }

    if (theme === 'anping_brick') {
      // 【台南安平 古堡與億載金城】左側1624荷蘭熱蘭遮城三層紅磚城基與古榕；右側台江運河石岸與古砲護欄
      ctx.fillStyle = isLight ? '#c0392b' : '#962d22';
      ctx.fillRect(0, y2, Math.max(0, leftEdge1), sliceH);
      const brickLedge1 = leftEdge1 - w1 * 0.25;
      const brickLedge2 = leftEdge2 - w2 * 0.25;
      this.drawPolygon(ctx, Math.max(0, brickLedge1), y1, leftEdge1, y1, leftEdge2, y2, Math.max(0, brickLedge2), y2, isLight ? '#a04000' : '#784212');

      ctx.fillStyle = isLight ? '#1abc9c' : '#16a085';
      ctx.fillRect(Math.max(0, rightEdge2), y2, width - Math.max(0, rightEdge2), sliceH);
      const stone1 = rightEdge1 + w1 * 0.16;
      const stone2 = rightEdge2 + w2 * 0.16;
      this.drawPolygon(ctx, rightEdge1, y1, stone1, y1, stone2, y2, rightEdge2, y2, isLight ? '#ecf0f1' : '#bdc3c7');
      return;
    }

    if (theme === 'jiufen') {
      ctx.fillStyle = isLight ? '#3d354b' : '#2b2537';
      ctx.fillRect(0, y2, Math.max(0, leftEdge1), sliceH);
      ctx.fillStyle = isLight ? '#111d35' : '#0b1324';
      ctx.fillRect(Math.max(0, rightEdge2), y2, width - Math.max(0, rightEdge2), sliceH);
      return;
    }

    const grassColor = isLight ? this.currentStage.grassLight : this.currentStage.grassDark;
    ctx.fillStyle = grassColor;
    ctx.fillRect(0, y2, width, sliceH);
  }

  drawRoadSlice(ctx, width, lanes, x1, y1, w1, x2, y2, w2, colorType) {
    const theme = this.currentStage;
    const isLight = colorType === 'light';
    const roadColor = isLight ? theme.roadLight : theme.roadDark;
    const rumbleColor = isLight ? theme.rumbleLight : theme.rumbleDark;

    const r1 = w1 / 7.2;
    const r2 = w2 / 7.2;

    // 外側碎石路肩與排水溝邊坡
    const outerColor = isLight ? '#c2b9a5' : '#9c9482';
    this.drawPolygon(ctx, x1 - w1 - r1 * 2.1, y1, x1 - w1 - r1, y1, x2 - w2 - r2, y2, x2 - w2 - r2 * 2.1, y2, outerColor);
    this.drawPolygon(ctx, x1 + w1 + r1, y1, x1 + w1 + r1 * 2.1, y1, x2 + w2 + r2 * 2.1, y2, x2 + w2 + r2, y2, outerColor);

    // 街機 OutRun 紅白/黃黑立體路緣石 (Rumble Strips)
    this.drawPolygon(ctx, x1 - w1 - r1, y1, x1 - w1, y1, x2 - w2, y2, x2 - w2 - r2, y2, rumbleColor);
    this.drawPolygon(ctx, x1 + w1, y1, x1 + w1 + r1, y1, x2 + w2 + r2, y2, x2 + w2, y2, rumbleColor);

    // 柏油路面主體
    this.drawPolygon(ctx, x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2, roadColor);

    // 細緻柏油輪胎壓痕紋理 (Tire Wear Strips)，提升 Super-Scaler 街機真實質感
    const wearColor = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.03)';
    for (let t = 0; t < lanes; t++) {
      const centerRatio = -1 + ((t + 0.5) * 2) / lanes;
      const tx1 = x1 + w1 * centerRatio;
      const tx2 = x2 + w2 * centerRatio;
      const tw1 = (w1 / lanes) * 0.44;
      const tw2 = (w2 / lanes) * 0.44;
      this.drawPolygon(ctx, tx1 - tw1, y1, tx1 + tw1, y1, tx2 + tw2, y2, tx2 - tw2, y2, wearColor);
    }

    // 兩側白實線邊界 (Road Edge Lines)
    const edgeW1 = Math.max(1.5, w1 / 52);
    const edgeW2 = Math.max(1, w2 / 52);
    const edgeLineColor = isLight ? 'rgba(255, 255, 255, 0.82)' : 'rgba(220, 225, 230, 0.65)';
    this.drawPolygon(ctx, x1 - w1, y1, x1 - w1 + edgeW1, y1, x2 - w2 + edgeW2, y2, x2 - w2, y2, edgeLineColor);
    this.drawPolygon(ctx, x1 + w1 - edgeW1, y1, x1 + w1, y1, x2 + w2, y2, x2 + w2 - edgeW2, y2, edgeLineColor);

    if (isLight) {
      const l1 = Math.max(2, w1 / 34);
      const l2 = Math.max(1, w2 / 34);
      let laneX1 = x1 - w1 + (w1 * 2) / lanes;
      let laneX2 = x2 - w2 + (w2 * 2) / lanes;
      for (let lane = 1; lane < lanes; lane++) {
        this.drawPolygon(
          ctx,
          laneX1 - l1 / 2, y1,
          laneX1 + l1 / 2, y1,
          laneX2 + l2 / 2, y2,
          laneX2 - l2 / 2, y2,
          theme.laneColor
        );
        laneX1 += (w1 * 2) / lanes;
        laneX2 += (w2 * 2) / lanes;
      }

      // 路緣反光貓眼石 (Cat's-eye Reflectors)
      if (w1 > 45) {
        const catSize = Math.max(2, Math.min(5, w1 * 0.015));
        ctx.fillStyle = '#ffd32a';
        ctx.fillRect(x1 - w1 - r1 * 0.5 - catSize / 2, y1 - catSize, catSize, catSize);
        ctx.fillRect(x1 + w1 + r1 * 0.5 - catSize / 2, y1 - catSize, catSize, catSize);
      }
    }

    // 【天氣系統：柏油路面動態光影與濕滑倒影效果】
    this.drawWeatherRoadReflections(ctx, x1, y1, w1, x2, y2, w2, isLight);
  }

  /**
   * 繪製 5 大天氣狀態的天空光影（破曉神聖光束、晴天六角鏡頭光暈、魔幻日落晚霞、雨天烏雲閃電、高山濃霧）
   */
  drawWeatherSkyOverlay(ctx, width, height, horizonY) {
    const now = performance.now() * 0.001;
    const clampedH = Math.max(60, Math.min(height - 60, Math.floor(horizonY)));
    const sunX = Math.floor(((width * 0.72 - this.skyOffset * 0.12) % width + width) % width);

    const wSunrise = this.getWeatherWeight('sunrise');
    const wSunny = this.getWeatherWeight('sunny');
    const wSunset = this.getWeatherWeight('sunset');
    const wRainy = this.getWeatherWeight('rainy');
    const wFoggy = this.getWeatherWeight('foggy');

    ctx.save();

    // 1. 🌅 日出破曉 (Sunrise)：玫瑰金晨曦天幕 + 扇形破曉神聖光束 (God Rays)
    if (wSunrise > 0.02) {
      ctx.globalAlpha = wSunrise * 0.52;
      const srGrad = ctx.createLinearGradient(0, 0, 0, clampedH);
      srGrad.addColorStop(0, '#2c1654');
      srGrad.addColorStop(0.55, '#eb4d4b');
      srGrad.addColorStop(1, '#ffbe76');
      ctx.fillStyle = srGrad;
      ctx.fillRect(0, 0, width, clampedH);

      // 扇形破曉神聖光束 (Crepuscular God Rays)
      ctx.globalAlpha = wSunrise * 0.28;
      for (let r = 0; r < 7; r++) {
        const ang = -Math.PI * 0.92 + (r / 6) * Math.PI * 0.84 + Math.sin(now * 0.4 + r) * 0.04;
        ctx.fillStyle = (r % 2 === 0) ? '#fff200' : '#ffbe76';
        ctx.beginPath();
        ctx.moveTo(sunX, clampedH - 18);
        ctx.lineTo(sunX + Math.cos(ang - 0.055) * 260, clampedH - 18 + Math.sin(ang - 0.055) * 210);
        ctx.lineTo(sunX + Math.cos(ang + 0.055) * 260, clampedH - 18 + Math.sin(ang + 0.055) * 210);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 2. ☀️ 盛夏晴天 (Sunny)：斜射丁達爾陽光束 + 街機六角鏡頭光暈 (Lens Flare)
    if (wSunny > 0.02) {
      ctx.globalAlpha = wSunny * 0.18;
      for (let b = 0; b < 3; b++) {
        const bx = sunX - 90 + b * 75;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(sunX, clampedH - 58);
        ctx.lineTo(bx - 28, clampedH);
        ctx.lineTo(bx + 28, clampedH);
        ctx.closePath();
        ctx.fill();
      }
      // 六角彩色鏡頭光暈串 (Hexagonal Lens Flare)
      const flareColors = ['rgba(255, 242, 0, 0.32)', 'rgba(0, 240, 255, 0.26)', 'rgba(255, 107, 129, 0.28)'];
      const centerX = width * 0.5;
      const centerY = clampedH * 0.65;
      for (let f = 1; f <= 3; f++) {
        const fx = sunX + (centerX - sunX) * (f * 0.38);
        const fy = (clampedH - 58) + (centerY - (clampedH - 58)) * (f * 0.38);
        ctx.globalAlpha = wSunny * 0.65;
        ctx.fillStyle = flareColors[f - 1];
        ctx.beginPath();
        ctx.arc(fx, fy, 8 + f * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. 🌇 魔幻日落 (Sunset)：紫紅與烈焰金橘晚霞罩染 + 低垂巨型夕陽
    if (wSunset > 0.02) {
      ctx.globalAlpha = wSunset * 0.58;
      const ssGrad = ctx.createLinearGradient(0, 0, 0, clampedH);
      ssGrad.addColorStop(0, '#1b1464');
      ssGrad.addColorStop(0.48, '#b71540');
      ssGrad.addColorStop(0.82, '#e55039');
      ssGrad.addColorStop(1, '#f6b93b');
      ctx.fillStyle = ssGrad;
      ctx.fillRect(0, 0, width, clampedH);

      ctx.globalAlpha = wSunset * 0.72;
      const setGrad = ctx.createRadialGradient(sunX, clampedH - 20, 8, sunX, clampedH - 20, 96);
      setGrad.addColorStop(0, '#fff200');
      setGrad.addColorStop(0.45, 'rgba(255, 121, 63, 0.65)');
      setGrad.addColorStop(1, 'rgba(255, 121, 63, 0)');
      ctx.fillStyle = setGrad;
      ctx.beginPath();
      ctx.arc(sunX, clampedH - 20, 96, Math.PI, 0);
      ctx.fill();
    }

    // 4. 🌧️ 斜風驟雨 (Rainy)：鉛灰烏雲壓頂 + 偶發蒼白閃電雷光 (Lightning Flash)
    if (wRainy > 0.02) {
      ctx.globalAlpha = wRainy * 0.62;
      const rainSky = ctx.createLinearGradient(0, 0, 0, clampedH);
      rainSky.addColorStop(0, '#0f172a');
      rainSky.addColorStop(0.65, '#1e293b');
      rainSky.addColorStop(1, '#334155');
      ctx.fillStyle = rainSky;
      ctx.fillRect(0, 0, width, clampedH);

      if (this.weatherState.lightningAlpha > 0.02) {
        ctx.globalAlpha = this.weatherState.lightningAlpha;
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(0, 0, width, height);
        // 鋸齒閃電光束
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        const lx = width * 0.35;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx - 18, clampedH * 0.35);
        ctx.lineTo(lx + 12, clampedH * 0.52);
        ctx.lineTo(lx - 10, clampedH * 0.88);
        ctx.stroke();
      }
    }

    // 5. 🌫️ 高山濃霧 (Foggy)：遠景灰白雲霧罩染
    if (wFoggy > 0.02) {
      ctx.globalAlpha = wFoggy * 0.68;
      const fogGrad = ctx.createLinearGradient(0, 0, 0, clampedH + 36);
      fogGrad.addColorStop(0, 'rgba(185, 200, 212, 0.55)');
      fogGrad.addColorStop(0.7, 'rgba(220, 230, 238, 0.85)');
      fogGrad.addColorStop(1, 'rgba(236, 242, 248, 0.92)');
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, 0, width, clampedH + 36);
    }

    ctx.restore();
  }

  /**
   * 繪製柏油路面上的天氣光影（日出/日落的黃金波光反光帶、雨天的濕滑鏡面柏油與霓虹水面倒影）
   */
  drawWeatherRoadReflections(ctx, x1, y1, w1, x2, y2, w2, isLight) {
    const wSunset = this.getWeatherWeight('sunset');
    const wSunrise = this.getWeatherWeight('sunrise');
    const wRainy = this.getWeatherWeight('rainy');
    const goldenWeight = Math.max(wSunset, wSunrise * 0.85);

    if (goldenWeight > 0.05) {
      // 🌇/🌅 跑道中央隨波擺動的「夕陽/晨曦黃金波光反光帶 (Golden Specular Trail)」
      const shimmer = 1 + Math.sin(y1 * 0.14 + performance.now() * 0.008) * 0.22;
      const gw1 = w1 * 0.20 * shimmer;
      const gw2 = w2 * 0.20 * shimmer;
      const alpha = (isLight ? 0.26 : 0.18) * goldenWeight;
      this.drawPolygon(
        ctx,
        x1 - gw1, y1,
        x1 + gw1, y1,
        x2 + gw2, y2,
        x2 - gw2, y2,
        `rgba(255, 195, 50, ${alpha.toFixed(2)})`
      );
    }

    if (wRainy > 0.05) {
      // 🌧️ 雨天濕滑深色鏡面柏油質感與路旁霓虹/車尾燈水波倒影
      const wetAlpha = (isLight ? 0.22 : 0.28) * wRainy;
      this.drawPolygon(
        ctx,
        x1 - w1, y1,
        x1 + w1, y1,
        x2 + w2, y2,
        x2 - w2, y2,
        `rgba(12, 24, 42, ${wetAlpha.toFixed(2)})`
      );
      if (isLight) {
        const rw1 = w1 * 0.58;
        const rw2 = w2 * 0.58;
        this.drawPolygon(
          ctx,
          x1 - rw1, y1,
          x1 - rw1 * 0.65, y1,
          x2 - rw2 * 0.65, y2,
          x2 - rw2, y2,
          `rgba(0, 210, 255, ${(0.16 * wRainy).toFixed(2)})`
        );
        this.drawPolygon(
          ctx,
          x1 + rw1 * 0.65, y1,
          x1 + rw1, y1,
          x2 + rw2, y2,
          x2 + rw2 * 0.65, y2,
          `rgba(255, 75, 75, ${(0.16 * wRainy).toFixed(2)})`
        );
      }
    }
  }

  /**
   * 繪製前景天氣粒子（雨天雙層斜向雨絲、輪胎水花、高山流動雲霧帶）與破霧黃金車頭遠光燈束
   */
  drawWeatherForegroundAndLights(ctx, width, height, horizonY, player) {
    const now = performance.now() * 0.001;
    const clampedH = Math.max(60, Math.min(height - 60, Math.floor(horizonY)));
    const wRainy = this.getWeatherWeight('rainy');
    const wFoggy = this.getWeatherWeight('foggy');
    const wSunset = this.getWeatherWeight('sunset');

    ctx.save();

    // 1. 🌫️ 高山濃霧：橫向流動的多層次山嵐雲霧帶 (Drifting Fog Bands)
    if (wFoggy > 0.02) {
      const fogDistGrad = ctx.createLinearGradient(0, clampedH - 18, 0, height * 0.82);
      fogDistGrad.addColorStop(0, `rgba(228, 236, 244, ${(0.78 * wFoggy).toFixed(2)})`);
      fogDistGrad.addColorStop(0.45, `rgba(215, 226, 236, ${(0.42 * wFoggy).toFixed(2)})`);
      fogDistGrad.addColorStop(1, 'rgba(215, 226, 236, 0)');
      ctx.fillStyle = fogDistGrad;
      ctx.fillRect(0, clampedH - 18, width, height * 0.82 - (clampedH - 18));

      // 飄移山嵐霧團
      ctx.fillStyle = `rgba(245, 250, 255, ${(0.32 * wFoggy).toFixed(2)})`;
      for (let f = 0; f < 5; f++) {
        const fx = ((f * 170 + now * (28 + f * 7)) % (width + 240)) - 120;
        const fy = clampedH + 8 + f * 26;
        ctx.beginPath();
        ctx.ellipse(fx, fy, 95 + f * 15, 14 + f * 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. 💡 黃金破霧車頭遠光燈束 (Headlight Cones)：在起霧、雨天或日落暮色時自動開啟！
    const headlightPower = Math.max(wFoggy, wRainy * 0.88, wSunset * 0.55);
    if (headlightPower > 0.08 && player && player.crashTimer <= 0) {
      const carCenterX = Math.floor(width / 2);
      const carBaseY = Math.floor(height - 26);
      const steerShift = (player.steer || 0) * 44;

      const beamGrad = ctx.createLinearGradient(carCenterX, carBaseY - 28, carCenterX + steerShift, clampedH + 28);
      beamGrad.addColorStop(0, `rgba(255, 242, 130, ${(0.42 * headlightPower).toFixed(2)})`);
      beamGrad.addColorStop(0.55, `rgba(255, 225, 90, ${(0.20 * headlightPower).toFixed(2)})`);
      beamGrad.addColorStop(1, 'rgba(255, 225, 90, 0)');
      ctx.fillStyle = beamGrad;

      // 左車頭遠光燈錐
      ctx.beginPath();
      ctx.moveTo(carCenterX - 26, carBaseY - 30);
      ctx.lineTo(carCenterX - 145 + steerShift, clampedH + 34);
      ctx.lineTo(carCenterX - 12 + steerShift, clampedH + 34);
      ctx.closePath();
      ctx.fill();

      // 右車頭遠光燈錐
      ctx.beginPath();
      ctx.moveTo(carCenterX + 26, carBaseY - 30);
      ctx.lineTo(carCenterX + 12 + steerShift, clampedH + 34);
      ctx.lineTo(carCenterX + 145 + steerShift, clampedH + 34);
      ctx.closePath();
      ctx.fill();
    }

    // 3. 🌧️ 雨天：雙層高速斜向雨絲 (Diagonal Rain Streaks) 與車輪水花噴濺 (Tire Water Spray)
    if (wRainy > 0.03) {
      const windTilt = -10 - (player ? (player.steer || 0) * 12 : 0);
      const rainList = this.weatherState.rainParticles || [];
      for (let i = 0; i < rainList.length; i++) {
        const rp = rainList[i];
        const rx = ((rp.x * width + now * windTilt * 18) % width + width) % width;
        const ry = ((rp.y * height + now * rp.speed * 540) % height + height) % height;
        ctx.strokeStyle = rp.layer === 0
          ? `rgba(200, 230, 255, ${(0.58 * wRainy).toFixed(2)})`
          : `rgba(140, 195, 245, ${(0.36 * wRainy).toFixed(2)})`;
        ctx.lineWidth = rp.layer === 0 ? 1.6 : 1.0;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + windTilt * 0.45, ry + rp.len);
        ctx.stroke();
      }

      // 玩家車輪左右兩側高速噴濺的白色水花粒子
      if (player && player.speed > 2500 && player.crashTimer <= 0) {
        const cx = Math.floor(width / 2);
        const cy = Math.floor(height - 20);
        ctx.fillStyle = `rgba(225, 245, 255, ${(0.68 * wRainy).toFixed(2)})`;
        for (let s = 0; s < 6; s++) {
          const spread = (s + 1) * 5 + Math.sin(now * 28 + s) * 4;
          const lift = (s * 4 + (now * 90) % 14);
          ctx.fillRect(cx - 44 - spread, cy - lift, 4, 3);
          ctx.fillRect(cx + 40 + spread, cy - lift, 4, 3);
        }
      }
    }

    ctx.restore();
  }

  getDynamicSegmentCurve(segment, activeForkDir) {
    if (segment.forkPhase === 'realign') {
      const u = segment.realignProgress || 0;
      // 前半段 (0 <= u < 0.5)：順著左/右分支往外彎出去；後半段 (0.5 <= u <= 1.0)：反向回彎將跑道導正回直線！
      const sCurve = Math.sin(u * Math.PI * 2) * 3.4;
      return activeForkDir * sCurve;
    }
    return segment.curve;
  }

  render(ctx, width, height, player) {
    const baseSegment = this.findSegment(player.z);
    const basePercent = (player.z % this.segmentLength) / this.segmentLength;
    const playerSegment = this.findSegment(player.z + this.cameraHeight * this.cameraDepth);
    const playerPercent = ((player.z + this.cameraHeight * this.cameraDepth) % this.segmentLength) / this.segmentLength;
    const playerY = this.easeInOut(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);

    // 判斷目前在分岔路鎖定哪一側分支（左道 -1 / 右道 +1）
    const activeForkDir = this.forkBranchLocked
      ? this.chosenForkDir
      : (player.x < 0 ? -1 : 1);

    const slope = (playerSegment.p2.world.y - playerSegment.p1.world.y) / this.segmentLength;
    const horizonOffset = Math.max(-45, Math.min(45, slope * 28));
    const dynamicHorizonY = height * 0.50 + horizonOffset;

    ctx.fillStyle = this.currentStage.grassDark;
    ctx.fillRect(0, Math.max(0, dynamicHorizonY - 2), width, height);

    window.spriteRenderer.drawBackground(
      ctx,
      width,
      height,
      dynamicHorizonY,
      this.skyOffset,
      this.currentStage
    );

    // 疊加當前關卡與動態過渡的「5 大天氣狀態天空光影效果」
    this.drawWeatherSkyOverlay(ctx, width, height, dynamicHorizonY);

    let maxy = height;
    let x = 0;
    const baseCurve = this.getDynamicSegmentCurve(baseSegment, activeForkDir);
    let dx = -(baseCurve * basePercent);

    const visibleSegments = [];

    for (let n = 0; n < this.drawDistance; n++) {
      const segIndex = (baseSegment.index + n) % this.segments.length;
      const segment = this.segments[segIndex];
      const looped = segment.index < baseSegment.index;
      const camZ = player.z - (looped ? this.trackLength : 0);

      this.project(
        segment.p1,
        (player.x * this.roadWidth) - x,
        playerY + this.cameraHeight,
        camZ,
        width,
        height,
        horizonOffset
      );
      this.project(
        segment.p2,
        (player.x * this.roadWidth) - x - dx,
        playerY + this.cameraHeight,
        camZ,
        width,
        height,
        horizonOffset
      );

      const segCurve = this.getDynamicSegmentCurve(segment, activeForkDir);
      x += dx;
      dx += segCurve;

      segment.clip = maxy;

      if (
        segment.p1.camera.z <= this.cameraDepth ||
        segment.p2.screen.y >= segment.p1.screen.y ||
        segment.p2.screen.y >= maxy
      ) {
        continue;
      }

      visibleSegments.push(segment);

      const x1 = segment.p1.screen.x;
      const y1 = segment.p1.screen.y;
      const w1 = segment.p1.screen.w;
      const x2 = segment.p2.screen.x;
      const y2 = segment.p2.screen.y;
      const w2 = segment.p2.screen.w;

      this.drawStageRoadsideSlice(ctx, width, segment, x1, y1, w1, x2, y2, w2);

      if (segment.forkPhase === 'split' && segment.forkOffset > 0.02) {
        // 【Phase A：OutRun Y字分岔展開區】左右雙分支向外分開，中央呈現三角綠地與紅白分流鼻端
        const splitShift1 = w1 * segment.forkOffset;
        const splitShift2 = w2 * segment.forkOffset;
        const widthFactor = 1.0 - Math.min(0.26, segment.forkOffset * 0.22);
        const branchW1 = w1 * widthFactor;
        const branchW2 = w2 * widthFactor;

        this.drawRoadSlice(
          ctx, width, 2,
          x1 - splitShift1, y1, branchW1,
          x2 - splitShift2, y2, branchW2,
          segment.color
        );
        this.drawRoadSlice(
          ctx, width, 2,
          x1 + splitShift1, y1, branchW1,
          x2 + splitShift2, y2, branchW2,
          segment.color
        );
      } else if (segment.forkPhase === 'realign' && segment.forkOffset > 0.01) {
        // 【Phase B：順著所選左/右分支開出去，並平滑將跑道導正回中央】
        const u = segment.realignProgress || 0;
        const chosenShift1 = activeForkDir * w1 * segment.forkOffset;
        const chosenShift2 = activeForkDir * w2 * segment.forkOffset;
        const widthFactor = 0.74 + 0.26 * this.easeInOut(0, 1, u);
        const chosenW1 = w1 * widthFactor;
        const chosenW2 = w2 * widthFactor;

        // 未選擇的另一側分支逐漸向外側遠離淡出畫面
        if (u < 0.65) {
          const otherOffset = 1.18 + this.easeIn(0, 2.4, u / 0.65);
          const otherShift1 = -activeForkDir * w1 * otherOffset;
          const otherShift2 = -activeForkDir * w2 * otherOffset;
          this.drawRoadSlice(
            ctx, width, 2,
            x1 + otherShift1, y1, w1 * 0.72,
            x2 + otherShift2, y2, w2 * 0.72,
            segment.color
          );
        }

        // 玩家所選的主分支平滑導正回畫面正中央且恢復 4 車道寬度
        this.drawRoadSlice(
          ctx, width, u > 0.55 ? this.lanes : 2,
          x1 + chosenShift1, y1, chosenW1,
          x2 + chosenShift2, y2, chosenW2,
          segment.color
        );
      } else {
        this.drawRoadSlice(ctx, width, this.lanes, x1, y1, w1, x2, y2, w2, segment.color);
      }

      maxy = y1;
    }

    for (let i = visibleSegments.length - 1; i >= 0; i--) {
      const segment = visibleSegments[i];
      const scale = segment.p1.screen.scale;
      const roadHalfW = segment.p1.screen.w;

      if (segment.sprites && segment.sprites.length > 0) {
        for (let s = 0; s < segment.sprites.length; s++) {
          const sp = segment.sprites[s];
          if (sp.collected || sp.used) continue;
          const spriteX = segment.p1.screen.x + (sp.offset * roadHalfW);
          const spriteY = segment.p1.screen.y;
          if (spriteY <= segment.clip) {
            window.spriteRenderer.drawRoadsideSprite(ctx, sp, spriteX, spriteY, scale, roadHalfW, segment.p1.screen.x);
          }
        }
      }

      if (segment.cars && segment.cars.length > 0) {
        for (let c = 0; c < segment.cars.length; c++) {
          const car = segment.cars[c];
          const carPercent = (((car.z % this.segmentLength) + this.segmentLength) % this.segmentLength) / this.segmentLength;
          const carScale = segment.p1.screen.scale + (segment.p2.screen.scale - segment.p1.screen.scale) * carPercent;
          const carRoadX = segment.p1.screen.x + (segment.p2.screen.x - segment.p1.screen.x) * carPercent;
          const carY = segment.p1.screen.y + (segment.p2.screen.y - segment.p1.screen.y) * carPercent;
          const carRoadHalfW = segment.p1.screen.w + (segment.p2.screen.w - segment.p1.screen.w) * carPercent;
          const carX = carRoadX + (carScale * car.offset * this.roadWidth * width / 2);
          if (carY <= segment.clip) {
            window.spriteRenderer.drawRoadsideSprite(ctx, car, carX, carY, carScale, carRoadHalfW);
          }
        }
      }
    }

    // 繪製前景天氣粒子（雨絲、輪胎水花、流動山嵐濃霧）與黃金破霧車頭遠光燈束
    this.drawWeatherForegroundAndLights(ctx, width, height, dynamicHorizonY, player);

    // 繪製小車（機車）被撞飛時的 720 度大風車飛天搞笑動畫與「💥 按陰陽～！！」字卡
    if (this.flyingScooters && this.flyingScooters.length > 0 && window.spriteRenderer) {
      window.spriteRenderer.drawFlyingScooters(ctx, this.flyingScooters);
    }
  }
}

window.Pseudo3DRoad = Pseudo3DRoad;
