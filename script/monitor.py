import csv
import os
import time
from threading import Lock, Thread
import requests
from dotenv import load_dotenv
from pynput import keyboard, mouse

# .envファイルを読み込む
load_dotenv()

# ================= 設定エリア =================
API_URL = "https://volt-ruby.vercel.app/api/activity-log"
API_KEY = os.getenv("ACTIVITY_API_KEY")

# 送信間隔 (秒) - 10分 = 600秒
INTERVAL = 600

# 1分ごとのログ間隔
LOG_INTERVAL = 60

# CSVログの保存先
LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "activity_log.csv")
# ============================================

# カウンターとロック
lock = Lock()
interval_stats = {"keystrokes": 0, "clicks": 0}
minute_stats = {"keystrokes": 0, "clicks": 0}

# 最後に送信した時刻
last_send_time = time.time()

# --- 入力検知関数 ---
def on_press(key):
    with lock:
        interval_stats["keystrokes"] += 1
        minute_stats["keystrokes"] += 1

def on_click(x, y, button, pressed):
    if pressed:
        with lock:
            interval_stats["clicks"] += 1
            minute_stats["clicks"] += 1

# --- 送信ロジック（共通化） ---
def send_payload(force=False):
    """
    溜まっているデータを送信する関数
    force=True の場合はカウントが0でも送信処理を試みる（終了時など）
    """
    global last_send_time
    
    # 送信データを取得して一時的に保持
    with lock:
        current_keys = interval_stats["keystrokes"]
        current_clicks = interval_stats["clicks"]
    
    # データが0なら送らない（ただしforce=Trueならログ出すなど調整可）
    if current_keys == 0 and current_clicks == 0:
        # 時間だけ更新しておく
        last_send_time = time.time()
        return

    # 送信処理
    try:
        payload = {"keystrokes": current_keys, "clicks": current_clicks}
        headers = {
            "x-api-key": API_KEY,
            "Content-Type": "application/json"
        }
        
        print(f"[{time.strftime('%H:%M')}] 送信試行... (Keys: {current_keys}, Clicks: {current_clicks})")
        response = requests.post(API_URL, json=payload, headers=headers, timeout=10) # タイムアウト設定
        
        if response.status_code == 200:
            print(" -> 送信成功！カウンタをリセットします。")
            # 送信成功時のみ、カウントを減算（リセット）する
            with lock:
                interval_stats["keystrokes"] -= current_keys
                interval_stats["clicks"] -= current_clicks
            last_send_time = time.time()
        else:
            print(f" -> エラー: {response.status_code} {response.text}")
            print(" -> データを保持し、次回まとめて送信します。")
            
    except Exception as e:
        print(f" -> 通信エラー（スリープ復帰直後等の可能性）: {e}")
        print(" -> データを保持し、次回まとめて送信します。")

# --- 定期送信ループ（スマート監視） ---
def send_data_loop():
    global last_send_time
    while True:
        # 1秒ごとにチェック（スリープ対策）
        time.sleep(1)
        
        # 前回の送信から INTERVAL 秒以上経過していたら送信
        if time.time() - last_send_time >= INTERVAL:
            send_payload()

# --- CSV記録ループ ---
def log_minute_stats_loop():
    while True:
        time.sleep(LOG_INTERVAL)
        with lock:
            keys = minute_stats["keystrokes"]
            clicks = minute_stats["clicks"]
            minute_stats["keystrokes"] = 0
            minute_stats["clicks"] = 0

        timestamp = time.strftime("%Y-%m-%d %H:%M")
        # コンソールがうるさければコメントアウトしてください
        # print(f"[{timestamp}] 1分ログ -> K: {keys}, C: {clicks}") 
        try:
            file_exists = os.path.isfile(LOG_FILE)
            with open(LOG_FILE, mode="a", newline="") as csvfile:
                writer = csv.writer(csvfile)
                if not file_exists:
                    writer.writerow(["timestamp", "keystrokes", "clicks"])
                writer.writerow([timestamp, keys, clicks])
        except Exception as e:
            print(f" -> CSV書き込みエラー: {e}")

# --- メイン処理 ---
def start_monitoring():
    if not API_KEY:
        print("エラー: .envファイルに ACTIVITY_API_KEY が設定されていません。")
        return

    print("========================================")
    print(f"監視を開始しました: {API_URL}")
    print(f"送信間隔: {INTERVAL}秒 (スリープ対応版)")
    print("停止するには Ctrl+C を押してください")
    print("========================================")

    # スレッド開始
    sender = Thread(target=send_data_loop, daemon=True)
    sender.start()
    minute_logger = Thread(target=log_minute_stats_loop, daemon=True)
    minute_logger.start()

    # キーボードとマウスの監視
    # try...finally ブロックで、終了時に必ず送信を試みる
    try:
        with keyboard.Listener(on_press=on_press) as k_listener, \
             mouse.Listener(on_click=on_click) as m_listener:
            k_listener.join()
            m_listener.join()
    except KeyboardInterrupt:
        print("\n停止シグナル検知。終了処理中...")
    finally:
        print("未送信データを送信しています...")
        send_payload(force=True)
        print("監視を終了します。")

if __name__ == "__main__":
    start_monitoring()