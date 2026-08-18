# ===============================
# YIZ-AMS Backend API Test Suite
# ===============================

$baseUrl = "http://localhost:5000/api"

Write-Host ""
Write-Host "==========================="
Write-Host "YIZ-AMS API TEST"
Write-Host "==========================="
Write-Host ""

# -------------------------------
# Login
# -------------------------------

$login = Invoke-RestMethod `
-Method POST `
-Uri "$baseUrl/admin/login" `
-ContentType "application/json" `
-Body '{
    "email":"halirujikamshi@gmail.com",
    "password":"Your PW"
}'

$token = $login.token

Write-Host "Login Successful"
Write-Host ""

# -------------------------------
# Dashboard
# -------------------------------

Write-Host "Dashboard"

Invoke-RestMethod `
-Uri "$baseUrl/dashboard" `
-Headers @{Authorization="Bearer $token"} |
ConvertTo-Json -Depth 5

Write-Host ""

# -------------------------------
# Settings
# -------------------------------

Write-Host "Settings"

Invoke-RestMethod `
-Uri "$baseUrl/settings" `
-Headers @{Authorization="Bearer $token"} |
ConvertTo-Json -Depth 5

Write-Host ""

# -------------------------------
# Members
# -------------------------------

Write-Host "Members"

Invoke-RestMethod `
-Uri "$baseUrl/members" `
-Headers @{Authorization="Bearer $token"} |
ConvertTo-Json -Depth 5

Write-Host ""

# -------------------------------
# Contributions
# -------------------------------

Write-Host "Contributions"

Invoke-RestMethod `
-Uri "$baseUrl/contributions" `
-Headers @{Authorization="Bearer $token"} |
ConvertTo-Json -Depth 5

Write-Host ""

# -------------------------------
# Expenses
# -------------------------------

Write-Host "Expenses"

Invoke-RestMethod `
-Uri "$baseUrl/expenses" `
-Headers @{Authorization="Bearer $token"} |
ConvertTo-Json -Depth 5

Write-Host ""

# -------------------------------
# Financial Summary
# -------------------------------

Write-Host "Financial Summary"

Invoke-RestMethod `
-Uri "$baseUrl/reports/summary" `
-Headers @{Authorization="Bearer $token"} |
ConvertTo-Json -Depth 5

Write-Host ""

# -------------------------------
# Announcements
# -------------------------------

Write-Host "Announcements"

Invoke-RestMethod `
-Uri "$baseUrl/announcements" `
-Headers @{Authorization="Bearer $token"} |
ConvertTo-Json -Depth 5

Write-Host ""

Write-Host "==========================="
Write-Host "ALL TESTS COMPLETED"
Write-Host "==========================="