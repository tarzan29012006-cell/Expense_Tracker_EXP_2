from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from datetime import date, timedelta
import calendar

from tracker.models import Category, Transaction, UserProfile

class ExpenseTracker20TestCases(TestCase):
    """
    Comprehensive 20-Test-Case Suite for Expense Tracker Web Application.
    Covers Functional (FR-1 to FR-16) and Non-Functional Requirements.
    """

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='kirthick',
            email='kirthick@example.com',
            password='password123',
            first_name='Kirthick'
        )
        self.profile = UserProfile.objects.create(user=self.user, monthly_budget=Decimal('40000.00'))

        # Create Standard Categories
        self.cat_food = Category.objects.create(name='Food', icon='utensils', color='#FB923C')
        self.cat_travel = Category.objects.create(name='Travel', icon='car', color='#3B82F6')
        self.cat_shopping = Category.objects.create(name='Shopping', icon='shopping-bag', color='#10B981')
        self.cat_others = Category.objects.create(name='Others', icon='more-horizontal', color='#A855F7')

        today = date.today()
        # Seed Baseline Transactions for Current Month
        Transaction.objects.create(
            user=self.user,
            type='income',
            amount=Decimal('50000.00'),
            description='Monthly Salary',
            date=date(today.year, today.month, 1)
        )
        Transaction.objects.create(
            user=self.user,
            category=self.cat_food,
            type='expense',
            amount=Decimal('12000.00'),
            description='Lunch & Groceries',
            date=today
        )
        Transaction.objects.create(
            user=self.user,
            category=self.cat_travel,
            type='expense',
            amount=Decimal('8500.00'),
            description='Travel & Cab',
            date=today
        )

        # Baseline Transaction for Previous Month
        if today.month == 1:
            prev_year, prev_month = today.year - 1, 12
        else:
            prev_year, prev_month = today.year, today.month - 1
        Transaction.objects.create(
            user=self.user,
            category=self.cat_food,
            type='expense',
            amount=Decimal('10000.00'),
            description='Last Month Food',
            date=date(prev_year, prev_month, 10)
        )

    def _get_auth_token(self):
        res = self.client.post('/api/auth/login/', {
            'username': 'kirthick',
            'password': 'password123'
        })
        return res.data['access']

    # -------------------------------------------------------------
    # 1. AUTHENTICATION & ACCESS CONTROL
    # -------------------------------------------------------------

    def test_tc01_login_valid_username(self):
        """TC-01: User Login with Valid Username and Password (FR-1, FR-3)"""
        res = self.client.post('/api/auth/login/', {
            'username': 'kirthick',
            'password': 'password123'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertEqual(res.data['user']['username'], 'kirthick')
        self.assertEqual(res.data['user']['first_name'], 'Kirthick')

    def test_tc02_login_valid_email(self):
        """TC-02: User Login with Valid Email and Password (FR-1, FR-3)"""
        res = self.client.post('/api/auth/login/', {
            'email': 'kirthick@example.com',
            'password': 'password123'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertEqual(res.data['user']['email'], 'kirthick@example.com')

    def test_tc03_login_empty_credentials_validation(self):
        """TC-03: Form Validation for Blank Username/Password (FR-2)"""
        res = self.client.post('/api/auth/login/', {
            'username': '',
            'password': ''
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', res.data)

    def test_tc04_login_invalid_password(self):
        """TC-04: Rejection of Invalid Credentials (FR-4)"""
        res = self.client.post('/api/auth/login/', {
            'username': 'kirthick',
            'password': 'IncorrectPassword!'
        })
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', res.data)

    def test_tc05_protected_route_without_token(self):
        """TC-05: Access Denial on Protected Endpoints for Unauthenticated Requests (FR-5, NFR-4)"""
        res = self.client.get('/api/summary/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_tc06_token_refresh(self):
        """TC-06: JWT Token Refresh Mechanism (Section 5.2)"""
        login_res = self.client.post('/api/auth/login/', {
            'username': 'kirthick',
            'password': 'password123'
        })
        refresh_token = login_res.data['refresh']

        res = self.client.post('/api/auth/refresh/', {'refresh': refresh_token})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)

    def test_tc07_logout_endpoint(self):
        """TC-07: User Logout & Refresh Token Clearing (FR-6)"""
        login_res = self.client.post('/api/auth/login/', {
            'username': 'kirthick',
            'password': 'password123'
        })
        refresh_token = login_res.data['refresh']

        res = self.client.post('/api/auth/logout/', {'refresh': refresh_token})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('message', res.data)

    def test_tc08_register_new_user(self):
        """TC-08: New User Self-Service Registration (Section 3)"""
        res = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'StrongPassword123!',
            'first_name': 'New'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', res.data)
        self.assertEqual(res.data['user']['username'], 'newuser')
        self.assertTrue(User.objects.filter(username='newuser').exists())

    # -------------------------------------------------------------
    # 2. USER PROFILE & SETTINGS
    # -------------------------------------------------------------

    def test_tc09_user_profile_greeting_and_budget_update(self):
        """TC-09: Profile Retrieval & Display Name / Budget Update (FR-7, Section 5)"""
        token = self._get_auth_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # Get profile
        get_res = self.client.get('/api/auth/me/')
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertEqual(get_res.data['first_name'], 'Kirthick')

        # Update display name and budget
        patch_res = self.client.patch('/api/auth/me/', {
            'first_name': 'Kirthick Kumar',
            'monthly_budget': 45000.00
        })
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data['first_name'], 'Kirthick Kumar')
        self.assertEqual(float(patch_res.data['monthly_budget']), 45000.0)

    # -------------------------------------------------------------
    # 3. DASHBOARD SUMMARY & CATEGORY BREAKDOWN
    # -------------------------------------------------------------

    def test_tc10_dashboard_summary_computation(self):
        """TC-10: Dashboard Financial Summary Computation: Income, Expense, Balance (FR-9)"""
        token = self._get_auth_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        res = self.client.get('/api/summary/?period=this_month')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Income = 50,000 | Expenses = 12,000 + 8,500 = 20,500 | Balance = 29,500
        self.assertEqual(res.data['total_income'], 50000.0)
        self.assertEqual(res.data['total_expenses'], 20500.0)
        self.assertEqual(res.data['remaining_balance'], 29500.0)

    def test_tc11_period_filter_switching(self):
        """TC-11: Period Filter Switching: Current vs Last Month vs All (FR-8)"""
        token = self._get_auth_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # Current Month
        res_current = self.client.get('/api/summary/?period=this_month')
        self.assertEqual(res_current.data['total_expenses'], 20500.0)

        # Last Month
        res_last = self.client.get('/api/summary/?period=last_month')
        self.assertEqual(res_last.data['total_expenses'], 10000.0)

        # All Time
        res_all = self.client.get('/api/summary/?period=all')
        self.assertEqual(res_all.data['total_expenses'], 30500.0)

    def test_tc12_expenses_by_category_breakdown(self):
        """TC-12: Expense Overview Donut Breakdown & Percentages (FR-10)"""
        token = self._get_auth_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        res = self.client.get('/api/expenses/by-category/?period=this_month')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['total_spent'], 20500.0)

        cats = {c['name']: c for c in res.data['categories']}
        self.assertIn('Food', cats)
        self.assertEqual(cats['Food']['amount'], 12000.0)
        # 12,000 / 20,500 = ~59%
        self.assertEqual(cats['Food']['percentage'], round((12000 / 20500) * 100))

    # -------------------------------------------------------------
    # 4. ADD EXPENSE & FORM VALIDATION
    # -------------------------------------------------------------

    def test_tc13_add_expense_amount_validation(self):
        """TC-13: Validation: Amount must be greater than 0 (FR-11)"""
        token = self._get_auth_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # Test zero amount
        res_zero = self.client.post('/api/transactions/', {
            'amount': 0,
            'category_id': self.cat_food.id,
            'type': 'expense'
        })
        self.assertEqual(res_zero.status_code, status.HTTP_400_BAD_REQUEST)

        # Test negative amount
        res_neg = self.client.post('/api/transactions/', {
            'amount': -50.00,
            'category_id': self.cat_food.id,
            'type': 'expense'
        })
        self.assertEqual(res_neg.status_code, status.HTTP_400_BAD_REQUEST)

    def test_tc14_add_expense_category_required(self):
        """TC-14: Validation: Category Selection Required for Expenses (FR-11)"""
        token = self._get_auth_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        res = self.client.post('/api/transactions/', {
            'amount': 500.00,
            'type': 'expense'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('category', res.data)

    def test_tc15_add_expense_successful_creation(self):
        """TC-15: Successful Expense Addition & Dynamic Balance Impact (FR-11, FR-12)"""
        token = self._get_auth_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        res = self.client.post('/api/transactions/', {
            'amount': 450.00,
            'category_id': self.cat_food.id,
            'description': 'Lunch at restaurant',
            'type': 'expense',
            'date': str(date.today())
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(float(res.data['amount']), 450.0)

        # Verify summary reflects new total
        sum_res = self.client.get('/api/summary/?period=this_month')
        self.assertEqual(sum_res.data['total_expenses'], 20950.0)
        self.assertEqual(sum_res.data['remaining_balance'], 29050.0)

    # -------------------------------------------------------------
    # 5. TRANSACTIONS MANAGEMENT & CRUD
    # -------------------------------------------------------------

    def test_tc16_recent_transactions_limit_and_order(self):
        """TC-16: Recent Transactions Retrieval with Ordering and Limit Constraints (FR-13)"""
        token = self._get_auth_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        res = self.client.get('/api/transactions/?limit=4')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertLessEqual(len(res.data), 4)
        # Ensure latest transactions appear first
        dates = [txn['date'] for txn in res.data]
        self.assertEqual(dates, sorted(dates, reverse=True))

    def test_tc17_edit_transaction(self):
        """TC-17: Transaction Edit / Modification via PUT/PATCH (FR-13, Section 5.2)"""
        token = self._get_auth_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        txn = Transaction.objects.filter(user=self.user, type='expense').first()

        res = self.client.patch(f'/api/transactions/{txn.id}/', {
            'amount': 15000.00,
            'description': 'Updated Dinner Spend'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(float(res.data['amount']), 15000.0)
        self.assertEqual(res.data['description'], 'Updated Dinner Spend')

    def test_tc18_delete_transaction(self):
        """TC-18: Transaction Deletion via Three-Dot Menu Action (FR-13, Section 5.2)"""
        token = self._get_auth_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        txn = Transaction.objects.create(
            user=self.user,
            category=self.cat_travel,
            type='expense',
            amount=Decimal('320.00'),
            description='Cab ride to delete',
            date=date.today()
        )

        res_del = self.client.delete(f'/api/transactions/{txn.id}/')
        self.assertEqual(res_del.status_code, status.HTTP_200_OK)
        self.assertFalse(Transaction.objects.filter(id=txn.id).exists())

    def test_tc19_transaction_search_and_filter(self):
        """TC-19: Transaction Keyword Search & Filter by Category (Section 3)"""
        token = self._get_auth_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # Search by description keyword
        res_search = self.client.get('/api/transactions/?search=Travel')
        self.assertEqual(res_search.status_code, status.HTTP_200_OK)
        self.assertTrue(all('travel' in (t['description'] + t['category_detail']['name']).lower() for t in res_search.data))

        # Filter by category
        res_cat = self.client.get(f'/api/transactions/?category={self.cat_food.id}')
        self.assertEqual(res_cat.status_code, status.HTTP_200_OK)
        self.assertTrue(all(t['category_detail']['id'] == self.cat_food.id for t in res_cat.data))

    # -------------------------------------------------------------
    # 6. QUICK INSIGHTS & BUDGET STATUS
    # -------------------------------------------------------------

    def test_tc20_quick_insights_generation(self):
        """TC-20: Dynamic Quick Insights Generation: Trend, Share, and Budget Status (FR-15)"""
        token = self._get_auth_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        res = self.client.get('/api/insights/?period=this_month')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 3)

        insights = {item['id']: item for item in res.data}
        # Insight 1: Month-over-month trend
        self.assertIn('more this month', insights[1]['text'])
        # Insight 2: Largest category share
        self.assertIn('Food expenses are', insights[2]['text'])
        # Insight 3: Budget status
        self.assertIn('within your budget', insights[3]['text'])
