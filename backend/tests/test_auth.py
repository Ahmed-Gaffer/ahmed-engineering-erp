import pytest


class TestAuth:
    """Success: register (admin-only), login, me, token rejection."""

    @pytest.mark.asyncio
    async def test_register_as_admin(self, client, admin_token):
        resp = await client.post("/api/auth/register", json={
            "username": "engineer1", "email": "eng@test.com",
            "password": "pass123", "role": "engineer",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["role"] == "engineer"

    @pytest.mark.asyncio
    async def test_register_anonymous_rejected_when_users_exist(self, client):
        resp = await client.post("/api/auth/register", json={
            "username": "hacker", "email": "hack@test.com",
            "password": "pass123",
        })
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_register_duplicate(self, client, admin_token):
        resp = await client.post("/api/auth/register", json={
            "username": "testadmin", "email": "dup@test.com",
            "password": "pass123",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 400

    @pytest.mark.asyncio
    async def test_login(self, client, admin_token):
        await client.post("/api/auth/register", json={
            "username": "logintest", "email": "login@test.com",
            "password": "pass123", "role": "admin",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        resp = await client.post("/api/auth/login", json={
            "username": "logintest", "password": "pass123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["username"] == "logintest"

    @pytest.mark.asyncio
    async def test_login_bad_password(self, client):
        resp = await client.post("/api/auth/login", json={
            "username": "nonexistent", "password": "wrong",
        })
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_login_returns_refresh_token(self, client, admin_token):
        resp = await client.post("/api/auth/login", json={
            "username": "testadmin", "password": "admin123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "refresh_token" in data

    @pytest.mark.asyncio
    async def test_refresh_token_works(self, client, admin_token):
        resp = await client.post("/api/auth/login", json={
            "username": "testadmin", "password": "admin123",
        })
        assert resp.status_code == 200
        refresh_token = resp.json()["refresh_token"]
        resp2 = await client.post("/api/auth/refresh", json={
            "refresh_token": refresh_token,
        })
        assert resp2.status_code == 200
        data = resp2.json()
        assert "access_token" in data
        assert "refresh_token" in data

    @pytest.mark.asyncio
    async def test_refresh_with_access_token_rejected(self, client, admin_token):
        resp = await client.post("/api/auth/refresh", json={
            "refresh_token": admin_token,
        })
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_logout_blacklists_token(self, client, admin_token):
        resp = await client.post("/api/auth/logout", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        resp2 = await client.get("/api/auth/me", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp2.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_logout_no_token(self, client):
        resp = await client.post("/api/auth/logout")
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_me(self, client, admin_token):
        resp = await client.get("/api/auth/me", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        assert resp.json()["id"] > 0

    @pytest.mark.asyncio
    async def test_me_no_token(self, client):
        resp = await client.get("/api/auth/me")
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_me_bad_token(self, client):
        resp = await client.get("/api/auth/me", headers={
            "Authorization": "Bearer invalidtoken123",
        })
        assert resp.status_code == 401
