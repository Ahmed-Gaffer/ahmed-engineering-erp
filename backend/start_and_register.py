import subprocess, sys, time, httpx, asyncio

proc = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
    cwd=r"E:\خاص احمد جعفر\برمجة\مشاريع\engineering-management-system-3\backend",
    env={"PYTHONPATH": r"E:\خاص احمد جعفر\برمجة\مشاريع\engineering-management-system-3\backend"},
    stdout=subprocess.PIPE, stderr=subprocess.STDOUT
)

# Wait for server
import re
for _ in range(30):
    line = proc.stdout.readline().decode("utf-8", errors="replace")
    print(line, end="")
    if "Application startup complete" in line:
        break
    time.sleep(0.5)

print("\n--- Server started, registering admin ---")

async def setup():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as c:
        r = await c.post("/api/auth/register", json={"username": "admin", "email": "admin@negida.com", "password": "admin123", "role": "admin"})
        print("Register:", r.status_code, r.json() if r.status_code != 200 else r.json().get("username"))
        r = await c.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
        if r.status_code == 200:
            token = r.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            r = await c.get("/api/company-profile/current", headers=headers)
            d = r.json()
            print(f"Profile: {d.get('company_name_ar')}")
            print(f"Phone: {d.get('phone')}")
        else:
            print("Login failed:", r.json())

asyncio.run(setup())
proc.terminate()
