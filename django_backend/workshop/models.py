from django.db import models
from accounts.models import Client, Technician
from inventory.models import Product

class Motorcycle(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    plate = models.CharField(max_length=20, unique=True)
    brand = models.CharField(max_length=100)
    model_name = models.CharField(max_length=100)
    color = models.CharField(max_length=50, null=True, blank=True)
    year = models.IntegerField(null=True, blank=True)
    photo = models.ImageField(upload_to='motorcycles/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.plate} - {self.brand}"

class ServiceMethod(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    labor_cost = models.DecimalField(max_digits=10, decimal_places=2)
    estimated_time_minutes = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Quote(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Borrador'),
        ('sent', 'Enviado'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
    )
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    motorcycle = models.ForeignKey(Motorcycle, on_delete=models.CASCADE)
    description = models.CharField(max_length=255, null=True, blank=True)
    issue_date = models.DateField()
    valid_until = models.DateField()
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cotización #{self.id}"

class QuoteItem(models.Model):
    quote = models.ForeignKey(Quote, on_delete=models.CASCADE, related_name='items')
    # Simplified polymorphism representation: we specify just the name of the service/product here
    # or link it explicitly 
    is_product = models.BooleanField(default=True)
    product_item = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    service_item = models.ForeignKey(ServiceMethod, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class RepairOrder(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('diagnosing', 'Diagnosticando'),
        ('waiting_parts', 'Esperando Repuestos'),
        ('in_process', 'En Proceso'),
        ('finished', 'Finalizado'),
        ('delivered', 'Entregado'),
    )
    code = models.CharField(max_length=50, unique=True)
    quote = models.ForeignKey(Quote, on_delete=models.SET_NULL, null=True, blank=True)
    motorcycle = models.ForeignKey(Motorcycle, on_delete=models.CASCADE)
    technician = models.ForeignKey(Technician, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    problem_description = models.TextField()
    technical_report = models.TextField(null=True, blank=True)
    evidence_video = models.FileField(upload_to='repairs/videos/', null=True, blank=True)
    entry_at = models.DateTimeField()
    estimated_delivery = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.code

class RepairMaterial(models.Model):
    repair_order = models.ForeignKey(RepairOrder, on_delete=models.CASCADE, related_name='materials')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    cost_at_usage = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
