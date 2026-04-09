from rest_framework import serializers
from .models import Motorcycle, ServiceMethod, Quote, QuoteItem, RepairOrder, RepairMaterial

class MotorcycleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Motorcycle
        fields = '__all__'

class RepairOrderSerializer(serializers.ModelSerializer):
    motorcycle_plate = serializers.CharField(source='motorcycle.plate', read_only=True)
    technician_name = serializers.CharField(source='technician.person.first_name', read_only=True)

    class Meta:
        model = RepairOrder
        fields = '__all__'

class QuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quote
        fields = '__all__'
