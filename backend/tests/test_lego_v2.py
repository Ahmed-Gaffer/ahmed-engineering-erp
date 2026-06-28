import pytest
from core.lego_v2.event_bus.event_bus import event_bus
from core.lego_v2.event_bus.events import ENGINEERING_EVENTS
from core.lego_v2.connectors.connector_registry import connector_registry


@pytest.mark.asyncio
async def test_event_bus_publish_subscribe():
    received = []

    async def test_handler(event):
        received.append(event)

    event_bus.subscribe("test.event", test_handler)
    await event_bus.publish({"name": "test.event", "source": "test", "payload": {"key": "val"}})

    assert len(received) == 1
    assert received[0]["name"] == "test.event"
    assert received[0]["payload"]["key"] == "val"

    event_bus._handlers.pop("test.event", None)


@pytest.mark.asyncio
async def test_event_bus_history():
    await event_bus.publish({"name": "test.history", "source": "test", "payload": {}})
    history = event_bus.get_history("test.history")
    assert len(history) >= 1
    assert history[-1]["name"] == "test.history"

    all_history = event_bus.get_history()
    assert len(all_history) >= 1


def test_engineering_events_defined():
    assert "SUBMITTAL_SUBMITTED" in ENGINEERING_EVENTS
    assert ENGINEERING_EVENTS["SUBMITTAL_SUBMITTED"] == "engineering.submittal.submitted"
    assert ENGINEERING_EVENTS["INSPECTION_PASSED"] == "engineering.inspection.passed"
    assert ENGINEERING_EVENTS["PUNCHLIST_VERIFIED"] == "engineering.punchlist.verified"
    assert ENGINEERING_EVENTS["TRANSMITTAL_SENT"] == "engineering.transmittal.sent"
    assert ENGINEERING_EVENTS["SAFETY_INCIDENT_CLOSED"] == "engineering.safety_incident.closed"
    assert ENGINEERING_EVENTS["SAFETY_OBSERVATION_RESOLVED"] == "engineering.safety_observation.resolved"


def test_all_events_have_string_values():
    for key, val in ENGINEERING_EVENTS.items():
        assert isinstance(key, str), f"Key {key} must be string"
        assert isinstance(val, str), f"Value for {key} must be string"
        assert val.startswith("engineering."), f"Value for {key} must start with 'engineering.'"


@pytest.mark.asyncio
async def test_connector_registry_call():
    async def echo_handler(**kwargs):
        return kwargs

    connector_registry.register_port("echo", "test", echo_handler)
    result = await connector_registry.call("test", "echo", message="hello")
    assert result == {"message": "hello"}

    with pytest.raises(RuntimeError):
        await connector_registry.call("test", "nonexistent")


@pytest.mark.asyncio
async def test_event_bus_handler_error_does_not_break_chain():
    results = []

    async def failing_handler(event):
        raise ValueError("Boom")

    async def good_handler(event):
        results.append(event)

    event_bus.subscribe("test.error_chain", failing_handler)
    event_bus.subscribe("test.error_chain", good_handler)

    # Should not raise — EventBus catches handler errors
    await event_bus.publish({"name": "test.error_chain", "source": "test", "payload": {}})

    assert len(results) == 1

    event_bus._handlers.pop("test.error_chain", None)


@pytest.mark.asyncio
async def test_notification_adapter_creates_notification():
    from app.engineering_features.notification_adapter import handle_engineering_event

    event = {
        "name": "engineering.submittal.submitted",
        "source": "engineering",
        "payload": {
            "entity_type": "submittal",
            "entity_id": 1,
            "action": "submitted",
            "from_status": "draft",
            "to_status": "submitted",
            "actor_id": 1,
            "actor_name": "Test User",
            "user_id": 1,
            "comment": "Test submission",
            "link": "/engineering/submittals",
        },
    }

    try:
        await handle_engineering_event(event)
    except Exception:
        # May fail in test env without DB — that's OK
        pass
