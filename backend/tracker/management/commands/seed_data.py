from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from tracker.models import Category, Transaction, UserProfile
from decimal import Decimal
from datetime import date

class Command(BaseCommand):
    help = 'Seeds initial categories, default user Kirthick, and sample transactions matching UI mockup'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding data...")

        # 1. Categories
        cat_configs = [
            {'name': 'Food', 'icon': 'utensils', 'color': '#FB923C'},       # Orange
            {'name': 'Travel', 'icon': 'car', 'color': '#3B82F6'},          # Blue
            {'name': 'Shopping', 'icon': 'shopping-bag', 'color': '#10B981'},# Green
            {'name': 'Others', 'icon': 'more-horizontal', 'color': '#A855F7'} # Purple
        ]

        cats = {}
        for c in cat_configs:
            cat_obj, created = Category.objects.get_or_create(
                name=c['name'],
                defaults={'icon': c['icon'], 'color': c['color']}
            )
            cats[c['name']] = cat_obj
            self.stdout.write(f"Category: {cat_obj.name} (color: {cat_obj.color})")

        # 2. User Kirthick
        user, created = User.objects.get_or_create(
            username='kirthick',
            defaults={
                'email': 'kirthick@example.com',
                'first_name': 'Kirthick',
                'is_staff': True,
                'is_superuser': True
            }
        )
        user.set_password('password123')
        user.first_name = 'Kirthick'
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.monthly_budget = Decimal('40000.00')
        profile.save()

        self.stdout.write(f"User '{user.username}' ready (password: password123)")

        # Clear existing transactions for Kirthick to seed exact matching data
        Transaction.objects.filter(user=user).delete()

        # 3. Transactions for October 2026 (Previous Month for +5% income and +8% expense)
        Transaction.objects.create(
            user=user,
            type='income',
            amount=Decimal('47619.00'),
            description='October Salary',
            date=date(2026, 10, 1)
        )
        Transaction.objects.create(
            user=user,
            category=cats['Food'],
            type='expense',
            amount=Decimal('11100.00'),
            description='October Groceries & Food',
            date=date(2026, 10, 10)
        )
        Transaction.objects.create(
            user=user,
            category=cats['Travel'],
            type='expense',
            amount=Decimal('7800.00'),
            description='October Travel & Commute',
            date=date(2026, 10, 12)
        )
        Transaction.objects.create(
            user=user,
            category=cats['Shopping'],
            type='expense',
            amount=Decimal('6700.00'),
            description='October Shopping',
            date=date(2026, 10, 15)
        )
        Transaction.objects.create(
            user=user,
            category=cats['Others'],
            type='expense',
            amount=Decimal('4446.00'),
            description='October Utilities & Bills',
            date=date(2026, 10, 20)
        )

        # 4. Transactions for November 2026 (Current Month - exactly matches mockup)
        # Income = 50,000
        Transaction.objects.create(
            user=user,
            type='income',
            amount=Decimal('50000.00'),
            description='Monthly Salary',
            date=date(2026, 11, 1)
        )

        # Current Month Expenses = 32,450
        # Food (12,000):
        Transaction.objects.create(
            user=user,
            category=cats['Food'],
            type='expense',
            amount=Decimal('4200.00'),
            description='Weekly Grocery Stock',
            date=date(2026, 11, 3)
        )
        Transaction.objects.create(
            user=user,
            category=cats['Food'],
            type='expense',
            amount=Decimal('2800.00'),
            description='Dinner with Friends',
            date=date(2026, 11, 8)
        )
        Transaction.objects.create(
            user=user,
            category=cats['Food'],
            type='expense',
            amount=Decimal('4550.00'),
            description='Supermarket Groceries',
            date=date(2026, 11, 12)
        )
        # Mockup Recent #1:
        Transaction.objects.create(
            user=user,
            category=cats['Food'],
            type='expense',
            amount=Decimal('450.00'),
            description='Lunch at restaurant',
            date=date(2026, 11, 17)
        )

        # Travel (8,500):
        Transaction.objects.create(
            user=user,
            category=cats['Travel'],
            type='expense',
            amount=Decimal('1680.00'),
            description='Fuel & Metro Pass',
            date=date(2026, 11, 5)
        )
        Transaction.objects.create(
            user=user,
            category=cats['Travel'],
            type='expense',
            amount=Decimal('6500.00'),
            description='Flight Ticket Booking',
            date=date(2026, 11, 10)
        )
        # Mockup Recent #2:
        Transaction.objects.create(
            user=user,
            category=cats['Travel'],
            type='expense',
            amount=Decimal('320.00'),
            description='Cab Ride',
            date=date(2026, 11, 16)
        )

        # Shopping (7,200):
        Transaction.objects.create(
            user=user,
            category=cats['Shopping'],
            type='expense',
            amount=Decimal('1200.00'),
            description='Footwear & Accessories',
            date=date(2026, 11, 4)
        )
        Transaction.objects.create(
            user=user,
            category=cats['Shopping'],
            type='expense',
            amount=Decimal('4800.00'),
            description='Winter Jacket & Clothes',
            date=date(2026, 11, 9)
        )
        # Mockup Recent #3:
        Transaction.objects.create(
            user=user,
            category=cats['Shopping'],
            type='expense',
            amount=Decimal('1200.00'),
            description='Online Shopping',
            date=date(2026, 11, 15)
        )

        # Others (4,750):
        Transaction.objects.create(
            user=user,
            category=cats['Others'],
            type='expense',
            amount=Decimal('1500.00'),
            description='Gym Subscription',
            date=date(2026, 11, 6)
        )
        Transaction.objects.create(
            user=user,
            category=cats['Others'],
            type='expense',
            amount=Decimal('2650.00'),
            description='Broadband & Utilities',
            date=date(2026, 11, 11)
        )
        # Mockup Recent #4:
        Transaction.objects.create(
            user=user,
            category=cats['Others'],
            type='expense',
            amount=Decimal('600.00'),
            description='Movie Tickets',
            date=date(2026, 11, 14)
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded all initial data!'))
