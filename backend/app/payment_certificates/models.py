from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base import Base, TimestampMixin


class PaymentCertificate(Base, TimestampMixin):
    __tablename__ = "payment_certificates"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    certificate_number: Mapped[str] = mapped_column(String(100))
    contractor_id: Mapped[int | None] = mapped_column(ForeignKey("contractors.id", ondelete="SET NULL"), nullable=True)
    period_from: Mapped[str | None] = mapped_column(Date, nullable=True)
    period_to: Mapped[str | None] = mapped_column(Date, nullable=True)
    issue_date: Mapped[str | None] = mapped_column(Date, nullable=True)
    previous_total: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    current_works: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    materials_on_site: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    insurance_percent: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    advance_repayment: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    fine_deductions: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    other_deductions: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    net_amount: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    retention_percent: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    retention_amount: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    amount_due: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    status: Mapped[str] = mapped_column(String(20), default="under_review")
    payment_date: Mapped[str | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    project = relationship("Project", back_populates="payment_certificates")
    contractor = relationship("Contractor", back_populates="payment_certificates")
