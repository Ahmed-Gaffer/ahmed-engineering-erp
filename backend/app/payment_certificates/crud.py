from sqlalchemy.ext.asyncio import AsyncSession
from app.core.crud import GenericCRUD
from app.payment_certificates.models import PaymentCertificate


class PaymentCertificateCRUD(GenericCRUD[PaymentCertificate]):
    async def create(self, db: AsyncSession, data) -> PaymentCertificate:
        d = data.model_dump()
        d = self._compute(d)
        obj = self.model(**d)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    async def update(self, db: AsyncSession, id: int, data) -> PaymentCertificate:
        obj = await self.get(db, id)
        d = data.model_dump(exclude_unset=True)
        merged = {c.name: getattr(obj, c.name) for c in obj.__table__.columns}
        merged.update(d)
        merged = self._compute(merged)
        for key, value in merged.items():
            if key in d or key in {"net_amount", "retention_amount", "amount_due"}:
                setattr(obj, key, value)
        await db.commit()
        await db.refresh(obj)
        return obj

    def _compute(self, d: dict) -> dict:
        gross = float(d.get("current_works", 0) or 0) + float(d.get("materials_on_site", 0) or 0)
        ins = gross * float(d.get("insurance_percent", 0) or 0) / 100
        deductions = ins + float(d.get("advance_repayment", 0) or 0) + float(d.get("fine_deductions", 0) or 0) + float(d.get("other_deductions", 0) or 0)
        net = gross - deductions + float(d.get("previous_total", 0) or 0)
        ret = net * float(d.get("retention_percent", 0) or 0) / 100
        d["net_amount"] = round(net, 2)
        d["retention_amount"] = round(ret, 2)
        d["amount_due"] = round(net - ret, 2)
        return d


payment_cert_crud = PaymentCertificateCRUD(PaymentCertificate)
