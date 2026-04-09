import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_erp.settings')
django.setup()

from accounts.models import User, Person, Client, Technician
from inventory.models import Category, Supplier, Product
from workshop.models import Motorcycle, ServiceMethod

def run_seed():
    print("--- Borrando datos viejos ---")
    Product.objects.all().delete()
    Category.objects.all().delete()
    Supplier.objects.all().delete()
    Motorcycle.objects.all().delete()
    Client.objects.all().delete()
    Technician.objects.all().delete()
    Person.objects.exclude(user_account__username='admin').delete()
    
    print("--- Sembrando Proveedores y Categorías ---")
    cat1 = Category.objects.create(name='Frenos', description='Pastillas y líquidos')
    cat2 = Category.objects.create(name='Motor', description='Aceites y repuestos de motor')
    cat3 = Category.objects.create(name='Accesorios', description='Cascos, luces')

    sup1 = Supplier.objects.create(business_name='Importadora Boliviana', nit='1234567890')
    sup2 = Supplier.objects.create(business_name='Repuestos Illimani', nit='0987654321')

    print("--- Sembrando Productos (Precios en Bs.) ---")
    products = [
        {'sku': 'FRN-001', 'name': 'Pastillas de freno Brembo', 'cat': cat1, 'sup': sup1, 'pb': 150.00, 'ps': 220.00, 'stock': 12, 'min': 5},
        {'sku': 'MTR-001', 'name': 'Aceite Motul 10W40', 'cat': cat2, 'sup': sup2, 'pb': 60.00, 'ps': 90.00, 'stock': 45, 'min': 10},
        {'sku': 'ACC-001', 'name': 'Faro LED Universal', 'cat': cat3, 'sup': sup1, 'pb': 80.00, 'ps': 130.00, 'stock': 3, 'min': 5},
    ]
    for p in products:
        Product.objects.create(
            sku=p['sku'], name=p['name'], category=p['cat'], supplier=p['sup'],
            purchase_price=p['pb'], sale_price=p['ps'], stock=p['stock'], min_stock=p['min']
        )

    print("--- Sembrando Personas (Cliente y Técnico) ---")
    p_cliente = Person.objects.create(first_name='Carlos', last_name='Mamani', phone='77712345', address='El Alto, Ciudad Satélite')
    cliente = Client.objects.create(person=p_cliente, loyalty_points=15)

    p_tecnico = Person.objects.create(first_name='Juan', last_name='Pérez', phone='66654321')
    tecnico = Technician.objects.create(person=p_tecnico, specialty='Mecánica General')

    print("--- Sembrando Motocicleta ---")
    Motorcycle.objects.create(client=cliente, plate='1234-ABC', brand='Honda', model_name='CBR 250R', year=2021)

    print("¡Base de datos sembrada con éxito en Bolivianos (Bs.)!")

if __name__ == '__main__':
    run_seed()
