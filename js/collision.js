/**
 * TaiwanOutRun - 分岔路選擇（起點富岡車站 ➔ 8個隨機景點 ➔ 8大終點）、特色美食拾取與碰撞系統
 */

const FOOD_CONFIG = {
  FOOD_SAUSAGE:    { name: '炭烤大香腸', score: 800, cal: 28 },
  FOOD_BURGER:     { name: '雙層起司大漢堡', score: 900, cal: 34 },
  FOOD_VERMICELLI: { name: '大腸蚵仔麵線', score: 1000, cal: 30 },
  FOOD_ZONGZI:     { name: '古早味燒肉粽', score: 950, cal: 35 },
  FOOD_TOFU:       { name: '脆皮黃金臭豆腐', score: 850, cal: 30 },
  FOOD_BOBA:       { name: '黑糖珍珠奶茶', score: 750, cal: 26 }
};

class CollisionSystem {
  constructor() {
    this.inForkZone = false;
    this.leftBranchId = '';
    this.rightBranchId = '';
    this.leftBranchName = '';
    this.rightBranchName = '';
    this.leftBranchRegion = '';
    this.rightBranchRegion = '';
  }

  checkTrafficAndObstacleCollision(player, road, onScoreAdd, onBanner) {
    if (player.crashTimer > 0) return;

    // 檢查前方帝雉是否受到驚嚇振翅高飛
    const aheadSeg = road.findSegment(player.z + 950);
    if (aheadSeg && aheadSeg.sprites) {
      for (let s = 0; s < aheadSeg.sprites.length; s++) {
        const sp = aheadSeg.sprites[s];
        if (sp.type === 'NPC_PHEASANT' && !sp.startled) {
          sp.startled = true;
        }
      }
    }

    // 玩家載具在畫面上的視覺位置對應 Z 約為 player.z + 820 ~ 1160，同步涵蓋近身區段確保視覺接觸即刻判定
    const checkOffsets = [360, 600, 820, 980, 1140];
    for (let d = 0; d < checkOffsets.length; d++) {
      const playerSeg = road.findSegment(player.z + checkOffsets[d]);
      if (!playerSeg) continue;

      // 1. 檢查與各地特色美食、香蕉皮、以及路邊危險障礙物的互動
      if (playerSeg.sprites && playerSeg.sprites.length > 0) {
        for (let s = 0; s < playerSeg.sprites.length; s++) {
          const sp = playerSeg.sprites[s];
          if (sp.collected || sp.used) continue;

          // (A) 拾取道路上的各地特色美食
          if (FOOD_CONFIG[sp.type]) {
            if (Math.abs(player.x - sp.offset) < 0.44) {
              sp.collected = true;
              const info = FOOD_CONFIG[sp.type];
              player.addFoodCalories(info.name, info.score, info.cal, onScoreAdd);
            }
            continue;
          }

          // (B) 壓到台灣獼猴丟的香蕉皮 -> 360度旋轉打滑
          if (sp.type === 'BANANA_PEEL') {
            if (Math.abs(player.x - sp.offset) < 0.28) {
              sp.used = true;
              player.triggerBananaSpin();
            }
            continue;
          }

          // (C) 撞到路邊危險障礙物 -> 觸發搞笑翻車空中分解重組（沿途街景建築位於 ±1.42 外且無 isObstacle，不會誤撞）
          if (sp.isObstacle) {
            if (player.crashInvincible <= 0 && Math.abs(player.x - sp.offset) < 0.36) {
              const dir = player.x >= sp.offset ? 1 : -1;
              player.triggerCrash(dir);
              return;
            }
          }
        }
      }

      // 2. 檢查與路上【大車：砂石車】、【中車：一般轎車】、【小車：機車】的碰撞（頻率維持 40%）
      if (player.crashInvincible <= 0 && playerSeg.cars && playerSeg.cars.length > 0) {
        for (let i = 0; i < playerSeg.cars.length; i++) {
          const car = playerSeg.cars[i];
          // 國道紅斑馬警車由 road.updatePoliceChase 獨立處理 3 次急煞攔截判定
          if (car.type === 'POLICE_RED_ZEBRA' || (car.hitCooldown && car.hitCooldown > 0)) {
            continue;
          }

          const hitRadius = car.type === 'TRAFFIC_GRAVEL_TRUCK'
            ? 0.34
            : (car.type === 'TRAFFIC_SEDAN' ? 0.29 : 0.25);
          const dist = Math.abs(player.x - car.offset);

          if (dist < hitRadius && player.speed > car.speed * 0.75) {
            const dir = player.x >= car.offset ? 1 : -1;

            // 任何車輛累計撞到 5 次，觸發國道警車「紅斑馬」追緝攔截機制！
            player.trafficHitCount = (player.trafficHitCount || 0) + 1;
            const willTriggerPolice = player.trafficHitCount >= 5;
            if (willTriggerPolice) {
              player.trafficHitCount = 0;
              road.triggerPoliceChase(player, onBanner);
            }

            if (player.nitroTimer > 0) {
              car.offset += (car.offset >= player.x ? 0.95 : -0.95);
              car.z += 900;
              car.hitCooldown = 1.0;
              if (car.type === 'TRAFFIC_SCOOTER') {
                road.launchFlyingScooter(car, -dir);
                if (window.arcadeAudio) window.arcadeAudio.playScooterFlyawaySound();
              } else if (window.arcadeAudio) {
                window.arcadeAudio.playForkSelect();
              }
              if (typeof onScoreAdd === 'function') onScoreAdd(300);
              return;
            }

            if (car.type === 'TRAFFIC_GRAVEL_TRUCK') {
              // 【大車：砂石車】撞到立刻翻車！
              car.z += 1600;
              car.hitCooldown = 1.5;
              player.sedanHitTimer = 0;
              player.pickupPopupText = '🚛 撞上巨型砂石車！立刻大翻車啦！';
              player.pickupPopupTimer = 2.2;
              player.triggerCrash(dir);
              return;
            } else if (car.type === 'TRAFFIC_SEDAN') {
              // 【中車：一般轎車】撞到減速到 50KM，5 秒內撞擊第二次就觸發翻車！
              if (player.sedanHitTimer > 0) {
                car.z += 1500;
                car.hitCooldown = 1.5;
                player.sedanHitTimer = 0;
                player.pickupPopupText = '💥 5秒內二次撞擊轎車！觸發大翻車！';
                player.pickupPopupTimer = 2.2;
                player.triggerCrash(dir);
                return;
              } else {
                car.offset = Math.max(-0.85, Math.min(0.85, car.offset + (car.offset >= player.x ? 0.55 : -0.55)));
                car.z += 1100;
                car.hitCooldown = 1.2;
                player.setSpeedToKmh(50);
                player.sedanHitTimer = 5.0;
                player.pickupPopupText = '🚗 撞到轎車！減速至 50KM（5秒內再撞將翻車！）';
                player.pickupPopupTimer = 2.2;
                if (window.arcadeAudio) {
                  window.arcadeAudio.playSedanWarningHitSound();
                }
                return;
              }
            } else {
              // 【小車：機車】撞到機車搞笑飛出去＋發出「按陰陽！」語音音效（無文字註解），每次撞到速度 -30%！
              road.launchFlyingScooter(car, -dir);
              car.z += 2800;
              car.hitCooldown = 1.2;
              player.applyPercentSlowdown(0.30);
              if (window.arcadeAudio) {
                window.arcadeAudio.playScooterFlyawaySound();
              }
              return;
            }
          }
        }
      }
    }
  }

  checkForkAndStageTransition(player, road, onStageChanged, onFinaleVictory) {
    // 若為第 10 關（最終 8 大終點關卡）：檢查是否衝過正中央的終點線！
    if (road.currentStage.isFinale) {
      this.inForkZone = false;
      if (road.finishLineSegment > 0 && player.z >= road.finishLineSegment * road.segmentLength) {
        if (window.arcadeAudio) {
          window.arcadeAudio.playCheckpoint();
        }
        if (typeof onFinaleVictory === 'function') {
          onFinaleVictory(road.currentStage);
        }
      }
      return;
    }

    const seg = road.findSegment(player.z);
    const decisionSeg = road.forkDecisionSegment || (road.forkEndSegment - 40);

    // 在進入分岔口到分支鎖定點之間顯示左右景點選擇大看板
    this.inForkZone = seg.index >= road.forkStartSegment - 28 && seg.index < decisionSeg;

    if (this.inForkZone) {
      this.leftBranchId = road.currentStage.leftBranch;
      this.rightBranchId = road.currentStage.rightBranch;
      const leftStage = window.STAGE_TREE[this.leftBranchId];
      const rightStage = window.STAGE_TREE[this.rightBranchId];
      this.leftBranchName = leftStage ? leftStage.spotName : '';
      this.rightBranchName = rightStage ? rightStage.spotName : '';
      this.leftBranchRegion = leftStage ? (leftStage.isFinale ? '🏁終點' : leftStage.region) : '';
      this.rightBranchRegion = rightStage ? (rightStage.isFinale ? '🏁終點' : rightStage.region) : '';
    }

    // 抵達分岔中島鼻端 (forkDecisionSegment)：鎖定玩家所選的左/右分支，開始「順著分支開出去 ➔ 畫面平滑導正跑道」！
    if (player.z >= decisionSeg * road.segmentLength && !road.forkBranchLocked) {
      road.forkBranchLocked = true;
      road.chosenForkDir = player.x < 0 ? -1 : 1;
      road.lastForkCenterOffset = road.chosenForkDir * (seg.forkOffset || 1.18);
      if (window.arcadeAudio) {
        window.arcadeAudio.playForkSelect();
      }
    }

    // 在分支導正區段 (realign phase)：讓車道與鏡頭平滑隨分支曲線導正回跑道中央 (player.x -> 0)
    if (road.forkBranchLocked && seg.forkPhase === 'realign') {
      const currentCenterOffset = road.chosenForkDir * (seg.forkOffset || 0);
      const deltaCenter = currentCenterOffset - road.lastForkCenterOffset;
      road.lastForkCenterOffset = currentCenterOffset;
      player.x += deltaCenter;
      // 溫和將車身相對分支中心的偏移收斂，使導正完成時車子自然位於跑道中央
      const localOffset = player.x - currentCenterOffset;
      player.x = currentCenterOffset + localOffset * 0.96;
    }

    if (player.z >= road.forkEndSegment * road.segmentLength) {
      const chosenDir = road.forkBranchLocked ? road.chosenForkDir : (player.x < 0 ? -1 : 1);
      const chosenBranch = chosenDir < 0
        ? road.currentStage.leftBranch
        : road.currentStage.rightBranch;

      const nextStageNum = road.stageNumber + 1;
      player.z = 0;
      player.x = Math.max(-0.35, Math.min(0.35, player.x * 0.5));

      if (window.routeManager) {
        window.routeManager.recordStageEnter(chosenBranch, nextStageNum);
      }
      road.buildStageTrack(chosenBranch, nextStageNum);

      if (window.arcadeAudio) {
        window.arcadeAudio.playCheckpoint();
      }
      if (typeof onStageChanged === 'function') {
        onStageChanged(road.currentStage, nextStageNum);
      }
    }
  }
}

window.CollisionSystem = CollisionSystem;
