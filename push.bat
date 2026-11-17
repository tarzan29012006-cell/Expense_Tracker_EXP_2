@echo off
echo ====================================================
echo Pushing Expense Tracker App to GitHub
echo Repository: https://github.com/tarzan29012006-cell/Expense_Tracker_EXP_2.git
echo ====================================================

"C:\Program Files\Git\cmd\git.exe" status
echo.
echo Pushing to main branch...
"C:\Program Files\Git\cmd\git.exe" push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================================
    echo SUCCESS: Project successfully pushed to GitHub!
    echo URL: https://github.com/tarzan29012006-cell/Expense_Tracker_EXP_2
    echo ====================================================
) else (
    echo.
    echo ====================================================
    echo If prompted, please complete the GitHub sign-in in your browser
    echo or provide a Personal Access Token (PAT).
    echo ====================================================
)

pause
