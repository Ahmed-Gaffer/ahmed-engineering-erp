import pytest


class TestNotificationsNoTableConflict:
    """Bug #1: 'Table notifications is already defined' from duplicate model."""

    @pytest.mark.asyncio
    async def test_create_notification_succeeds(self, client, admin_token):
        """Create notification and confirm no table conflict occurs."""
        resp = await client.post("/api/notifications/", json={
            "title": "Fix Test Notification",
            "message": "Created after duplicate model fix",
            "type": "warning",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "Fix Test Notification"
        # notifications/api.py create endpoint only returns id/title/message
        assert "id" in data

    @pytest.mark.asyncio
    async def test_list_notifications_after_create(self, client, admin_token):
        """List notifications and verify no SQL table conflict."""
        await client.post("/api/notifications/", json={
            "title": "List check", "type": "info",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        resp = await client.get("/api/notifications/", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        items = resp.json().get("items", [])
        assert any(n["title"] == "List check" for n in items)


class TestDashboardTotalWorks:
    """Bug #2: dashboard used total_amount but model has total_works."""

    @pytest.mark.asyncio
    async def test_dashboard_summary_returns_total_works(self, client, admin_token):
        """Dashboard must contain recent_ipcs with total_works field."""
        resp = await client.get("/api/engineering/dashboard/summary", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "recent_ipcs" in data
        if data["recent_ipcs"]:
            for ipc in data["recent_ipcs"]:
                assert "total_works" in ipc
                assert "total_amount" not in ipc

    @pytest.mark.asyncio
    async def test_dashboard_summary_has_minimal_fields(self, client, admin_token):
        resp = await client.get("/api/engineering/dashboard/summary", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        data = resp.json()
        for key in ("total_projects", "total_ipc_amount", "total_vo_amount",
                     "total_contracts", "projects_by_status"):
            assert key in data


class TestProjectModelContractorRelationship:
    """Bug #3: Contractor relationship mapper error (missing import)."""

    @pytest.mark.asyncio
    async def test_create_and_list_project(self, client, admin_token):
        """Creating and querying Project must not fail due to Contractor mapper."""
        create_resp = await client.post("/api/projects/", json={
            "code": "FIX-PRJ-001",
            "name": "Fixed Project",
            "project_type": "مباني",
            "status": "planned",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert create_resp.status_code == 200
        pid = create_resp.json()["id"]

        get_resp = await client.get(f"/api/projects/{pid}", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert get_resp.status_code == 200
        assert get_resp.json()["name"] == "Fixed Project"

    @pytest.mark.asyncio
    async def test_list_projects_endpoint(self, client, admin_token):
        resp = await client.get("/api/projects/", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "total" in data


class TestVariationOrderAwaitPrecedence:
    """Bug #4: await db.execute(...).scalars().all() — wrong precedence."""

    @pytest.mark.asyncio
    async def _create_project_and_contract(self, client, admin_token, proj_code, vo_label):
        """Helper: create a project + contract and return (project_id, contract_id)."""
        p = await client.post("/api/projects/", json={
            "code": proj_code, "name": f"VO test {vo_label}",
            "project_type": "بنية تحتية", "status": "planned",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        pid = p.json()["id"]
        c = await client.post("/api/engineering/contracts", json={
            "project_id": pid, "contract_number": f"CN-{proj_code}",
            "contract_type": "main", "party_a": "Owner", "party_b": "Contr",
            "value": "100000.00",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        cid = c.json()["id"]
        return pid, cid

    @pytest.mark.asyncio
    async def test_create_and_query_variation_order(self, client, admin_token):
        """Create a VariationOrder and query it — must not raise."""
        pid, cid = await self._create_project_and_contract(client, admin_token, "VO-FIX-P1", "create")
        create_resp = await client.post("/api/engineering/variation-orders", json={
            "vo_number": "VO-FIX-001",
            "title": "Fix await precedence",
            "amount_change": "15000.00",
            "project_id": pid,
            "contract_id": cid,
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert create_resp.status_code == 200
        assert create_resp.json()["vo_number"] == "VO-FIX-001"

    @pytest.mark.asyncio
    async def test_variation_order_list_by_project(self, client, admin_token):
        pid, cid = await self._create_project_and_contract(client, admin_token, "VO-FIX-P2", "list")
        await client.post("/api/engineering/variation-orders", json={
            "vo_number": "VO-FIX-002",
            "title": "List fix",
            "amount_change": "5000.00",
            "project_id": pid,
            "contract_id": cid,
        }, headers={"Authorization": f"Bearer {admin_token}"})
        resp = await client.get(f"/api/engineering/projects/{pid}/variation-orders", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    @pytest.mark.asyncio
    async def test_dashboard_counts_vos(self, client, admin_token):
        """Dashboard must include total_variation_orders without await errors."""
        resp = await client.get("/api/engineering/dashboard/summary", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        assert "total_variation_orders" in resp.json()


class TestNotificationModelDirectImport:
    """Verify Notification model works when both modules import it."""

    @pytest.mark.asyncio
    async def test_notification_has_correct_fields(self, client, admin_token):
        # Create via the simple endpoint (returns id/title/message only)
        create_resp = await client.post("/api/notifications/", json={
            "title": "Field check",
            "message": "test message",
            "type": "error",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert create_resp.status_code == 200
        nid = create_resp.json()["id"]

        # Fetch via engineering endpoint which returns full NotificationResponse
        resp = await client.get(f"/api/engineering/notifications", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
        items = resp.json().get("items", resp.json())
        if isinstance(items, list):
            match = [n for n in items if n["id"] == nid]
            assert match, f"Notification {nid} not found in list"
            assert match[0]["type"] == "error"

    @pytest.mark.asyncio
    async def test_notification_mark_read(self, client, admin_token):
        n = await client.post("/api/notifications/", json={
            "title": "Read test", "type": "info",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        nid = n.json()["id"]
        resp = await client.put(f"/api/notifications/{nid}/read", headers={
            "Authorization": f"Bearer {admin_token}",
        })
        assert resp.status_code == 200
