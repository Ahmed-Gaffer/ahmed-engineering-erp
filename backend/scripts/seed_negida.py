import asyncio, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import select
from app.database import async_session
from app.company_profile.models import CompanyProfile


async def main():
    async with async_session() as db:
        existing = (await db.execute(select(CompanyProfile).limit(1))).scalar_one_or_none()

        data = {
            "company_name_ar": "شركة نجيدة للمقاولات",
            "company_name_en": "Negida Contracting Company",
            "established_year": 1995,
            "phone": "+966 12 345 6789",
            "email": "info@negidacontracting.com",
            "website": "http://www.negidacontracting.com",
            "address": "جدة، المملكة العربية السعودية",
            "about_ar": "شركة نجيدة للمقاولات هي شركة رائدة في مجال المقاولات العامة، متخصصة في تقديم حلول متكاملة في مجالات التشييد والبنية التحتية والمشاريع الصناعية. تأسست الشركة عام 1995 بهدف تقديم خدمات متميزة تلبي احتياجات السوق السعودي.",
            "about_en": "Negida Contracting Company is a leading general contracting company specialized in providing integrated solutions in construction, infrastructure, and industrial projects. Founded in 1995, the company aims to deliver exceptional services that meet the needs of the Saudi market.",
            "vision_ar": "أن نكون الخيار الأول في قطاع المقاولات",
            "vision_en": "To be the first choice in the contracting sector",
            "mission_ar": "تقديم خدمات مقاولات عالية الجودة",
            "mission_en": "Providing high-quality contracting services",
        }

        if existing:
            for key, val in data.items():
                setattr(existing, key, val)
            print("Company profile updated.")
        else:
            db.add(CompanyProfile(**data))
            print("Company profile created.")

        await db.commit()


if __name__ == "__main__":
    asyncio.run(main())
