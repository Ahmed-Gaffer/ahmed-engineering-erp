"""Start the backend server and verify it works."""
import multiprocessing, time, urllib.request, json, os, sys

os.environ["PYTHONPATH"] = os.path.dirname(os.path.abspath(__file__))


def run_server():
    import uvicorn
    from app.main import app
    uvicorn.run(app, host="0.0.0.0", port=8008, log_level="info")


if __name__ == "__main__":
    p = multiprocessing.Process(target=run_server, daemon=True)
    p.start()
    time.sleep(5)

    # Health
    r = urllib.request.urlopen("http://localhost:8008/api/health")
    print("Health:", r.status, r.read().decode())

    # Login
    req = urllib.request.Request(
        "http://localhost:8008/api/auth/login",
        data=json.dumps({"username": "admin", "password": "admin123"}).encode(),
        headers={"Content-Type": "application/json"},
    )
    r = urllib.request.urlopen(req)
    token = json.loads(r.read())["access_token"]
    print("Login OK, token:", token[:30])

    # Contractors
    req = urllib.request.Request(
        "http://localhost:8008/api/contractors/",
        headers={"Authorization": f"Bearer {token}"},
    )
    r = urllib.request.urlopen(req)
    data = json.loads(r.read())
    print(f"Contractors: {data['total']} items")

    # Projects
    req = urllib.request.Request(
        "http://localhost:8008/api/projects/",
        headers={"Authorization": f"Bearer {token}"},
    )
    r = urllib.request.urlopen(req)
    data = json.loads(r.read())
    print(f"Projects: {data['total']} items")

    print()
    print("=== BACKEND RUNNING at http://localhost:8008 ===")
    print("=== Login: admin / admin123 ===")
    p.join()
