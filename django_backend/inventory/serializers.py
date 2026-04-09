from rest_framework import serializers
from .models import Supplier, Category, Product, InventoryPrediction

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.business_name', read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'

class InventoryPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryPrediction
        fields = '__all__'
