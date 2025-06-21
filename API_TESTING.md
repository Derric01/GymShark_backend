# Gym Sharks API Testing Guide

## PowerShell Testing Commands

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
```

### Welcome Message
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/" -Method GET
```

### Home Workouts (Hard-coded content)
```powershell
# Get all home workouts
Invoke-RestMethod -Uri "http://localhost:5000/api/home-workouts" -Method GET

# Get workouts by category
Invoke-RestMethod -Uri "http://localhost:5000/api/home-workouts/category/HIIT" -Method GET
Invoke-RestMethod -Uri "http://localhost:5000/api/home-workouts/category/Yoga" -Method GET

# Get workouts by difficulty
Invoke-RestMethod -Uri "http://localhost:5000/api/home-workouts/difficulty/Beginner" -Method GET
```

### Supplements (Hard-coded content)
```powershell
# Get all supplements
Invoke-RestMethod -Uri "http://localhost:5000/api/supplements" -Method GET

# Get supplements by category
Invoke-RestMethod -Uri "http://localhost:5000/api/supplements/category/Protein" -Method GET

# Get supplement recommendations
Invoke-RestMethod -Uri "http://localhost:5000/api/supplements/recommended/muscle%20gain" -Method GET
```

### Diet Plans (Hard-coded content)
```powershell
# Get all diet plans
Invoke-RestMethod -Uri "http://localhost:5000/api/diets" -Method GET

# Get diet plan by goal
Invoke-RestMethod -Uri "http://localhost:5000/api/diets/weight%20loss" -Method GET
Invoke-RestMethod -Uri "http://localhost:5000/api/diets/muscle%20gain" -Method GET
```

### User Registration & Authentication
```powershell
# Register new user
$registerBody = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
    firstName = "Test"
    lastName = "User"
    age = 25
    gender = "male"
    fitnessGoal = "muscle gain"
    activityLevel = "moderate"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"

# Login
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $response.token
```

### Authenticated Requests (after login)
```powershell
# Get user profile
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/profile" -Method GET -Headers $headers

# Get memberships
Invoke-RestMethod -Uri "http://localhost:5000/api/memberships" -Method GET -Headers $headers
```

### AI-Powered Tips (requires authentication)
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

# Get workout tips
$workoutTipsBody = @{
    fitnessGoal = "muscle gain"
    experience = "beginner"
    equipment = @("dumbbells", "resistance bands")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/ai/workout-tips" -Method POST -Body $workoutTipsBody -ContentType "application/json" -Headers $headers

# Get nutrition advice
$nutritionBody = @{
    goal = "weight loss"
    age = 25
    gender = "male"
    activityLevel = "moderate"
    dietaryRestrictions = @()
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/ai/nutrition-advice" -Method POST -Body $nutritionBody -ContentType "application/json" -Headers $headers
```

## Sample Response Examples

### Home Workout Response
```json
{
  "success": true,
  "count": 6,
  "data": {
    "workouts": [
      {
        "title": "Full Body HIIT Blast",
        "category": "HIIT",
        "difficulty": "Intermediate",
        "duration": 20,
        "equipment": ["None"],
        "exercises": [...]
      }
    ]
  }
}
```

### Supplement Response
```json
{
  "success": true,
  "count": 12,
  "data": {
    "supplements": [
      {
        "name": "Whey Protein Powder",
        "category": "Protein",
        "benefits": ["Supports muscle protein synthesis", ...],
        "dosage": {
          "amount": "25-30g",
          "frequency": "1-2 times daily"
        }
      }
    ]
  }
}
```

## Quick Test Script
Save this as `test-api.ps1` and run it:

```powershell
# Test all major endpoints
Write-Host "🧪 Testing Gym Sharks API..." -ForegroundColor Green

Write-Host "1. Health Check..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET | Format-Table

Write-Host "2. Home Workouts..." -ForegroundColor Yellow
$workouts = Invoke-RestMethod -Uri "http://localhost:5000/api/home-workouts" -Method GET
Write-Host "Found $($workouts.count) home workouts" -ForegroundColor Green

Write-Host "3. Supplements..." -ForegroundColor Yellow
$supplements = Invoke-RestMethod -Uri "http://localhost:5000/api/supplements" -Method GET
Write-Host "Found $($supplements.count) supplements" -ForegroundColor Green

Write-Host "4. Diet Plans..." -ForegroundColor Yellow
$diets = Invoke-RestMethod -Uri "http://localhost:5000/api/diets" -Method GET
Write-Host "Found $($diets.count) diet plans" -ForegroundColor Green

Write-Host "✅ All endpoints working!" -ForegroundColor Green
```
