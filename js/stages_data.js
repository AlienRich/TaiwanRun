/**
 * TaiwanOutRun - 全台路線圖資料庫與隨機路線產生器 (Milestone 5.0)
 * 1. 起點：桃園楊梅・富岡火車站（限時 30 秒，出發 10 秒後抵達第一個左右分岔點）
 * 2. 途經 8 個關卡：從 26 個台灣經典自然與人文景點中隨機排列產生（每關限時 60 秒）
 * 3. 最終第 10 關（8 大終點隨機其一）：白沙屯媽祖廟、彰化鹿港天后宮、台南赤嵌樓、墾丁鵝鑾鼻燈塔、
 *    台東三仙台、花蓮太魯閣牌坊、宜蘭蘭陽博物館、澎湖跨海大橋（限時 60 秒，正中央終點大樓＋兩旁群眾歡呼）
 */

const START_STAGE_DATA = {
  id: 'fugang',
  isStart: true,
  isFinale: false,
  region: '桃園楊梅',
  spotName: '富岡火車站',
  name: '起點 ‧ 桃園楊梅 富岡火車站',
  category: '鐵道老街（起點）',
  sceneryDesc: '昭和風情的純樸客家庄鐵道小鎮，火車鳴笛駛過平交道，紅磚拱廊與巴洛克洋樓交織。',
  architectureDesc: '富岡火車站（舊稱伯公岡驛）、中正路呂家聲洋樓（鑊嫲篤穹頂）、信義街紅磚拱廊、永昌碾米廠、大井頭福德宮。',
  geologyDesc: '桃園楊梅富岡台地、社子溪沖積紅土緩坡階地。',
  timeLimit: 30, // 起點限時 30 秒，出發約 10 秒即進入左右分岔點
  skyTop: '#1a5276',
  skyMid: '#5499c7',
  skyBottom: '#f5cba7',
  sunColor: '#ffd32a',
  mountainFar: '#34495e',
  mountainColor: '#2c3e50',
  grassLight: '#6e513b',
  grassDark: '#59402e',
  roadLight: '#565a63',
  roadDark: '#4a4e57',
  rumbleLight: '#e74c3c',
  rumbleDark: '#f5f6fa',
  laneColor: '#ffd32a',
  sideTheme: 'fugang_street',
  horizonTheme: 'fugang_town',
  // 車輛衝出富岡車站後，依序展現的 3 段式富岡街景：1.車站廣場平交道 ➔ 2.呂家聲巴洛克洋樓 ➔ 3.信義街紅磚拱廊與碾米廠
  streetSequence: ['STREET_FUGANG_PLAZA', 'STREET_FUGANG_LYU_MANSION', 'STREET_FUGANG_ARCADE'],
  obstacleType: 'LANTERN_POLE'
};

/**
 * 26 個台灣經典途經景點（完整收錄使用者提供之地區、景點名稱、風景描述、核心建築、地理地質、景觀分類）
 */
const SCENIC_STAGES_LIST = [
  // ==================== 北部 (6) ====================
  {
    id: 'yangmingshan',
    region: '北部',
    spotName: '陽明山小油坑',
    name: '北部 ‧ 陽明山小油坑',
    category: '火山地質（自然）',
    sceneryDesc: '硫氣瀰漫的荒涼噴氣口、箭竹林綠意與秋季盛開的大片金黃芒草波浪。',
    architectureDesc: '設有木棧道觀景台、地質解說站與遊客服務中心。',
    geologyDesc: '後火山活動地質、硫磺噴氣孔、溫泉湧泉、硫磺結晶地貌與崩塌斷崖地形。',
    timeLimit: 60,
    skyTop: '#2c3e50',
    skyMid: '#7f8c8d',
    skyBottom: '#f6e58d',
    sunColor: '#ffbe76',
    mountainFar: '#535c68',
    mountainColor: '#3d3d3d',
    grassLight: '#786fa6',
    grassDark: '#574b90',
    roadLight: '#57606f',
    roadDark: '#4b525e',
    rumbleLight: '#f1c40f',
    rumbleDark: '#2f3542',
    laneColor: '#ffffff',
    sideTheme: 'volcano_sulfur',
    horizonTheme: 'volcano_fumarole',
    streetSequence: ['PROP_SULFUR_VENT', 'PROP_SILVERGRASS_WAVE', 'PROP_BOARDWALK_DECK'],
    obstacleType: 'CLIFF_ROCK'
  },
  {
    id: 'yehliu',
    region: '北部',
    spotName: '野柳地質公園',
    name: '北部 ‧ 野柳地質公園',
    category: '海蝕奇岩（自然）',
    sceneryDesc: '蔚藍海岸襯托奇岩怪石，晨昏光影下的蕈狀岩與岬角海蝕平台景緻。',
    architectureDesc: '步道防護設施、解說展示牌、第三代仿製女王頭模型區。',
    geologyDesc: '沉積岩經差異侵蝕與海蝕作用形成的女王頭、仙女鞋、燭臺石、海蝕洞與壺穴。',
    timeLimit: 60,
    skyTop: '#006266',
    skyMid: '#0097e6',
    skyBottom: '#f8efba',
    sunColor: '#ffd32a',
    mountainFar: '#b89f5d',
    mountainColor: '#9c824a',
    grassLight: '#d1b26f',
    grassDark: '#b89856',
    roadLight: '#636e72',
    roadDark: '#535c60',
    rumbleLight: '#ff5252',
    rumbleDark: '#ffffff',
    laneColor: '#ffd32a',
    sideTheme: 'yehliu_coast',
    horizonTheme: 'yehliu_cape',
    streetSequence: ['PROP_QUEEN_HEAD', 'PROP_FAIRY_SHOE', 'PROP_CANDLE_ROCK'],
    obstacleType: 'CLIFF_ROCK'
  },
  {
    id: 'npm',
    region: '北部',
    spotName: '故宮博物院',
    name: '北部 ‧ 故宮博物院',
    category: '歷史文化（人文）',
    sceneryDesc: '依山傍水的典雅園林，至善園宋代庭園風格，山光水色與古典意境交織。',
    architectureDesc: '中國北方宮殿式黃瓦綠牆主建築、華表、至善園、文獻館與仿古迴廊。',
    geologyDesc: '外雙溪山谷盆地邊緣之緩坡階地與沖積谷地。',
    timeLimit: 60,
    skyTop: '#1e3799',
    skyMid: '#4a69bd',
    skyBottom: '#b8e994',
    sunColor: '#fad390',
    mountainFar: '#1e5631',
    mountainColor: '#143d22',
    grassLight: '#2ecc71',
    grassDark: '#27ae60',
    roadLight: '#5a626a',
    roadDark: '#4d545b',
    rumbleLight: '#f1c40f',
    rumbleDark: '#1e824c',
    laneColor: '#ffffff',
    sideTheme: 'palace_garden',
    horizonTheme: 'palace_museum',
    streetSequence: ['PROP_PALACE_HUABIAO', 'PROP_ZHISHAN_GARDEN', 'PROP_PALACE_MAIN_HALL'],
    obstacleType: 'LANTERN_POLE'
  },
  {
    id: 'jiufen',
    region: '北部',
    spotName: '九份老街',
    name: '北部 ‧ 九份老街',
    category: '山城復古（人文）',
    sceneryDesc: '階梯縱橫依山面海、入夜後紅燈籠高掛、遠眺基隆嶼與無敵海景的朦朧夜色。',
    architectureDesc: '昇平戲院（日治老戲院）、阿妹茶樓、木造古民居與陡峭石階步道（豎崎路）。',
    geologyDesc: '丘陵聚落階梯地形、昔日金礦脈沉積之火成岩與沉積岩接觸帶山體。',
    timeLimit: 60,
    skyTop: '#140c1c',
    skyMid: '#442434',
    skyBottom: '#d27d2c',
    sunColor: '#ff4e50',
    mountainFar: '#261722',
    mountainColor: '#190f17',
    grassLight: '#2d3436',
    grassDark: '#1e2426',
    roadLight: '#4b4b56',
    roadDark: '#3f3f48',
    rumbleLight: '#ff3838',
    rumbleDark: '#ff9f43',
    laneColor: '#ffeaa7',
    sideTheme: 'jiufen',
    horizonTheme: 'jiufen',
    streetSequence: ['PROP_SHENGPING_THEATER', 'PROP_SHUQI_STEPS', 'PROP_AMEI_TEAHOUSE'],
    obstacleType: 'LANTERN_POLE'
  },
  {
    id: 'shifen',
    region: '北部',
    spotName: '十分瀑布與老街',
    name: '北部 ‧ 十分瀑布與老街',
    category: '水岸瀑布／人文',
    sceneryDesc: '奔騰瀑布水花漫天激起彩虹，老街鐵道兩側天燈冉冉升空的壯麗畫面。',
    architectureDesc: '平溪支線鐵道（火車穿街過）、十分車站、吊橋與沿軌老街店鋪。',
    geologyDesc: '簾幕式斷層瀑布、基隆河上游砂岩層差異侵蝕地貌、河床壺穴地形。',
    timeLimit: 60,
    skyTop: '#0c2461',
    skyMid: '#1e3799',
    skyBottom: '#82ccdd',
    sunColor: '#ffd32a',
    mountainFar: '#1e5631',
    mountainColor: '#143d22',
    grassLight: '#27ae60',
    grassDark: '#1e8449',
    roadLight: '#555d66',
    roadDark: '#484f57',
    rumbleLight: '#ff5252',
    rumbleDark: '#ffd32a',
    laneColor: '#ffffff',
    sideTheme: 'shifen_waterfall',
    horizonTheme: 'shifen_lanterns',
    streetSequence: ['PROP_SHIFEN_WATERFALL', 'PROP_PINGXI_RAIL_SHOP', 'PROP_SKY_LANTERN'],
    obstacleType: 'LANTERN_POLE'
  },
  {
    id: 'taipingshan',
    region: '北部',
    spotName: '太平山見晴懷古步道',
    name: '北部 ‧ 太平山見晴懷古步道',
    category: '森林迷霧（自然）',
    sceneryDesc: '終年雲霧飄渺的檜木林徑、雲海翻騰與夕照金光穿透高聳冷杉的迷幻景緻。',
    architectureDesc: '舊時運材軌道、枕木懸空棧道、長苔蘚的木造小橋與索道遺跡。',
    geologyDesc: '溫帶高山雲霧林帶、中新世砂頁岩變質沉積地層、濕潤多雨的山脊崩壁。',
    timeLimit: 60,
    skyTop: '#1b4f72',
    skyMid: '#5dade2',
    skyBottom: '#f9e79f',
    sunColor: '#f4d03f',
    mountainFar: '#194d33',
    mountainColor: '#113825',
    grassLight: '#226b44',
    grassDark: '#195434',
    roadLight: '#535c57',
    roadDark: '#454d48',
    rumbleLight: '#a3cb38',
    rumbleDark: '#ffffff',
    laneColor: '#ffeaa7',
    sideTheme: 'alishan',
    horizonTheme: 'alishan',
    streetSequence: ['PROP_MOSS_RAIL_TRACK', 'PROP_SUSPENDED_WOOD_BRIDGE', 'PROP_CYPRESS_MIST'],
    obstacleType: 'CYPRESS_TREE'
  },

  // ==================== 中部 (1) ====================
  {
    id: 'gaomei',
    region: '中部',
    spotName: '高美濕地',
    name: '中部 ‧ 高美濕地',
    category: '濕地生態（自然）',
    sceneryDesc: '夕陽餘暉將泥灘染成金色、退潮時形成純淨天空之鏡、海天一線倒影如畫。',
    architectureDesc: '延伸入海的生態木棧道、巨型高聳白色風力發電機組、高美燈塔。',
    geologyDesc: '大甲溪出海口沖積泥質潮間帶、沙灘與泥灘共存之複合濕地、雲林莞草群落。',
    timeLimit: 60,
    skyTop: '#3c1053',
    skyMid: '#ad5389',
    skyBottom: '#ff9966',
    sunColor: '#ff5e62',
    mountainFar: '#4a235a',
    mountainColor: '#2e1538',
    grassLight: '#c27ba0',
    grassDark: '#a64d79',
    roadLight: '#5c5268',
    roadDark: '#4d4457',
    rumbleLight: '#ffd32a',
    rumbleDark: '#ffffff',
    laneColor: '#ffeaa7',
    sideTheme: 'gaomei_mirror',
    horizonTheme: 'gaomei_windmills',
    streetSequence: ['PROP_WIND_TURBINE', 'PROP_GAOMEI_BOARDWALK', 'PROP_GAOMEI_LIGHTHOUSE'],
    obstacleType: 'BETEL_BOOTH'
  },

  // ==================== 山區 (5) ====================
  {
    id: 'hehuanshan',
    region: '山區',
    spotName: '合歡山暗空公園',
    name: '山區 ‧ 合歡山暗空公園',
    category: '高山星空（自然）',
    sceneryDesc: '極高透光度下的璀璨銀河、壯闊高山杜鵑花海、無光害星軌與日出雲瀑。',
    architectureDesc: '鳶峰星空劇場、昆陽觀星平台、武嶺觀景亭台（海拔3275公尺標誌）。',
    geologyDesc: '高山箭竹草原地貌、板岩變質地質、古冰河冰斗與碎石崩坡地形。',
    timeLimit: 60,
    skyTop: '#050517',
    skyMid: '#151947',
    skyBottom: '#3c40c6',
    sunColor: '#ffffff',
    mountainFar: '#1e272e',
    mountainColor: '#11171b',
    grassLight: '#1e4d3b',
    grassDark: '#14382a',
    roadLight: '#485460',
    roadDark: '#3c4650',
    rumbleLight: '#00f0ff',
    rumbleDark: '#ffffff',
    laneColor: '#ffd32a',
    sideTheme: 'alpine_starry',
    horizonTheme: 'hehuanshan_galaxy',
    streetSequence: ['PROP_WULING_3275_SIGN', 'PROP_STARGAZING_DECK', 'PROP_ALPINE_AZALEA'],
    obstacleType: 'CLIFF_ROCK'
  },
  {
    id: 'cingjing',
    region: '山區',
    spotName: '清境農場',
    name: '山區 ‧ 清境農場',
    category: '高山原野（自然／人文）',
    sceneryDesc: '歐風牧野風光、羊群漫步碧綠草原、遠眺合歡群峰與奇萊山連綿山脈。',
    architectureDesc: '都鐸式建築風格民宿群、青青草原綿羊城堡、高空景觀步道。',
    geologyDesc: '霧社山區高山單面山緩坡、階地草原化開墾地貌。',
    timeLimit: 60,
    skyTop: '#0097e6',
    skyMid: '#48dbfb',
    skyBottom: '#c8d6e5',
    sunColor: '#ffd32a',
    mountainFar: '#27ae60',
    mountainColor: '#1e8449',
    grassLight: '#55efc4',
    grassDark: '#00b894',
    roadLight: '#636e72',
    roadDark: '#535c60',
    rumbleLight: '#ffffff',
    rumbleDark: '#2ecc71',
    laneColor: '#ffffff',
    sideTheme: 'cingjing_pasture',
    horizonTheme: 'cingjing_castle',
    streetSequence: ['PROP_SHEEP_CASTLE', 'PROP_TUDOR_MANOR', 'PROP_GRAZING_SHEEP'],
    obstacleType: 'CYPRESS_TREE'
  },
  {
    id: 'sunmoonlake',
    region: '山區',
    spotName: '日月潭國家風景區',
    name: '山區 ‧ 日月潭國家風景區',
    category: '湖光山色（自然）',
    sceneryDesc: '湖波如鏡、晨嵐初開時如國畫潑墨，水鳥掠過翠綠湖面與四周鬱蔥山巒。',
    architectureDesc: '向山遊客中心（清水模建築）、慈恩塔、文武廟、玄奘寺與環湖木棧自行車道。',
    geologyDesc: '斷層陷落形成的天然高山湖泊，中央以拉魯島為界劃分日潭與月潭。',
    timeLimit: 60,
    skyTop: '#16a085',
    skyMid: '#48c9b0',
    skyBottom: '#d1f2eb',
    sunColor: '#f7dc6f',
    mountainFar: '#117864',
    mountainColor: '#0e6251',
    grassLight: '#1abc9c',
    grassDark: '#16a085',
    roadLight: '#566573',
    roadDark: '#475460',
    rumbleLight: '#f39c12',
    rumbleDark: '#ffffff',
    laneColor: '#ffd32a',
    sideTheme: 'lake_emerald',
    horizonTheme: 'sunmoon_lake',
    streetSequence: ['PROP_XIANGSHAN_CENTER', 'PROP_WENWU_TEMPLE', 'PROP_CIEN_PAGODA'],
    obstacleType: 'CYPRESS_TREE'
  },
  {
    id: 'xitou',
    region: '山區',
    spotName: '溪頭／杉林溪森林園區',
    name: '山區 ‧ 溪頭／杉林溪森林園區',
    category: '森林瀑布（自然）',
    sceneryDesc: '蓊鬱柳杉竹林、飛瀑擊石的清涼水霧、春櫻秋楓與鬱金香花田四季變幻。',
    architectureDesc: '大學池竹拱橋、銀杏步道木棧、空中走廊（Skywalk）、松瀧岩水簾洞步道。',
    geologyDesc: '砂岩頁岩互層崩壁、松瀧岩天然砂岩鐘乳石凹壁洞穴、斷崖型瀑布。',
    timeLimit: 60,
    skyTop: '#145a32',
    skyMid: '#27ae60',
    skyBottom: '#abebc6',
    sunColor: '#f9e79f',
    mountainFar: '#196f3d',
    mountainColor: '#145a32',
    grassLight: '#2ecc71',
    grassDark: '#229954',
    roadLight: '#515a5a',
    roadDark: '#424949',
    rumbleLight: '#f1c40f',
    rumbleDark: '#1e8449',
    laneColor: '#ffffff',
    sideTheme: 'alishan',
    horizonTheme: 'xitou_bamboo',
    streetSequence: ['PROP_BAMBOO_ARCH_BRIDGE', 'PROP_GINKGO_WOODS', 'PROP_SONGLONG_WATERFALL'],
    obstacleType: 'CYPRESS_TREE'
  },
  {
    id: 'meishan',
    region: '山區',
    spotName: '梅山太平雲梯',
    name: '山區 ‧ 嘉義梅山 太平雲梯',
    category: '高山雲海吊橋（人文地景）',
    sceneryDesc: '海拔千米全台最高單跨吊橋、俯瞰嘉南平原萬家燈火、漫步穿梭於雲海霧氣與階梯狀高山茶園。',
    architectureDesc: '太平雲梯高山單跨吊橋（長281公尺）、望風亭觀景台、太平老街復古紅磚聚落、茶園木棧步道。',
    geologyDesc: '阿里山山脈西緣斷層陡崖、梅山三十六彎險峻盤山公路地貌、日落雲海湧聚帶。',
    timeLimit: 60,
    skyTop: '#1e3799',
    skyMid: '#e67e22',
    skyBottom: '#f9ca24',
    sunColor: '#ffd32a',
    mountainFar: '#1e8449',
    mountainColor: '#145a32',
    grassLight: '#2ecc71',
    grassDark: '#27ae60',
    roadLight: '#525e54',
    roadDark: '#444f46',
    rumbleLight: '#ffd32a',
    rumbleDark: '#c0392b',
    laneColor: '#ffffff',
    sideTheme: 'meishan_tea',
    horizonTheme: 'meishan_clouds',
    streetSequence: ['PROP_TAIPING_SUSPENSION_BRIDGE', 'PROP_TEA_TERRACE_DECK', 'PROP_WANGFENG_PAVILION'],
    obstacleType: 'CYPRESS_TREE'
  },

  // ==================== 東部 (6) ====================
  {
    id: 'yunshanshui',
    region: '東部',
    spotName: '壽豐雲山水',
    name: '東部 ‧ 花蓮壽豐 雲山水夢幻湖',
    category: '落羽松湖畔（自然）',
    sceneryDesc: '宛如歐洲童話的蒂芬妮藍夢幻湖，四季變換的落羽松倒影，白雲與中央山脈倒映湖面。',
    architectureDesc: '歐風城堡莊園民宿、夢幻湖落羽松跳石瀑布水圳步道、木棧水岸觀景平台。',
    geologyDesc: '花東縱谷平原沖積扇低窪濕地、天然清澈湧泉湧出形成之廣闊生態湖泊。',
    timeLimit: 60,
    skyTop: '#0984e3',
    skyMid: '#74b9ff',
    skyBottom: '#dff9fb',
    sunColor: '#ffeaa7',
    mountainFar: '#10ac84',
    mountainColor: '#1e824c',
    grassLight: '#2ed573',
    grassDark: '#26af61',
    roadLight: '#57606f',
    roadDark: '#4b525e',
    rumbleLight: '#00d2d3',
    rumbleDark: '#ffffff',
    laneColor: '#ffd32a',
    sideTheme: 'yunshanshui_cypress',
    horizonTheme: 'yunshanshui_lake',
    streetSequence: ['PROP_EURO_CASTLE_MANOR', 'PROP_CYPRESS_STEP_STONES', 'PROP_LAKE_BOARDWALK'],
    obstacleType: 'CLIFF_ROCK'
  },
  {
    id: 'qixingtan',
    region: '東部',
    spotName: '七星潭',
    name: '東部 ‧ 七星潭',
    category: '礫石海灘（自然）',
    sceneryDesc: '蔚藍太平洋浪花捲動青石發出碎響、月牙形弧線海灣遠眺清水斷崖峭壁。',
    architectureDesc: '濱海自行車道、石雕景觀涼亭、臨海觀景步道。',
    geologyDesc: '礫石海灘、抬升海階地貌、沉積礫岩經長年太平洋波浪淘選研磨地形。',
    timeLimit: 60,
    skyTop: '#0052a5',
    skyMid: '#00a8ff',
    skyBottom: '#dff9fb',
    sunColor: '#ffd32a',
    mountainFar: '#1e5631',
    mountainColor: '#143d22',
    grassLight: '#95a5a6',
    grassDark: '#7f8c8d',
    roadLight: '#576574',
    roadDark: '#485460',
    rumbleLight: '#00a8ff',
    rumbleDark: '#ffffff',
    laneColor: '#ffffff',
    sideTheme: 'suhua',
    horizonTheme: 'suhua',
    streetSequence: ['PROP_STONE_PAVILION', 'PROP_CRESCENT_PEBBLE_BAY', 'PROP_COAST_BIKEWAY'],
    obstacleType: 'CLIFF_ROCK'
  },
  {
    id: 'liyutan',
    region: '東部',
    spotName: '鯉魚潭',
    name: '東部 ‧ 鯉魚潭',
    category: '湖泊生態（自然）',
    sceneryDesc: '湖光映照鯉魚山綠意、平靜水面上天鵝船游弋、春夏之交夜間螢火蟲光點。',
    architectureDesc: '潭畔木棧環潭自行車道、碼頭遊艇浮橋、潭南露營區景觀台。',
    geologyDesc: '昔日木瓜溪古河道襲奪形成之天然堰塞／低漥內陸湖泊。',
    timeLimit: 60,
    skyTop: '#13334c',
    skyMid: '#1f6f8b',
    skyBottom: '#99a8b2',
    sunColor: '#ffeaa7',
    mountainFar: '#1e5631',
    mountainColor: '#143d22',
    grassLight: '#27ae60',
    grassDark: '#1e8449',
    roadLight: '#535c68',
    roadDark: '#454d57',
    rumbleLight: '#7bed9f',
    rumbleDark: '#2f3542',
    laneColor: '#ffffff',
    sideTheme: 'lake_emerald',
    horizonTheme: 'liyutan_lake',
    streetSequence: ['PROP_SWAN_PEDAL_BOAT', 'PROP_FIREFLY_GLOW', 'PROP_LAKE_PIER'],
    obstacleType: 'CYPRESS_TREE'
  },
  {
    id: 'guanshan',
    region: '東部',
    spotName: '關山鎮',
    name: '東部 ‧ 關山鎮',
    category: '慢活小鎮（人文／自然）',
    sceneryDesc: '恬靜田園聚落、兩旁老樹成蔭的環鎮綠廊、純樸慢活的縱谷客家農莊風情。',
    architectureDesc: '日式官舍聚落木造群、關山舊火車站、關山環鎮自行車道紅石溪水圳設施。',
    geologyDesc: '花東縱谷平原、沉積沖積扇地形、中央山脈與海岸山脈交界狹長平原。',
    timeLimit: 60,
    skyTop: '#2980b9',
    skyMid: '#6dd5fa',
    skyBottom: '#ffffff',
    sunColor: '#ffd32a',
    mountainFar: '#27ae60',
    mountainColor: '#1e8449',
    grassLight: '#78e08f',
    grassDark: '#38ada9',
    roadLight: '#596275',
    roadDark: '#4b5363',
    rumbleLight: '#e67e22',
    rumbleDark: '#ffffff',
    laneColor: '#ffd32a',
    sideTheme: 'pastoral_green',
    horizonTheme: 'rift_valley',
    streetSequence: ['PROP_GUANSHAN_OLD_STATION', 'PROP_JAPANESE_DORM', 'PROP_CANAL_BIKEWAY'],
    obstacleType: 'CYPRESS_TREE'
  },
  {
    id: 'chishang',
    region: '東部',
    spotName: '池上伯朗大道',
    name: '東部 ‧ 池上伯朗大道',
    category: '田園風光（自然）',
    sceneryDesc: '一望無際的金黃稻浪、無電線桿干擾的純粹天際線、中央山脈為屏障的綠野。',
    architectureDesc: '「金城武樹」休憩區、大坡池觀景棧道、農村古厝與天堂路標誌造景。',
    geologyDesc: '卑南溪沖積扇平原、花東縱谷斷層平原帶、高通透肥沃壤土地質。',
    timeLimit: 60,
    skyTop: '#0072ff',
    skyMid: '#00c6ff',
    skyBottom: '#fff7ae',
    sunColor: '#ffd32a',
    mountainFar: '#1e5631',
    mountainColor: '#143d22',
    grassLight: '#f1c40f',
    grassDark: '#d4ac0d',
    roadLight: '#636e72',
    roadDark: '#535c60',
    rumbleLight: '#f39c12',
    rumbleDark: '#ffffff',
    laneColor: '#ffffff',
    sideTheme: 'golden_rice',
    horizonTheme: 'chishang_paddy',
    streetSequence: ['PROP_TAKESHI_TREE', 'PROP_GOLDEN_RICE_WAVE', 'PROP_HEAVEN_ROAD_SWING'],
    obstacleType: 'CYPRESS_TREE'
  },
  {
    id: 'jialulan',
    region: '東部',
    spotName: '加路蘭海岸',
    name: '東部 ‧ 台東加路蘭遊憩區',
    category: '漂流木地景藝術（自然與人文）',
    sceneryDesc: '浩瀚無垠的湛藍太平洋，自然原始的漂流木大地藝術裝置，椰影婆娑的大草原與拍岸白色浪花。',
    architectureDesc: '漂流木裝置藝術（哭泣的露珠、千手的約定）、原民手作茅草工坊、海岸觀景木棧平台。',
    geologyDesc: '卑南溪出海口階地沉積、都蘭灣弧形海岸、南側小野柳砂頁岩互層海蝕奇岩（豆腐岩、蜂窩岩）。',
    timeLimit: 60,
    skyTop: '#0052a5',
    skyMid: '#00a8ff',
    skyBottom: '#dff9fb',
    sunColor: '#ffd32a',
    mountainFar: '#2f3640',
    mountainColor: '#1e272e',
    grassLight: '#00b894',
    grassDark: '#00947a',
    roadLight: '#57606f',
    roadDark: '#48505c',
    rumbleLight: '#00cec9',
    rumbleDark: '#ffffff',
    laneColor: '#ffd32a',
    sideTheme: 'jialulan_coast',
    horizonTheme: 'jialulan_pacific',
    streetSequence: ['PROP_DRIFTWOOD_ART', 'PROP_XIAOYELIU_REEF', 'PROP_PACIFIC_PALM'],
    obstacleType: 'PALM_TREE'
  },

  // ==================== 南部 (5) ====================
  {
    id: 'anping',
    region: '南部',
    spotName: '台南安平古堡',
    name: '南部 ‧ 台南安平古堡與億載金城',
    category: '大航海紅磚要塞（歷史人文）',
    sceneryDesc: '1624年荷蘭東印度公司熱蘭遮城，三層紅磚階梯城台、純白高聳瞭望圓塔、古榕盤根錯節與清代古砲。',
    architectureDesc: '安平古堡三層紅磚城垣殘蹟、白色瞭望塔、古砲台、億載金城西洋八角稜堡與圓拱城門。',
    geologyDesc: '台江內海潟湖古沉積陸地、安平大員沙洲與鹽水溪出海口沖積地。',
    timeLimit: 60,
    skyTop: '#8e44ad',
    skyMid: '#d35400',
    skyBottom: '#f39c12',
    sunColor: '#ffd32a',
    mountainFar: '#6e2c00',
    mountainColor: '#4a1d00',
    grassLight: '#935116',
    grassDark: '#784212',
    roadLight: '#5d534f',
    roadDark: '#4f4643',
    rumbleLight: '#c0392b',
    rumbleDark: '#ecf0f1',
    laneColor: '#ffd32a',
    sideTheme: 'anping_brick',
    horizonTheme: 'anping_fort',
    streetSequence: ['PROP_ZEELANDIA_FORT', 'PROP_ANPING_WHITE_TOWER', 'PROP_YIZAI_CANNON_BASTION'],
    obstacleType: 'LANTERN_POLE'
  },
  {
    id: 'foguangshan',
    region: '南部',
    spotName: '佛光山佛陀紀念館',
    name: '南部 ‧ 佛光山佛陀紀念館',
    category: '宗教建築（人文）',
    sceneryDesc: '莊嚴肅穆的佛教聖域、夕照穿過寶塔的萬道佛光、寬闊成佛大道的宏偉視野。',
    architectureDesc: '108公尺高「佛光大佛」、本館、八座中國古式寶塔、成佛大道與禮敬大廳。',
    geologyDesc: '高屏溪沿岸台地沖積平原、緩坡丘陵地形。',
    timeLimit: 60,
    skyTop: '#641e16',
    skyMid: '#b7950b',
    skyBottom: '#f9e79f',
    sunColor: '#fff200',
    mountainFar: '#512e5f',
    mountainColor: '#3b2047',
    grassLight: '#d4ac0d',
    grassDark: '#b7950b',
    roadLight: '#615a51',
    roadDark: '#524c44',
    rumbleLight: '#ffd32a',
    rumbleDark: '#922b21',
    laneColor: '#ffffff',
    sideTheme: 'buddha_pagoda',
    horizonTheme: 'foguang_buddha',
    streetSequence: ['PROP_EIGHT_PAGODAS', 'PROP_BODHI_AVENUE', 'PROP_GIANT_GOLDEN_BUDDHA'],
    obstacleType: 'LANTERN_POLE'
  },
  {
    id: 'kenting_st',
    region: '南部',
    spotName: '墾丁大街',
    name: '南部 ‧ 墾丁大街',
    category: '觀光景點（人文／自然）',
    sceneryDesc: '南洋熱帶棕櫚搖曳、白日碧海藍天、入夜後霓虹閃爍與熱鬧異國市集氛圍。',
    architectureDesc: '兩側熱帶度假飯店聚落、流動夜市攤商聚落、墾丁國家公園管理處展示館。',
    geologyDesc: '隆起恆春石灰岩台地、海岸珊瑚礁階地與砂質沉積海岸。',
    timeLimit: 60,
    skyTop: '#190a36',
    skyMid: '#70146b',
    skyBottom: '#ff4e50',
    sunColor: '#ff007f',
    mountainFar: '#240046',
    mountainColor: '#15002b',
    grassLight: '#28143b',
    grassDark: '#1d0d2b',
    roadLight: '#4e465c',
    roadDark: '#423b4f',
    rumbleLight: '#ff007f',
    rumbleDark: '#00f0ff',
    laneColor: '#ffd32a',
    sideTheme: 'kenting',
    horizonTheme: 'kenting',
    streetSequence: ['PROP_TROPICAL_RESORT', 'PROP_NEON_PUB_STALL', 'PROP_SURF_PALM'],
    obstacleType: 'PALM_TREE'
  },
  {
    id: 'nanwan',
    region: '南部',
    spotName: '墾丁南灣',
    name: '南部 ‧ 屏東墾丁南灣遊憩區',
    category: '熱帶金黃沙灘（自然）',
    sceneryDesc: '600公尺弧形金色細沙沙灘，漸層湛藍的熱帶海灣，五彩遮陽傘海、水上摩托車馳騁浪花。',
    architectureDesc: '南灣水上活動服務中心、五彩海灘遮陽傘群、白色木造衝浪俱樂部小屋、椰林景觀步道。',
    geologyDesc: '恆春石灰岩台地環抱之海灣、貝殼沙與石英沙混合之細緻金黃沙灘、裙礁珊瑚海岸。',
    timeLimit: 60,
    skyTop: '#0077b6',
    skyMid: '#00b4d8',
    skyBottom: '#caf0f8',
    sunColor: '#ffd32a',
    mountainFar: '#2a9d8f',
    mountainColor: '#1d786d',
    grassLight: '#f1c40f',
    grassDark: '#e67e22',
    roadLight: '#5c677d',
    roadDark: '#4c5669',
    rumbleLight: '#ff3838',
    rumbleDark: '#ffd32a',
    laneColor: '#ffffff',
    sideTheme: 'nanwan_sand',
    horizonTheme: 'nanwan_beach',
    streetSequence: ['PROP_BEACH_PARASOL_CLUSTER', 'PROP_SURF_WATER_SCOOTER', 'PROP_WIND_TURBINE_BAY'],
    obstacleType: 'PALM_TREE'
  },
  {
    id: 'longpan',
    region: '南部',
    spotName: '墾丁龍磐公園',
    name: '南部 ‧ 墾丁龍磐公園',
    category: '崩崖地貌（自然）',
    sceneryDesc: '廣袤綠茵草原連接險峻懸崖、強風吹拂下的萬里晴空、太平洋巨浪拍岸景觀。',
    architectureDesc: '木棧引導步道、地質解說指示牌（無過多人工建築以保持天然地貌）。',
    geologyDesc: '石灰岩溶蝕地形、崩崖地形、溶溝、滲穴與裂隙台地地貌。',
    timeLimit: 60,
    skyTop: '#005f73',
    skyMid: '#0a9396',
    skyBottom: '#94d2bd',
    sunColor: '#ee9b00',
    mountainFar: '#9b2226',
    mountainColor: '#ae2012',
    grassLight: '#52b788',
    grassDark: '#bb3e03',
    roadLight: '#576574',
    roadDark: '#485460',
    rumbleLight: '#ee9b00',
    rumbleDark: '#ffffff',
    laneColor: '#ffffff',
    sideTheme: 'suhua',
    horizonTheme: 'longpan_cliff',
    streetSequence: ['PROP_KARST_FISSURE', 'PROP_RED_SOIL_CLIFF', 'PROP_PACIFIC_GALE_DECK'],
    obstacleType: 'CLIFF_ROCK'
  },

  // ==================== 離島 (3) ====================
  {
    id: 'matsu',
    region: '離島',
    spotName: '馬祖藍眼淚',
    name: '離島 ‧ 馬祖藍眼淚',
    category: '生物奇觀（自然）',
    sceneryDesc: '夜晚海風吹拂下，浪花撞擊礁石瞬間綻放如夢似幻的幽藍冷光、星海相映。',
    architectureDesc: '傳統閩東花崗岩聚落（如芹壁村）、戰地坑道（北海坑道觀淚點）、海防碉堡。',
    geologyDesc: '花崗岩海蝕斷崖、海蝕門、波蝕平台與富含營養鹽的近岸海域。',
    timeLimit: 60,
    skyTop: '#020617',
    skyMid: '#0f172a',
    skyBottom: '#1e3a8a',
    sunColor: '#38bdf8',
    mountainFar: '#1e293b',
    mountainColor: '#0f172a',
    grassLight: '#0284c7',
    grassDark: '#0369a1',
    roadLight: '#334155',
    roadDark: '#1e293b',
    rumbleLight: '#00f0ff',
    rumbleDark: '#1e3a8a',
    laneColor: '#38bdf8',
    sideTheme: 'blue_tears',
    horizonTheme: 'matsu_qinbi',
    streetSequence: ['PROP_QINBI_STONE_HOUSE', 'PROP_MILITARY_BUNKER', 'PROP_BLUE_TEARS_WAVE'],
    obstacleType: 'CLIFF_ROCK'
  },
  {
    id: 'qimei',
    region: '離島',
    spotName: '澎湖七美雙心石滬',
    name: '離島 ‧ 澎湖七美雙心石滬',
    category: '先民智慧（人文／自然）',
    sceneryDesc: '碧藍漸層海水拍擊黑色玄武岩礁、退潮時清晰顯現的浪漫雙心幾何造型。',
    architectureDesc: '雙心石滬本體（玄武岩與珊瑚礁石堆疊）、頂隙觀景平台、七美燈塔。',
    geologyDesc: '柱狀節理玄武岩台地、海蝕波蝕棚、珊瑚裙礁與潮間帶陷阱工程。',
    timeLimit: 60,
    skyTop: '#0077b6',
    skyMid: '#00b4d8',
    skyBottom: '#90e0ef',
    sunColor: '#ffd32a',
    mountainFar: '#3d405b',
    mountainColor: '#2b2d42',
    grassLight: '#0096c7',
    grassDark: '#0077b6',
    roadLight: '#576574',
    roadDark: '#485460',
    rumbleLight: '#ff4d6d',
    rumbleDark: '#ffffff',
    laneColor: '#ffd32a',
    sideTheme: 'kenting',
    horizonTheme: 'qimei_twin_hearts',
    streetSequence: ['PROP_BASALT_COLUMNS', 'PROP_TWIN_HEARTS_WEIR', 'PROP_QIMEI_LIGHTHOUSE'],
    obstacleType: 'CLIFF_ROCK'
  },
  {
    id: 'liuqiu',
    region: '離島',
    spotName: '小琉球花瓶岩',
    name: '離島 ‧ 小琉球花瓶岩',
    category: '珊瑚礁岩（自然）',
    sceneryDesc: '晶瑩剔透的藍綠色海面、海龜浮游於礁石旁、落日彩霞映照奇石的生動景緻。',
    architectureDesc: '靈山寺、濱海木棧觀景步道、浮潛下水階梯設施。',
    geologyDesc: '隆起珊瑚礁岩受海水長年差異侵蝕形成的蕈狀岩、周邊裙礁環礁地貌。',
    timeLimit: 60,
    skyTop: '#006d77',
    skyMid: '#83c5be',
    skyBottom: '#ffddd2',
    sunColor: '#e29578',
    mountainFar: '#264653',
    mountainColor: '#1d3557',
    grassLight: '#2a9d8f',
    grassDark: '#21867a',
    roadLight: '#5c677d',
    roadDark: '#4c5669',
    rumbleLight: '#2ec4b6',
    rumbleDark: '#ffffff',
    laneColor: '#ffeaa7',
    sideTheme: 'kenting',
    horizonTheme: 'liuqiu_vase_rock',
    streetSequence: ['PROP_VASE_CORAL_ROCK', 'PROP_SEA_TURTLE_SWIM', 'PROP_LINGSHAN_TEMPLE'],
    obstacleType: 'PALM_TREE'
  },
  // ================= 新增 12 大台灣經典中途景點（擴充至 15 關 5 分鐘環島） =================
  {
    id: 'dapengbay',
    region: '南部',
    spotName: '屏東大鵬灣跨海大橋',
    name: '南部 ‧ 屏東東港大鵬灣跨海大橋',
    category: '跨海斜張橋與潟湖（自然／人文）',
    sceneryDesc: '蔚藍大鵬灣潟湖上橫跨純白單塔斜張開啟橋，遠方海平面可見小琉球島影與點點白色風帆。',
    architectureDesc: '全台唯一可開合之單塔非對稱斜張「鵬灣跨海大橋」、東港華僑市場牌樓、濱灣碼頭帆船基地。',
    geologyDesc: '台灣西南沿海最大單口囊狀潟湖與紅樹林濕地生態系。',
    timeLimit: 60,
    skyTop: '#006266',
    skyMid: '#00a8ff',
    skyBottom: '#ffeaa7',
    sunColor: '#ffd32a',
    mountainFar: '#1e3799',
    mountainColor: '#0c2461',
    grassLight: '#2ecc71',
    grassDark: '#27ae60',
    roadLight: '#5c677d',
    roadDark: '#4c5669',
    rumbleLight: '#00a8ff',
    rumbleDark: '#ffffff',
    laneColor: '#ffd32a',
    sideTheme: 'kenting',
    horizonTheme: 'dapengbay_bridge',
    streetSequence: ['PROP_ARCH_BRIDGE', 'PROP_HARBOR_LIGHTHOUSE', 'PROP_OYSTER_SHACK'],
    obstacleType: 'PALM_TREE'
  },
  {
    id: 'lotuspond',
    region: '南部',
    spotName: '高雄蓮池潭龍虎塔',
    name: '南部 ‧ 高雄左營蓮池潭龍虎塔',
    category: '宗教名勝與湖畔（人文）',
    sceneryDesc: '碧綠蓮池潭水面上矗立色彩鮮豔的「龍塔、虎塔」雙七層寶塔與九曲橋，遠景為半屏山與玄天上帝巨像。',
    architectureDesc: '龍虎雙塔（入龍喉出虎口）、九曲橋、春秋閣、左營舊城拱辰門與眷村美食街。',
    geologyDesc: '半屏山隆起珊瑚礁石灰岩山麓與天然曹公圳蓄水湖泊。',
    timeLimit: 60,
    skyTop: '#0984e3',
    skyMid: '#74b9ff',
    skyBottom: '#ffeaa7',
    sunColor: '#fff200',
    mountainFar: '#2d3436',
    mountainColor: '#1e272e',
    grassLight: '#00b894',
    grassDark: '#009432',
    roadLight: '#57606f',
    roadDark: '#48505c',
    rumbleLight: '#e74c3c',
    rumbleDark: '#ffd32a',
    laneColor: '#ffffff',
    sideTheme: 'red_brick_fort',
    horizonTheme: 'lotuspond_pagodas',
    streetSequence: ['PROP_WENWU_TEMPLE', 'PROP_CIEN_PAGODA', 'PROP_FORT_WALL'],
    obstacleType: 'LANTERN_POLE'
  },
  {
    id: 'qigu',
    region: '南部',
    spotName: '台南七股鹽山＆黑面琵鷺',
    name: '南部 ‧ 台南七股鹽山與黑面琵鷺濕地',
    category: '濱海鹽田與生態（自然／人文）',
    sceneryDesc: '夕陽下閃耀如雪山般的巨型白色「七股鹽山」，搭配曾文溪口潟湖晚霞與成群展翅飛翔的黑面琵鷺剪影。',
    architectureDesc: '高達六層樓的七股鹽山主峰、傳統紅瓦曬鹽田、木製龍骨水車、紅樹林賞鳥亭。',
    geologyDesc: '台江內海淤積形成的濱海沙洲、潟湖濕地與結晶滷水曬鹽場。',
    timeLimit: 60,
    skyTop: '#2c1654',
    skyMid: '#e55039',
    skyBottom: '#f6b93b',
    sunColor: '#ffdd59',
    mountainFar: '#3c1e47',
    mountainColor: '#24112b',
    grassLight: '#dfe6e9',
    grassDark: '#b2bec3',
    roadLight: '#636e72',
    roadDark: '#535c60',
    rumbleLight: '#ffffff',
    rumbleDark: '#f39c12',
    laneColor: '#ffeaa7',
    sideTheme: 'wetland_sunset',
    horizonTheme: 'qigu_salt_mountain',
    streetSequence: ['PROP_WIND_TURBINE', 'PROP_CRAB_BOARDWALK', 'PROP_OYSTER_SHACK'],
    obstacleType: 'TRAFFIC_CONE'
  },
  {
    id: 'npmsouth',
    region: '南部',
    spotName: '嘉義故宮南院＆北回歸線館',
    name: '南部 ‧ 嘉義北回歸線太陽館與故宮南院',
    category: '現代建築與天文地標（人文）',
    sceneryDesc: '充滿科幻感的「北回歸線飛碟造型太陽館」與故宮南院水墨流線雙弧主建築、鮮紅至美橋橫跨湖面。',
    architectureDesc: '第五代北回歸線飛碟太陽館、歷代北回歸線標塔、故宮南院至美橋與濃墨/飛白建築館體。',
    geologyDesc: '北緯 23.5 度北回歸線穿越嘉南平原沖積沃野與蒜頭糖廠甘蔗田。',
    timeLimit: 60,
    skyTop: '#1e3799',
    skyMid: '#4a69bd',
    skyBottom: '#f8c291',
    sunColor: '#ffd32a',
    mountainFar: '#2f3640',
    mountainColor: '#1e272e',
    grassLight: '#2ecc71',
    grassDark: '#27ae60',
    roadLight: '#57606f',
    roadDark: '#48505c',
    rumbleLight: '#e74c3c',
    rumbleDark: '#ffffff',
    laneColor: '#ffd32a',
    sideTheme: 'museum_palace',
    horizonTheme: 'npmsouth_tropic',
    streetSequence: ['PROP_ARCH_BRIDGE', 'PROP_XIANGSHAN_CENTER', 'PROP_NPM_PAIFANG'],
    obstacleType: 'TRAFFIC_CONE'
  },
  {
    id: 'duoliang',
    region: '東部',
    spotName: '台東太麻里多良火車站',
    name: '東部 ‧ 台東太麻里多良火車站',
    category: '全台灣最美臨海車站（山海鐵道）',
    sceneryDesc: '緊貼太平洋漸層牛奶藍海面的高架「鮮紅鐵道欄杆月台」，藍皮解憂號與紅斑馬自強號從海天一線間疾馳而過！',
    architectureDesc: '多良車站紅色高架月台欄杆、瀧溪山洞隧道口、太麻里櫻木花道平交道、金針山觀景台。',
    geologyDesc: '中央山脈南段大武山東南麓直逼太平洋深海海溝之陡峭海階崖。',
    timeLimit: 60,
    skyTop: '#1b1464',
    skyMid: '#eb4d4b',
    skyBottom: '#f9ca24',
    sunColor: '#fff200',
    mountainFar: '#130f40',
    mountainColor: '#30336b',
    grassLight: '#2ecc71',
    grassDark: '#218c74',
    roadLight: '#535c68',
    roadDark: '#454d57',
    rumbleLight: '#ff3838',
    rumbleDark: '#ffffff',
    laneColor: '#ffd32a',
    sideTheme: 'suhua',
    horizonTheme: 'duoliang_station',
    streetSequence: ['PROP_MIANQING_TRACK', 'PROP_PEBBLE_SURF_SHORE', 'PROP_ALISHAN_RED_TRAIN'],
    obstacleType: 'CLIFF_ROCK'
  },
  {
    id: 'beigang',
    region: '中部',
    spotName: '雲林西螺大橋＆北港朝天宮',
    name: '中部 ‧ 雲林西螺紅橋與北港朝天宮',
    category: '鋼桁架長橋與媽祖總本山（人文）',
    sceneryDesc: '橫跨寬闊濁水溪的鮮紅色鋼桁架「西螺大橋」與香火鼎盛、萬人朝聖的北港朝天宮重簷燕尾廟頂交相輝映！',
    architectureDesc: '全長 1939 公尺之 31 拱鮮紅華倫氏桁架「西螺大橋」、北港朝天宮國定古蹟、千里眼順風耳巨偶與延平老街。',
    geologyDesc: '台灣最長河川濁水溪出山麓後展開之廣袤扇狀沖積平原。',
    timeLimit: 60,
    skyTop: '#b71540',
    skyMid: '#e58e26',
    skyBottom: '#fad390',
    sunColor: '#ffd32a',
    mountainFar: '#4a235a',
    mountainColor: '#2e1538',
    grassLight: '#78e08f',
    grassDark: '#38ada9',
    roadLight: '#5c5252',
    roadDark: '#4d4444',
    rumbleLight: '#ff3838',
    rumbleDark: '#ffd32a',
    laneColor: '#ffd32a',
    sideTheme: 'red_brick_fort',
    horizonTheme: 'beigang_xiluo',
    streetSequence: ['PROP_ARCH_BRIDGE', 'PROP_PILGRIM_FLAG_SEA', 'PROP_DRAGON_BELL_TOWER'],
    obstacleType: 'LANTERN_POLE'
  },
  {
    id: 'ruisui',
    region: '東部',
    spotName: '花蓮瑞穗北回歸線＆牧場',
    name: '東部 ‧ 花蓮瑞穗北回歸線標與瑞穗牧場',
    category: '縱谷牧野與天文地標（自然／人文）',
    sceneryDesc: '中央山脈與海岸山脈夾峙下，純白色日晷造型「瑞穗北回歸線標碑」高聳入雲，旁有綠油油牧場與黑白乳牛群。',
    architectureDesc: '白色窺陽塔造型瑞穗北回歸線標、瑞穗牧場風車木屋、舞鶴台地茶園與掃叭石柱遺址。',
    geologyDesc: '花東縱谷中段秀姑巒溪與紅葉溪沖積階地及舞鶴河階台地。',
    timeLimit: 60,
    skyTop: '#0097e6',
    skyMid: '#48dbfb',
    skyBottom: '#dff9fb',
    sunColor: '#ffd32a',
    mountainFar: '#27ae60',
    mountainColor: '#1e8449',
    grassLight: '#55efc4',
    grassDark: '#00b894',
    roadLight: '#57606f',
    roadDark: '#48505c',
    rumbleLight: '#ffffff',
    rumbleDark: '#2ecc71',
    laneColor: '#ffd32a',
    sideTheme: 'cingjing_pasture',
    horizonTheme: 'ruisui_tropic_pasture',
    streetSequence: ['PROP_GRAZING_SHEEP', 'PROP_TAKESHI_TREE', 'PROP_GOLDEN_RICE_WAVE'],
    obstacleType: 'CYPRESS_TREE'
  },
  {
    id: 'shitiping',
    region: '東部',
    spotName: '花蓮石梯坪＆親不知子古道',
    name: '東部 ‧ 花蓮豐濱石梯坪與親不知子古道',
    category: '海蝕單面山與懸崖棧道（自然）',
    sceneryDesc: '灰白色隆起珊瑚礁與凝灰岩「單面山」斜插進太平洋，巨浪拍打海蝕壺穴激起數層樓高的雪白浪花！',
    architectureDesc: '新機隧道懸崖峭壁上的「親不知子透明玻璃海上古道」、石梯漁港賞鯨碼頭、海濱露營木屋。',
    geologyDesc: '白色火山凝灰岩質單面山、海蝕平台、隆起珊瑚礁與全台第一大海蝕壺穴群。',
    timeLimit: 60,
    skyTop: '#0a3d62',
    skyMid: '#3c6382',
    skyBottom: '#82ccdd',
    sunColor: '#f8c291',
    mountainFar: '#2f3640',
    mountainColor: '#1e272e',
    grassLight: '#636e72',
    grassDark: '#4b5558',
    roadLight: '#535c68',
    roadDark: '#454d57',
    rumbleLight: '#00a8ff',
    rumbleDark: '#ffffff',
    laneColor: '#ffd32a',
    sideTheme: 'suhua',
    horizonTheme: 'shitiping_steps',
    streetSequence: ['PROP_VOLCANIC_REEF', 'PROP_MARBLE_TUNNEL', 'PROP_PEBBLE_SURF_SHORE'],
    obstacleType: 'CLIFF_ROCK'
  },
  {
    id: 'longteng',
    region: '山區',
    spotName: '苗栗三義龍騰斷橋＆勝興站',
    name: '山區 ‧ 苗栗三義龍騰斷橋與勝興車站',
    category: '舊山線鐵道古蹟（人文／山林）',
    sceneryDesc: '雲霧繚繞的翠綠山谷間，矗立著歷經兩次大地震仍屹立不搖的「紅磚糯米橋墩遺跡（龍騰斷橋）」，充滿蒼勁古蹟美感。',
    architectureDesc: '1907 年建魚藤坪紅磚斷橋拱柱、縱貫鐵路最高點「勝興木造車站」、舊山線鐵道自行車與木雕老街。',
    geologyDesc: '苗栗三義火炎山礫石台地北側山谷與關刀山斷層地貌。',
    timeLimit: 60,
    skyTop: '#535c68',
    skyMid: '#95afc0',
    skyBottom: '#dff9fb',
    sunColor: '#ffeaa7',
    mountainFar: '#2f3640',
    mountainColor: '#1e272e',
    grassLight: '#2ecc71',
    grassDark: '#218c74',
    roadLight: '#57606f',
    roadDark: '#48505c',
    rumbleLight: '#c0392b',
    rumbleDark: '#ffffff',
    laneColor: '#ffeaa7',
    sideTheme: 'bamboo_mist',
    horizonTheme: 'longteng_broken_bridge',
    streetSequence: ['PROP_FORT_WALL', 'PROP_SHENGPING_THEATER', 'PROP_MIANQING_TRACK'],
    obstacleType: 'CYPRESS_TREE'
  },
  {
    id: 'qingshui',
    region: '東部',
    spotName: '花蓮蘇花公路・清水斷崖',
    name: '東部 ‧ 花蓮秀林蘇花公路清水斷崖',
    category: '台灣八景・山海絕壁（自然奇觀）',
    sceneryDesc: '台灣八景之首！左側是近乎 90 度垂直竄升兩千公尺的大理石高山絕壁，右側是漸層蒂芬妮藍的太平洋萬丈深淵！',
    architectureDesc: '蘇花公路崇德隧道口觀景台、「清水斷崖」台灣十景巨石碑、臨海連續明隧道石柱與懸崖護欄。',
    geologyDesc: '清水山東側斷層崖直插太平洋海溝，由片麻岩與結晶石灰岩（大理岩）構成之世界級海崖。',
    timeLimit: 60,
    skyTop: '#0052a5',
    skyMid: '#00a8e8',
    skyBottom: '#90e0ef',
    sunColor: '#fff200',
    mountainFar: '#2d3436',
    mountainColor: '#1e272e',
    grassLight: '#576574',
    grassDark: '#353b48',
    roadLight: '#535c68',
    roadDark: '#454d57',
    rumbleLight: '#00f0ff',
    rumbleDark: '#ffffff',
    laneColor: '#ffd32a',
    sideTheme: 'suhua',
    horizonTheme: 'qingshui_cliff',
    streetSequence: ['PROP_MARBLE_TUNNEL', 'PROP_VERTICAL_WALL', 'PROP_EIGHT_VIEWS_STELE'],
    obstacleType: 'CLIFF_ROCK'
  },
  {
    id: 'hsinchu_moat',
    region: '北部',
    spotName: '新竹東門城迎曦門＆城隍廟',
    name: '北部 ‧ 新竹竹塹東門城與都城隍廟',
    category: '百年古城門與美食夜市（人文）',
    sceneryDesc: '重簷歇山頂的紅磚石砌古城樓「竹塹迎曦門」坐落於護城河圓環中央，遠方襯托燈火通明的都城隍廟牌樓。',
    architectureDesc: '1827 年建國定古蹟「竹塹城東門迎曦門」、護城河親水岸柳樹、新竹都城隍廟紅燈籠美食夜市。',
    geologyDesc: '頭前溪與鳳山溪沖積而成之竹塹平原及九降風風口地貌。',
    timeLimit: 60,
    skyTop: '#2c1654',
    skyMid: '#c0392b',
    skyBottom: '#f39c12',
    sunColor: '#ffd32a',
    mountainFar: '#3c1e47',
    mountainColor: '#24112b',
    grassLight: '#27ae60',
    grassDark: '#1e8449',
    roadLight: '#5c5252',
    roadDark: '#4d4444',
    rumbleLight: '#e74c3c',
    rumbleDark: '#ffd32a',
    laneColor: '#ffd32a',
    sideTheme: 'red_brick_fort',
    horizonTheme: 'hsinchu_east_gate',
    streetSequence: ['PROP_FORT_WALL', 'PROP_CHIHKAN_PAVILION', 'PROP_RED_LANTERN_STAIRS'],
    obstacleType: 'LANTERN_POLE'
  },
  {
    id: 'tamsui',
    region: '北部',
    spotName: '新北淡水情人橋＆紅毛城',
    name: '北部 ‧ 新北淡水漁人碼頭情人橋與紅毛城',
    category: '河口夕照與洋樓古蹟（人文／自然）',
    sceneryDesc: '淡水河口金色波光粼粼的水面上，純白色風帆造型「情人橋」與對岸八里觀音山構成北台灣最浪漫的夕陽地平線！',
    architectureDesc: '淡水漁人碼頭單塔斜張「情人橋」、百年紅磚古蹟「淡水紅毛城」、英國領事館拱廊與河畔木棧道。',
    geologyDesc: '大屯火山群西南麓與淡水河出海口交會之河海口紅樹林地貌，隔河遠眺觀音山。',
    timeLimit: 60,
    skyTop: '#2c1654',
    skyMid: '#eb4d4b',
    skyBottom: '#f0932b',
    sunColor: '#ffbe76',
    mountainFar: '#30336b',
    mountainColor: '#130f40',
    grassLight: '#2ecc71',
    grassDark: '#27ae60',
    roadLight: '#535c68',
    roadDark: '#454d57',
    rumbleLight: '#ff7979',
    rumbleDark: '#ffffff',
    laneColor: '#ffd32a',
    sideTheme: 'wetland_sunset',
    horizonTheme: 'tamsui_lover_bridge',
    streetSequence: ['PROP_FORT_WALL', 'PROP_ARCH_BRIDGE', 'PROP_HARBOR_LIGHTHOUSE'],
    obstacleType: 'LANTERN_POLE'
  }
];

/**
 * 8 大終點關卡（第 10 關：車輛行駛時依序展現沿途街景，最終有終點線、正中央矗立終點主建築、兩旁群眾歡呼）
 */
const FINALE_STAGES_LIST = [
  {
    id: 'end_baishatun',
    isFinale: true,
    region: '苗栗通霄',
    spotName: '白沙屯媽祖廟',
    name: '終點 ‧ 白沙屯媽祖廟（拱天宮）',
    category: '宗教人文聖地（終點）',
    sceneryDesc: '成千上萬戴橘帽的香燈腳旗海飄揚，「粉紅超跑」媽祖神轎領航，鞭炮齊鳴直達拱天宮！',
    architectureDesc: '白沙屯拱天宮雙殿式金碧輝煌廟宇、雙龍剪黏屋脊、紅金拱天宮牌樓與海線平交道。',
    geologyDesc: '苗栗通霄濱海沙丘平原與台鐵海線走廊。',
    timeLimit: 60,
    skyTop: '#641e16',
    skyMid: '#cb4335',
    skyBottom: '#f9e79f',
    sunColor: '#ffd32a',
    mountainFar: '#4a235a',
    mountainColor: '#2e1538',
    grassLight: '#784212',
    grassDark: '#5c320d',
    roadLight: '#5c5252',
    roadDark: '#4d4444',
    rumbleLight: '#ff3838',
    rumbleDark: '#ffd32a',
    laneColor: '#ffd32a',
    sideTheme: 'red_brick_fort',
    horizonTheme: 'temple_festive',
    streetSequence: ['PROP_PILGRIM_FLAG_SEA', 'PROP_PINK_SUPERCAR_PALANQUIN', 'PROP_FIRECRACKER_ARCH'],
    finaleMonument: 'MONUMENT_BAISHATUN',
    finaleImage: 'assets/finales/finale_baishatun.jpg',
    obstacleType: 'LANTERN_POLE'
  },
  {
    id: 'end_lukang',
    isFinale: true,
    region: '彰化鹿港',
    spotName: '彰化鹿港天后宮',
    name: '終點 ‧ 彰化鹿港天后宮',
    category: '國定古蹟名廟（終點）',
    sceneryDesc: '鹿港紅磚古厝長條街屋、傳統燈籠高掛、香火鼎盛的中山路老街直通天后宮三川殿！',
    architectureDesc: '鹿港天后宮歇山重簷三川殿、八卦藻井、青斗石龍柱、半邊井與紅磚亭仔腳老街。',
    geologyDesc: '彰化平原鹿港古河港沖積扇平原。',
    timeLimit: 60,
    skyTop: '#4a154b',
    skyMid: '#b33939',
    skyBottom: '#ffb142',
    sunColor: '#ffd32a',
    mountainFar: '#3d1e1e',
    mountainColor: '#2b1414',
    grassLight: '#8c4627',
    grassDark: '#6e351c',
    roadLight: '#594f4f',
    roadDark: '#4a4141',
    rumbleLight: '#e74c3c',
    rumbleDark: '#f1c40f',
    laneColor: '#ffd32a',
    sideTheme: 'red_brick_fort',
    horizonTheme: 'temple_festive',
    streetSequence: ['PROP_LUKANG_HALF_WELL', 'PROP_CRAFT_LANTERN_SHOP', 'PROP_LUKANG_OLD_ARCADE'],
    finaleMonument: 'MONUMENT_LUKANG',
    finaleImage: 'assets/finales/finale_lukang.jpg',
    obstacleType: 'LANTERN_POLE'
  },
  {
    id: 'end_chihkan',
    isFinale: true,
    region: '台南中西區',
    spotName: '台南赤嵌樓',
    name: '終點 ‧ 台南赤嵌樓',
    category: '府城國定古蹟（終點）',
    sceneryDesc: '古榕盤根紅磚城牆、九座石龜贔屭御碑排列，夕照映紅飛簷雙層閣樓海神廟與文昌閣！',
    architectureDesc: '赤嵌樓（普羅民遮城稜堡殘跡、海神廟、文昌閣）、九座乾隆御龜碑、祀典武廟紅牆。',
    geologyDesc: '昔日台江內海海岸平原與赤嵌台地。',
    timeLimit: 60,
    skyTop: '#5b2c6f',
    skyMid: '#d35400',
    skyBottom: '#f5b041',
    sunColor: '#ffd32a',
    mountainFar: '#5c2a18',
    mountainColor: '#421d10',
    grassLight: '#935116',
    grassDark: '#784212',
    roadLight: '#5d534f',
    roadDark: '#4f4643',
    rumbleLight: '#c0392b',
    rumbleDark: '#f5cba7',
    laneColor: '#ffd32a',
    sideTheme: 'red_brick_fort',
    horizonTheme: 'tainan_forts',
    streetSequence: ['PROP_WUMIAO_RED_WALL', 'PROP_BIXI_TURTLE_STELE', 'PROP_CHIHKAN_GARDEN'],
    finaleMonument: 'MONUMENT_CHIHKAN',
    finaleImage: 'assets/finales/finale_chihkan.jpg',
    obstacleType: 'LANTERN_POLE'
  },
  {
    id: 'end_eluanbi',
    isFinale: true,
    region: '屏東恆春',
    spotName: '墾丁鵝鑾鼻燈塔',
    name: '終點 ‧ 墾丁鵝鑾鼻燈塔',
    category: '台灣極南燈塔（終點）',
    sceneryDesc: '穿過搖曳椰林與珊瑚礁草原，巴士海峽與太平洋交會處，純白圓形武裝燈塔耀眼矗立！',
    architectureDesc: '鵝鑾鼻純白鐵造圓形武裝燈塔、環繞壕溝與槍眼圍牆、「台灣八景鵝鑾鼻」石碑。',
    geologyDesc: '台灣最南端隆起珊瑚礁石灰岩岬角與裙礁海岸。',
    timeLimit: 60,
    skyTop: '#0077b6',
    skyMid: '#00b4d8',
    skyBottom: '#caf0f8',
    sunColor: '#ffd32a',
    mountainFar: '#2a9d8f',
    mountainColor: '#1d786d',
    grassLight: '#52b788',
    grassDark: '#40916c',
    roadLight: '#5c677d',
    roadDark: '#4c5669',
    rumbleLight: '#00f0ff',
    rumbleDark: '#ffffff',
    laneColor: '#ffd32a',
    sideTheme: 'kenting',
    horizonTheme: 'kenting',
    streetSequence: ['PROP_COCONUT_BOULEVARD', 'PROP_CORAL_LIMESTONE', 'PROP_EIGHT_VIEWS_STELE'],
    finaleMonument: 'MONUMENT_ELUANBI',
    finaleImage: 'assets/finales/finale_eluanbi.jpg',
    obstacleType: 'PALM_TREE'
  },
  {
    id: 'end_sanxiantai',
    isFinale: true,
    region: '台東成功',
    spotName: '台東三仙台',
    name: '終點 ‧ 台東三仙台',
    category: '東海岸跨海奇景（終點）',
    sceneryDesc: '太平洋巨浪拍擊都巒山黑色火山角礫岩，八拱跨海波浪步橋如巨龍般躍向離岸三仙台島！',
    architectureDesc: '三仙台跨海八拱波浪步橋、離岸海蝕島日治燈杆、濱海礫石木棧道。',
    geologyDesc: '都巒山層火山角礫岩、海蝕柱、海蝕平台與離岸海蝕小島。',
    timeLimit: 60,
    skyTop: '#1e3799',
    skyMid: '#0097e6',
    skyBottom: '#f6b93b',
    sunColor: '#ffd32a',
    mountainFar: '#2f3640',
    mountainColor: '#1e272e',
    grassLight: '#576574',
    grassDark: '#353b48',
    roadLight: '#57606f',
    roadDark: '#48505c',
    rumbleLight: '#00a8ff',
    rumbleDark: '#ffffff',
    laneColor: '#ffd32a',
    sideTheme: 'suhua',
    horizonTheme: 'sanxiantai_bridge',
    streetSequence: ['PROP_PEBBLE_SURF_SHORE', 'PROP_VOLCANIC_REEF', 'PROP_AMIS_TOTEM_PLAZA'],
    finaleMonument: 'MONUMENT_SANXIANTAI',
    finaleImage: 'assets/finales/finale_sanxiantai.jpg',
    obstacleType: 'CLIFF_ROCK'
  },
  {
    id: 'end_taroko',
    isFinale: true,
    region: '花蓮秀林',
    spotName: '花蓮太魯閣牌坊',
    name: '終點 ‧ 花蓮太魯閣牌坊',
    category: '世界級峽谷地標（終點）',
    sceneryDesc: '立霧溪碧水切穿千仞大理石絕壁，出峽谷口迎面而來「東西橫貫公路」紅金飛簷大牌樓！',
    architectureDesc: '「東西橫貫公路」太魯閣牌坊（紅柱金瓦中國宮殿式牌樓）、錦文橋、燕子口明隧道。',
    geologyDesc: '歐亞板塊與菲律賓海板塊擠壓抬升之世界級變質大理岩峽谷。',
    timeLimit: 60,
    skyTop: '#2c3e50',
    skyMid: '#4ca1af',
    skyBottom: '#c4e0e5',
    sunColor: '#ffd32a',
    mountainFar: '#576574',
    mountainColor: '#3d4852',
    grassLight: '#636e72',
    grassDark: '#4b5558',
    roadLight: '#5a6265',
    roadDark: '#4d5457',
    rumbleLight: '#e74c3c',
    rumbleDark: '#ffd32a',
    laneColor: '#ffd32a',
    sideTheme: 'taroko',
    horizonTheme: 'taroko',
    streetSequence: ['PROP_SWALLOW_GROTTO_TUNNEL', 'PROP_JINWEN_RED_BRIDGE', 'PROP_MARBLE_GORGE_WALL'],
    finaleMonument: 'MONUMENT_TAROKO_ARCH',
    finaleImage: 'assets/finales/finale_taroko.jpg',
    obstacleType: 'CLIFF_ROCK'
  },
  {
    id: 'end_alishan',
    isFinale: true,
    region: '嘉義阿里山',
    spotName: '嘉義阿里山森林神木',
    name: '終點 ‧ 嘉義阿里山森林神木',
    category: '千年神木鐵道（終點）',
    sceneryDesc: '破曉金色雲海翻騰於玉山群峰，紅色阿里山森林小火車鳴笛駛出千年紅檜神木站，茶農與鄒族勇士夾道歡呼！',
    architectureDesc: '阿里山森林鐵路紅色柴油機關車、木造神木車站月台、千年紅檜巨木圍欄步道。',
    geologyDesc: '阿里山山脈斷層嶺線、高山雲海逆溫層與千年紅檜扁柏霧林帶。',
    timeLimit: 60,
    skyTop: '#0f2027',
    skyMid: '#2c5364',
    skyBottom: '#f39c12',
    sunColor: '#ffd32a',
    mountainFar: '#1e3c40',
    mountainColor: '#142e24',
    grassLight: '#27ae60',
    grassDark: '#1e8449',
    roadLight: '#5a524c',
    roadDark: '#4a423d',
    rumbleLight: '#e74c3c',
    rumbleDark: '#ffd32a',
    laneColor: '#ffeaa7',
    sideTheme: 'alishan',
    horizonTheme: 'alishan',
    streetSequence: ['PROP_RED_CYPRESS', 'PROP_FOREST_RAILWAY', 'PROP_CLOUD_SEA_VIEW'],
    finaleMonument: 'MONUMENT_ALISHAN_TREE',
    finaleImage: 'assets/finales/finale_alishan.jpg',
    obstacleType: 'CYPRESS_TREE'
  },
  {
    id: 'end_lanyang',
    isFinale: true,
    region: '宜蘭頭城',
    spotName: '宜蘭蘭陽博物館',
    name: '終點 ‧ 宜蘭蘭陽博物館',
    category: '單面山地景建築（終點）',
    sceneryDesc: '遠眺海上龜山島，烏石港鏡面濕地水畔，20度斜角拔地而起的單面山幾何玻璃石材博物館！',
    architectureDesc: '蘭陽博物館（20度傾斜單面山幾何建築、四季音符石材鋁板外牆）、烏石港濕地木棧道。',
    geologyDesc: '東北角海岸單面山（Cuesta）地貌、烏石港海岸濕地與外海龜山島火山島。',
    timeLimit: 60,
    skyTop: '#006266',
    skyMid: '#1289a7',
    skyBottom: '#c8d6e5',
    sunColor: '#ffd32a',
    mountainFar: '#1e5631',
    mountainColor: '#143d22',
    grassLight: '#2ecc71',
    grassDark: '#27ae60',
    roadLight: '#576574',
    roadDark: '#485460',
    rumbleLight: '#00f0ff',
    rumbleDark: '#ffffff',
    laneColor: '#ffffff',
    sideTheme: 'lake_emerald',
    horizonTheme: 'lanyang_guishan',
    streetSequence: ['PROP_TOUCHENG_ARCADE', 'PROP_WUSHI_HARBOR_SAIL', 'PROP_WETLAND_BOARDWALK'],
    finaleMonument: 'MONUMENT_LANYANG_MUSEUM',
    obstacleType: 'CLIFF_ROCK'
  },
  {
    id: 'end_penghu',
    isFinale: true,
    region: '澎湖白沙／西嶼',
    spotName: '澎湖跨海大橋',
    name: '終點 ‧ 澎湖跨海大橋',
    category: '海上長虹地標（終點）',
    sceneryDesc: '穿越通梁古榕與仙人掌海岸，筆直馳騁在波濤洶湧的吼門水道之上，衝向純白跨海大橋拱門！',
    architectureDesc: '澎湖跨海大橋白色半圓形地標拱門、通梁保安宮百年古榕、海上箱型梁長橋欄杆。',
    geologyDesc: '澎湖玄武岩方山台地、吼門水道急流海峽與珊瑚礁淺坪。',
    timeLimit: 60,
    skyTop: '#0052a5',
    skyMid: '#00a8ff',
    skyBottom: '#dff9fb',
    sunColor: '#ffd32a',
    mountainFar: '#2b2d42',
    mountainColor: '#1d1e2c',
    grassLight: '#0096c7',
    grassDark: '#0077b6',
    roadLight: '#5c677d',
    roadDark: '#4c5669',
    rumbleLight: '#ffffff',
    rumbleDark: '#00a8ff',
    laneColor: '#ffd32a',
    sideTheme: 'penghu_bridge_sea',
    horizonTheme: 'penghu_ocean',
    streetSequence: ['PROP_TONGLIANG_BANYAN', 'PROP_CACTUS_ICE_STAND', 'PROP_BRIDGE_SEA_RAIL'],
    finaleMonument: 'MONUMENT_PENGHU_BRIDGE',
    finaleImage: 'assets/finales/finale_penghu.jpg',
    obstacleType: 'PALM_TREE'
  }
];

// ==================== 35 個關卡沿途 6 段式「牌樓、在地小吃、山景、海景、沿途小景點、核心街景」資料庫 ====================
const STAGE_SUBSPOTS_MAP = {
  fugang: [
    { kind: 'PAIFANG', title: '⛩️ 富岡老街迎賓牌樓', sign: '伯公岡・富岡老街', color: '#c0392b', accent: '#ffd32a' },
    { kind: 'RAILWAY', title: '🚂 台鐵富岡海線平交道', sign: '噹噹噹・鐵道號誌亭', color: '#2d3436', accent: '#ffd32a' },
    { kind: 'BAROQUE', title: '🏛️ 1929 呂家聲巴洛克洋樓', sign: '鑊嫲篤圓頂・五開間', color: '#a04000', accent: '#ecf0f1' },
    { kind: 'SNACK', title: '🍜 富岡客家粄條＆薑絲大腸攤', sign: '古早味客家粄條', color: '#d35400', accent: '#ffeaa7' },
    { kind: 'ARCADE', title: '🏮 信義街昭和紅磚拱廊', sign: '紅磚亭仔腳老街', color: '#b03a2e', accent: '#f1c40f' },
    { kind: 'HERITAGE', title: '🏭 永昌碾米廠＆大井頭伯公祠', sign: '百年碾米廠紅磚塔', color: '#8e44ad', accent: '#f39c12' }
  ],
  yangmingshan: [
    { kind: 'PAIFANG', title: '⛩️ 陽明山國家公園石碑牌樓', sign: '陽明山國家公園', color: '#576574', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🍗 竹子湖山產土雞＆地瓜湯攤', sign: '竹子湖白斬土雞・小饅頭', color: '#d35400', accent: '#ffd32a' },
    { kind: 'MOUNTAIN', title: '⛰️ 小油坑橋遠眺七星山景', sign: '七星山主峰 1120M', color: '#27ae60', accent: '#ecf0f1' },
    { kind: 'SULFUR', title: '🌋 小油坑硫磺噴氣孔結晶壁', sign: '火山硫磺噴氣孔', color: '#f1c40f', accent: '#7f8c8d' },
    { kind: 'NATURE_WAVE', title: '🌾 百拉卡公路秋日銀白芒草海', sign: '陽明山秋芒花浪', color: '#dfe6e9', accent: '#f39c12' },
    { kind: 'PAVILION', title: '♨️ 冷水坑牛奶湖＆溫泉泡腳池', sign: '硫磺溫泉泡腳亭', color: '#8e44ad', accent: '#00f0ff' }
  ],
  yehliu: [
    { kind: 'PAIFANG', title: '⛩️ 野柳地質公園海蝕拱門牌樓', sign: '野柳地質公園', color: '#d1b26f', accent: '#00a8ff' },
    { kind: 'SNACK', title: '🦀 龜吼漁港萬里蟹＆烤小管攤', sign: '現蒸三點蟹・花蟹・烤透抽', color: '#e74c3c', accent: '#ffd32a' },
    { kind: 'OCEAN', title: '⚓ 野柳漁港捕小管漁船與海景', sign: '萬里野柳湛藍海灣', color: '#0984e3', accent: '#ffffff' },
    { kind: 'ROCK_GEO', title: '🪨 蕈狀岩群、薑石與海蝕壺穴', sign: '蜂窩岩・海蝕平台', color: '#b89856', accent: '#ffeaa7' },
    { kind: 'QUEEN_HEAD', title: '👑 國寶級野柳女王頭＆俏皮公主', sign: '野柳女王頭地標', color: '#d4ac0d', accent: '#ffd32a' },
    { kind: 'LIGHTHOUSE', title: '🗼 仙女鞋、燭臺石＆野柳燈杆海景', sign: '野柳岬角單面山海景', color: '#ffffff', accent: '#e74c3c' }
  ],
  npm: [
    { kind: 'PAIFANG', title: '⛩️ 至善天下六柱青白石大牌樓', sign: '天下為公・國立故宮博物院', color: '#ecf0f1', accent: '#2980b9' },
    { kind: 'SNACK', title: '🦐 外雙溪活水釣蝦＆烤香腸攤', sign: '外雙溪胡椒蝦・大香腸', color: '#c0392b', accent: '#ffd32a' },
    { kind: 'PAVILION', title: '🏯 至善園宋代松風閣＆曲橋流水', sign: '至善園・蘭亭曲水', color: '#1e8449', accent: '#f1c40f' },
    { kind: 'HERITAGE', title: '🦁 華表蟠龍石柱大道＆鎮院銅獅', sign: '白石華表迎賓大道', color: '#dfe6e9', accent: '#f39c12' },
    { kind: 'MOUNTAIN', title: '⛰️ 外雙溪翠綠山谷與宮殿山景', sign: '雙溪山嵐翠谷', color: '#145a32', accent: '#a3cb38' },
    { kind: 'TEMPLE', title: '🏛️ 故宮博物院黃瓦白牆正館大殿', sign: '翠玉白菜・肉形石國寶殿', color: '#f1c40f', accent: '#27ae60' }
  ],
  jiufen: [
    { kind: 'PAIFANG', title: '⛩️ 九份老街基山街「舊道口」牌樓', sign: '九份基山街舊道口', color: '#8e44ad', accent: '#ff3838' },
    { kind: 'SNACK', title: '🍧 賴阿婆芋圓、阿蘭草仔粿＆紅糟肉圓', sign: '九份手工芋圓・草仔粿', color: '#e67e22', accent: '#ffd32a' },
    { kind: 'ARCADE', title: '🏮 豎崎路陡峭石階＆漫天紅燈籠海', sign: '豎崎路紅燈籠石階', color: '#c0392b', accent: '#ff1e1e' },
    { kind: 'HERITAGE', title: '🎬 日治昇平戲院復古售票口＆老海報', sign: '1934 昇平戲院古蹟', color: '#576574', accent: '#f1c40f' },
    { kind: 'TEMPLE', title: '🍵 阿妹茶樓三層木造紅燈籠樓閣', sign: '阿妹茶樓山城夜景', color: '#922b21', accent: '#ffd32a' },
    { kind: 'OCEAN', title: '🌊 雞籠山山景＆深澳灣陰陽海海景', sign: '遠眺基隆嶼・陰陽海', color: '#0097e6', accent: '#f39c12' }
  ],
  shifen: [
    { kind: 'PAIFANG', title: '⛩️ 平溪線十分老街鐵道迎賓牌樓', sign: '十分老街・天燈故鄉', color: '#c0392b', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🍗 十分鐵道溜哥燒烤雞翅包飯攤', sign: '炭烤雞翅包飯・花生捲冰淇淋', color: '#d35400', accent: '#ffeaa7' },
    { kind: 'BRIDGE', title: '🌉 靜安吊橋藍白鐵索橋＆基隆河景', sign: '1947 靜安吊橋', color: '#0984e3', accent: '#ffffff' },
    { kind: 'FESTIVAL', title: '🏮 鐵道兩旁彩色祈福天燈冉冉升空', sign: '十分鐵道放天燈祈福', color: '#ff3838', accent: '#ffd32a' },
    { kind: 'RAILWAY', title: '🚃 平溪支線黃色柴油小火車穿街過', sign: '火車門前過・十分車站', color: '#f1c40f', accent: '#2980b9' },
    { kind: 'MOUNTAIN', title: '💦 十分大瀑布馬蹄形簾幕飛瀑＆彩虹', sign: '台灣尼加拉・十分大瀑布', color: '#00cec9', accent: '#ffffff' }
  ],
  taipingshan: [
    { kind: 'PAIFANG', title: '⛩️ 太平山國家森林遊樂區原木牌樓', sign: '太平山國家森林遊樂區', color: '#6e2c00', accent: '#2ecc71' },
    { kind: 'SNACK', title: '🌽 鳩之澤溫泉地熱竹簍煮溫泉蛋＆玉米攤', sign: '鳩之澤溫泉蛋・現煮甜玉米', color: '#e67e22', accent: '#ffd32a' },
    { kind: 'MOUNTAIN', title: '🌲 原始紅檜扁柏巨木林＆迷霧山景', sign: '千年檜木雲霧森林', color: '#145a32', accent: '#dfe6e9' },
    { kind: 'BRIDGE', title: '🪵 見晴懷古步道青苔高架木棧與索道橋', sign: '全球最美小路・見晴古道', color: '#5c2e14', accent: '#27ae60' },
    { kind: 'RAILWAY', title: '🚜 太平山亮黃色山地運材「蹦蹦車」', sign: '太平山蹦蹦車鐵道', color: '#f1c40f', accent: '#c0392b' },
    { kind: 'MOUNTAIN', title: '☁️ 望洋山日出＆聖稜線翻騰雲海山景', sign: '太平山壯闊雲海展望台', color: '#5dade2', accent: '#f9e79f' }
  ],
  gaomei: [
    { kind: 'PAIFANG', title: '⛩️ 高美濕地野生動物保護區入口牌樓', sign: '台中清水・高美濕地', color: '#8e44ad', accent: '#ff9966' },
    { kind: 'SNACK', title: '🦑 高美堤防現烤大魷魚、蚵嗲＆清水米糕攤', sign: '炭烤巨無霸大魷魚・炸蚵嗲', color: '#d35400', accent: '#ffd32a' },
    { kind: 'BRIDGE', title: '🌉 高美雙曲景觀橋白色流線跨海斜張橋', sign: '高美雙曲景觀橋', color: '#ecf0f1', accent: '#00a8ff' },
    { kind: 'LIGHTHOUSE', title: '🗼 紅白相間八角形「高美燈塔」園區', sign: '1967 高美紅白燈塔', color: '#e74c3c', accent: '#ffffff' },
    { kind: 'WINDMILL', title: '🌬️ 整排巨型白色風力發電機組＆海景', sign: '高美風車大道', color: '#ffffff', accent: '#ff5e62' },
    { kind: 'OCEAN', title: '🌅 延伸入海木棧道、招潮蟹＆夕陽天空之鏡', sign: '高美夕照天空之鏡', color: '#ff9966', accent: '#ffd32a' }
  ],
  hehuanshan: [
    { kind: 'PAIFANG', title: '⛩️ 太魯閣國家公園合歡山界碑牌樓', sign: '台14甲線・合歡山暗空公園', color: '#2c3e50', accent: '#00f0ff' },
    { kind: 'SNACK', title: '🍢 高山最高關東煮、大禹嶺熱薑茶＆茶葉蛋攤', sign: '海拔3000m熱騰騰關東煮', color: '#e67e22', accent: '#ffd32a' },
    { kind: 'MOUNTAIN', title: '⛰️ 昆陽太魯閣界碑＆大曲流壯麗山景', sign: '昆陽S型高山公路山景', color: '#1e4d3b', accent: '#00f0ff' },
    { kind: 'WULING', title: '🏔️ 武嶺 3275 公尺台灣公路最高點標誌亭', sign: '武嶺海拔 3275M 地標', color: '#7f8c8d', accent: '#ffd32a' },
    { kind: 'HERITAGE', title: '🏨 松雪樓高山景觀旅館＆玉山杜鵑花叢', sign: '松雪樓・合歡東峰登山口', color: '#2980b9', accent: '#ff6b81' },
    { kind: 'PAVILION', title: '🌌 鳶峰國際暗空公園觀星圓頂＆璀璨銀河', sign: '合歡山國際暗空公園星海', color: '#3c40c6', accent: '#ffffff' }
  ],
  cingjing: [
    { kind: 'PAIFANG', title: '⛩️ 清境農場青青草原純白城堡大牌樓', sign: '清境農場青青草原', color: '#ecf0f1', accent: '#c0392b' },
    { kind: 'SNACK', title: '🍑 雲南擺夷椒麻雞、高山水蜜桃＆羊奶冰棒攤', sign: '清境雲南擺夷美食・羊奶冰', color: '#e74c3c', accent: '#ffd32a' },
    { kind: 'BAROQUE', title: '🏰 老英格蘭都鐸式鐘樓古堡莊園山景', sign: '都鐸式歐風古堡莊園', color: '#6e2c00', accent: '#ecf0f1' },
    { kind: 'SHEEP', title: '🐑 青青草原白色木柵欄＆綿羊脫毛秀牧場', sign: '柯麗黛綿羊漫步草原', color: '#2ecc71', accent: '#ffffff' },
    { kind: 'WINDMILL', title: '🎡 觀山牧區荷蘭大風車＆奇萊連峰山景', sign: '觀山牧區風車與奇萊山景', color: '#e67e22', accent: '#ffffff' },
    { kind: 'BRIDGE', title: '🌉 清境高空觀景步道穿梭雲端山景', sign: '清境高空景觀步道', color: '#ffffff', accent: '#00a8ff' }
  ],
  sunmoonlake: [
    { kind: 'PAIFANG', title: '⛩️ 日月潭國家風景區巨石迎賓牌樓', sign: '日月潭國家風景區', color: '#16a085', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🥚 玄光寺阿婆香菇茶葉蛋、伊達邵刈包＆紅茶攤', sign: '阿婆茶葉蛋・台茶18號紅玉', color: '#d35400', accent: '#ffeaa7' },
    { kind: 'TEMPLE', title: '🏯 日月潭文武廟紅柱金瓦三川牌樓＆大石獅', sign: '日月潭文武廟山門', color: '#c0392b', accent: '#ffd32a' },
    { kind: 'HERITAGE', title: '🏛️ 向山遊客中心清水模跨距弧形拱建築', sign: '向山清水模無邊際水池', color: '#95a5a6', accent: '#00cec9' },
    { kind: 'OCEAN', title: '🛥️ 水社碼頭遊艇、拉魯島＆翠綠湖光山色', sign: '拉魯島・全球十大最美單車道', color: '#00b894', accent: '#ffffff' },
    { kind: 'WINDMILL', title: '🗼 沙巴囒山「慈恩塔」九層八角寶塔山景', sign: '海拔1000m 慈恩塔攬勝', color: '#c0392b', accent: '#f1c40f' }
  ],
  xitou: [
    { kind: 'PAIFANG', title: '⛩️ 溪頭自然教育園區孟宗竹林大牌樓', sign: '溪頭・杉林溪森林園區', color: '#1e8449', accent: '#f1c40f' },
    { kind: 'SNACK', title: '👹 妖怪村松林町紅鳥居、咬人貓麵包＆竹筒飯攤', sign: '溪頭妖怪村・咬人貓現烤麵包', color: '#c0392b', accent: '#ffd32a' },
    { kind: 'BRIDGE', title: '🎋 溪頭「大學池」孟宗竹拱橋＆翠綠池水', sign: '溪頭地標・大學池竹拱橋', color: '#27ae60', accent: '#f9e79f' },
    { kind: 'FOREST', title: '🌲 溪頭空中走廊（Skywalk）穿梭柳杉樹冠山景', sign: '海拔7層樓高・森林空中走廊', color: '#145a32', accent: '#a3cb38' },
    { kind: 'NATURE_WAVE', title: '🍂 大崙山銀杏森林金黃山谷＆雲霧高山茶園', sign: '鹿谷銀杏森林金黃雲海', color: '#f1c40f', accent: '#2ecc71' },
    { kind: 'MOUNTAIN', title: '💦 杉林溪松瀧岩瀑布天然砂岩鐘乳大岩洞', sign: '杉林溪首景・松瀧岩水簾洞', color: '#00cec9', accent: '#576574' }
  ],
  meishan: [
    { kind: 'PAIFANG', title: '⛩️ 梅山太平老街迎賓原木大牌樓', sign: '嘉義梅山・太平雲梯老街', color: '#8d6e63', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🍵 梅山高山烏龍茶、苦茶油雞＆茶葉蛋小吃攤', sign: '梅山冠軍高山茶・苦茶油麵線', color: '#27ae60', accent: '#ffeaa7' },
    { kind: 'BRIDGE', title: '🌉 海拔千米「太平雲梯」單跨白色高空懸索吊橋', sign: '海拔1000M・全台最長單跨吊橋', color: '#ffffff', accent: '#00a8ff' },
    { kind: 'MOUNTAIN', title: '☁️ 望風亭俯瞰嘉南平原萬家燈火與翻騰夕陽雲海', sign: '太平望風亭・夕照雲海大景', color: '#f39c12', accent: '#e74c3c' },
    { kind: 'NATURE_WAVE', title: '🍃 雲之南道層疊翠綠階梯高山茶園步道景觀', sign: '高山茶園階梯綠浪・雲之南道', color: '#2ecc71', accent: '#1e8449' },
    { kind: 'ARCADE', title: '🏮 太平老街古早紅磚聚落、竹林古道與陶藝彩繪', sign: '百年太平老街・竹林茶坊古道', color: '#c0392b', accent: '#ffd32a' }
  ],
  yunshanshui: [
    { kind: 'PAIFANG', title: '⛩️ 雲山水植物農莊歐風大門景觀牌樓', sign: '花蓮壽豐・雲山水夢幻湖', color: '#0984e3', accent: '#ffffff' },
    { kind: 'SNACK', title: '🍋 壽豐豐春冰果店天然甘蔗冰＆柴燒芋頭攤', sign: '壽豐古早味甘蔗冰・柴燒紅豆芋頭', color: '#e67e22', accent: '#ffeaa7' },
    { kind: 'CASTLE', title: '🏰 夢幻湖畔英倫都鐸風城堡莊園民宿與綠茵草坪', sign: '歐洲童話城堡莊園・湖畔草坪', color: '#2c3e50', accent: '#f1c40f' },
    { kind: 'BRIDGE', title: '🌉 夢幻湖落羽松跳石水圳與涓涓流水瀑布步道', sign: '夢幻湖落羽松跳石水瀑步道', color: '#00cec9', accent: '#ffffff' },
    { kind: 'FOREST', title: '🌲 四季變幻金黃翠綠落羽松水中森林倒影', sign: '水漾落羽松林・金黃翠綠倒影', color: '#27ae60', accent: '#f39c12' },
    { kind: 'OCEAN', title: '🦢 蒂芬妮藍碧湖天鵝水鴨悠游與中央山脈山景', sign: '蒂芬妮藍夢幻湖・天鵝倒影', color: '#00cec9', accent: '#74b9ff' }
  ],
  qixingtan: [
    { kind: 'PAIFANG', title: '⛩️ 七星潭海岸風景特定區藍白海浪牌樓', sign: '花蓮新城・七星潭月牙灣', color: '#0984e3', accent: '#ffffff' },
    { kind: 'SNACK', title: '🐙 七星潭柴魚博物館章魚燒、飛魚卵香腸＆麻糬攤', sign: '現刨柴魚章魚燒・飛魚卵大香腸', color: '#d35400', accent: '#ffd32a' },
    { kind: 'MOUNTAIN', title: '⛰️ 四八高地戰備坑道＆俯瞰月牙灣太平洋海景', sign: '四八高地180度無敵海景', color: '#27ae60', accent: '#00a8ff' },
    { kind: 'OCEAN', title: '🌊 七星潭鵝卵石海灘、疊石祈福塔＆湛藍浪花', sign: '七星潭黑白鵝卵石疊石海景', color: '#0052a5', accent: '#ecf0f1' },
    { kind: 'PAVILION', title: '🐟 東昌定置漁場曼波魚石雕＆賞星廣場涼亭', sign: '曼波魚故鄉・賞星廣場白亭', color: '#ffffff', accent: '#00cec9' },
    { kind: 'MOUNTAIN', title: '🪨 遠眺崇德「清水斷崖」絕壁直插太平洋海景', sign: '台灣十景・清水斷崖山海交會', color: '#2c3e50', accent: '#00f0ff' }
  ],
  liyutan: [
    { kind: 'PAIFANG', title: '⛩️ 花東縱谷鯉魚潭風景區原民圖騰牌樓', sign: '花蓮壽豐・鯉魚潭風景區', color: '#c0392b', accent: '#7bed9f' },
    { kind: 'SNACK', title: '🦐 鯉魚潭潭北活跳蝦、酥炸蝦餅＆木瓜牛奶攤', sign: '鯉魚潭名產・麻辣活跳蝦＆蝦餅', color: '#e74c3c', accent: '#ffd32a' },
    { kind: 'MOUNTAIN', title: '⛰️ 鯉魚山翠綠森林山景倒映碧綠湖面', sign: '鯉魚山森林步道與湖面倒影', color: '#1e8449', accent: '#48c9b0' },
    { kind: 'OCEAN', title: '🦢 環潭水上天鵝腳踏船碼頭＆獨木舟湖景', sign: '鯉魚潭彩色天鵝船碼頭', color: '#00a8ff', accent: '#ffd32a' },
    { kind: 'RAILWAY', title: '🚂 池南國家森林遊樂區蒸汽老火車頭＆蹦蹦車', sign: '池南林業陳列館・蒸汽運材車', color: '#2d3436', accent: '#f1c40f' },
    { kind: 'PAVILION', title: '✨ 環潭落羽松木棧道、紅瓦涼亭＆夜間螢火蟲海', sign: '鯉魚潭湖濱木棧道與螢火蟲季', color: '#16a085', accent: '#ffeaa7' }
  ],
  guanshan: [
    { kind: 'PAIFANG', title: '⛩️ 關山環鎮自行車道＆親水公園原木牌樓', sign: '全台首座・關山環鎮自行車道', color: '#8d6e63', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🍱 關山公有市場脆皮臭豆腐、關山便當＆花生糖攤', sign: '關山老店臭豆腐・關山米木盒便當', color: '#e67e22', accent: '#ffeaa7' },
    { kind: 'HERITAGE', title: '🚉 日治「舊關山火車站」曼薩爾式半木構造站房', sign: '1919 舊關山驛歷史建築', color: '#5dade2', accent: '#ecf0f1' },
    { kind: 'ARCADE', title: '🏡 關山鐵路舊站日式官舍木造聚落老街', sign: '日治鐵道長官宿舍木屋群', color: '#6e2c00', accent: '#f5cba7' },
    { kind: 'BRIDGE', title: '🌉 關山親水公園紅石溪水圳拱橋＆中央山脈山景', sign: '紅石溪清澈水圳與縱谷山景', color: '#27ae60', accent: '#ffffff' },
    { kind: 'HERITAGE', title: '🌾 關山農會「米國學校」彩繪大穀倉＆稻浪展望台', sign: '關山米國學校彩繪穀倉', color: '#f1c40f', accent: '#e74c3c' }
  ],
  chishang: [
    { kind: 'PAIFANG', title: '⛩️ 池上伯朗大道純白相框地標＆迎賓牌樓', sign: '台東池上・伯朗大道', color: '#ffffff', accent: '#f1c40f' },
    { kind: 'SNACK', title: '🍱 池上全美行月台木片便當＆大池煎豆皮小吃攤', sign: '正宗池上米便當・香煎手工豆皮', color: '#d35400', accent: '#ffd32a' },
    { kind: 'NATURE_WAVE', title: '🌾 萬頃無電線桿「翠綠／金黃稻浪」＆中央山脈山景', sign: '縱谷零電線桿黃金稻海', color: '#f1c40f', accent: '#27ae60' },
    { kind: 'PAVILION', title: '🎠 天堂路 S 型蜿蜒田間小徑＆月亮白色鞦韆', sign: '池上萬新道路・天堂路鞦韆', color: '#ecf0f1', accent: '#e67e22' },
    { kind: 'TAKESHI_TREE', title: '🌳 伯朗大道「金城武樹（茄冬樹）」＆奉茶石壺', sign: 'I SEE YOU・金城武樹奉茶點', color: '#1e8449', accent: '#8d6e63' },
    { kind: 'OCEAN', title: '🪷 池上大坡池國家級斷層濕地、竹筏＆荷花池景', sign: '池上斷層湖泊・大坡池濕地', color: '#0097e6', accent: '#fd79a8' }
  ],
  jialulan: [
    { kind: 'PAIFANG', title: '⛩️ 加路蘭遊憩區阿美族漂流木原生迎賓牌樓', sign: '東部海岸・台東加路蘭遊憩區', color: '#c0392b', accent: '#00cec9' },
    { kind: 'SNACK', title: '🥥 東河肉包、加路蘭手洗愛玉冰＆現烤飛魚攤', sign: '正宗東河肉包・手洗野生愛玉', color: '#e67e22', accent: '#ffd32a' },
    { kind: 'SHEEP', title: '🎨 「哭泣的露珠」巨型漂流木大地裝置藝術', sign: '加路蘭地標・哭泣的露珠大地藝術', color: '#8d6e63', accent: '#00a8ff' },
    { kind: 'ROCK_GEO', title: '🗿 小野柳地質奇岩・蜂窩岩、豆腐岩海蝕奇觀', sign: '小野柳砂頁岩互層海蝕豆腐岩', color: '#2d3436', accent: '#dfe6e9' },
    { kind: 'FOREST', title: '🌴 迎風搖曳熱帶椰子林大道與碧綠觀海大草原', sign: '椰影婆娑・太平洋大草原步道', color: '#00b894', accent: '#ffeaa7' },
    { kind: 'OCEAN', title: '🌊 遠眺太平洋蔚藍深海、綠島剪影與拍岸巨浪', sign: '都蘭灣黑潮浪花・遠眺綠島剪影', color: '#0052a5', accent: '#00f0ff' }
  ],
  anping: [
    { kind: 'PAIFANG', title: '⛩️ 安平老街開台第一街木造復古迎賓牌樓', sign: '開台第一街・台南安平老街', color: '#c0392b', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🍤 安平周氏蝦捲、現烤椪餅＆同記安平豆花攤', sign: '安平現炸周氏蝦捲・傳統黑糖豆花', color: '#d35400', accent: '#ffeaa7' },
    { kind: 'BAROQUE', title: '🏰 1624 熱蘭遮城三層紅磚階梯城基與古城牆殘壁', sign: '荷治大員要塞・熱蘭遮城古城垣', color: '#a04000', accent: '#ecf0f1' },
    { kind: 'HERITAGE', title: '🗼 純白高聳安平古堡瞭望塔、觀景窗與紅頂', sign: '安平地標・純白古堡圓形瞭望塔', color: '#ffffff', accent: '#e74c3c' },
    { kind: 'TEMPLE', title: '💣 億載金城二鯤鯓砲台西洋稜堡與清代阿姆斯壯大砲', sign: '萬流砥柱・億載金城八角稜堡古砲', color: '#935116', accent: '#f1c40f' },
    { kind: 'FOREST', title: '🌳 安平樹屋百年雀榕盤根錯節倉庫與台江運河夕照', sign: '樹以牆為幹・安平樹屋台江夕照', color: '#1e8449', accent: '#e67e22' }
  ],
  foguangshan: [
    { kind: 'PAIFANG', title: '⛩️ 佛光山「不二門」＆禮敬大廳宏偉山門牌樓', sign: '高雄大樹・佛光山佛陀紀念館', color: '#d4ac0d', accent: '#922b21' },
    { kind: 'SNACK', title: '🍍 高屏溪斜張橋景觀＆大樹金鑽鳳梨冰、玉荷包攤', sign: '大樹金鑽鳳梨冰・佛光滴水坊素麵', color: '#f39c12', accent: '#ffffff' },
    { kind: 'WINDMILL', title: '🏯 成佛大道兩側「八塔」中國式七層寶塔林立', sign: '一教二眾三好四給・八座七層寶塔', color: '#c0392b', accent: '#ffd32a' },
    { kind: 'HERITAGE', title: '🙏 萬人照相台＆十八羅漢、八宗祖師石雕群像', sign: '菩提廣場十八羅漢石雕陣', color: '#95a5a6', accent: '#f1c40f' },
    { kind: 'TEMPLE', title: '🏛️ 佛陀紀念館覆鉢式本館＆四聖諦印度風金塔', sign: '佛陀紀念館本館與四聖塔', color: '#d4ac0d', accent: '#ecf0f1' },
    { kind: 'BUDDHA', title: '✨ 108 公尺世界最高銅鑄坐佛「佛光大佛」聖像', sign: '108M 佛光大佛萬道金光', color: '#ffd32a', accent: '#fff200' }
  ],
  kenting_st: [
    { kind: 'PAIFANG', title: '⛩️ 墾丁國家公園牌樓＆南洋熱帶棕櫚拱門', sign: '國境之南・墾丁大街夜市', color: '#ff007f', accent: '#00f0ff' },
    { kind: 'SNACK', title: '🦑 墾丁大街炭烤大魷魚、泰式香蕉煎餅＆調酒車攤', sign: '墾丁大街烤魷魚・脆皮湯包・調酒攤', color: '#e84393', accent: '#ffd32a' },
    { kind: 'MOUNTAIN', title: '⛰️ 墾丁牧場碧綠草原＆「大尖山」獨立尖峰山景', sign: '南台灣馬特洪峰・大尖山山景', color: '#27ae60', accent: '#a3cb38' },
    { kind: 'OCEAN', title: '🏖️ 南灣＆小灣金黃沙灘、彩色陽傘與水上摩托車海景', sign: '南灣金沙灘與碧海藍天', color: '#00a8ff', accent: '#ffd32a' },
    { kind: 'ROCK_GEO', title: '🪨 船帆石（尼克森頭）珊瑚巨岩矗立碧藍海岸', sign: '高18公尺珊瑚礁・船帆石海景', color: '#d1b26f', accent: '#00cec9' },
    { kind: 'FESTIVAL', title: '🍹 墾丁大街霓虹南洋酒吧、衝浪板店＆椰林街景', sign: '墾丁大街不夜城霓虹市集', color: '#8e44ad', accent: '#00f0ff' }
  ],
  nanwan: [
    { kind: 'PAIFANG', title: '⛩️ 墾丁南灣熱帶海浪圖騰迎賓牌樓', sign: '國境之南・墾丁南灣遊憩區', color: '#0097e6', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🍧 恆春阿伯綠豆蒜、芒果雪花冰＆現烤大魷魚攤', sign: '恆春阿伯綠豆蒜・新鮮芒果冰', color: '#f39c12', accent: '#ffffff' },
    { kind: 'OCEAN', title: '🏖️ 南灣金色弧形沙灘與五彩斑斕遮陽傘海', sign: '600M金黃細沙海灣・遮陽傘海', color: '#f1c40f', accent: '#00a8ff' },
    { kind: 'OCEAN', title: '🏄 碧藍浪花衝浪手、水上摩托車＆香蕉船馳騁', sign: '南灣水上摩托車與衝浪狂飆', color: '#00cec9', accent: '#e74c3c' },
    { kind: 'WINDMILL', title: '💨 遠眺核三廠白色巨型風力發電機與大尖石山', sign: '白色風力大風車・大尖石山山景', color: '#ffffff', accent: '#27ae60' },
    { kind: 'FESTIVAL', title: '🌴 椰林比基尼大道、衝浪俱樂部彩繪小屋街景', sign: '南灣南洋椰林大道與衝浪小屋', color: '#e84393', accent: '#00f0ff' }
  ],
  longpan: [
    { kind: 'PAIFANG', title: '⛩️ 台26線佳鵝公路「龍磐公園」木造入口牌樓', sign: '佳鵝公路・墾丁龍磐大崩崖', color: '#ae2012', accent: '#ee9b00' },
    { kind: 'SNACK', title: '🍵 滿州港口茶冰鎮茶攤＆飛魚乾烤山豬肉香腸攤', sign: '滿州海風港口茶・飛魚卵香腸', color: '#d35400', accent: '#ffd32a' },
    { kind: 'SHEEP', title: '🦌 水蛙窟大草原純白木柵欄＆野生台灣梅花鹿奔馳', sign: '水蛙窟牧草平原與梅花鹿群', color: '#52b788', accent: '#ffffff' },
    { kind: 'ROCK_GEO', title: '🪨 隆起珊瑚礁石灰岩大崩崖、溶溝＆裂隙斷層地形', sign: '龍磐石灰岩斷層大崩崖', color: '#9b2226', accent: '#f39c12' },
    { kind: 'NATURE_WAVE', title: '🏜️ 風吹砂海濱壯觀黃色沙瀑、沙河與紅土崖壁', sign: '落山風奇景・風吹砂沙丘', color: '#ee9b00', accent: '#bb3e03' },
    { kind: 'OCEAN', title: '🌊 蜿蜒海岸懸崖公路＆太平洋無敵壯闊海景展望台', sign: '太平洋浩瀚海平線與裙礁浪花', color: '#005f73', accent: '#00f0ff' }
  ],
  matsu: [
    { kind: 'PAIFANG', title: '⛩️ 馬祖列島福澳港「枕戈待旦」巨型紅字照壁牌樓', sign: '枕戈待旦・馬祖列島戰地風光', color: '#c0392b', accent: '#ffffff' },
    { kind: 'SNACK', title: '🍔 馬祖老酒麵線、繼光餅（馬祖漢堡）＆紅糟淡菜攤', sign: '馬祖老酒麵線・繼光餅夾蚵蛋', color: '#d35400', accent: '#ffd32a' },
    { kind: 'BAROQUE', title: '🏘️ 北竿「芹壁聚落」閩東花崗岩印章石屋＆石獅山城', sign: '馬祖地中海・芹壁閩東石屋群', color: '#7f8c8d', accent: '#f39c12' },
    { kind: 'HERITAGE', title: '🍶 南竿「八八坑道」花崗岩戰備坑道口＆老酒大酒甕', sign: '八八坑道陳年老酒與花崗岩洞', color: '#576574', accent: '#c0392b' },
    { kind: 'LIGHTHOUSE', title: '🗼 國境之北「東引島燈塔」純白十八世紀歐風燈塔海景', sign: '東引別墅・斷崖白色東引燈塔', color: '#ffffff', accent: '#00a8ff' },
    { kind: 'OCEAN', title: '💧 北海坑道＆鐵堡夜浪拍岸綻放奇幻螢光「藍眼淚」', sign: '世界奇景・馬祖夜海螢光藍眼淚', color: '#00f0ff', accent: '#38bdf8' }
  ],
  qimei: [
    { kind: 'PAIFANG', title: '⛩️ 澎湖七美嶼南滬港玄武岩海島迎賓牌樓', sign: '澎湖南海明珠・七美嶼', color: '#0077b6', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🌵 七美九孔鮑魚麵線、澎湖仙人掌冰＆黑糖糕攤', sign: '七美現撈九孔麵線・酸甜仙人掌冰', color: '#ff4d6d', accent: '#ffeaa7' },
    { kind: 'ROCK_GEO', title: '🗺️ 七美「小台灣」天然海蝕平台（神似台灣島奇岩海景）', sign: '大自然的鬼斧神工・小台灣海蝕棚', color: '#d1b26f', accent: '#00b4d8' },
    { kind: 'MOUNTAIN', title: '🦁 大獅與龍埕柱狀節理玄武岩海蝕柱＆褶皺海崖', sign: '石獅鎮海・大獅龍埕柱狀玄武岩', color: '#2b2d42', accent: '#90e0ef' },
    { kind: 'LIGHTHOUSE', title: '🗼 望夫石海岸傳說礁岩＆七美嶼純白鋼筋燈塔', sign: '台灣最晚興建・七美嶼燈塔', color: '#ffffff', accent: '#0077b6' },
    { kind: 'OCEAN', title: '💕 頂隙玄武岩崖下碧藍漸層海灣「雙心石滬」全景', sign: '先民捕魚智慧・浪漫七美雙心石滬', color: '#00b4d8', accent: '#ff4d6d' }
  ],
  liuqiu: [
    { kind: 'PAIFANG', title: '⛩️ 小琉球白沙尾漁港彩虹南北堤＆海島迎賓牌樓', sign: '珊瑚礁之島・屏東小琉球', color: '#2ec4b6', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🐢 小琉球相思麵、手工脆皮麻花捲＆海龜燒雞蛋糕攤', sign: '小琉球相思麵・海龜燒・起司餅', color: '#e29578', accent: '#ffeaa7' },
    { kind: 'TEMPLE', title: '🏯 靈山寺臨海飛簷觀音殿＆遠眺高屏海岸海景', sign: '白沙尾港畔・小琉球靈山寺', color: '#c0392b', accent: '#f1c40f' },
    { kind: 'ROCK_GEO', title: '🪨 美人洞、烏鬼洞＆厚石裙礁珊瑚礁石灰岩迷宮', sign: '厚石裙礁・觀音石與紅番石海景', color: '#7f8c8d', accent: '#2a9d8f' },
    { kind: 'OCEAN', title: '🐢 晶瑩藍綠珊瑚礁淺海＆野生保育綠蠵龜浮游海景', sign: '海龜之島・野生綠蠵龜共游海灣', color: '#00b4d8', accent: '#2ecc71' },
    { kind: 'QUEEN_HEAD', title: '🌿 高 9 公尺頭頂翠綠植物的珊瑚礁地標「花瓶岩」', sign: '小琉球第一地標・海上花瓶岩', color: '#d1b26f', accent: '#27ae60' }
  ],

  // ==================== 8 大終點關卡沿途 6 段街景 ====================
  end_baishatun: [
    { kind: 'PAIFANG', title: '⛩️ 白沙屯拱天宮台1線紅柱金瓦迎賓大牌樓', sign: '苗栗通霄・白沙屯拱天宮', color: '#c0392b', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🥟 白沙屯廟口古早味肉餅、炸蚵嗲＆平安米苔目攤', sign: '香燈腳結緣平安餐・廟口肉餅蚵嗲', color: '#d35400', accent: '#ffeaa7' },
    { kind: 'WINDMILL', title: '🌬️ 通霄白沙屯海線鐵道、巨型白色風車＆台灣海峽海景', sign: '白沙屯海濱風車與海線鐵道', color: '#ffffff', accent: '#00a8ff' },
    { kind: 'FESTIVAL', title: '🚩 萬人橘帽香燈腳信眾大軍＆「勇」字令旗旗海', sign: '徒步進香・橘帽香燈腳旗海', color: '#ff7f50', accent: '#ffd32a' },
    { kind: 'PALANQUIN', title: '🌸 「粉紅超跑」白沙屯媽祖神轎疾馳過街賜福', sign: '粉紅超跑媽祖神轎・進喔！進喔！', color: '#ff6b81', accent: '#ffd32a' },
    { kind: 'TEMPLE', title: '🏮 拱天宮廟前熱鬧紅燈籠海＆鞭炮齊鳴迎駕街景', sign: '白沙屯拱天宮三川殿前廣場', color: '#e74c3c', accent: '#ffd32a' }
  ],
  end_lukang: [
    { kind: 'PAIFANG', title: '⛩️ 鹿港天后宮四柱三間雕龍迎賓大牌樓', sign: '一府二鹿・彰化鹿港天后宮', color: '#b33939', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🦪 鹿港廟口蚵仔煎、蝦猴酥、牛舌餅＆古早味麵茶攤', sign: '鹿港蝦猴酥・蚵仔煎・阿振肉包', color: '#d35400', accent: '#ffeaa7' },
    { kind: 'ARCADE', title: '🧱 埔頭街紅磚古厝、三槐挺秀「半邊井」＆九曲巷', sign: '鹿港紅磚老街・半邊井古蹟', color: '#a04000', accent: '#f39c12' },
    { kind: 'HERITAGE', title: '🏮 鹿港公會堂紅磚洋樓＆桂花巷藝術村彩繪燈籠海', sign: '1928 鹿港公會堂與手繪燈籠街', color: '#c0392b', accent: '#ffd32a' },
    { kind: 'BAROQUE', title: '🏛️ 鹿港中山路昭和巴洛克五開間街屋＆五福大街', sign: '不見天街・鹿港中山路巴洛克洋樓', color: '#8c4627', accent: '#ecf0f1' },
    { kind: 'TEMPLE', title: '🏯 鹿港天后宮廟埕大牌樓、香客大樓＆進香舞龍陣頭', sign: '國定古蹟・鹿港天后宮廟埕廣場', color: '#c0392b', accent: '#ffd32a' }
  ],
  end_chihkan: [
    { kind: 'PAIFANG', title: '⛩️ 台南赤嵌文化園區古色古香紅磚飛簷牌樓', sign: '府城核心・台南赤嵌文化園區', color: '#a04000', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🍵 民族路義豐冬瓜茶、浮水魚羹、春捲＆碗粿小吃攤', sign: '百年義豐冬瓜茶・台南碗粿魚羹', color: '#d35400', accent: '#ffeaa7' },
    { kind: 'TEMPLE', title: '🧱 國定古蹟「祀典武廟」朱紅長山牆＆大天后宮古巷', sign: '江南燕尾脊・台南祀典武廟紅牆', color: '#c0392b', accent: '#f1c40f' },
    { kind: 'HERITAGE', title: '🏰 1653 荷蘭「普羅民遮城」紅磚稜堡殘跡＆半月古井', sign: '荷治普羅民遮城糖水糯米紅磚壁', color: '#935116', accent: '#ecf0f1' },
    { kind: 'PAVILION', title: '🐢 蓬壺書院門廳＆九座乾隆御製「石龜贔屭御碑」', sign: '九座滿漢文乾隆石龜贔屭御碑', color: '#7f8c8d', accent: '#ffd32a' },
    { kind: 'TEMPLE', title: '🏯 赤嵌樓庭園鯉魚池、文昌閣魁星爺＆海神廟重簷飛簷', sign: '赤嵌夕照・海神廟與文昌閣雙樓', color: '#c0392b', accent: '#ffd32a' }
  ],
  end_eluanbi: [
    { kind: 'PAIFANG', title: '⛩️ 墾丁國家公園鵝鑾鼻岬角珊瑚礁迎賓大牌樓', sign: '國境極南・屏東鵝鑾鼻燈塔', color: '#0077b6', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🐟 鵝鑾鼻商店街炭烤飛魚、恆春洋蔥餅＆大顆椰子水攤', sign: '現烤飛魚・恆春洋蔥圈・冰椰子水', color: '#2ecc71', accent: '#ffeaa7' },
    { kind: 'OCEAN', title: '🌴 香蕉灣原始熱帶海岸林、船帆石＆碧藍珊瑚海景', sign: '香蕉灣海岸林與巴士海峽海景', color: '#00b4d8', accent: '#27ae60' },
    { kind: 'ROCK_GEO', title: '🏖️ 砂島潔白貝殼砂保護區＆隆起珊瑚礁裙礁浪花', sign: '97%純度貝殼砂・砂島海灣奇景', color: '#f8efba', accent: '#0097e6' },
    { kind: 'HERITAGE', title: '🗿 鵝鑾鼻大草原椰林步道＆「台灣八景鵝鑾鼻」石碑', sign: '鵝鑾鼻綠茵大草原與八景石碑', color: '#52b788', accent: '#ecf0f1' },
    { kind: 'LIGHTHOUSE', title: '🗼 純白武裝圓塔「鵝鑾鼻燈塔」壕溝圍牆＆旋轉探照燈', sign: '台灣八景之首・鵝鑾鼻武裝燈塔', color: '#ffffff', accent: '#e74c3c' }
  ],
  end_sanxiantai: [
    { kind: 'PAIFANG', title: '⛩️ 台東成功三仙台遊憩區阿美族太陽圖騰牌樓', sign: '東海岸地標・台東成功三仙台', color: '#c0392b', accent: '#00a8ff' },
    { kind: 'SNACK', title: '🐟 新港漁港現切旗魚生魚片、鬼頭刀魚排＆東河包子攤', sign: '成功鏢旗魚・炸鬼頭刀・東河肉包', color: '#e67e22', accent: '#ffd32a' },
    { kind: 'ROCK_GEO', title: '🍄 石雨傘平衡岩海岬、男人石＆蔚藍太平洋海景', sign: '成功石雨傘海蝕平衡岩海岬', color: '#b89856', accent: '#0097e6' },
    { kind: 'OCEAN', title: '🌊 三仙台潔白鵝卵礫石海灘、林投樹＆浪濤拍岸海景', sign: '三仙台礫石海灣與太平洋白浪', color: '#0052a5', accent: '#ffffff' },
    { kind: 'ROCK_GEO', title: '🪨 都巒山層黑色火山角礫岩海蝕平台、仙劍峽＆合歡洞', sign: '火山角礫岩海蝕柱與海蝕溝', color: '#2d3436', accent: '#00cec9' },
    { kind: 'BRIDGE', title: '🌉 「三仙台八拱跨海步橋」如長龍躍向離岸三仙島', sign: '八拱波浪跨海大橋與三仙台島', color: '#ffffff', accent: '#e74c3c' }
  ],
  end_taroko: [
    { kind: 'PAIFANG', title: '⛩️ 太魯閣國家公園中橫公路入口大理石界碑牌樓', sign: '花蓮秀林・中橫公路太魯閣口', color: '#576574', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🍋 新城老街佳興檸檬汁、原民馬告香腸＆小米麻糬攤', sign: '新城佳興檸檬汁・馬告烤山豬肉香腸', color: '#27ae60', accent: '#ffeaa7' },
    { kind: 'OCEAN', title: '🌊 立霧溪出海口沖積扇＆崇德清水斷崖山海交界奇景', sign: '立霧溪出海口與太平洋山海景', color: '#0097e6', accent: '#7f8c8d' },
    { kind: 'BRIDGE', title: '🌉 大紅鋼拱「錦文橋」橫跨立霧溪碧水與白色大理石河床', sign: '太魯閣峽谷門戶・紅色錦文橋', color: '#e74c3c', accent: '#00cec9' },
    { kind: 'MOUNTAIN', title: '⛰️ 千仞灰白變質大理岩垂直峭壁＆中橫公路鑿岩明隧道', sign: '鬼斧神工・太魯閣大理石峽谷峭壁', color: '#7f8c8d', accent: '#ecf0f1' },
    { kind: 'PAIFANG', title: '🏮 「東西橫貫公路」太魯閣紅柱金瓦青綠彩繪宮殿牌坊', sign: '海拔60公尺・東西橫貫公路大牌坊', color: '#c0392b', accent: '#ffd32a' }
  ],
  end_alishan: [
    { kind: 'PAIFANG', title: '⛩️ 阿里山國家森林遊樂區檜木迎賓大牌樓', sign: '海拔2216M・嘉義阿里山森林遊樂區', color: '#8e281c', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🍱 奮起湖鐵路便當、現烤山葵香腸＆高山愛玉冰攤', sign: '奮起湖雙主菜便當・手洗野生愛玉', color: '#d35400', accent: '#ffeaa7' },
    { kind: 'MOUNTAIN', title: '☁️ 祝山觀日平台金色日出光芒＆翻騰壯闊雲海山景', sign: '阿里山五奇・祝山日出與壯闊雲海', color: '#f39c12', accent: '#ffffff' },
    { kind: 'BRIDGE', title: '🌸 沼平公園櫻之道天空步道＆吉野櫻花海滿開', sign: '阿里山櫻王・沼平櫻之道木棧道', color: '#fd79a8', accent: '#ffffff' },
    { kind: 'RAILWAY', title: '🚂 阿里山森林鐵路紅色小火車穿梭神木站與櫻花鐵道', sign: '之字形登山鐵道・阿里山紅火車', color: '#c0392b', accent: '#ffd32a' },
    { kind: 'FOREST', title: '🌲 三千年紅檜巨木群棧道、香林神木＆姊妹潭秘境', sign: '28棵千年紅檜・阿里山神木群', color: '#145a32', accent: '#2ecc71' }
  ],
  end_lanyang: [
    { kind: 'PAIFANG', title: '⛩️ 宜蘭頭城烏石港＆蘭陽博物館園區迎賓牌樓', sign: '宜蘭頭城・蘭陽博物館園區', color: '#006266', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🍨 頭城阿宗芋冰城、頂埔阿嬤蔥油餅＆烏石港吻仔魚羹攤', sign: '頭城阿宗叭噗芋冰・炸蛋三星蔥油餅', color: '#e67e22', accent: '#ffeaa7' },
    { kind: 'ARCADE', title: '🧱 開蘭第一街「頭城老街」紅磚拱廊古厝＆慶元宮街景', sign: '頭城和平老街紅磚拱廊與古井', color: '#a04000', accent: '#f1c40f' },
    { kind: 'OCEAN', title: '🏄 烏石港衝浪沙灘、賞鯨船碼頭＆外海「龜山島」海景', sign: '烏石港衝浪海灣與海上龜山島', color: '#0097e6', accent: '#2ecc71' },
    { kind: 'BRIDGE', title: '🌿 烏石港舊址濕地生態木棧道＆單面山礁岩鏡面倒影', sign: '烏石港春帆・濕地生態木棧道', color: '#16a085', accent: '#ecf0f1' },
    { kind: 'HERITAGE', title: '📐 20 度斜角自濕地拔地而起的「蘭陽博物館」單面山建築', sign: '北關單面山幾何建築・蘭陽博物館', color: '#2c3e50', accent: '#00f0ff' }
  ],
  end_penghu: [
    { kind: 'PAIFANG', title: '⛩️ 澎湖白沙鄉通梁村跨海大橋海島迎賓牌樓', sign: '菊島地標・澎湖跨海大橋', color: '#0052a5', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🌵 通梁保安宮前易家仙人掌冰、現炸花枝丸＆小管麵線攤', sign: '澎湖紫紅仙人掌冰・現炸大花枝丸', color: '#ff4d6d', accent: '#ffeaa7' },
    { kind: 'FOREST', title: '🌳 三百年「通梁古榕」66 根氣根綠蔭廊道＆保安宮紅瓦', sign: '樹齡300年・通梁保安宮大古榕', color: '#1e8449', accent: '#c0392b' },
    { kind: 'OCEAN', title: '🌺 澎湖玄武岩海岸、盛開天人菊花叢＆碧海藍天海景', sign: '澎湖縣花天人菊與玄武岩海岸', color: '#e67e22', accent: '#00a8ff' },
    { kind: 'BRIDGE', title: '🌊 吼門水道湍急湛藍海流、跨海箱型梁橋欄＆海鷗群', sign: '橫跨白沙與西嶼・吼門水道海景', color: '#0077b6', accent: '#ffffff' },
    { kind: 'PAIFANG', title: '🌉 純白半圓形「澎湖跨海大橋」金字大拱門＆漁翁島銅像', sign: '全長2494公尺・澎湖跨海大橋拱門', color: '#ffffff', accent: '#e74c3c' }
  ],
  // ================= 新增 12 個中途景點的 6 段式沿途景色（跑道左右兩邊由遠到近） =================
  dapengbay: [
    { kind: 'PAIFANG', title: '⛩️ 屏東東港「華僑市場」漁港迎賓大牌樓＆黑鮪魚雕塑', sign: '黑鮪魚故鄉・東港華僑市場牌樓', color: '#c0392b', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🍣 東港現切黑鮪魚生魚片、雙糕潤老店＆烤鮮蚵攤', sign: '東港黑鮪魚大腹・手工雙糕潤', color: '#e74c3c', accent: '#ffeaa7' },
    { kind: 'OCEAN', title: '🌿 大鵬灣囊狀潟湖紅樹林濕地、水上飛機觀景台＆白鷺鷥', sign: '台灣最大單口潟湖・大鵬灣濕地', color: '#0097e6', accent: '#2ecc71' },
    { kind: 'OCEAN', title: '⛵ 濱灣碼頭重型帆船基地、點點白帆＆遠方小琉球島影', sign: '大鵬灣帆船基地與小琉球海景', color: '#00a8ff', accent: '#ffffff' },
    { kind: 'SNACK', title: '🦐 東港櫻花蝦炒飯、旗魚黑輪＆炭烤大生蠔海產攤', sign: '國寶東港櫻花蝦・現炸旗魚黑輪', color: '#e67e22', accent: '#ffd32a' },
    { kind: 'BRIDGE', title: '🌉 全台唯一可開合之純白單塔斜張「鵬灣跨海大橋」鋼索塔', sign: '開啟式單塔斜張・鵬灣跨海大橋', color: '#ffffff', accent: '#00a8ff' }
  ],
  lotuspond: [
    { kind: 'PAIFANG', title: '⛩️ 高雄左營「蓮池潭風景區」古色古香迎賓大牌樓', sign: '高雄左營名勝・蓮池潭風景區', color: '#c0392b', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🍜 左營眷村刀削牛肉麵、老牌木瓜牛奶＆炭烤黑輪片攤', sign: '左營眷村刀削麵・大樹下烤黑輪', color: '#d35400', accent: '#ffeaa7' },
    { kind: 'OCEAN', title: '🪷 蓮池潭盛開粉紅荷花池、九曲橋漢白玉石欄杆＆垂柳湖景', sign: '泮水荷香・蓮池潭九曲橋荷花池', color: '#27ae60', accent: '#fd79a8' },
    { kind: 'MOUNTAIN', title: '⛰️ 隆起珊瑚礁「半屏山」翠綠山景＆北極亭玄天上帝水上巨像', sign: '半屏山麓與72尺玄天上帝神像', color: '#2ecc71', accent: '#f1c40f' },
    { kind: 'HERITAGE', title: '🧱 國定古蹟「左營舊城拱辰門」石砌城垣＆春秋閣雙宮殿', sign: '鳳山縣舊城北門・春秋閣五里亭', color: '#7f8c8d', accent: '#e74c3c' },
    { kind: 'PAIFANG', title: '🐉 張開大口的巨型彩繪「龍塔、虎塔」雙七層寶塔（入龍喉出虎口）', sign: '入龍喉出虎口・蓮池潭龍虎雙塔', color: '#e67e22', accent: '#2ecc71' }
  ],
  qigu: [
    { kind: 'PAIFANG', title: '⛩️ 台南七股鹽場「台灣鹽博物館」與白色鹽山入口牌樓', sign: '台灣曬鹽重鎮・台南七股鹽山', color: '#0984e3', accent: '#ffffff' },
    { kind: 'SNACK', title: '🍦 七股鹽山限定海鹽鹹冰棒、鹽焗大白蝦＆現烤虱目魚肚攤', sign: '七股藍藻鹹冰棒・粗鹽焗烤大蝦', color: '#00a8ff', accent: '#ffeaa7' },
    { kind: 'ARCADE', title: '⚙️ 傳統瓦盤曬鹽田、紅磚鹽工宿舍＆復古木製龍骨水車', sign: '三百年曬鹽史・瓦盤鹽田與水車', color: '#a04000', accent: '#ffffff' },
    { kind: 'OCEAN', title: '🦩 曾文溪口黑面琵鷺保護區紅樹林賞鳥亭＆夕陽潟湖海景', sign: '國際級濕地・黑面琵鷺賞鳥亭', color: '#e55039', accent: '#ffd32a' },
    { kind: 'WINDMILL', title: '❄️ 層層堆疊如阿爾卑斯雪山般的白色金字塔小鹽丘群', sign: '陽光閃耀雪白結晶・七股鹽丘群', color: '#dfe6e9', accent: '#74b9ff' },
    { kind: 'MOUNTAIN', title: '🏔️ 高達 20 公尺（六層樓高）的巨型雪白「七股鹽山」主峰地標', sign: '南台灣雪山奇景・七股鹽山主峰', color: '#ffffff', accent: '#f39c12' }
  ],
  npmsouth: [
    { kind: 'PAIFANG', title: '🛸 嘉義水上「北緯 23.5 度北回歸線太陽館」飛碟造型巨塔', sign: '北緯23度半・嘉義北回歸線太陽館', color: '#2980b9', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🍚 嘉義噴水火雞肉飯、林聰明砂鍋魚頭＆恩典方塊酥攤', sign: '正宗嘉義火雞肉飯・砂鍋魚頭', color: '#d35400', accent: '#ffeaa7' },
    { kind: 'HERITAGE', title: '🗼 歷代一至五代北回歸線白色紀念標塔群＆天文日晷廣場', sign: '1908年立標・歷代北回歸線標塔', color: '#ecf0f1', accent: '#e74c3c' },
    { kind: 'NATURE_WAVE', title: '🌾 嘉南平原翠綠甘蔗田、蒜頭糖廠五分車鐵道＆黃金稻浪', sign: '嘉南平原沃野・蒜頭糖廠五分車', color: '#2ecc71', accent: '#f1c40f' },
    { kind: 'BRIDGE', title: '🌉 橫跨至善湖面、宛如朱紅魔毯飛舞的「故宮南院至美橋」', sign: '雙弧跨湖紅橋・故宮南院至美橋', color: '#e74c3c', accent: '#ffffff' },
    { kind: 'HERITAGE', title: '🏛️ 融合書法濃墨、飛白與渲染曲線的「故宮博物院南部院區」主館', sign: '亞洲藝術文化博物館・故宮南院', color: '#2c3e50', accent: '#ffd32a' }
  ],
  duoliang: [
    { kind: 'RAILWAY', title: '🚦 台東太麻里「櫻木花道平交道」閃爍紅燈與太平洋海天一線', sign: '灌籃高手海景・太麻里平交道', color: '#e74c3c', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🫔 排灣族阿拜（小米粽）、炭烤山豬肉香腸＆洛神花冰沙攤', sign: '部落手作小米阿拜・太麻里洛神花', color: '#c0392b', accent: '#ffeaa7' },
    { kind: 'MOUNTAIN', title: '🌼 太麻里金針山滿山遍野黃金忘憂花海＆大武山雲海山景', sign: '日升之鄉・太麻里金針山金黃花海', color: '#f39c12', accent: '#2ecc71' },
    { kind: 'OCEAN', title: '🌊 南迴公路太平洋三色漸層牛奶藍海浪＆海崖觀景護欄', sign: '台9線南迴最美海岸・太平洋三色海', color: '#00a8e8', accent: '#ffffff' },
    { kind: 'CLIFF_TUNNEL', title: '🚇 多良一號山洞隧道口、垂直山壁與高架鐵道水泥巨柱', sign: '依山傍海高架鐵道・多良山洞隧道', color: '#7f8c8d', accent: '#f1c40f' },
    { kind: 'RAILWAY', title: '🚂 全台最美臨海「多良火車站」鮮紅鐵道欄杆月台與藍皮火車疾馳！', sign: '全台最美臨海月台・多良火車站', color: '#ff3838', accent: '#00a8ff' }
  ],
  beigang: [
    { kind: 'BRIDGE', title: '🌉 橫跨濁水溪、全長 1939 公尺的鮮紅鋼鐵桁架「西螺大橋」橋頭', sign: '遠東第一大橋・西螺大橋鮮紅鋼拱', color: '#e74c3c', accent: '#ffd32a' },
    { kind: 'ARCADE', title: '🧱 西螺延平老街昭和巴洛克紅磚鐘樓＆百年瑞春黑豆醬油甕陣', sign: '西螺延平歷史街區・百年甕釀醬油', color: '#a04000', accent: '#f1c40f' },
    { kind: 'SNACK', title: '🦆 北港老受鴨肉飯、廟邊假魚肚羹、黑麻油＆日興堂狀元餅攤', sign: '北港廟口鴨肉飯・冷壓黑麻油大餅', color: '#d35400', accent: '#ffeaa7' },
    { kind: 'BRIDGE', title: '🐉 北港觀光大橋紅色龍形拱橋＆巨型千里眼、順風耳神偶護駕', sign: '千里眼順風耳開路・北港迎媽祖', color: '#c0392b', accent: '#2ecc71' },
    { kind: 'FESTIVAL', title: '🧨 北港中山路滿街紅燈籠海、犁炮煙火陣＆進香團大旗', sign: '台灣媽祖信仰總本山・北港犁炮陣', color: '#ff3838', accent: '#ffd32a' },
    { kind: 'HERITAGE', title: '🏯 國定古蹟「北港朝天宮」四落八殿重簷燕尾與雙龍搶珠屋脊', sign: '國定古蹟・北港朝天宮媽祖廟', color: '#c0392b', accent: '#ffd32a' }
  ],
  ruisui: [
    { kind: 'PAIFANG', title: '⛩️ 花蓮瑞穗「舞鶴觀光茶園」巨型大茶壺地標與北回歸線迎賓牌', sign: '花東縱谷中段・花蓮瑞穗鄉', color: '#27ae60', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🥛 瑞穗牧場現蒸鮮奶饅頭、濃醇鮮乳酪、蜜香紅茶＆鶴岡文旦攤', sign: '瑞穗熱鮮奶饅頭・舞鶴蜜香紅茶', color: '#ffffff', accent: '#0984e3' },
    { kind: 'HERITAGE', title: '🗿 千年卑南文化巨石遺跡「掃叭石柱」與縱谷翠綠茶園山坡', sign: '三千年巨石文明・舞鶴掃叭石柱', color: '#7f8c8d', accent: '#2ecc71' },
    { kind: 'SHEEP', title: '🐄 瑞穗牧場白色木柵欄、風車穀倉＆悠閒吃草的黑白荷蘭乳牛群', sign: '純淨水源孕育・瑞穗牧場乳牛群', color: '#ffffff', accent: '#2d3436' },
    { kind: 'MOUNTAIN', title: '⛰️ 秀姑巒溪泛舟峽谷入口、紅葉溫泉山嵐與中央山脈翠綠山景', sign: '秀姑巒溪激流泛舟與中央山脈', color: '#16a085', accent: '#ffeaa7' },
    { kind: 'PAIFANG', title: '☀️ 純白高聳日晷窺陽塔造型「瑞穗北回歸線標碑」（北緯 23.5 度）', sign: '白色日晷窺陽塔・瑞穗北回歸線標', color: '#ffffff', accent: '#00a8ff' }
  ],
  shitiping: [
    { kind: 'PAIFANG', title: '⛩️ 花蓮豐濱「石梯坪風景區」東海岸奇岩迎賓石碑與石梯漁港', sign: '世界級地質教室・花蓮豐濱石梯坪', color: '#006266', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🐟 石梯港現烤飛魚、飛魚卵爆汁香腸、海菜吻仔魚湯＆麻糬攤', sign: '炭烤東海岸飛魚・爆汁飛魚卵香腸', color: '#d35400', accent: '#ffeaa7' },
    { kind: 'CLIFF_TUNNEL', title: '🌉 新機隧道峭壁外懸空透明強化玻璃「親不知子海上古道」', sign: '垂直海崖透明棧道・親不知子古道', color: '#00a8ff', accent: '#ffffff' },
    { kind: 'OCEAN', title: '🌊 太平洋巨浪拍擊海蝕溝與全台第一大「海蝕壺穴群」激起白浪', sign: '巨浪拍岸・石梯坪海蝕壺穴與潮間帶', color: '#0984e3', accent: '#ecf0f1' },
    { kind: 'HERITAGE', title: '⛺ 石梯坪海濱木造露營屋、月洞奇觀鐘乳石洞與賞鯨船碼頭', sign: '台灣賞鯨發源地・石梯漁港碼頭', color: '#2c3e50', accent: '#ffd32a' },
    { kind: 'MOUNTAIN', title: '🪨 高達 17 公尺的灰白色火山凝灰岩「石梯坪單面山」斜插進太平洋！', sign: '白色火山凝灰岩奇景・石梯坪單面山', color: '#dfe6e9', accent: '#00a8e8' }
  ],
  longteng: [
    { kind: 'PAIFANG', title: '⛩️ 苗栗三義「水美木雕老街」原木牌樓＆舊山線鐵道迎賓拱門', sign: '台灣木雕王國・苗栗三義舊山線', color: '#6e2c00', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🍵 三義客家擂茶、九層塔客家板條、艾草菜包＆桐花麻糬攤', sign: '現磨客家擂茶・三義油蔥手工板條', color: '#27ae60', accent: '#ffeaa7' },
    { kind: 'RAILWAY', title: '🚉 縱貫鐵路最高點「海拔 402.326 公尺勝興木造車站」與鐵道自行車', sign: '縱貫線最高點・百年木造勝興車站', color: '#5c2e14', accent: '#f1c40f' },
    { kind: 'FOREST', title: '🌼 四月雪「三義油桐花步道」滿地白花毯与山嵐雲霧森林', sign: '客庄四月雪・三義油桐花山林步道', color: '#2ecc71', accent: '#ffffff' },
    { kind: 'CLIFF_TUNNEL', title: '🚇 舊山線連續開鑿隧道群（二號隧道開天洞）與鯉魚潭水庫鐵橋', sign: '舊山線百年磚砌隧道・開天隧道口', color: '#7f8c8d', accent: '#e74c3c' },
    { kind: 'BRIDGE', title: '🧱 歷經 1935 與 1999 兩次大地震屹立山谷的紅磚古蹟「龍騰斷橋（魚藤坪斷橋）」', sign: '台灣鐵道藝術極品・三義龍騰斷橋', color: '#c0392b', accent: '#ffd32a' }
  ],
  qingshui: [
    { kind: 'PAIFANG', title: '🪨 蘇花公路崇德隧道口「台灣十景・清水斷崖」巨型大理石紀念碑', sign: '台灣八景之首・蘇花公路清水斷崖', color: '#2d3436', accent: '#ffd32a' },
    { kind: 'CLIFF_TUNNEL', title: '🚇 匯德與崇德連續臨海「明隧道」粗獷花崗片麻岩大石柱', sign: '蘇花公路臨海明隧道・千仞絕壁', color: '#7f8c8d', accent: '#f1c40f' },
    { kind: 'SNACK', title: '🍋 花蓮新城佳興冰果室檸檬汁、剝皮辣椒香腸＆原住民竹筒飯攤', sign: '新城佳興連皮檸檬汁・花蓮剝皮辣椒', color: '#27ae60', accent: '#ffeaa7' },
    { kind: 'OCEAN', title: '🛶 懸崖護欄外萬丈深淵的「三色蒂芬妮藍太平洋」與海上日出獨木舟', sign: '深海溝三色漸層海面・太平洋絕景', color: '#00a8e8', accent: '#00f0ff' },
    { kind: 'MOUNTAIN', title: '⛰️ 左側近乎 90 度垂直竄升 2408 公尺的「清水大山」大理石斷層峭壁', sign: '垂直落差2400公尺・清水山大斷崖', color: '#636e72', accent: '#ffffff' },
    { kind: 'CLIFF_TUNNEL', title: '🌊 崇德步道懸崖觀景台：左靠千仞絕壁、右臨太平洋驚濤拍岸！', sign: '山海交界世界奇觀・清水斷崖觀景台', color: '#0052a5', accent: '#ffd32a' }
  ],
  hsinchu_moat: [
    { kind: 'PAIFANG', title: '⛩️ 新竹百年信仰中心「新竹都城隍廟」紅金飛簷牌樓與大紅燈籠', sign: '全台位階最高・新竹都城隍廟', color: '#c0392b', accent: '#ffd32a' },
    { kind: 'SNACK', title: '🍲 城隍廟口海瑞大粒貢丸湯、九降風炊粉（炒米粉）＆紅糟肉圓攤', sign: '新竹三寶・大貢丸湯與炒米粉肉圓', color: '#e67e22', accent: '#ffeaa7' },
    { kind: 'ARCADE', title: '🧱 北門大街日式紅磚巴洛克古厝、新復珍竹塹餅老鋪＆水潤餅店', sign: '北門老街巴洛克洋樓・竹塹餅老鋪', color: '#a04000', accent: '#f1c40f' },
    { kind: 'OCEAN', title: '🌿 竹塹古護城河親水公園、翠綠垂柳河岸與石拱小橋', sign: '古竹塹城護城河・親水垂柳河岸', color: '#27ae60', accent: '#00a8ff' },
    { kind: 'HERITAGE', title: '🏛️ 日本時代古典紅磚官廳「新竹州廳（市政府）」與玻璃工藝館', sign: '國定古蹟和洋紅磚建築・新竹州廳', color: '#b03a2e', accent: '#ecf0f1' },
    { kind: 'PAIFANG', title: '🏯 1827 年建國定古蹟「竹塹城東門・迎曦門」重簷歇山頂紅磚石砌城樓！', sign: '竹塹古城地標・東門城迎曦門', color: '#c0392b', accent: '#ffd32a' }
  ],
  tamsui: [
    { kind: 'HERITAGE', title: '🏰 1644 年建三百餘年朱紅磚牆古蹟「淡水紅毛城」與英國領事館拱廊', sign: '國定古蹟・淡水紅毛城與領事館', color: '#c0392b', accent: '#ffffff' },
    { kind: 'SNACK', title: '🍦 淡水老街正宗阿給、阿婆鐵蛋、鮮奶酥脆魚酥＆巨無霸超高霜淇淋攤', sign: '淡水老街阿給鐵蛋・巨無霸霜淇淋', color: '#e67e22', accent: '#ffeaa7' },
    { kind: 'ARCADE', title: '🧱 淡水重建街山城石階、馬偕博士牛津學堂與海關碼頭紅磚倉庫', sign: '淡水海關碼頭紅磚洋樓與牛津學堂', color: '#a04000', accent: '#f1c40f' },
    { kind: 'OCEAN', title: '⛴️ 淡水河畔夕陽金色波光、藍色公路八里渡輪＆傳統木造舢舨船', sign: '淡水暮色・八里渡輪與金色河口', color: '#e55039', accent: '#ffd32a' },
    { kind: 'MOUNTAIN', title: '⛰️ 隔著淡水河口遠眺夕陽餘暉下的「八里觀音山」硬漢嶺輪廓', sign: '淡江夕照與對岸八里觀音山剪影', color: '#6c5ce7', accent: '#f39c12' },
    { kind: 'BRIDGE', title: '🌉 淡水漁人碼頭純白單塔風帆造型斜張「情人橋」與木棧道晚霞！', sign: '白色風帆斜張地標・淡水情人橋', color: '#ffffff', accent: '#ff7979' }
  ]
};

// 建立全域 STAGE_TREE 查詢表，並將 6 段式沿途小景點 (subSpots) 自動掛載至每一關
// 依使用者指定：「景點的排序，由南至北，由西到東」進行地理經緯度精確排序（共 38 處中途景點）！
const GEO_ORDER_SCENIC_IDS = [
  // 【第 1～2 區：極南端・屏東半島與西南外海（由南至北、由西到東）】
  'liuqiu',       // 1. 屏東小琉球花瓶岩 (22.35°N, 120.38°E - 極南西側外海)
  'dapengbay',    // 2. 屏東東港大鵬灣跨海大橋 (22.45°N, 120.48°E - 屏東西岸潟湖)
  'kenting_st',   // 3. 屏東墾丁大街 (21.94°N, 120.79°E - 極南西側海岸)
  'nanwan',       // 4. 屏東墾丁南灣遊憩區 (21.95°N, 120.76°E - 恆春熱帶金黃沙灘)
  'longpan',      // 5. 屏東墾丁龍磐公園 (21.92°N, 120.84°E - 極南東側太平洋崩崖)

  // 【第 3～4 區：高雄港都、台南古都鹽田與澎湖南海（由南至北、由西到東）】
  'qimei',        // 6. 澎湖七美雙心石滬 (23.20°N, 119.42°E - 台灣海峽極西端)
  'qigu',         // 7. 台南七股鹽山＆黑面琵鷺 (23.15°N, 120.10°E - 台南極西濱海鹽田)
  'anping',       // 8. 台南安平古堡與億載金城 (23.00°N, 120.16°E - 安平紅磚古堡砲台)
  'lotuspond',    // 9. 高雄左營蓮池潭龍虎塔 (22.68°N, 120.29°E - 高雄西側蓮池潭)
  'foguangshan',  // 10. 高雄佛光山佛陀紀念館 (22.75°N, 120.44°E - 高雄內陸丘陵)

  // 【第 5～6 區：嘉南平原、阿里山山脈與南迴／花東縱谷南段（由南至北、由西到東）】
  'npmsouth',     // 11. 嘉義故宮南院＆北回歸線館 (23.47°N, 120.29°E - 嘉南平原西側)
  'meishan',      // 12. 嘉義梅山太平雲梯 (23.56°N, 120.60°E - 海拔千米高山茶園雲梯)
  'duoliang',     // 13. 台東太麻里多良火車站 (22.50°N, 120.96°E - 南迴太平洋海岸)
  'guanshan',     // 14. 台東關山鎮 (23.04°N, 121.16°E - 花東縱谷南段偏西)
  'chishang',     // 15. 台東池上伯朗大道 (23.12°N, 121.21°E - 花東縱谷南段偏東)
  'jialulan',     // 16. 台東卑南加路蘭海岸 (22.81°N, 121.19°E - 東海岸漂流木藝術)

  // 【第 7～8 區：雲林濁水溪、台中西海岸至南投高山湖泊（由南至北、由西到東）】
  'beigang',      // 17. 雲林西螺大橋＆北港朝天宮 (23.56°N, 120.30°E - 雲林西部平原)
  'gaomei',       // 18. 台中高美濕地 (24.31°N, 120.55°E - 中部西海岸)
  'xitou',        // 19. 南投溪頭／杉林溪森林園區 (23.67°N, 120.79°E - 中部山區偏西)
  'sunmoonlake',  // 20. 南投日月潭國家風景區 (23.86°N, 120.91°E - 中部高山湖泊)
  'cingjing',     // 21. 南投清境農場 (24.05°N, 121.16°E - 中橫高山西段)
  'hehuanshan',   // 22. 合歡山暗空公園 (24.14°N, 121.27°E - 中橫最高點武嶺)

  // 【第 9～10 區：花東縱谷中北段、東海岸奇岩與蘇花絕壁（由南至北、由西到東）】
  'ruisui',       // 23. 花蓮瑞穗北回歸線＆牧場 (23.49°N, 121.36°E - 花東縱谷中段)
  'shitiping',    // 24. 花蓮豐濱石梯坪＆親不知子 (23.48°N, 121.51°E - 東海岸中段奇岩)
  'liyutan',      // 25. 花蓮壽豐鯉魚潭 (23.92°N, 121.50°E - 花蓮縱谷湖泊)
  'yunshanshui',  // 26. 花蓮壽豐雲山水夢幻湖 (23.83°N, 121.52°E - 落羽松跳石瀑布)
  'qixingtan',    // 27. 花蓮新城七星潭 (24.03°N, 121.63°E - 花蓮太平洋東岸)
  'qingshui',     // 28. 花蓮蘇花公路清水斷崖 (24.20°N, 121.67°E - 蘇花海岸絕壁)

  // 【第 11～13 區：苗竹山城、宜蘭高山、大台北河口與北海岸東北角（由南至北、由西到東）】
  'longteng',     // 29. 苗栗三義龍騰斷橋＆勝興站 (24.36°N, 120.77°E - 苗栗舊山線)
  'hsinchu_moat', // 30. 新竹東門城迎曦門＆城隍廟 (24.80°N, 120.97°E - 竹塹古城)
  'taipingshan',  // 31. 宜蘭太平山見晴懷古步道 (24.49°N, 121.53°E - 東北高山林道)
  'tamsui',       // 32. 新北淡水情人橋＆紅毛城 (25.18°N, 121.41°E - 台北河口西岸)
  'npm',          // 33. 台北故宮博物院 (25.10°N, 121.54°E - 台北盆地)
  'yangmingshan', // 34. 台北陽明山小油坑 (25.17°N, 121.54°E - 台北北端火山群)
  'matsu',        // 35. 馬祖藍眼淚 (26.16°N, 119.95°E - 極北西側外海列島)
  'yehliu',       // 36. 新北萬里野柳地質公園 (25.20°N, 121.69°E - 北海岸岬角)
  'shifen',       // 37. 新北平溪十分瀑布與老街 (25.04°N, 121.77°E - 東北山谷鐵道)
  'jiufen'        // 38. 新北瑞芳九份老街 (25.10°N, 121.84°E - 東北角極東山海城)
];

// 8 大終點（對應使用者上傳的 8 張終點構圖）依「由南至北，由西到東」地理順序排列
const GEO_ORDER_FINALE_IDS = [
  'end_eluanbi',    // 1. 屏東墾丁鵝鑾鼻燈塔 (極南端 21.90°N, 120.85°E)
  'end_penghu',     // 2. 澎湖跨海大橋 (西南外海 23.65°N, 119.55°E)
  'end_chihkan',    // 3. 台南赤嵌樓 (南部西岸 22.99°N, 120.20°E)
  'end_alishan',    // 4. 嘉義阿里山森林神木 (中南部高山 23.51°N, 120.80°E)
  'end_sanxiantai', // 5. 台東成功三仙台 (東南部太平洋岸 23.12°N, 121.41°E)
  'end_lukang',     // 6. 彰化鹿港天后宮 (中部西岸 24.05°N, 120.43°E)
  'end_baishatun',  // 7. 苗栗白沙屯拱天宮 (中北部西岸 24.57°N, 120.70°E)
  'end_taroko'      // 8. 花蓮太魯閣牌樓 (東部峽谷海岸 24.15°N, 121.62°E)
];

/**
 * 5 大天氣狀態與光影效果中英文設定表
 * - sunrise : 🌅 日出破曉（玫瑰金晨曦、破曉神聖光束 God Rays、路面暖金反射）
 * - sunny   : ☀️ 盛夏晴天（高飽和藍天、六角鏡頭光暈 Lens Flare、丁達爾陽光束、清晰斜影）
 * - sunset  : 🌇 魔幻日落（紫紅烈焰晚霞、逆光金邊剪影、路面黃金波光反光帶）
 * - rainy   : 🌧️ 斜風驟雨（鉛灰烏雲、雙層斜向雨絲、偶發閃電雷光、濕滑鏡面柏油倒影與輪胎水花）
 * - foggy   : 🌫️ 高山濃霧（流動山嵐雲霧帶、遠景深度霧化、開啟黃金破霧車頭遠光燈束與鮮紅尾燈）
 */
const WEATHER_TYPES_META = {
  sunrise: { id: 'sunrise', icon: '🌅', label: '日出破曉', desc: '晨曦金光束・雲海破曉' },
  sunny:   { id: 'sunny',   icon: '☀️', label: '盛夏晴天', desc: '耀眼驕陽・高對比光影' },
  sunset:  { id: 'sunset',  icon: '🌇', label: '魔幻日落', desc: '紫金晚霞・黃金路面反光' },
  rainy:   { id: 'rainy',   icon: '🌧️', label: '斜風驟雨', desc: '濕滑路面倒影・閃電水花' },
  foggy:   { id: 'foggy',   icon: '🌫️', label: '高山濃霧', desc: '雲霧繚繞・黃金破霧車燈' }
};

/**
 * 各景點「專屬綁定主天氣 (`primary`)」與「行駛途中隨機動態過渡天氣池 (`transitions`)」
 * 結合：
 * 1. 綁定最符合該景點特色的主天氣（如高美濕地/淡水固定日落、溪頭/陽明山起霧、九份/十分雨天、阿里山/三仙台日出）
 * 2. 行駛至關卡中段時，會隨機觸發平滑的「隨時間動態天氣變化」（如晴天開進山區漸漸起霧或下雨、晨霧散開迎來日出等）
 */
const STAGE_WEATHER_CONFIG = {
  // 起點
  fugang:         { primary: 'sunny',   transitions: ['sunset', 'rainy'] },

  // 極南與離島
  liuqiu:         { primary: 'sunset',  transitions: ['sunny', 'rainy'] },
  dapengbay:      { primary: 'sunny',   transitions: ['sunset', 'rainy'] },
  kenting_st:     { primary: 'sunset',  transitions: ['rainy', 'sunny'] },
  nanwan:         { primary: 'sunny',   transitions: ['sunrise', 'sunset'] },
  longpan:        { primary: 'sunrise', transitions: ['sunny', 'foggy'] },

  // 南部與澎湖
  qimei:          { primary: 'sunny',   transitions: ['sunset', 'sunrise'] },
  qigu:           { primary: 'sunset',  transitions: ['sunny', 'foggy'] },
  anping:         { primary: 'sunset',  transitions: ['sunny', 'rainy'] },
  lotuspond:      { primary: 'sunny',   transitions: ['sunset', 'rainy'] },
  foguangshan:    { primary: 'sunrise', transitions: ['sunny', 'foggy'] },

  // 嘉南、阿里山山脈、南迴與花東縱谷南段
  npmsouth:       { primary: 'sunny',   transitions: ['sunset', 'rainy'] },
  meishan:        { primary: 'sunset',  transitions: ['foggy', 'sunrise'] },
  duoliang:       { primary: 'sunrise', transitions: ['sunny', 'rainy'] },
  guanshan:       { primary: 'sunset',  transitions: ['sunny', 'rainy'] },
  chishang:       { primary: 'sunny',   transitions: ['sunset', 'rainy'] },
  jialulan:       { primary: 'sunrise', transitions: ['sunny', 'rainy'] },

  // 中部西岸至中央山脈
  beigang:        { primary: 'sunset',  transitions: ['sunny', 'rainy'] },
  gaomei:         { primary: 'sunset',  transitions: ['rainy', 'foggy'] },
  xitou:          { primary: 'foggy',   transitions: ['rainy', 'sunny'] },
  sunmoonlake:    { primary: 'rainy',   transitions: ['foggy', 'sunrise'] },
  cingjing:       { primary: 'sunny',   transitions: ['foggy', 'rainy'] },
  hehuanshan:     { primary: 'sunrise', transitions: ['foggy', 'sunny'] },

  // 花東縱谷北段、東海岸與蘇花絕壁
  ruisui:         { primary: 'sunny',   transitions: ['foggy', 'rainy'] },
  shitiping:      { primary: 'rainy',   transitions: ['sunny', 'foggy'] },
  liyutan:        { primary: 'foggy',   transitions: ['sunrise', 'sunny'] },
  yunshanshui:    { primary: 'sunny',   transitions: ['foggy', 'rainy'] },
  qixingtan:      { primary: 'sunrise', transitions: ['sunny', 'sunset'] },
  qingshui:       { primary: 'sunny',   transitions: ['sunrise', 'foggy'] },

  // 北部苗竹、宜蘭高山、大台北與東北角
  longteng:       { primary: 'foggy',   transitions: ['sunny', 'rainy'] },
  hsinchu_moat:   { primary: 'sunset',  transitions: ['sunny', 'rainy'] },
  taipingshan:    { primary: 'foggy',   transitions: ['rainy', 'sunrise'] },
  tamsui:         { primary: 'sunset',  transitions: ['rainy', 'sunny'] },
  npm:            { primary: 'sunny',   transitions: ['rainy', 'sunset'] },
  yangmingshan:   { primary: 'foggy',   transitions: ['rainy', 'sunrise'] },
  matsu:          { primary: 'foggy',   transitions: ['rainy', 'sunrise'] },
  yehliu:         { primary: 'sunny',   transitions: ['sunset', 'rainy'] },
  shifen:         { primary: 'rainy',   transitions: ['foggy', 'sunset'] },
  jiufen:         { primary: 'rainy',   transitions: ['foggy', 'sunset'] },

  // 8 大終點
  end_eluanbi:    { primary: 'sunny',   transitions: ['sunset'] },
  end_penghu:     { primary: 'sunny',   transitions: ['sunset'] },
  end_chihkan:    { primary: 'sunset',  transitions: ['sunny'] },
  end_alishan:    { primary: 'sunrise', transitions: ['foggy'] },
  end_sanxiantai: { primary: 'sunrise', transitions: ['sunny'] },
  end_lukang:     { primary: 'sunset',  transitions: ['sunny'] },
  end_baishatun:  { primary: 'sunset',  transitions: ['sunny'] },
  end_taroko:     { primary: 'sunny',   transitions: ['foggy'] },
  end_lanyang:    { primary: 'rainy',   transitions: ['sunny'] }
};

const rawStageMap = {
  fugang: START_STAGE_DATA
};
SCENIC_STAGES_LIST.forEach((s) => {
  rawStageMap[s.id] = s;
});
FINALE_STAGES_LIST.forEach((f) => {
  rawStageMap[f.id] = f;
});

// 重新依「由南至北、由西到東」覆寫 SCENIC_STAGES_LIST 與 FINALE_STAGES_LIST 順序
SCENIC_STAGES_LIST.length = 0;
GEO_ORDER_SCENIC_IDS.forEach((id, idx) => {
  if (rawStageMap[id]) {
    rawStageMap[id].geoOrder = idx + 1;
    SCENIC_STAGES_LIST.push(rawStageMap[id]);
  }
});

FINALE_STAGES_LIST.length = 0;
GEO_ORDER_FINALE_IDS.forEach((id, idx) => {
  if (rawStageMap[id]) {
    rawStageMap[id].geoOrder = idx + 1;
    FINALE_STAGES_LIST.push(rawStageMap[id]);
  }
});

const STAGE_TREE = {
  fugang: START_STAGE_DATA
};
SCENIC_STAGES_LIST.forEach((s) => {
  STAGE_TREE[s.id] = s;
});
FINALE_STAGES_LIST.forEach((f) => {
  STAGE_TREE[f.id] = f;
});
if (rawStageMap.end_lanyang) {
  STAGE_TREE.end_lanyang = rawStageMap.end_lanyang;
}
Object.keys(STAGE_TREE).forEach((k) => {
  const st = STAGE_TREE[k];
  st.subSpots = STAGE_SUBSPOTS_MAP[k] || STAGE_SUBSPOTS_MAP.fugang;
  const wCfg = STAGE_WEATHER_CONFIG[k] || { primary: 'sunny', transitions: ['sunset', 'rainy'] };
  st.weather = wCfg.primary;
  st.dynamicWeathers = wCfg.transitions;
});

/**
 * 台灣地理順序環島路線管理器（15 關 × 每關 20 秒 ＝ 全程 5 分鐘）：
 * - 第 1 關固定為「桃園富岡火車站」（20 秒）
 * - 第 2 ~ 14 關（共 13 個中途景點區段）：將 38 個景點依「由南至北、由西到東」分為 13 個地理推進區段，
 *   每一關的分岔口提供該地理區段的兩個景點，且左道固定為「偏西／靠南」、右道固定為「偏東／靠北」！
 * - 第 15 關（最終關）：從 8 大終點抽出西岸／南端終點（左道）與高山／東岸終點（右道）供玩家決戰衝線！
 */
class TaiwanRouteManager {
  constructor() {
    this.totalStages = 15; // 1 (起點) + 13 (由南至北、由西到東中途景點) + 1 (終點) = 15 關 (全程 5 分鐘)
    this.resetRoute();
  }

  shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  resetRoute() {
    // 將已按「由南至北、由西到東」排序的 38 個中途景點劃分為 13 個循序漸進的地理緯度/經度區段 (第 2 關 ~ 第 14 關)
    const tiers = [
      ['liuqiu', 'dapengbay', 'kenting_st'],          // 第 2 關：小琉球 ➔ 東港大鵬灣跨海大橋 ➔ 墾丁大街
      ['nanwan', 'longpan', 'duoliang'],              // 第 3 關：墾丁南灣沙灘 ➔ 龍磐崩崖 ➔ 台東太麻里多良火車站
      ['qimei', 'qigu', 'anping'],                    // 第 4 關：澎湖七美 ➔ 台南七股鹽山 ➔ 台南安平古堡與億載金城
      ['lotuspond', 'foguangshan', 'npmsouth'],       // 第 5 關：高雄蓮池潭龍虎塔 ➔ 佛光山大佛 ➔ 嘉義故宮南院與北回歸線館
      ['meishan', 'guanshan', 'chishang', 'jialulan'], // 第 6 關：梅山太平雲梯 ➔ 關山 ➔ 池上伯朗大道 ➔ 台東加路蘭海岸
      ['beigang', 'gaomei', 'xitou'],                 // 第 7 關：雲林西螺大橋/北港朝天宮 ➔ 台中高美濕地 ➔ 溪頭妖怪村
      ['sunmoonlake', 'cingjing', 'hehuanshan'],      // 第 8 關：日月潭 ➔ 清境農場 ➔ 合歡山武嶺
      ['ruisui', 'shitiping', 'liyutan'],             // 第 9 關：花蓮瑞穗北回歸線與牧場 ➔ 石梯坪單面山 ➔ 壽豐鯉魚潭
      ['yunshanshui', 'qixingtan', 'qingshui'],       // 第 10 關：壽豐雲山水夢幻湖 ➔ 七星潭月牙灣 ➔ 蘇花公路清水斷崖
      ['longteng', 'hsinchu_moat', 'taipingshan'],    // 第 11 關：苗栗三義龍騰斷橋 ➔ 新竹東門城與城隍廟 ➔ 宜蘭太平山
      ['tamsui', 'npm', 'yangmingshan'],              // 第 12 關：新北淡水情人橋与紅毛城 ➔ 台北故宮 ➔ 陽明山小油坑
      ['matsu', 'yehliu'],                            // 第 13 關：馬祖藍眼淚 ➔ 萬里野柳女王頭
      ['shifen', 'jiufen']                            // 第 14 關：平溪十分瀑布天燈 ➔ 瑞芳九份山城
    ];

    this.stagePairs = tiers.map((tierIds) => {
      // 從該區段隨機挑出 2 個景點，並保持「左道 = 偏西/偏南 (索引較小)、右道 = 偏東/偏北 (索引較大)」
      const indices = [];
      for (let i = 0; i < tierIds.length; i++) indices.push(i);
      const picked = this.shuffleArray(indices).slice(0, 2).sort((a, b) => a - b);
      return {
        leftId: tierIds[picked[0]],
        rightId: tierIds[picked[1]]
      };
    });

    // 備份完整由南至北、由西到東清單供景點回顧補齊使用
    this.scenicPool = GEO_ORDER_SCENIC_IDS.slice();

    // 第 15 關終點分岔（共 8 個上傳終點構圖）：左道為西部/南部終點，右道為高山/東部終點
    const westSouthFinales = ['end_eluanbi', 'end_penghu', 'end_chihkan', 'end_lukang', 'end_baishatun'];
    const eastNorthFinales = ['end_alishan', 'end_sanxiantai', 'end_taroko'];
    this.finalePair = {
      leftId: this.shuffleArray(westSouthFinales)[0],
      rightId: this.shuffleArray(eastNorthFinales)[0]
    };
    this.finalePool = [this.finalePair.leftId, this.finalePair.rightId];

    this.visitedHistory = ['fugang'];
    this.visitedIds = this.visitedHistory;
    this.currentForkPair = this.drawNextPairForStage(2);
  }

  /**
   * 根據即將進入的關卡編號 (nextStageNumber: 2..15) 取出符合「由南至北、由西到東」的左右分岔路景點 ID
   */
  drawNextPairForStage(nextStageNumber) {
    if (nextStageNumber >= this.totalStages) {
      return this.finalePair;
    }
    const pairIdx = Math.max(0, Math.min(this.stagePairs.length - 1, nextStageNumber - 2));
    return this.stagePairs[pairIdx];
  }

  recordStageEnter(stageId, stageNumber) {
    this.visitedHistory.push(stageId);
    this.visitedIds = this.visitedHistory;
    if (stageNumber < this.totalStages) {
      this.currentForkPair = this.drawNextPairForStage(stageNumber + 1);
    }
  }
}

window.WEATHER_TYPES_META = WEATHER_TYPES_META;
window.STAGE_WEATHER_CONFIG = STAGE_WEATHER_CONFIG;
window.STAGE_SUBSPOTS_MAP = STAGE_SUBSPOTS_MAP;
window.START_STAGE_DATA = START_STAGE_DATA;
window.SCENIC_STAGES_LIST = SCENIC_STAGES_LIST;
window.FINALE_STAGES_LIST = FINALE_STAGES_LIST;
window.STAGE_TREE = STAGE_TREE;
window.routeManager = new TaiwanRouteManager();
