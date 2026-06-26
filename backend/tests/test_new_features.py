import pytest


class TestEmployeesCRUD:
    """CRUD cycle on employees (new entity, 4-file pattern)."""

    @pytest.mark.asyncio
    async def test_create_employee(self, client, admin_token):
        resp = await client.post("/api/employees/", json={
            "employee_code": "EMP001", "full_name": "Ahmed Ali",
            "position": "مهندس مدني", "department": "الهندسة",
            "status": "active",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert resp.json()["employee_code"] == "EMP001"

    @pytest.mark.asyncio
    async def test_list_employees(self, client, admin_token):
        resp = await client.get("/api/employees/", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert data["page"] == 1

    @pytest.mark.asyncio
    async def test_get_employee(self, client, admin_token):
        created = await client.post("/api/employees/", json={
            "employee_code": "EMP-GET", "full_name": "Get Test",
            "department": "إدارة", "status": "active",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        eid = created.json()["id"]
        resp = await client.get(f"/api/employees/{eid}", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        assert resp.json()["full_name"] == "Get Test"

    @pytest.mark.asyncio
    async def test_update_employee(self, client, admin_token):
        created = await client.post("/api/employees/", json={
            "employee_code": "EMP-UPD", "full_name": "Before",
            "department": "مبيعات", "status": "active",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        eid = created.json()["id"]
        resp = await client.put(f"/api/employees/{eid}", json={
            "full_name": "After Update",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert resp.json()["full_name"] == "After Update"

    @pytest.mark.asyncio
    async def test_delete_employee(self, client, admin_token):
        created = await client.post("/api/employees/", json={
            "employee_code": "EMP-DEL", "full_name": "To Delete",
            "status": "active",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        eid = created.json()["id"]
        resp = await client.delete(f"/api/employees/{eid}", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        resp2 = await client.get(f"/api/employees/{eid}", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp2.status_code == 404

    @pytest.mark.asyncio
    async def test_bulk_delete_employees(self, client, admin_token):
        ids = []
        for i in range(3):
            r = await client.post("/api/employees/", json={
                "employee_code": f"EMP-BD{i}", "full_name": f"Bulk {i}",
                "status": "active",
            }, headers={"Authorization": f"Bearer {admin_token}"})
            ids.append(r.json()["id"])
        resp = await client.post("/api/employees/bulk-delete", json={
            "ids": ids,
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert resp.json()["deleted"] == 3


class TestNotifications:
    """Notification CRUD and mark-read flow."""

    @pytest.mark.asyncio
    async def test_create_notification(self, client, admin_token):
        resp = await client.post("/api/notifications/", json={
            "title": "Test Notification",
            "message": "This is a test",
            "type": "info",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert resp.json()["title"] == "Test Notification"

    @pytest.mark.asyncio
    async def test_list_notifications(self, client, admin_token):
        resp = await client.get("/api/notifications/", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        assert "items" in resp.json()

    @pytest.mark.asyncio
    async def test_unread_count(self, client, admin_token):
        resp = await client.get("/api/notifications/unread-count", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        assert "count" in resp.json()

    @pytest.mark.asyncio
    async def test_mark_read(self, client, admin_token):
        created = await client.post("/api/notifications/", json={
            "title": "Mark Read Test", "type": "info",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        nid = created.json()["id"]
        resp = await client.put(f"/api/notifications/{nid}/read", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_mark_all_read(self, client, admin_token):
        resp = await client.put("/api/notifications/read-all", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200


class TestActivities:
    """Activity feed from audit_logs."""

    @pytest.mark.asyncio
    async def test_list_activities(self, client, admin_token):
        resp = await client.get("/api/activities/", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "total" in data


class TestSearch:
    """Global search across entities."""

    @pytest.mark.asyncio
    async def test_search(self, client, admin_token):
        resp = await client.get("/api/search/?q=test", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "results" in data
        assert data["query"] == "test"

    @pytest.mark.asyncio
    async def test_search_empty_query_rejected(self, client, admin_token):
        resp = await client.get("/api/search/?q=", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 422


class TestExport:
    """Excel export for all entities."""

    @pytest.mark.asyncio
    async def test_export_contractors(self, client, admin_token):
        resp = await client.get("/api/export/contractors", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        assert resp.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    @pytest.mark.asyncio
    async def test_export_invalid_entity(self, client, admin_token):
        resp = await client.get("/api/export/invalid-entity", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_export_requires_auth(self, client):
        resp = await client.get("/api/export/contractors")
        assert resp.status_code in (401, 403)


class TestNewEndpointsAuth:
    """All new endpoints reject anonymous requests."""

    @pytest.mark.asyncio
    async def test_employees_requires_auth(self, client):
        resp = await client.get("/api/employees/")
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_notifications_requires_auth(self, client):
        resp = await client.get("/api/notifications/")
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_activities_requires_auth(self, client):
        resp = await client.get("/api/activities/")
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_search_requires_auth(self, client):
        resp = await client.get("/api/search/?q=test")
        assert resp.status_code in (401, 403)
