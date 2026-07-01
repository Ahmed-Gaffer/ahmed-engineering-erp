import pytest
from httpx import AsyncClient


# ─── Helpers ─────────────────────────────────────────────────────────────────

_counter = 0

def _next_code(prefix: str) -> str:
    global _counter
    _counter += 1
    return f"{prefix}-{_counter:04d}"

BOQ_PAYLOAD = {
    "description": "Integration Test BOQ Item",
    "unit": "m3",
    "quantity": 100,
    "unit_price": 500,
}

CONTRACT_PAYLOAD = {
    "contract_type": "main",
    "party_a": "Owner",
    "party_b": "Contractor",
    "value": 1_000_000,
    "retention_percent": 5,
}


async def create_project(client: AsyncClient, token: str) -> dict:
    code = _next_code("PRJ")
    resp = await client.post(
        "/api/projects/",
        json={
            "code": code,
            "name": f"Integration Test Project {code}",
            "project_type": "مباني",
            "status": "planned",
            "location": "Test Location",
            "client_name": "Test Client",
            "budget_estimated": 1_000_000,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    return resp.json()


async def create_boq_item(client: AsyncClient, token: str, project_id: int) -> dict:
    payload = {**BOQ_PAYLOAD, "project_id": project_id, "item_code": _next_code("BOQ")}
    resp = await client.post(
        "/api/engineering/boq-items",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    return resp.json()


async def create_contract(client: AsyncClient, token: str, project_id: int) -> dict:
    cn = _next_code("CONT")
    resp = await client.post(
        "/api/engineering/contracts",
        json={**CONTRACT_PAYLOAD, "project_id": project_id, "contract_number": cn},
        headers={"Authorization": f"Bearer {token}"},
    )
    return resp.json()


# ─── 1. Health & Auth ────────────────────────────────────────────────────────

class TestHealthAndAuth:

    @pytest.mark.asyncio
    async def test_health_endpoint(self, client):
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}

    @pytest.mark.asyncio
    async def test_login_valid_credentials(self, client, admin_user):
        resp = await client.post("/api/auth/login", json={
            "username": "testadmin", "password": "admin123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["username"] == "testadmin"
        assert data["user"]["role"] == "admin"

    @pytest.mark.asyncio
    async def test_login_invalid_credentials(self, client):
        resp = await client.post("/api/auth/login", json={
            "username": "nonexistent", "password": "wrong",
        })
        assert resp.status_code == 401
        data = resp.json()
        assert "detail" in data

    @pytest.mark.asyncio
    async def test_engineering_projects_requires_auth(self, client):
        resp = await client.get("/api/engineering/projects")
        assert resp.status_code == 401
        data = resp.json()
        assert "detail" in data


# ─── 2. Projects CRUD (via /api/projects/) ───────────────────────────────────

class TestProjectsCRUD:

    @pytest.mark.asyncio
    async def test_create_project(self, client, admin_token):
        proj = await create_project(client, admin_token)
        assert proj["code"].startswith("PRJ-")
        assert "Integration Test Project" in proj["name"]
        assert proj["status"] == "planned"
        assert "id" in proj

    @pytest.mark.asyncio
    async def test_list_projects(self, client, admin_token):
        await create_project(client, admin_token)
        resp = await client.get(
            "/api/projects/",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert len(data["items"]) > 0

    @pytest.mark.asyncio
    async def test_get_project(self, client, admin_token):
        proj = await create_project(client, admin_token)
        pid = proj["id"]
        resp = await client.get(
            f"/api/projects/{pid}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == pid
        assert data["code"] == proj["code"]

    @pytest.mark.asyncio
    async def test_get_project_404(self, client, admin_token):
        resp = await client.get(
            "/api/projects/99999",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_projects_requires_auth(self, client):
        resp = await client.get("/api/projects/")
        assert resp.status_code == 401


# ─── 3. Engineering Projects ─────────────────────────────────────────────────

class TestEngineeringProjects:

    @pytest.mark.asyncio
    async def test_engineering_list_projects(self, client, admin_token):
        await create_project(client, admin_token)
        resp = await client.get(
            "/api/engineering/projects",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        if data:
            assert "id" in data[0]
            assert "code" in data[0]
            assert "name" in data[0]

    @pytest.mark.asyncio
    async def test_engineering_get_project(self, client, admin_token):
        proj = await create_project(client, admin_token)
        resp = await client.get(
            f"/api/engineering/projects/{proj['id']}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == proj["id"]
        assert data["name"] == proj["name"]

    @pytest.mark.asyncio
    async def test_engineering_get_project_404(self, client, admin_token):
        resp = await client.get(
            "/api/engineering/projects/99999",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 404


# ─── 4. BOQ Items ────────────────────────────────────────────────────────────

class TestBOQItems:

    @pytest.mark.asyncio
    async def test_create_boq_item(self, client, admin_token):
        proj = await create_project(client, admin_token)
        boq_code = _next_code("BOQ")
        resp = await client.post(
            "/api/engineering/boq-items",
            json={**BOQ_PAYLOAD, "project_id": proj["id"], "item_code": boq_code},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["item_code"] == boq_code
        assert data["description"] == BOQ_PAYLOAD["description"]
        assert data["total_price"] == 100 * 500
        assert "id" in data
        assert "project_id" in data

    @pytest.mark.asyncio
    async def test_list_project_boq(self, client, admin_token):
        proj = await create_project(client, admin_token)
        boq = await create_boq_item(client, admin_token, proj["id"])
        resp = await client.get(
            f"/api/engineering/projects/{proj['id']}/boq",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert any(b["item_code"] == boq["item_code"] for b in data)


# ─── 5. Work Orders ──────────────────────────────────────────────────────────

class TestWorkOrders:

    @pytest.mark.asyncio
    async def test_create_work_order(self, client, admin_token):
        proj = await create_project(client, admin_token)
        wo_num = _next_code("WO")
        resp = await client.post(
            "/api/work-orders/",
            json={
                "project_id": proj["id"],
                "wo_number": wo_num,
                "title": "Integration Test Work Order",
                "status": "issued",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["wo_number"] == wo_num
        assert data["status"] == "issued"

    @pytest.mark.asyncio
    async def test_report_work_orders(self, client, admin_token):
        proj = await create_project(client, admin_token)
        await client.post(
            "/api/work-orders/",
            json={
                "project_id": proj["id"],
                "wo_number": _next_code("WO"),
                "title": "WO Report Test",
                "status": "issued",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        resp = await client.get(
            "/api/engineering/reports/work-orders",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "total" in data
        assert "orders" in data
        assert "by_priority" in data
        assert "by_status" in data
        assert data["total"] > 0

    @pytest.mark.asyncio
    async def test_report_work_orders_filtered_by_status(self, client, admin_token):
        proj = await create_project(client, admin_token)
        await client.post(
            "/api/work-orders/",
            json={
                "project_id": proj["id"],
                "wo_number": _next_code("WO"),
                "title": "WO Filter Test",
                "status": "issued",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        resp = await client.get(
            "/api/engineering/reports/work-orders?status=issued",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] > 0
        for o in data["orders"]:
            assert o["status"] == "issued"


# ─── 6. Schedules ────────────────────────────────────────────────────────────

class TestSchedules:

    SCHED_PAYLOAD = {
        "task_name": "Integration Test Task",
        "duration_days": 15,
        "status": "planned",
        "progress_percent": 0,
    }

    @pytest.mark.asyncio
    async def test_create_schedule(self, client, admin_token):
        proj = await create_project(client, admin_token)
        resp = await client.post(
            "/api/engineering/schedules",
            json={**self.SCHED_PAYLOAD, "project_id": proj["id"]},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["task_name"] == "Integration Test Task"
        assert data["duration_days"] == 15
        assert data["status"] == "planned"
        assert "id" in data

    @pytest.mark.asyncio
    async def test_report_schedules(self, client, admin_token):
        proj = await create_project(client, admin_token)
        await client.post(
            "/api/engineering/schedules",
            json={**self.SCHED_PAYLOAD, "project_id": proj["id"]},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        resp = await client.get(
            "/api/engineering/reports/schedules",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "total" in data
        assert "schedules" in data
        assert "avg_progress" in data
        assert "by_status" in data
        assert data["total"] > 0

    @pytest.mark.asyncio
    async def test_report_schedules_filtered_by_status(self, client, admin_token):
        proj = await create_project(client, admin_token)
        await client.post(
            "/api/engineering/schedules",
            json={**self.SCHED_PAYLOAD, "project_id": proj["id"]},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        resp = await client.get(
            "/api/engineering/reports/schedules?status=planned",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] > 0
        for s in data["schedules"]:
            assert s["status"] == "planned"


# ─── 7. Daily Reports ────────────────────────────────────────────────────────

class TestDailyReports:

    @pytest.mark.asyncio
    async def test_create_daily_report(self, client, admin_token):
        proj = await create_project(client, admin_token)
        resp = await client.post(
            "/api/engineering/daily-reports",
            json={
                "project_id": proj["id"],
                "report_date": "2025-06-01",
                "weather": "Sunny",
                "manpower_count": 25,
                "equipment_count": 5,
                "work_description": "Foundation works",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["report_date"] == "2025-06-01"
        assert data["manpower_count"] == 25
        assert "id" in data

    @pytest.mark.asyncio
    async def test_report_daily_summary(self, client, admin_token):
        proj = await create_project(client, admin_token)
        await client.post(
            "/api/engineering/daily-reports",
            json={
                "project_id": proj["id"],
                "report_date": "2025-06-02",
                "manpower_count": 30,
                "equipment_count": 3,
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        resp = await client.get(
            "/api/engineering/reports/daily",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "total_reports" in data
        assert "total_manpower" in data
        assert "total_equipment" in data
        assert "reports" in data
        assert data["total_reports"] > 0
        assert data["total_manpower"] >= 30


# ─── 8. Reports (Financial & Progress) ───────────────────────────────────────

class TestReports:

    @pytest.mark.asyncio
    async def test_report_financial(self, client, admin_token):
        resp = await client.get(
            "/api/engineering/reports/financial",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "total_contracts" in data
        assert "total_ipcs" in data
        assert "total_contract_value" in data
        assert "total_boq_value" in data
        assert "total_ipc_paid" in data
        assert "contracts_by_status" in data
        assert "project_breakdown" in data

    @pytest.mark.asyncio
    async def test_report_progress(self, client, admin_token):
        resp = await client.get(
            "/api/engineering/reports/progress",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "total_projects" in data
        assert "delayed_projects" in data
        assert "avg_progress" in data
        assert "projects_by_status" in data
        assert "projects" in data

    @pytest.mark.asyncio
    async def test_report_project_financial(self, client, admin_token):
        proj = await create_project(client, admin_token)
        resp = await client.get(
            f"/api/engineering/reports/project-financial/{proj['id']}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["project_id"] == proj["id"]
        assert "contract_value" in data
        assert "boq_total" in data
        assert "total_billed" in data
        assert "total_paid" in data
        assert "spi" in data
        assert "cpi" in data

    @pytest.mark.asyncio
    async def test_report_project_financial_404(self, client, admin_token):
        resp = await client.get(
            "/api/engineering/reports/project-financial/99999",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 404


# ─── 9. IPC ──────────────────────────────────────────────────────────────────

class TestIPC:

    @pytest.mark.asyncio
    async def test_create_contract(self, client, admin_token):
        """A contract is a prerequisite for IPC creation."""
        proj = await create_project(client, admin_token)
        data = await create_contract(client, admin_token, proj["id"])
        assert data["contract_number"].startswith("CONT-")
        assert data["project_id"] == proj["id"]
        assert "id" in data

    @pytest.mark.asyncio
    async def test_list_project_ipcs(self, client, admin_token):
        """List IPCs for a project (initially should be empty)."""
        proj = await create_project(client, admin_token)
        resp = await client.get(
            f"/api/engineering/projects/{proj['id']}/ipcs",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_create_ipc_with_boq_and_contract(self, client, admin_token):
        """Full IPC creation: project → contract → BOQ → IPC."""
        proj = await create_project(client, admin_token)
        contract = await create_contract(client, admin_token, proj["id"])
        boq = await create_boq_item(client, admin_token, proj["id"])

        ipc_num = _next_code("IPC")
        resp = await client.post(
            "/api/engineering/ipcs",
            json={
                "project_id": proj["id"],
                "contract_id": contract["id"],
                "ipc_number": ipc_num,
                "ipc_period": 1,
                "start_date": "2025-01-01",
                "end_date": "2025-01-31",
                "details": [{"boq_item_id": boq["id"], "current_quantity": 50}],
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["ipc_number"] == ipc_num
        assert data["status"] == "draft"
        assert data["total_works"] > 0
        assert "net_amount" in data
        assert "gross_amount" in data

    @pytest.mark.asyncio
    async def test_ipc_lifecycle(self, client, admin_token):
        """Submit → approve → pay an IPC."""
        proj = await create_project(client, admin_token)
        contract = await create_contract(client, admin_token, proj["id"])
        boq = await create_boq_item(client, admin_token, proj["id"])

        ipc_num = _next_code("IPC-LIFE")
        create_resp = await client.post(
            "/api/engineering/ipcs",
            json={
                "project_id": proj["id"],
                "contract_id": contract["id"],
                "ipc_number": ipc_num,
                "ipc_period": 1,
                "details": [{"boq_item_id": boq["id"], "current_quantity": 25}],
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        ipc_id = create_resp.json()["id"]

        submit_resp = await client.post(
            f"/api/engineering/ipcs/{ipc_id}/submit",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert submit_resp.status_code == 200
        assert submit_resp.json()["status"] == "submitted"

        approve_resp = await client.post(
            f"/api/engineering/ipcs/{ipc_id}/approve",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert approve_resp.status_code == 200
        assert approve_resp.json()["status"] == "approved"

        pay_resp = await client.post(
            f"/api/engineering/ipcs/{ipc_id}/pay",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert pay_resp.status_code == 200
        assert pay_resp.json()["status"] == "paid"


# ─── 10. Dashboard ───────────────────────────────────────────────────────────

class TestDashboard:

    @pytest.mark.asyncio
    async def test_dashboard_summary(self, client, admin_token):
        resp = await client.get(
            "/api/engineering/dashboard/summary",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "total_projects" in data
        assert "total_contract_value" in data
        assert "total_ipc_count" in data
        assert "projects_by_status" in data
        assert "ipc_by_status" in data

    @pytest.mark.asyncio
    async def test_dashboard_ipc_trends(self, client, admin_token):
        resp = await client.get(
            "/api/engineering/dashboard/ipc-trends",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)


# ─── 11. Edge Cases & Validation ─────────────────────────────────────────────

class TestEdgeCases:

    @pytest.mark.asyncio
    async def test_create_project_missing_required_fields(self, client, admin_token):
        resp = await client.post(
            "/api/projects/",
            json={"name": "Incomplete"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_invalid_token(self, client):
        resp = await client.get(
            "/api/engineering/projects",
            headers={"Authorization": "Bearer invalidtoken123"},
        )
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_expired_or_bad_token_message(self, client):
        resp = await client.get(
            "/api/engineering/projects",
            headers={"Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.bad.data"},
        )
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_project_summary_endpoint(self, client, admin_token):
        proj = await create_project(client, admin_token)
        resp = await client.get(
            f"/api/engineering/projects/{proj['id']}/summary",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "project" in data
        assert "counts" in data
        assert "contracts" in data["counts"]
        assert "drawings" in data["counts"]
        assert "boq_items" in data["counts"]
        assert "ipcs" in data["counts"]

    @pytest.mark.asyncio
    async def test_dashboard_export_csv(self, client, admin_token):
        resp = await client.get(
            "/api/engineering/reports/dashboard-export",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        assert "text/csv" in resp.headers.get("content-type", "")
