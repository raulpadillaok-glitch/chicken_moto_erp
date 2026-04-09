from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import Person, Client, Technician

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims (to read in React without hitting DB)
        token['username'] = user.username
        token['role'] = user.role
        return token
        
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add to the JSON response body
        data['role'] = self.user.role
        data['username'] = self.user.username
        return data

class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = '__all__'

class ClientSerializer(serializers.ModelSerializer):
    person_details = PersonSerializer(source='person', read_only=True)
    class Meta:
        model = Client
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']
        extra_kwargs = {'password': {'write_only': True}}

class TechnicianSerializer(serializers.ModelSerializer):
    person_details = PersonSerializer(source='person', read_only=True)
    class Meta:
        model = Technician
        fields = '__all__'
