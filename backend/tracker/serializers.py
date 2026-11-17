from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Transaction, UserProfile

class UserSerializer(serializers.ModelSerializer):
    monthly_budget = serializers.DecimalField(
        source='profile.monthly_budget',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    avatar_url = serializers.CharField(
        source='profile.avatar_url',
        read_only=True
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'monthly_budget', 'avatar_url']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', '')
        )
        UserProfile.objects.create(user=user)
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'color']

class TransactionSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'category', 'category_detail', 'category_id',
            'type', 'amount', 'description', 'date', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'category']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value

    def validate(self, attrs):
        instance = getattr(self, 'instance', None)
        txn_type = attrs.get('type', getattr(instance, 'type', 'expense'))
        category = attrs.get('category', getattr(instance, 'category', None))
        if txn_type == 'expense' and not category:
            raise serializers.ValidationError({"category": "Category is required for expenses."})
        return attrs

    def create(self, validated_data):
        # Automatically assign current user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)
