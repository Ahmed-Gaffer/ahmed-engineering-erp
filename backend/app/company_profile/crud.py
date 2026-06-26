from app.core.crud import GenericCRUD
from app.company_profile.models import CompanyProfile

company_profile_crud = GenericCRUD(CompanyProfile)
