/**
 * TaiwanOutRun - Web Audio API 8-bit 街機音效與台灣迷因配樂合成器
 * 內建：引擎浪聲、6大車款專屬必殺音效、小吃攤撞飛與咀嚼聲、變胖(Fat Mode)與推車減肥音效、踩香蕉皮滑倒音效
 */
class ArcadeAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.engineOsc = null;
    this.engineGain = null;
    this.isInitialized = false;
    this.melodyTimers = [];
    this.bgmAudio = null;
    this.bgmBaseVolume = 0.52;
    this.bgmDuckTimer = null;
    this.setupBgmElement();
  }

  /**
   * 建立適合網路高速串流的輕量化背景音樂播放器 (優先載入 48kbps Opus OGG ~1.8MB，備援 64kbps MP3 ~2.3MB)
   */
  setupBgmElement() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    try {
      const audio = document.createElement('audio');
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = this.bgmBaseVolume;

      const srcOgg = document.createElement('source');
      srcOgg.src = 'assets/audio/bgm_racing.ogg';
      srcOgg.type = 'audio/ogg; codecs=opus';

      const srcMp3 = document.createElement('source');
      srcMp3.src = 'assets/audio/bgm_racing.mp3';
      srcMp3.type = 'audio/mpeg';

      audio.appendChild(srcOgg);
      audio.appendChild(srcMp3);
      this.bgmAudio = audio;

      // 當使用者首次點擊畫面或按鍵時自動啟動背景音樂
      const unlockBgm = () => {
        this.startBgm();
      };
      window.addEventListener('pointerdown', unlockBgm, { once: true, passive: true });
      window.addEventListener('keydown', unlockBgm, { once: true, passive: true });
    } catch (_) {}
  }

  startBgm() {
    if (!this.bgmAudio || !this.enabled) return;
    try {
      if (this.bgmAudio.paused) {
        const playPromise = this.bgmAudio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
      }
    } catch (_) {}
  }

  pauseBgm() {
    if (!this.bgmAudio) return;
    try {
      this.bgmAudio.pause();
    } catch (_) {}
  }

  duckBgm(durationMs = 2400) {
    if (!this.bgmAudio || !this.enabled) return;
    try {
      this.bgmAudio.volume = 0.16;
      if (this.bgmDuckTimer) clearTimeout(this.bgmDuckTimer);
      this.bgmDuckTimer = setTimeout(() => {
        if (this.bgmAudio && this.enabled) {
          this.bgmAudio.volume = this.bgmBaseVolume;
        }
      }, durationMs);
    } catch (_) {}
  }

  init() {
    this.startBgm();
    if (this.isInitialized) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.isInitialized = true;

    this.engineOsc = this.ctx.createOscillator();
    this.engineGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.value = 55;

    filter.type = 'lowpass';
    filter.frequency.value = 340;

    this.engineGain.gain.value = 0.0;

    this.engineOsc.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);
    this.engineOsc.start();
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopEngine();
      this.clearMelody();
      this.pauseBgm();
    } else {
      if (this.bgmAudio) {
        this.bgmAudio.volume = this.bgmBaseVolume;
      }
      this.startBgm();
    }
    return this.enabled;
  }

  clearMelody() {
    while (this.melodyTimers.length > 0) {
      clearTimeout(this.melodyTimers.pop());
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
  }

  updateEngine(speedRatio, isNitro = false, vehicleId = 'sausage', isCrashing = false, isFat = false) {
    if (!this.isInitialized || !this.enabled || !this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const now = this.ctx.currentTime;
    if (isCrashing) {
      this.engineGain.gain.setTargetAtTime(0.01, now, 0.04);
      return;
    }

    let basePitch = 48;
    let pitchRange = 135;
    if (vehicleId === 'gravel' || vehicleId === 'garbage') {
      basePitch = 36;
      pitchRange = 95;
    } else if (vehicleId === 'grandma') {
      basePitch = 72;
      pitchRange = 175;
    } else if (vehicleId === 'train') {
      basePitch = 32;
      pitchRange = 85;
    }

    // 變胖時引擎重拖低沉感
    if (isFat) {
      basePitch *= 0.78;
      pitchRange *= 0.8;
    }

    const wobble = vehicleId === 'train'
      ? (Math.floor(now * (8 + speedRatio * 14)) % 2) * 18
      : Math.sin(now * 38) * 6;

    const freq = basePitch + speedRatio * pitchRange + (isNitro ? 58 : 0) + wobble;
    this.engineOsc.frequency.setTargetAtTime(freq, now, 0.03);
    const targetGain = speedRatio > 0.01 ? (isNitro ? 0.11 : 0.065) : 0.015;
    this.engineGain.gain.setTargetAtTime(targetGain, now, 0.05);
  }

  stopEngine() {
    if (!this.isInitialized || !this.engineGain || !this.ctx) return;
    this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
  }

  playTone(freq, duration = 0.12, type = 'square', volume = 0.13, slideTo = null) {
    if (!this.isInitialized || !this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
    }

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  playVehicleNitro(vehicleId) {
    this.clearMelody();
    if (vehicleId === 'garbage') {
      const notes = [
        { f: 659.25, d: 0.13 }, { f: 783.99, d: 0.13 }, { f: 1046.5, d: 0.22 },
        { f: 987.77, d: 0.14 }, { f: 783.99, d: 0.14 }, { f: 880.0, d: 0.24 },
        { f: 783.99, d: 0.14 }, { f: 659.25, d: 0.14 }, { f: 587.33, d: 0.28 },
        { f: 659.25, d: 0.14 }, { f: 783.99, d: 0.14 }, { f: 1046.5, d: 0.35 }
      ];
      let delay = 0;
      notes.forEach((n) => {
        const t = setTimeout(() => this.playTone(n.f, n.d, 'square', 0.15), delay);
        this.melodyTimers.push(t);
        delay += n.d * 920;
      });
    } else if (vehicleId === 'train') {
      this.playTone(440, 1.2, 'sawtooth', 0.15);
      this.playTone(554.37, 1.2, 'triangle', 0.15);
    } else if (vehicleId === 'gravel') {
      this.playTone(146.83, 0.45, 'sawtooth', 0.20);
      this.playTone(185.0, 0.45, 'sawtooth', 0.18);
      const t = setTimeout(() => this.playTone(120, 0.5, 'sawtooth', 0.18, 520), 220);
      this.melodyTimers.push(t);
    } else if (vehicleId === 'kinder') {
      const notes = [523.25, 659.25, 587.33, 392.0, 523.25, 587.33, 659.25, 523.25];
      notes.forEach((f, i) => {
        const t = setTimeout(() => this.playTone(f, 0.12, 'triangle', 0.16), i * 110);
        this.melodyTimers.push(t);
      });
    } else if (vehicleId === 'grandma') {
      this.playTone(240, 0.45, 'sawtooth', 0.16, 980);
      const t = setTimeout(() => this.playTone(880, 0.25, 'square', 0.14, 1320), 180);
      this.melodyTimers.push(t);
    } else {
      this.playTone(180, 0.35, 'sawtooth', 0.16, 640);
      [880, 1046.5, 1318.5].forEach((f, i) => {
        const t = setTimeout(() => this.playTone(f, 0.09, 'square', 0.14), 70 + i * 70);
        this.melodyTimers.push(t);
      });
    }
  }

  /**
   * 撞飛路邊小吃攤歡樂爆破聲
   */
  playStallSmash() {
    this.playTone(220, 0.16, 'sawtooth', 0.18, 85);
    setTimeout(() => this.playTone(587.33, 0.1, 'square', 0.14, 880), 60);
  }

  /**
   * 吃到雞排/珍奶/豬血糕咀嚼加分音效
   */
  playEatFood() {
    this.playTone(523.25, 0.07, 'square', 0.14, 783.99);
    setTimeout(() => this.playTone(783.99, 0.10, 'square', 0.15, 1174.66), 65);
  }

  /**
   * 《合金彈頭》吃太飽變胖 (UH-OH! BIG / FAT MODE) 渾厚音效
   */
  playFatTransform() {
    this.clearMelody();
    const notes = [392.0, 349.23, 311.13, 261.63, 196.0];
    notes.forEach((f, i) => {
      const t = setTimeout(() => this.playTone(f, 0.16, 'sawtooth', 0.18, f * 0.85), i * 100);
      this.melodyTimers.push(t);
    });
  }

  /**
   * 變胖狀態按下空白鍵：跳下車死命推車腳步聲
   */
  playPushCarStep() {
    this.playTone(180, 0.06, 'triangle', 0.14, 320);
  }

  /**
   * 減肥成功「啵！」一聲回縮身材並彈射起步
   */
  playDietPop() {
    this.playTone(260, 0.18, 'sine', 0.20, 1240);
    setTimeout(() => this.playTone(880, 0.15, 'square', 0.16, 1560), 120);
  }

  /**
   * 踩到台灣獼猴丟的香蕉皮 360 度滑倒音效
   */
  playBananaSlip() {
    this.playTone(880, 0.18, 'sine', 0.16, 280);
    setTimeout(() => this.playTone(320, 0.22, 'sine', 0.16, 960), 160);
  }

  /**
   * 產生撞擊碎裂、爆炸與重重落地的高張力白噪音衝擊聲
   */
  playNoiseBurst(duration = 0.25, volume = 0.22, filterFreq = 850, filterType = 'bandpass') {
    if (!this.isInitialized || !this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const sampleCount = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, sampleCount, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / sampleCount, 1.4);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, now);
    filter.Q.value = 1.4;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  /**
   * 使用雙共振峰濾波器 (Formant Vowel Filter) 合成台語語調人聲驚呼曲線
   * 即使系統未安裝中文語音包，也能發出極具戲劇張力的台語「阿娘威～！」與「幹！翻過來啦！」聲調！
   */
  playDriverVocalContour(vehicleId = 'sausage', phase = 'crash') {
    if (!this.isInitialized || !this.enabled || !this.ctx) return;

    // 定義各車款司機的台語驚呼音高曲線 (f0) 與母音共振峰 (F1, F2)
    let syllables = [];
    if (vehicleId === 'grandma') {
      // 阿嬤高亢顫音台語大喊：「阿～娘～威～呀！」(A - niâ - uê - iā!) vs 空中組裝：「緊接返來～安啦！」
      syllables = phase === 'crash'
        ? [
            { fStart: 420, fEnd: 460, dur: 0.16, f1: 820, f2: 1350, vib: 18 }, // 阿 (A)
            { fStart: 490, fEnd: 370, dur: 0.22, f1: 620, f2: 1950, vib: 22 }, // 娘 (niâ)
            { fStart: 390, fEnd: 580, dur: 0.34, f1: 480, f2: 2250, vib: 28 }, // 威～ (uê~)
            { fStart: 540, fEnd: 320, dur: 0.22, f1: 780, f2: 1450, vib: 20 }  // 呀！(ia!)
          ]
        : [
            { fStart: 440, fEnd: 520, dur: 0.14, f1: 550, f2: 2100, vib: 14 }, // 緊 (kín)
            { fStart: 520, fEnd: 660, dur: 0.22, f1: 750, f2: 1400, vib: 18 }  // 安啦！(an-lah!)
          ];
    } else if (vehicleId === 'gravel') {
      // 砂石車司機低沉粗獷台語怒吼：「幹！翻～過～來～啦！」
      syllables = phase === 'crash'
        ? [
            { fStart: 195, fEnd: 115, dur: 0.22, f1: 780, f2: 1220, vib: 8 },  // 幹！(Kàn!)
            { fStart: 165, fEnd: 210, dur: 0.18, f1: 580, f2: 1050, vib: 10 }, // 翻 (Png)
            { fStart: 205, fEnd: 155, dur: 0.18, f1: 460, f2: 920, vib: 10 },  // 過 (kuè)
            { fStart: 150, fEnd: 235, dur: 0.24, f1: 720, f2: 1320, vib: 14 }, // 來 (lâi)
            { fStart: 220, fEnd: 125, dur: 0.26, f1: 800, f2: 1280, vib: 12 }  // 啦！(lah!)
          ]
        : [
            { fStart: 160, fEnd: 245, dur: 0.18, f1: 650, f2: 1200, vib: 10 }, // 鎖返來！
            { fStart: 245, fEnd: 180, dur: 0.24, f1: 780, f2: 1350, vib: 12 }  // 福氣啦！
          ];
    } else if (vehicleId === 'kinder') {
      // 娃娃車老師與小朋友高音尖叫：「哇啊～！翻車車啦！」
      syllables = phase === 'crash'
        ? [
            { fStart: 520, fEnd: 690, dur: 0.26, f1: 850, f2: 1550, vib: 24 },
            { fStart: 640, fEnd: 480, dur: 0.22, f1: 680, f2: 1900, vib: 20 },
            { fStart: 560, fEnd: 740, dur: 0.28, f1: 820, f2: 1650, vib: 26 }
          ]
        : [
            { fStart: 523, fEnd: 659, dur: 0.15, f1: 750, f2: 1800, vib: 15 },
            { fStart: 659, fEnd: 784, dur: 0.22, f1: 850, f2: 2100, vib: 18 }
          ];
    } else if (vehicleId === 'train') {
      // 台鐵蒸汽火車老司機渾厚台語：「害呀！出軌翻過去啦！」
      syllables = phase === 'crash'
        ? [
            { fStart: 175, fEnd: 130, dur: 0.22, f1: 740, f2: 1180, vib: 9 },
            { fStart: 145, fEnd: 215, dur: 0.24, f1: 520, f2: 980, vib: 12 },
            { fStart: 210, fEnd: 120, dur: 0.28, f1: 760, f2: 1250, vib: 10 }
          ]
        : [
            { fStart: 180, fEnd: 260, dur: 0.22, f1: 680, f2: 1220, vib: 10 },
            { fStart: 260, fEnd: 220, dur: 0.25, f1: 750, f2: 1320, vib: 12 }
          ];
    } else {
      // 香腸攤老闆 / 垃圾車隊員道地台語驚呼：「矮油喂呀！害呀啦！」
      syllables = phase === 'crash'
        ? [
            { fStart: 280, fEnd: 360, dur: 0.18, f1: 760, f2: 1420, vib: 14 },
            { fStart: 360, fEnd: 250, dur: 0.22, f1: 540, f2: 1680, vib: 16 },
            { fStart: 270, fEnd: 410, dur: 0.28, f1: 720, f2: 1520, vib: 20 }
          ]
        : [
            { fStart: 290, fEnd: 390, dur: 0.16, f1: 700, f2: 1480, vib: 12 },
            { fStart: 390, fEnd: 460, dur: 0.22, f1: 780, f2: 1620, vib: 15 }
          ];
    }

    let offsetMs = 0;
    syllables.forEach((s) => {
      const timer = setTimeout(() => {
        if (!this.isInitialized || !this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const formant1 = this.ctx.createBiquadFilter();
        const formant2 = this.ctx.createBiquadFilter();
        const masterGain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(s.fStart, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, s.fEnd), now + s.dur);

        // 喉音顫音 (Vibrato)
        lfo.type = 'sine';
        lfo.frequency.value = 11;
        lfoGain.gain.value = s.vib;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        // 雙母音共振峰濾波器
        formant1.type = 'bandpass';
        formant1.frequency.setValueAtTime(s.f1, now);
        formant1.Q.value = 4.5;

        formant2.type = 'bandpass';
        formant2.frequency.setValueAtTime(s.f2, now);
        formant2.Q.value = 5.5;

        masterGain.gain.setValueAtTime(0.24, now);
        masterGain.gain.exponentialRampToValueAtTime(0.008, now + s.dur);

        osc.connect(formant1);
        osc.connect(formant2);
        formant1.connect(masterGain);
        formant2.connect(masterGain);
        masterGain.connect(this.ctx.destination);

        osc.start(now);
        lfo.start(now);
        osc.stop(now + s.dur);
        lfo.stop(now + s.dur);
      }, offsetMs);
      this.melodyTimers.push(timer);
      offsetMs += Math.round(s.dur * 860);
    });
  }

  /**
   * 呼叫瀏覽器 Web Speech API 真人語音合成，搭配各司機專屬音高 (pitch) 與語速 (rate) 演繹台語創意喊聲！
   */
  speakDriverPhrase(text, pitch = 1.0, rate = 1.15) {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const voices = synth.getVoices ? synth.getVoices() : [];
      const twVoice =
        voices.find((v) => v.lang && v.lang.toLowerCase().includes('zh-tw')) ||
        voices.find((v) => v.lang && v.lang.toLowerCase().includes('zh')) ||
        null;
      if (twVoice) {
        utter.voice = twVoice;
      }
      utter.lang = 'zh-TW';
      utter.pitch = pitch;
      utter.rate = rate;
      utter.volume = 1.0;
      synth.speak(utter);
    } catch (_) {}
  }

  /**
   * 撞車翻車 ➔ 高空分解 ➔ 神級空中抓車架與踢輪胎結合 ➔ 奇蹟落地 全程創意語音與音效演出（無文字註解干擾畫面）
   */
  playCrashWipeout(vehicleId = 'sausage') {
    this.clearMelody();
    this.duckBgm(2600);

    // 各車款司機專屬「撞車分解」與「空中神技結合」創意台語/國語驚呼台詞與語調設定
    const voiceProfiles = {
      grandma: {
        crashText: '阿娘威呀！夭壽喔！菜籃飛出去啦！',
        reassembleText: '緊給伊接返來！安啦！',
        pitch: 1.52,
        rate: 1.18
      },
      gravel: {
        crashText: '幹！翻過來啦！輪仔噴飛去啦！',
        reassembleText: '給我鎖返來！福氣啦！',
        pitch: 0.58,
        rate: 1.15
      },
      sausage: {
        crashText: '害呀啦！十八啦！香腸跟瓦斯桶飛上天啦！',
        reassembleText: '通殺啦！烤爐合體！',
        pitch: 0.92,
        rate: 1.20
      },
      garbage: {
        crashText: '矮油喂呀！垃圾車翻過去啦！回收桶抓緊咧！',
        reassembleText: '資源回收大合體！讚啦！',
        pitch: 1.10,
        rate: 1.20
      },
      kinder: {
        crashText: '哇啊！翻車車啦！小朋友抓緊老師喔！',
        reassembleText: '向日葵班變形合體！耶！',
        pitch: 1.65,
        rate: 1.24
      },
      train: {
        crashText: '謀菜啦！火車翻過去啦！鍋爐給我接回去！',
        reassembleText: '增產報國！合體成功！',
        pitch: 0.55,
        rate: 1.14
      }
    };

    const profile = voiceProfiles[vehicleId] || voiceProfiles.sausage;

    // 【第 1 階段 (0.00s)：猛烈撞擊翻車 + 司機台語大喊（「阿娘威呀！」/「幹！翻過來啦！」）】
    this.playNoiseBurst(0.32, 0.28, 520, 'lowpass');
    this.playTone(170, 0.30, 'sawtooth', 0.24, 32);
    this.playDriverVocalContour(vehicleId, 'crash');
    this.speakDriverPhrase(profile.crashText, profile.pitch, profile.rate);

    // 【第 2 階段 (0.34s)：高空完全分解（車輪、車架、貨物四散彈飛的卡通彈簧分解音）】
    const tDisassemble = setTimeout(() => {
      this.playNoiseBurst(0.18, 0.18, 1200, 'bandpass');
      [330, 494, 659, 880, 1175].forEach((freq, idx) => {
        const t = setTimeout(() => {
          this.playTone(freq, 0.08, 'triangle', 0.16, freq * 1.35);
        }, idx * 55);
        this.melodyTimers.push(t);
      });
    }, 340);

    // 【第 3 階段 (1.28s ~ 1.85s)：神級空中抓車架、腳勾大輪胎急速拼裝（機械棘輪「咔、咔、咔嚓！」高速吸附音效 + 司機合體喊聲）】
    const tReassembleVoice = setTimeout(() => {
      this.playDriverVocalContour(vehicleId, 'reassemble');
      this.speakDriverPhrase(profile.reassembleText, profile.pitch * 1.05, profile.rate * 1.04);
    }, 1280);

    const ratchetSteps = [
      { delay: 1260, f1: 280, f2: 560 }, // 左手抓回主車架「咔！」
      { delay: 1440, f1: 360, f2: 720 }, // 右腳勾回大輪胎「咔！」
      { delay: 1620, f1: 480, f2: 960 }, // 車斗與配件歸位「咔！」
      { delay: 1800, f1: 640, f2: 1280 } // 螺絲瞬間鎖緊「咔嚓！」
    ];
    ratchetSteps.forEach((step) => {
      const t = setTimeout(() => {
        this.playTone(step.f1, 0.07, 'square', 0.18, step.f2);
        this.playNoiseBurst(0.05, 0.12, 2400, 'highpass');
      }, step.delay);
      this.melodyTimers.push(t);
    });

    // 【第 4 階段 (2.02s)：半空 100% 零件合體完成（「鏘～！」金屬閃光共鳴和弦）】
    const tSnapComplete = setTimeout(() => {
      this.playTone(587.33, 0.18, 'triangle', 0.18, 1174.66);
      this.playTone(880.0, 0.22, 'square', 0.16, 1760.0);
    }, 2020);

    // 【第 5 階段 (2.34s)：雙輪重重落地火花四濺 + 奇蹟重組成功歡呼勝利號角】
    const tLandAndCheer = setTimeout(() => {
      // 重重落地重低音「咚！」
      this.playNoiseBurst(0.20, 0.24, 380, 'lowpass');
      this.playTone(135, 0.18, 'sawtooth', 0.22, 42);
      // 奇蹟重組成功比 YA / 比讚 短號角
      [523.25, 659.25, 783.99, 1046.5].forEach((n, idx) => {
        const tc = setTimeout(() => this.playTone(n, 0.11, 'square', 0.15), 90 + idx * 55);
        this.melodyTimers.push(tc);
      });
    }, 2340);

    this.melodyTimers.push(tDisassemble, tReassembleVoice, tSnapComplete, tLandAndCheer);
  }

  playSelectBeep() {
    this.playTone(660, 0.08, 'square', 0.12, 880);
  }

  playCheckpoint() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playTone(n, 0.14, 'square', 0.14), idx * 75);
    });
  }

  playForkSelect() {
    this.playTone(440, 0.09, 'triangle', 0.15, 880);
  }

  playBump() {
    this.playTone(130, 0.18, 'sawtooth', 0.18, 45);
  }

  /**
   * 【小車（機車）被撞飛搞笑音效】：「按陰陽～！」語音 + 卡通咻～砰拋物線飛天音效
   */
  playScooterFlyawaySound() {
    if (!this.isInitialized) this.init();
    if (!this.enabled || !this.ctx) return;

    // 1. 撞擊彈簧「咚～咻——！」高空飛天滑音
    this.playNoiseBurst(0.14, 0.20, 880, 'bandpass');
    this.playTone(260, 0.12, 'square', 0.20, 620);
    setTimeout(() => {
      this.playTone(380, 0.42, 'sine', 0.18, 1560);
    }, 70);
    // 遠方高空化為星星「叮★」一聲
    setTimeout(() => {
      this.playTone(1318.5, 0.10, 'triangle', 0.14, 2093.0);
    }, 480);

    // 2. 合成三音節台味語調聲線（按-陰-陽 ↘ ↗ ↘）確保無語音包時也有搞笑腔調
    const syllables = [
      { delay: 20, f1: 420, f2: 240, d: 0.13 },  // 「按 (Àn)」重音下劈
      { delay: 160, f1: 310, f2: 390, d: 0.13 }, // 「陰 (im)」中平上揚
      { delay: 300, f1: 360, f2: 580, d: 0.26 }  // 「陽～！(iông~!)」拉長高音慘叫
    ];
    syllables.forEach((s) => {
      setTimeout(() => {
        this.playTone(s.f1, s.d, 'sawtooth', 0.16, s.f2);
      }, s.delay);
    });

    // 3. 真人語音合成大喊「按陰陽！」（純語音，不顯示文字註解）
    this.speakDriverPhrase('按陰陽！', 1.45, 1.25);
  }

  /**
   * 【中車（一般轎車）第一次撞擊】：金屬擦撞減速至 50KM + 5秒二次翻車警戒警示音
   */
  playSedanWarningHitSound() {
    if (!this.isInitialized) this.init();
    if (!this.enabled || !this.ctx) return;

    this.playNoiseBurst(0.24, 0.25, 620, 'lowpass');
    this.playTone(165, 0.22, 'sawtooth', 0.22, 55);
    // 急促雙響警戒蜂鳴器 (提醒 5 秒內再撞就翻車)
    setTimeout(() => this.playTone(880, 0.09, 'square', 0.16, 440), 140);
    setTimeout(() => this.playTone(880, 0.12, 'square', 0.16, 440), 260);
  }

  /**
   * 【累計撞車 5 次：國道警車「紅斑馬」登場鳴笛與廣播】
   */
  playPoliceDispatchSiren() {
    if (!this.isInitialized) this.init();
    if (!this.enabled || !this.ctx) return;

    // 經典國道紅斑馬高頻「喔～伊～喔～伊～」雙音交替警笛
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.playTone(680, 0.22, 'sawtooth', 0.15, 1180);
      }, i * 440);
      setTimeout(() => {
        this.playTone(1180, 0.22, 'sawtooth', 0.15, 680);
      }, i * 440 + 220);
    }

    // 國道警察擴音器廣播
    this.speakDriverPhrase('逼逼！國道紅斑馬攔截！前方違規車輛立刻減速！', 1.05, 1.25);
  }

  /**
   * 【紅斑馬前方急煞攔截 (Brake-Check) 警示鳴笛音】
   */
  playPoliceBrakeScreech() {
    if (!this.isInitialized) this.init();
    if (!this.enabled || !this.ctx) return;

    // 短促 Yelp 警笛 + 輪胎急煞尖叫聲
    this.playTone(920, 0.12, 'square', 0.14, 1420);
    setTimeout(() => this.playTone(1350, 0.24, 'sawtooth', 0.12, 980), 90);
    this.playNoiseBurst(0.22, 0.12, 2200, 'bandpass');
  }

  /**
   * 【被紅斑馬減速撞擊命中（車速 -30%）音效】
   */
  playPoliceRamHit() {
    if (!this.isInitialized) this.init();
    if (!this.enabled || !this.ctx) return;

    this.playNoiseBurst(0.26, 0.26, 540, 'lowpass');
    this.playTone(145, 0.24, 'sawtooth', 0.24, 48);
    setTimeout(() => this.playTone(740, 0.14, 'square', 0.16, 1120), 110);
  }
}

window.arcadeAudio = new ArcadeAudio();
