import os, json

brain_dir = r"C:\Users\kms\.gemini\antigravity-ide\brain"
for root, _, files in os.walk(brain_dir):
    if "transcript_full.jsonl" in files:
        file_path = os.path.join(root, "transcript_full.jsonl")
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        data = json.loads(line)
                        content = data.get("content", "")
                        if "안드로이드 스튜디오" in content or "Android Studio" in content:
                            if "방금 안드로이드 스튜디오 실행 방법 답변한 대화" in content:
                                continue
                            print("----------------------------------------")
                            print(f"[{data.get('type')}]")
                            print(content.strip())
                    except:
                        pass
        except:
            pass
