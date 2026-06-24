from pydantic import BaseModel


class CompanyProfileCreate(BaseModel):
    company_name_ar: str
    company_name_en: str
    established_year: int | None = None
    about_ar: str | None = None
    about_en: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    website: str | None = None
    commercial_register: str | None = None
    tax_card: str | None = None
    logo_url: str | None = None
    vision_ar: str | None = None
    vision_en: str | None = None
    mission_ar: str | None = None
    mission_en: str | None = None


class CompanyProfileUpdate(BaseModel):
    company_name_ar: str | None = None
    company_name_en: str | None = None
    established_year: int | None = None
    about_ar: str | None = None
    about_en: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    website: str | None = None
    commercial_register: str | None = None
    tax_card: str | None = None
    logo_url: str | None = None
    vision_ar: str | None = None
    vision_en: str | None = None
    mission_ar: str | None = None
    mission_en: str | None = None
