import pytest


class TestContractorsCRUD:
    """Success: CRUD cycle on contractors (representative entity)."""

    @pytest.mark.asyncio
    async def test_create_contractor(self, client, admin_token):
        resp = await client.post("/api/contractors/", json={
            "code": "CON-T01", "name": "Test Contractor",
            "classification": "أ", "status": "active",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert resp.json()["code"] == "CON-T01"

    @pytest.mark.asyncio
    async def test_list_contractors(self, client, admin_token):
        resp = await client.get("/api/contractors/", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "total" in data
        assert data["page"] == 1

    @pytest.mark.asyncio
    async def test_list_contractors_pagination(self, client, admin_token):
        for i in range(5):
            await client.post("/api/contractors/", json={
                "code": f"CON-PG{i}", "name": f"Contractor {i}",
                "classification": "ب", "status": "active",
            }, headers={"Authorization": f"Bearer {admin_token}"})
        resp = await client.get("/api/contractors/?page=1&limit=3", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["items"]) <= 3
        assert data["total"] >= 5
        assert data["pages"] >= 2

    @pytest.mark.asyncio
    async def test_search_contractors(self, client, admin_token):
        await client.post("/api/contractors/", json={
            "code": "CON-SRCH", "name": "Alpha Search Corp",
            "classification": "أ", "status": "active",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        resp = await client.get("/api/contractors/?search=Alpha", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        items = resp.json()["items"]
        assert any("Alpha" in i["name"] for i in items)

    @pytest.mark.asyncio
    async def test_get_contractor(self, client, admin_token):
        created = await client.post("/api/contractors/", json={
            "code": "CON-GET", "name": "Get Test",
            "classification": "ج", "status": "active",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        cid = created.json()["id"]
        resp = await client.get(f"/api/contractors/{cid}", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        assert resp.json()["name"] == "Get Test"

    @pytest.mark.asyncio
    async def test_get_contractor_404(self, client, admin_token):
        resp = await client.get("/api/contractors/99999", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_update_contractor(self, client, admin_token):
        created = await client.post("/api/contractors/", json={
            "code": "CON-UPD", "name": "Before Update",
            "classification": "أ", "status": "active",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        cid = created.json()["id"]
        resp = await client.put(f"/api/contractors/{cid}", json={
            "name": "After Update",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert resp.json()["name"] == "After Update"

    @pytest.mark.asyncio
    async def test_delete_contractor(self, client, admin_token):
        created = await client.post("/api/contractors/", json={
            "code": "CON-DEL", "name": "To Delete",
            "classification": "د", "status": "active",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        cid = created.json()["id"]
        resp = await client.delete(f"/api/contractors/{cid}", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        resp2 = await client.get(f"/api/contractors/{cid}", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp2.status_code == 404

    @pytest.mark.asyncio
    async def test_bulk_delete(self, client, admin_token):
        ids = []
        for i in range(3):
            r = await client.post("/api/contractors/", json={
                "code": f"CON-BD{i}", "name": f"Bulk {i}",
                "classification": "أ", "status": "active",
            }, headers={"Authorization": f"Bearer {admin_token}"})
            ids.append(r.json()["id"])
        resp = await client.post("/api/contractors/bulk-delete", json={
            "ids": ids,
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert resp.json()["deleted"] == 3

    @pytest.mark.asyncio
    async def test_crud_requires_auth(self, client):
        resp = await client.get("/api/contractors/")
        assert resp.status_code in (401, 403)
