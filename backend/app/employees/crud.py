from app.core.crud import GenericCRUD
from app.employees.models import Employee

employee_crud = GenericCRUD(Employee)
