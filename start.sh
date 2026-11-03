#!/usr/bin/env bash
cd "$(dirname "$0")"
echo "🚀 正在啟動 TaiwanOutRun 台灣瘋狂大賽車 Web 服務..."
echo "👉 請在瀏覽器開啟： http://localhost:8080"
echo "（按 Ctrl + C 可停止服務）"
python3 -m http.server 8080
