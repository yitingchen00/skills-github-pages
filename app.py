from flask import Flask, render_template, request, redirect, url_for, jsonify
import json
from pathlib import Path

app = Flask(__name__)
DATA_FILE = Path("static/calendar_events.json")

@app.route("/")
def home():
    return redirect(url_for("login"))

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        name = request.form.get("username")
        gmail = request.form.get("gmail")
        if name and gmail:
            # 將姓名與 Gmail 當網址參數導向首頁
            return redirect(url_for("calendar", username=name, gmail=gmail))
        else:
            return render_template("login.html", error="請輸入完整資訊")
    return render_template("login.html")
@app.route("/friend")
def friend():
    return render_template("friend.html")

@app.route("/calendar")
def calendar():
    # 使用者資訊透過 URL 傳遞，不會儲存
    return render_template("family_calendar.html")

@app.route("/todo")
def todo():
    return render_template("family_todo.html")

@app.route("/info")
def info():
    return render_template("family_info.html")

@app.route("/events", methods=["GET"])
def get_events():
    if DATA_FILE.exists():
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            events = json.load(f)
    else:
        events = []
    return jsonify(events)

@app.route("/events", methods=["POST"])
def add_event():
    data = request.json
    if not DATA_FILE.exists():
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump([data], f, ensure_ascii=False, indent=2)
    else:
        with open(DATA_FILE, "r+", encoding="utf-8") as f:
            events = json.load(f)
            events.append(data)
            f.seek(0)
            json.dump(events, f, ensure_ascii=False, indent=2)
    return jsonify({"message": "活動已儲存"}), 201

if __name__ == "__main__":
    app.run(debug=True)
