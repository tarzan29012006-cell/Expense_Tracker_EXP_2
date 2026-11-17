# Expense Tracker App 💰

A full-stack Expense Tracker web application built strictly according to the Software Requirements Specification (SRS) and UI mockup.

---

## 🚀 Running the Application

Both servers are currently active:

- **Frontend App:** [http://127.0.0.1:5173/](http://127.0.0.1:5173/)
- **Backend API:** [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)
- **Django Admin:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

### Demo Credentials
- **Username:** `kirthick` (or email: `kirthick@example.com`)
- **Password:** `password123`
*(Or click the **"One-Click Demo Login (Kirthick)"** button on the Login page)*

---

## 🛠️ Quick Start Script

Double-click or run:
```bat
run.bat
```
This automatically launches both the Django API and Vite React server and opens the browser.

### Manual Commands

#### 1. Backend (Django REST Framework)
```powershell
cd backend
python manage.py migrate
python manage.py seed_data
python manage.py runserver 127.0.0.1:8000
```

#### 2. Frontend (React + Vite + Tailwind CSS)
```powershell
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

#### 3. Running Backend Tests
```powershell
cd backend
python manage.py test
```

---

## 🏗️ Architecture & Features

### 1. Dashboard (`/home`)
- **Summary Cards:** Total Income (₹50,000, +5%), Total Expenses (₹32,450, +8%), Remaining Balance (₹17,550 😊).
- **Expense Overview:** Responsive SVG donut chart with center total spend and category percentages (Food: 37%, Travel: 26%, Shopping: 22%, Others: 15%).
- **Add Expense Form:** Amount, Category dropdown, and optional description with real-time UI refresh.
- **Recent Transactions:** Latest 4 transactions with category pills, date, amount, and 3-dot dropdown menu for Edit and Delete.
- **Quick Insights:** Month-over-month comparison, top category spend share, and budget status.
- **Navigation Sidebar:** Responsive sidebar with active pill state and bottom piggy bank card ("Save Smart. Live Better.").

### 2. Transactions Page (`/transactions`)
- Full transaction history with search, category filtering, type filtering (Income/Expense), and period selector.
- Add, Edit, and Delete transactions.

### 3. Analytics Page (`/analytics`)
- Monthly budget target tracking and savings rate meter.
- Category spend distribution bars.

### 4. Settings Page (`/settings`)
- Profile display name update.
- Monthly budget limit customization.
