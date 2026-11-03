/**
 * TaiwanOutRun - 6 大台灣傳奇載具資料表與玩家物理/變胖(Fat Mode)/推車減肥/翻車狀態機
 */

const VEHICLE_ROSTER = [
  {
    id: 'sausage',
    name: '香腸/臭豆腐三輪車',
    tag: '平衡新手型',
    plate: '十八仔-666',
    desc: '車頂紅白大陽傘掛著紅燈籠與香腸，車斗橫置綠色瓦斯桶與十八仔碗公，催油門時烤腸香氣四溢！',
    nitroName: '【瓦斯回火大噴射】孤輪藍焰＋香腸碗公騰空！',
    nitroShout: '🎲 瓦斯回火孤輪大噴射！十八仔通殺啦！',
    crashQuote: '🎯【高空分解➔神級空中重組】老闆撐傘抓回瓦斯桶與車架，奇蹟落地比 YA✌️！',
    stats: { speed: 4, accel: 4, handling: 4, weight: 3 },
    maxSpeed: 13200,
    nitroMaxSpeed: 16800,
    accel: 7400,
    centrifugal: 0.28,
    turnSpeed: 2.45
  },
  {
    id: 'garbage',
    name: '黃色環保局垃圾車',
    tag: '重裝坦克型',
    plate: '清潔-9487',
    desc: '車身印有環保回收標誌，車頂雙黃警示燈閃爍，兩位穿螢光背心的隊員站在車尾踏板隨車晃動！',
    nitroName: '【少女的祈禱狂暴曲】狂暴音波＋藍橘火箭尾焰！',
    nitroShout: '🎵 少女的祈禱狂暴加速！隊員抓緊別飛走啦！',
    crashQuote: '🎯【高空分解➔神級空中重組】隊員半空徒手抓輪胎拼回車頭，全員車頂比讚👍！',
    stats: { speed: 3, accel: 3, handling: 3, weight: 5 },
    maxSpeed: 12700,
    nitroMaxSpeed: 16500,
    accel: 6600,
    centrifugal: 0.22,
    turnSpeed: 2.15
  },
  {
    id: 'gravel',
    name: '砂石車（公路霸王）',
    tag: '極速推土機',
    plate: '霸王-8888',
    desc: '藍色重裝傾卸砂斗滿載砂石不斷震落碎石，運將學長戴工程帽叼著菸、單手跨窗外霸氣巡航！',
    nitroName: '【福氣啦！雙聯裝保力達火箭】孤輪草藥蒸氣噴射！',
    nitroShout: '🍾 福氣啦！車側巨型玻璃瓶雙聯裝火箭全開！',
    crashQuote: '🎯【高空分解➔神級空中重組】學長空中腳勾巨胎、手扛藍色鐵斗喀嚓合體比讚👍！',
    stats: { speed: 5, accel: 3, handling: 2, weight: 5 },
    maxSpeed: 14000,
    nitroMaxSpeed: 17600,
    accel: 6800,
    centrifugal: 0.32,
    turnSpeed: 2.0
  },
  {
    id: 'kinder',
    name: '黃綠幼稚園娃娃車',
    tag: '超輕量高速型',
    plate: '向日葵-100',
    desc: '復古黃綠條紋小巴，車頂立著三角形警示牌，車窗裡坐滿開心揮手的 Q 版幼稚園小朋友！',
    nitroName: '【校園暴走大歡呼】衝出天窗揮蠟筆＋ㄅㄆㄇㄈ音波！',
    nitroShout: '🖍️ 哇——！ㄅㄆㄇㄈ校園暴走大歡呼！',
    crashQuote: '🎯【高空分解➔神級空中重組】隨車老師空中覺醒「守護孩子們」神技拼回整台車比 YA✌️！',
    stats: { speed: 4, accel: 5, handling: 5, weight: 2 },
    maxSpeed: 13500,
    nitroMaxSpeed: 17100,
    accel: 8600,
    centrifugal: 0.25,
    turnSpeed: 2.85
  },
  {
    id: 'grandma',
    name: '阿嬤的豪邁/迪爵 125',
    tag: '極限壓車型',
    plate: '買菜-0857',
    desc: '阿嬤穿粉紅碎花衫戴安全帽，紫色擋風鏡掛著平安符，前鐵籃塞滿高麗菜與大把三星蔥！',
    nitroName: '【買菜遲到極限抽油門】趴車狂飆＋二行程藍煙噴發！',
    nitroShout: '🥬 買菜遲到啦！極限壓車磨出整排火花！',
    crashQuote: '🎯【高空分解➔神級空中重組】阿嬤空中旋風腳勾輪胎、手接菜籃西瓜，完美落地大笑比 YA✌️！',
    stats: { speed: 4, accel: 5, handling: 5, weight: 1 },
    maxSpeed: 13600,
    nitroMaxSpeed: 17300,
    accel: 9000,
    centrifugal: 0.21,
    turnSpeed: 3.1
  },
  {
    id: 'train',
    name: 'CK-124 蒸汽火車',
    tag: '隱藏隱密霸主',
    plate: '台鐵-CK124',
    desc: '直接把百年黑金蒸汽火車開上柏油路！車頭掛著「增產報國」鐵牌與紅色排障器，連動桿火花四濺！',
    nitroName: '【全鍋爐過載鳴笛】孤輪翹頭＋車頂紅汽笛音浪＋火箱烈焰！',
    nitroShout: '🚂 嗚——！全鍋爐過載鳴笛！鋼輪擦出漫天火花！',
    crashQuote: '🎯【高空分解➔神級空中重組】司機與司爐工拿鐵鏟在半空拼回蒸汽鍋爐，鳴笛完美落地👍！',
    stats: { speed: 5, accel: 4, handling: 3, weight: 5 },
    maxSpeed: 14200,
    nitroMaxSpeed: 18000,
    accel: 7800,
    centrifugal: 0.24,
    turnSpeed: 2.25
  }
];

class PlayerVehicle {
  constructor() {
    this.selectedIndex = 0;
    this.vehicle = VEHICLE_ROSTER[0];
    this.reset();
  }

  selectVehicle(index) {
    this.selectedIndex = (index + VEHICLE_ROSTER.length) % VEHICLE_ROSTER.length;
    this.vehicle = VEHICLE_ROSTER[this.selectedIndex];
    this.applyVehicleStats();
  }

  applyVehicleStats() {
    const v = this.vehicle;
    this.maxSpeed = v.maxSpeed;
    this.nitroMaxSpeed = v.nitroMaxSpeed;
    this.accel = v.accel;
    this.centrifugal = v.centrifugal;
    this.turnSpeed = v.turnSpeed;
  }

  reset() {
    this.applyVehicleStats();
    this.x = 0;
    this.z = 0;
    this.speed = 0;
    this.braking = -15500;
    this.offRoadDecel = -9200;
    this.offRoadLimit = 5200;

    this.steer = 0;
    this.isBraking = false;
    this.nitroTimer = 0;
    this.nitroCooldown = 0;
    this.nitroCooldownMax = 3.6;

    // 合金彈頭「變胖系統 (Fat & Diet System)」與全程卡路里統計
    this.calories = 0;        // 0 ~ 100 (當前飽足感 %)
    this.totalCaloriesKcal = 0;       // 環島累計攝取總大卡 (kcal)
    this.totalCaloriesBurnedKcal = 0; // 環島推車減肥消耗大卡 (kcal)
    this.foodsEatenCount = 0;         // 累計吃下美食數量
    this.foodsEatenHistory = [];      // 吃過的台灣美食名稱紀錄
    this.fatTriggerCount = 0;         // 發福變胖次數
    this.isFatMode = false;   // 滿 100% 觸發發福狀態
    this.isPushingCar = false;// 變胖時按空白鍵跳下車推車狂奔
    this.pushStepSoundTimer = 0;
    this.pickupPopupText = '';
    this.pickupPopupTimer = 0;

    // 踩到台灣獼猴香蕉皮旋轉打滑狀態
    this.spinTimer = 0;

    // 重大撞車 / 翻車高空分解與神級空中重組狀態機
    this.crashTimer = 0;
    this.crashDuration = 2.75;
    this.crashInvincible = 0;
    this.crashProps = [];

    // 大中小車流碰撞與「國道紅斑馬」警車追緝機制狀態
    this.sedanHitTimer = 0;   // 中車（轎車）撞擊後 5 秒二次撞擊翻車警戒倒數
    this.trafficHitCount = 0; // 累計撞擊任何車輛次數（滿 5 次出動國道紅斑馬警車）
  }

  /**
   * 將當前車速強制設定為指定顯示時速 (例如撞到中車減速至 50 km/h)
   */
  setSpeedToKmh(targetKmh = 50) {
    this.speed = Math.round((targetKmh / 293) * 16800);
  }

  /**
   * 將當前車速依百分比扣減 (例如撞到機車或被紅斑馬攔截撞擊時車速 -30%)
   */
  applyPercentSlowdown(percent = 0.30) {
    this.speed = Math.max(1800, Math.round(this.speed * (1 - percent)));
  }

  /**
   * 拾取道路上的台灣特色美食 (香腸、漢堡、蚵仔麵線、燒肉粽、臭豆腐、珍奶)
   */
  addFoodCalories(foodName, scoreBonus, calGain, onScoreAdd) {
    if (typeof onScoreAdd === 'function') {
      onScoreAdd(scoreBonus);
    }
    const kcal = Math.round(calGain * 15);
    this.totalCaloriesKcal += kcal;
    this.foodsEatenCount += 1;
    this.foodsEatenHistory.push(foodName);

    this.pickupPopupText = `😋 吃到${foodName} +${scoreBonus}分 (+${kcal}kcal)!`;
    this.pickupPopupTimer = 1.35;

    if (!this.isFatMode) {
      this.calories = Math.min(100, this.calories + calGain);
      if (this.calories >= 100) {
        this.enterFatMode();
      } else if (window.arcadeAudio) {
        window.arcadeAudio.playEatFood();
      }
    } else if (window.arcadeAudio) {
      window.arcadeAudio.playEatFood();
    }
  }

  enterFatMode() {
    this.isFatMode = true;
    this.calories = 100;
    this.fatTriggerCount += 1;
    this.nitroTimer = 0;
    this.pickupPopupText = '🍔 好呷！吃太飽變胖啦 [按空白鍵下車推車減肥!]';
    this.pickupPopupTimer = 2.8;
    if (window.arcadeAudio) {
      window.arcadeAudio.playFatTransform();
    }
  }

  triggerBananaSpin() {
    if (this.spinTimer > 0 || this.crashTimer > 0 || this.nitroTimer > 0) return;
    this.spinTimer = 0.85;
    this.speed = Math.max(4500, this.speed * 0.72);
    this.pickupPopupText = '🍌 踩到台灣獼猴香蕉皮！大打滑！';
    this.pickupPopupTimer = 1.5;
    if (window.arcadeAudio) {
      window.arcadeAudio.playBananaSlip();
    }
  }

  triggerNitro() {
    if (this.crashTimer > 0 || this.isFatMode) return;
    if (this.nitroTimer <= 0 && this.nitroCooldown <= 0) {
      this.nitroTimer = 3.0;
      this.nitroCooldown = this.nitroCooldownMax;
      if (window.arcadeAudio) {
        window.arcadeAudio.playVehicleNitro(this.vehicle.id);
      }
    }
  }

  triggerCrash(impactDir = 1) {
    if (this.crashTimer > 0 || this.crashInvincible > 0) return;

    this.crashTimer = this.crashDuration;
    this.crashInvincible = 3.2;
    this.nitroTimer = 0;
    this.isPushingCar = false;
    this.speed = Math.max(2600, this.speed * 0.35);

    this.crashProps = [];
    for (let i = 0; i < 14; i++) {
      const angle = -Math.PI * 0.15 - Math.random() * Math.PI * 0.7;
      const spd = 160 + Math.random() * 240;
      this.crashProps.push({
        x: (Math.random() - 0.5) * 60,
        y: -40 - Math.random() * 30,
        vx: Math.cos(angle) * spd * (i % 2 === 0 ? 1 : -1) + impactDir * 45,
        vy: Math.sin(angle) * spd - 120,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 16,
        variant: i % 4
      });
    }

    if (window.arcadeAudio) {
      window.arcadeAudio.playCrashWipeout(this.vehicle.id);
    }
  }

  update(dt, input, road) {
    const playerSegment = road.findSegment(this.z);

    if (this.pickupPopupTimer > 0) {
      this.pickupPopupTimer = Math.max(0, this.pickupPopupTimer - dt);
    }
    if (this.crashInvincible > 0) {
      this.crashInvincible = Math.max(0, this.crashInvincible - dt);
    }
    if (this.spinTimer > 0) {
      this.spinTimer = Math.max(0, this.spinTimer - dt);
    }
    if (this.sedanHitTimer > 0) {
      this.sedanHitTimer = Math.max(0, this.sedanHitTimer - dt);
    }

    // 翻車解體動畫期間
    if (this.crashTimer > 0) {
      this.crashTimer = Math.max(0, this.crashTimer - dt);
      this.speed = Math.max(1800, this.speed - 5200 * dt);
      this.z += this.speed * dt;
      road.skyOffset += playerSegment.curve * (this.speed / this.maxSpeed) * 1.2;

      for (let i = 0; i < this.crashProps.length; i++) {
        const p = this.crashProps[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 540 * dt;
        p.rot += p.vRot * dt;
        if (p.y > 8) {
          p.y = 8;
          p.vy = -Math.abs(p.vy) * 0.52;
          p.vx *= 0.75;
        }
      }

      if (window.arcadeAudio) {
        window.arcadeAudio.updateEngine(0.1, false, this.vehicle.id, true, this.isFatMode);
      }
      return;
    }

    // 【發福狀態 FAT MODE：按下空白鍵觸發「跳下車推車狂奔減肥」】
    if (this.isFatMode) {
      if (input.nitro) {
        this.isPushingCar = true;
        // 高速燃燒卡路里！約 1.6 秒推車即可完全瘦身並彈射起步
        const burned = 64 * dt;
        this.calories = Math.max(0, this.calories - burned);
        this.totalCaloriesBurnedKcal += Math.round(burned * 12);
        this.pushStepSoundTimer -= dt;
        if (this.pushStepSoundTimer <= 0) {
          this.pushStepSoundTimer = 0.11;
          if (window.arcadeAudio) window.arcadeAudio.playPushCarStep();
        }
        const centerScreenX = (window.logicalCanvasWidth || 720) / 2;
        // 噴出藍色流汗粒子
        window.spriteRenderer.spawnParticle(
          centerScreenX + (Math.random() - 0.5) * 36,
          335,
          (Math.random() - 0.5) * 90,
          -60 - Math.random() * 50,
          5,
          '#00f0ff',
          0.35
        );

        if (this.calories <= 0) {
          // 瘦身成功！「啵！」一聲回縮身材並瞬間送一段免費彈射衝刺
          this.isFatMode = false;
          this.isPushingCar = false;
          this.nitroTimer = 1.8;
          this.pickupPopupText = '✨ 啵！瘦身成功！輕量化彈射起步！';
          this.pickupPopupTimer = 2.0;
          if (window.arcadeAudio) window.arcadeAudio.playDietPop();
        }
      } else {
        this.isPushingCar = false;
        // 即使沒按空白鍵，也會極緩慢自然代謝避免新手卡關
        this.calories = Math.max(0, this.calories - 4.5 * dt);
        if (this.calories <= 0) {
          this.isFatMode = false;
        }
      }
    } else {
      this.isPushingCar = false;
      if (this.nitroTimer > 0) {
        this.nitroTimer = Math.max(0, this.nitroTimer - dt);
      } else if (this.nitroCooldown > 0) {
        this.nitroCooldown = Math.max(0, this.nitroCooldown - dt);
      }

      if (input.nitro) {
        this.triggerNitro();
      }
    }

    this.isBraking = Boolean(input.brake);

    // 計算變胖後的最高車速上限 (發福時車速上限強制下降 25%，但下車死命推車時會加速衝刺)
    const effectiveMaxSpeed = this.isFatMode
      ? (this.isPushingCar ? this.maxSpeed * 0.92 : this.maxSpeed * 0.75)
      : this.maxSpeed;

    if (this.nitroTimer > 0) {
      this.speed = Math.min(this.nitroMaxSpeed, this.speed + this.accel * 2.35 * dt);
    } else if (this.isBraking) {
      this.speed = Math.max(2000, this.speed + this.braking * dt);
    } else {
      if (this.speed > effectiveMaxSpeed) {
        this.speed = Math.max(effectiveMaxSpeed, this.speed - 4500 * dt);
      } else {
        this.speed = Math.min(effectiveMaxSpeed, this.speed + this.accel * dt);
      }
    }

    const speedPercent = Math.min(1.25, this.speed / this.maxSpeed);

    // 【1986 SEGA OutRun 經典街機轉向與過彎離心甩尾手感】
    // 1. 漸進式方向盤回饋 + 反打方向盤 (Counter-Steer) 快速響應
    const turnMult = this.isFatMode ? 0.68 : 1.0;
    const centrifugalMult = this.isFatMode ? 1.65 : 1.0;
    const baseDx = dt * this.turnSpeed * turnMult * (0.48 + speedPercent * 0.76);

    if (input.left) {
      const counterBoost = this.steer > 0 ? 1.85 : 1.0;
      this.steer = Math.max(-1, this.steer - dt * 5.8 * counterBoost);
      this.x -= baseDx * (0.65 + Math.abs(this.steer) * 0.52);
    } else if (input.right) {
      const counterBoost = this.steer < 0 ? 1.85 : 1.0;
      this.steer = Math.min(1, this.steer + dt * 5.8 * counterBoost);
      this.x += baseDx * (0.65 + Math.abs(this.steer) * 0.52);
    } else {
      // 放開按鍵時平滑自動回正車身傾角
      this.steer *= Math.pow(0.012, dt);
      if (Math.abs(this.steer) < 0.015) this.steer = 0;
    }

    // 2. 分岔口展開階段 (split phase)：讓車輛自然順著所選左/右分支車道向外開出去！
    if (playerSegment.forkPhase === 'split' && playerSegment.forkOffset > 0.08) {
      const branchDir = input.left ? -1 : (input.right ? 1 : (this.x < 0 ? -1 : 1));
      const nextSeg = road.findSegment(this.z + road.segmentLength);
      const splitDelta = Math.max(0, (nextSeg.forkOffset || playerSegment.forkOffset) - playerSegment.forkOffset);
      const stepFactor = (this.speed * dt) / road.segmentLength;
      this.x += branchDir * splitDelta * stepFactor * 0.92;
    }

    // 3. 彎道離心力與 OutRun 壓彎抓地補償
    const activeForkDir = road.forkBranchLocked ? road.chosenForkDir : (this.x < 0 ? -1 : 1);
    const activeCurve = typeof road.getDynamicSegmentCurve === 'function'
      ? road.getDynamicSegmentCurve(playerSegment, activeForkDir)
      : playerSegment.curve;

    // 若玩家正在順著彎道方向壓車過彎，提供 OutRun 特有的 Power-Slide 抓地貼彎手感
    const isApexLeaning = (activeCurve < -0.5 && this.steer < -0.35) || (activeCurve > 0.5 && this.steer > 0.35);
    const gripAssist = isApexLeaning ? 0.78 : 1.0;

    this.x -= (baseDx * speedPercent * activeCurve * this.centrifugal * centrifugalMult * gripAssist);
    road.skyOffset += activeCurve * speedPercent * 2.1;

    const inFork = playerSegment.forkOffset > 0.04;
    const distFromBranchCenter = inFork
      ? Math.min(Math.abs(this.x - playerSegment.forkOffset), Math.abs(this.x + playerSegment.forkOffset))
      : Math.abs(this.x);
    const roadEdge = inFork ? 0.88 : 1.06;
    const maxClamp = inFork ? 2.55 : 1.85;

    if (distFromBranchCenter > roadEdge && this.speed > this.offRoadLimit && this.nitroTimer <= 0) {
      this.speed = Math.max(this.offRoadLimit, this.speed + this.offRoadDecel * dt);
    }

    this.x = Math.max(-maxClamp, Math.min(maxClamp, this.x));
    this.z += this.speed * dt;

    const centerScreenX = (window.logicalCanvasWidth || 720) / 2;

    // 變胖時底盤壓扁磨擦柏油路，持續噴出橘黃色底盤火花！
    if (this.isFatMode && this.speed > 2000 && Math.random() < 0.85) {
      window.spriteRenderer.spawnParticle(
        centerScreenX + (Math.random() > 0.5 ? -36 : 36),
        368,
        (Math.random() - 0.5) * 110,
        15 + Math.random() * 35,
        6,
        Math.random() > 0.4 ? '#ffd32a' : '#ff5252',
        0.28
      );
    }

    // 中車（轎車）撞擊後 5 秒車損警戒期間：引擎持續冒出黑灰煙提醒玩家小心二次撞擊翻車！
    if (this.sedanHitTimer > 0 && Math.random() < 0.75) {
      window.spriteRenderer.spawnParticle(
        centerScreenX + (Math.random() - 0.5) * 44,
        340,
        (Math.random() - 0.5) * 60,
        -45 - Math.random() * 40,
        6,
        Math.random() > 0.35 ? 'rgba(45, 52, 54, 0.85)' : '#ff9f43',
        0.36
      );
    }

    // 一般排氣與氮氣粒子
    if (this.speed > 500 && Math.random() < 0.8) {
      let pColor = 'rgba(200, 205, 215, 0.6)';
      let pSize = 4;
      if (this.nitroTimer > 0) {
        pColor = Math.random() > 0.4 ? '#00f0ff' : '#ffd32a';
        pSize = 7;
      } else if (this.vehicle.id === 'grandma') {
        pColor = 'rgba(162, 155, 254, 0.65)';
        pSize = 5;
      } else if (this.vehicle.id === 'train') {
        pColor = 'rgba(45, 52, 54, 0.8)';
        pSize = 6;
      }

      window.spriteRenderer.spawnParticle(
        centerScreenX + (Math.random() > 0.5 ? -38 : 38) + this.steer * 10,
        366,
        (Math.random() - 0.5) * 75 - this.steer * 85,
        20 + Math.random() * 45,
        pSize,
        pColor,
        0.34
      );
    }

    if (window.arcadeAudio) {
      window.arcadeAudio.updateEngine(
        this.speed / this.nitroMaxSpeed,
        this.nitroTimer > 0,
        this.vehicle.id,
        false,
        this.isFatMode
      );
    }
  }

  getDisplayKmh() {
    return Math.min(299, Math.round((this.speed / 16800) * 293));
  }

  getNitroReadyRatio() {
    if (this.nitroTimer > 0) {
      return this.nitroTimer / 3.0;
    }
    if (this.nitroCooldown > 0) {
      return 1 - (this.nitroCooldown / this.nitroCooldownMax);
    }
    return 1;
  }
}

window.VEHICLE_ROSTER = VEHICLE_ROSTER;
window.PlayerVehicle = PlayerVehicle;
