from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    UserProfileView,
    CategoryListView,
    SummaryView,
    ExpensesByCategoryView,
    TransactionListCreateView,
    TransactionDetailView,
    InsightsView
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/me/', UserProfileView.as_view(), name='auth_me'),

    # Categories
    path('categories/', CategoryListView.as_view(), name='category_list'),

    # Analytics / Summary
    path('summary/', SummaryView.as_view(), name='summary'),
    path('expenses/by-category/', ExpensesByCategoryView.as_view(), name='expenses_by_category'),
    path('insights/', InsightsView.as_view(), name='insights'),

    # Transactions CRUD
    path('transactions/', TransactionListCreateView.as_view(), name='transaction_list_create'),
    path('transactions/<int:pk>/', TransactionDetailView.as_view(), name='transaction_detail'),
]
