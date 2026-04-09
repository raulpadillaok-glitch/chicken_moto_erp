from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Supplier, Category, Product, InventoryPrediction
from .serializers import SupplierSerializer, CategorySerializer, ProductSerializer, InventoryPredictionSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

class InventoryPredictionViewSet(viewsets.ModelViewSet):
    queryset = InventoryPrediction.objects.all()
    serializer_class = InventoryPredictionSerializer
    permission_classes = [IsAuthenticated]
