import urllib.request, json

# Frontend
r = urllib.request.urlopen("http://localhost:3000")
print("Frontend HTML:", r.status, len(r.read()), "bytes")

# Backend health
r = urllib.request.urlopen("http://localhost:8008/api/health")
print("Backend health:", r.status, r.read().decode())

# Auth
req = urllib.request.Request(
    "http://localhost:8008/api/auth/login",
    data=json.dumps({"username": "admin", "password": "admin123"}).encode(),
    headers={"Content-Type": "application/json"},
)
r = urllib.request.urlopen(req)
t = json.loads(r.read())["access_token"]
print("Auth login: OK, token:", t[:30])

# Data access
req = urllib.request.Request(
    "http://localhost:8008/api/contractors/",
    headers={"Authorization": f"Bearer {t}"},
)
r = urllib.request.urlopen(req)
d = json.loads(r.read())
print(f"Contractors: {d['total']} items")

req = urllib.request.Request(
    "http://localhost:8008/api/projects/",
    headers={"Authorization": f"Bearer {t}"},
)
r = urllib.request.urlopen(req)
d = json.loads(r.read())
print(f"Projects: {d['total']} items")

req = urllib.request.Request(
    "http://localhost:8008/api/work-orders/",
    headers={"Authorization": f"Bearer {t}"},
)
r = urllib.request.urlopen(req)
d = json.loads(r.read())
print(f"Work Orders: {d['total']} items")

print("\n ALL SYSTEMS OPERATIONAL - http://localhost:3000")
print(" Login: admin / admin123")
