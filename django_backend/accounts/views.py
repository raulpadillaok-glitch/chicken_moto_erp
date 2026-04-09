from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from django.contrib.auth import get_user_model
from .models import Client, Person, Technician
from .serializers import CustomTokenObtainPairSerializer, UserSerializer, ClientSerializer, TechnicianSerializer

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    
    def create(self, request, *args, **kwargs):
        # Extract frontend variables
        person_data = request.data
        first_name = person_data.get('first_name', '').strip()
        last_name = person_data.get('last_name', '').strip()
        ci_nit = person_data.get('ci_nit', '').strip()
        phone = person_data.get('phone', '').strip()
        address = person_data.get('address', '').strip()
        
        if not first_name or not last_name:
            return Response({"error": "El nombre y apellido son obligatorios."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            with transaction.atomic():
                person = Person.objects.create(
                    first_name=first_name,
                    last_name=last_name,
                    ci_nit=ci_nit or None,
                    phone=phone or None,
                    address=address or None
                )
                client = Client.objects.create(
                    person=person, 
                    loyalty_points=request.data.get('loyalty_points', 0)
                )
                serializer = self.get_serializer(client)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": f"Error insertando registros: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        client = self.get_object()
        person_data = request.data
        
        try:
            with transaction.atomic():
                if client.person:
                    client.person.first_name = person_data.get('first_name', client.person.first_name).strip()
                    client.person.last_name = person_data.get('last_name', client.person.last_name).strip()
                    client.person.ci_nit = person_data.get('ci_nit', client.person.ci_nit) or None
                    client.person.phone = person_data.get('phone', client.person.phone) or None
                    client.person.address = person_data.get('address', client.person.address) or None
                    client.person.save()
                
                client.loyalty_points = person_data.get('loyalty_points', client.loyalty_points)
                client.save()
                
                serializer = self.get_serializer(client)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Error actualizando registros: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class TechnicianViewSet(viewsets.ModelViewSet):
    queryset = Technician.objects.all()
    serializer_class = TechnicianSerializer

    def create(self, request, *args, **kwargs):
        person_data = request.data
        try:
            with transaction.atomic():
                person = Person.objects.create(
                    first_name=person_data.get('first_name', '').strip(),
                    last_name=person_data.get('last_name', '').strip(),
                    ci_nit=person_data.get('ci_nit') or None,
                    phone=person_data.get('phone') or None,
                    address=person_data.get('address') or None,
                )
                technician = Technician.objects.create(
                    person=person,
                    specialty=person_data.get('specialty', 'General'),
                    is_available=person_data.get('is_available', True)
                )
                serializer = self.get_serializer(technician)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": f"Error insertando técnico: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        technician = self.get_object()
        person_data = request.data
        
        try:
            with transaction.atomic():
                if technician.person:
                    technician.person.first_name = person_data.get('first_name', technician.person.first_name).strip()
                    technician.person.last_name = person_data.get('last_name', technician.person.last_name).strip()
                    technician.person.ci_nit = person_data.get('ci_nit', technician.person.ci_nit) or None
                    technician.person.phone = person_data.get('phone', technician.person.phone) or None
                    technician.person.address = person_data.get('address', technician.person.address) or None
                    technician.person.save()
                
                technician.specialty = person_data.get('specialty', technician.specialty)
                technician.is_available = person_data.get('is_available', technician.is_available)
                technician.save()
                
                serializer = self.get_serializer(technician)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Error actualizando técnico: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
