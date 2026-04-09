from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Motorcycle, RepairOrder, Quote
from .serializers import MotorcycleSerializer, RepairOrderSerializer, QuoteSerializer

class MotorcycleViewSet(viewsets.ModelViewSet):
    queryset = Motorcycle.objects.all()
    serializer_class = MotorcycleSerializer
    permission_classes = [IsAuthenticated]

class RepairOrderViewSet(viewsets.ModelViewSet):
    queryset = RepairOrder.objects.all()
    serializer_class = RepairOrderSerializer
    permission_classes = [IsAuthenticated]

class QuoteViewSet(viewsets.ModelViewSet):
    queryset = Quote.objects.all()
    serializer_class = QuoteSerializer
    permission_classes = [IsAuthenticated]
