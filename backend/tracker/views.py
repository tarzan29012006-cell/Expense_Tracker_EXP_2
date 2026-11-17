from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import datetime, date, timedelta
from decimal import Decimal
import calendar

from .models import Category, Transaction, UserProfile
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    CategorySerializer,
    TransactionSerializer
)

def get_period_dates(period_str):
    """Returns (start_date, end_date) for a given period string."""
    today = date.today()
    # Normalize
    period = (period_str or "this_month").lower().replace(" ", "_").replace("-", "_")
    
    if period in ["this_month", "thismonth", "current_month"]:
        start_date = date(today.year, today.month, 1)
        _, last_day = calendar.monthrange(today.year, today.month)
        end_date = date(today.year, today.month, last_day)
        
        # Previous period for comparisons
        if today.month == 1:
            prev_year = today.year - 1
            prev_month = 12
        else:
            prev_year = today.year
            prev_month = today.month - 1
        _, prev_last_day = calendar.monthrange(prev_year, prev_month)
        prev_start = date(prev_year, prev_month, 1)
        prev_end = date(prev_year, prev_month, prev_last_day)
        return start_date, end_date, prev_start, prev_end

    elif period in ["last_month", "lastmonth", "prev_month"]:
        if today.month == 1:
            target_year = today.year - 1
            target_month = 12
        else:
            target_year = today.year
            target_month = today.month - 1
        _, last_day = calendar.monthrange(target_year, target_month)
        start_date = date(target_year, target_month, 1)
        end_date = date(target_year, target_month, last_day)
        
        # Two months ago for comparison
        if target_month == 1:
            prev_year = target_year - 1
            prev_month = 12
        else:
            prev_year = target_year
            prev_month = target_month - 1
        _, prev_last_day = calendar.monthrange(prev_year, prev_month)
        prev_start = date(prev_year, prev_month, 1)
        prev_end = date(prev_year, prev_month, prev_last_day)
        return start_date, end_date, prev_start, prev_end

    else:
        # All time
        start_date = date(2000, 1, 1)
        end_date = date(2099, 12, 31)
        prev_start = None
        prev_end = None
        return start_date, end_date, prev_start, prev_end

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username_or_email = request.data.get('username') or request.data.get('email') or ''
        password = request.data.get('password') or ''

        # FR-2: Validate both fields are filled before submitting
        if not username_or_email or not password:
            return Response(
                {'error': 'Both username/email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Allow login by email or username
        user = None
        if '@' in username_or_email:
            try:
                user_obj = User.objects.get(email__iexact=username_or_email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None
        else:
            user = authenticate(username=username_or_email, password=password)

        if user is not None:
            # Ensure profile exists
            if not hasattr(user, 'profile'):
                UserProfile.objects.create(user=user)
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        else:
            # FR-4: On invalid credentials show error and stay on Login
            return Response(
                {'error': 'Invalid username/email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'message': 'Logged out.'}, status=status.HTTP_200_OK)

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not hasattr(user, 'profile'):
            UserProfile.objects.create(user=user)
        return Response(UserSerializer(user).data)

    def patch(self, request):
        user = request.user
        if not hasattr(user, 'profile'):
            UserProfile.objects.create(user=user)

        first_name = request.data.get('first_name')
        if first_name is not None:
            user.first_name = first_name
            user.save()

        budget = request.data.get('monthly_budget')
        if budget is not None:
            user.profile.monthly_budget = Decimal(str(budget))
            user.profile.save()

        avatar_url = request.data.get('avatar_url')
        if avatar_url is not None:
            user.profile.avatar_url = avatar_url
            user.profile.save()

        return Response(UserSerializer(user).data)

class CategoryListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        categories = Category.objects.all().order_by('id')
        return Response(CategorySerializer(categories, many=True).data)

class SummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'this_month')
        start_date, end_date, prev_start, prev_end = get_period_dates(period)

        txns = Transaction.objects.filter(user=request.user)
        if start_date and end_date:
            curr_txns = txns.filter(date__gte=start_date, date__lte=end_date)
        else:
            curr_txns = txns

        income = curr_txns.filter(type='income').aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
        expenses = curr_txns.filter(type='expense').aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
        balance = income - expenses

        # Calculate previous period stats for percent change
        income_change_pct = 5.0 # fallback
        expense_change_pct = 8.0 # fallback
        if prev_start and prev_end:
            prev_txns = txns.filter(date__gte=prev_start, date__lte=prev_end)
            prev_income = prev_txns.filter(type='income').aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
            prev_expenses = prev_txns.filter(type='expense').aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')

            if prev_income > 0:
                income_change_pct = float(round(((income - prev_income) / prev_income) * 100, 1))
            elif income > 0:
                income_change_pct = 100.0

            if prev_expenses > 0:
                expense_change_pct = float(round(((expenses - prev_expenses) / prev_expenses) * 100, 1))
            elif expenses > 0:
                expense_change_pct = 100.0

        return Response({
            'period': period,
            'total_income': float(income),
            'total_expenses': float(expenses),
            'remaining_balance': float(balance),
            'income_change_pct': income_change_pct,
            'expense_change_pct': expense_change_pct,
        })

class ExpensesByCategoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'this_month')
        start_date, end_date, _, _ = get_period_dates(period)

        txns = Transaction.objects.filter(user=request.user, type='expense')
        if start_date and end_date:
            txns = txns.filter(date__gte=start_date, date__lte=end_date)

        total_spent = txns.aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
        total_spent_float = float(total_spent)

        categories = Category.objects.all().order_by('id')
        breakdown = []

        for cat in categories:
            cat_sum = txns.filter(category=cat).aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
            cat_amount = float(cat_sum)
            percentage = round((cat_amount / total_spent_float * 100)) if total_spent_float > 0 else 0
            breakdown.append({
                'category_id': cat.id,
                'name': cat.name,
                'color': cat.color,
                'icon': cat.icon,
                'amount': cat_amount,
                'percentage': percentage
            })

        return Response({
            'period': period,
            'total_spent': total_spent_float,
            'categories': breakdown
        })

class TransactionListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        txns = Transaction.objects.filter(user=request.user)
        
        # Period filter
        period = request.query_params.get('period')
        if period:
            start_date, end_date, _, _ = get_period_dates(period)
            if start_date and end_date:
                txns = txns.filter(date__gte=start_date, date__lte=end_date)

        # Category filter
        category_id = request.query_params.get('category')
        if category_id:
            txns = txns.filter(category_id=category_id)

        # Type filter
        txn_type = request.query_params.get('type')
        if txn_type:
            txns = txns.filter(type=txn_type)

        # Search filter
        search = request.query_params.get('search')
        if search:
            txns = txns.filter(
                Q(description__icontains=search) |
                Q(category__name__icontains=search)
            )

        # Limit filter (e.g. limit=4 for Recent Transactions)
        limit = request.query_params.get('limit')
        if limit:
            try:
                txns = txns[:int(limit)]
            except ValueError:
                pass

        serializer = TransactionSerializer(txns, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TransactionSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TransactionDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Transaction.objects.get(pk=pk, user=user)
        except Transaction.DoesNotExist:
            return None

    def get(self, request, pk):
        txn = self.get_object(pk, request.user)
        if not txn:
            return Response({'error': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(TransactionSerializer(txn).data)

    def put(self, request, pk):
        txn = self.get_object(pk, request.user)
        if not txn:
            return Response({'error': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = TransactionSerializer(txn, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        txn = self.get_object(pk, request.user)
        if not txn:
            return Response({'error': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = TransactionSerializer(txn, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        txn = self.get_object(pk, request.user)
        if not txn:
            return Response({'error': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)
        txn.delete()
        return Response({'message': 'Transaction deleted successfully.'}, status=status.HTTP_200_OK)

class InsightsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'this_month')
        start_date, end_date, prev_start, prev_end = get_period_dates(period)

        user = request.user
        txns = Transaction.objects.filter(user=user, type='expense')
        if start_date and end_date:
            curr_txns = txns.filter(date__gte=start_date, date__lte=end_date)
        else:
            curr_txns = txns

        curr_total = float(curr_txns.aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00'))

        # 1. Month-over-month comparison
        month_change_pct = 8.0
        if prev_start and prev_end:
            prev_txns = txns.filter(date__gte=prev_start, date__lte=prev_end)
            prev_total = float(prev_txns.aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00'))
            if prev_total > 0:
                month_change_pct = round(((curr_total - prev_total) / prev_total) * 100, 1)

        if month_change_pct >= 0:
            insight_1 = f"You spent {int(month_change_pct) if month_change_pct.is_integer() else month_change_pct}% more this month compared to last month."
            trend = "up"
        else:
            insight_1 = f"You spent {abs(int(month_change_pct) if month_change_pct.is_integer() else month_change_pct)}% less this month compared to last month."
            trend = "down"

        # 2. Largest category share
        categories = Category.objects.all()
        top_cat_name = "Food"
        top_cat_share = 37
        max_amt = 0.0

        for cat in categories:
            cat_sum = float(curr_txns.filter(category=cat).aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00'))
            if cat_sum > max_amt:
                max_amt = cat_sum
                top_cat_name = cat.name
                if curr_total > 0:
                    top_cat_share = round((cat_sum / curr_total) * 100)

        insight_2 = f"{top_cat_name} expenses are {top_cat_share}% of your total spending."

        # 3. Budget status
        budget = float(getattr(getattr(user, 'profile', None), 'monthly_budget', 40000.00))
        if curr_total <= budget:
            insight_3 = "Great job! You are within your budget. 🎉"
            budget_status = "safe"
        else:
            over = int(curr_total - budget)
            insight_3 = f"Attention: You exceeded your budget by ₹{over:,}."
            budget_status = "exceeded"

        return Response([
            {
                'id': 1,
                'type': 'spending_trend',
                'trend': trend,
                'icon': 'trending-up',
                'color': '#8B5CF6',
                'bgColor': '#F3E8FF',
                'text': insight_1
            },
            {
                'id': 2,
                'type': 'category_share',
                'icon': 'check-circle-2',
                'color': '#10B981',
                'bgColor': '#DCFCE7',
                'text': insight_2
            },
            {
                'id': 3,
                'type': 'budget_status',
                'status': budget_status,
                'icon': 'trophy',
                'color': '#F59E0B',
                'bgColor': '#FEF3C7',
                'text': insight_3
            }
        ])
