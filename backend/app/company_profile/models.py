from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.base import Base, TimestampMixin


class CompanyProfile(Base, TimestampMixin):
    __tablename__ = "company_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    company_name_ar: Mapped[str] = mapped_column(String(255))
    company_name_en: Mapped[str] = mapped_column(String(255))
    established_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    about_ar: Mapped[str | None] = mapped_column(Text, nullable=True)
    about_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(100), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    commercial_register: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tax_card: Mapped[str | None] = mapped_column(String(100), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    vision_ar: Mapped[str | None] = mapped_column(Text, nullable=True)
    vision_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    mission_ar: Mapped[str | None] = mapped_column(Text, nullable=True)
    mission_en: Mapped[str | None] = mapped_column(Text, nullable=True)
