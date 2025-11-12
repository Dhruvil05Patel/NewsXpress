# 🧪 Testing Firebase Auth + Backend Sync

## ✅ Current Status
- ✅ Backend running on http://localhost:4000
- ✅ Frontend running on http://localhost:5173
- ✅ Firebase Admin credentials configured
- ✅ Database connected

---

## 🎯 Test Scenarios

### Test 1: Register New User (Email/Password)

**Steps:**
1. Open http://localhost:5173 in your browser
2. Click the **Login/Register** button
3. Fill in registration form:
   - Email: `test@example.com`
   - Password: `TestPass123!`
4. Click **Register**

**Expected Results:**
- ✅ Toast notification: "Registered Successfully, please check your email!"
- ✅ Browser console shows: `✅ User synced to backend: <uuid>`
- ✅ No errors in backend terminal
- ✅ Backend logs: `✅ Created new profile for auth_id: <firebase-uid>`

**Verify in Database:**
```sql
SELECT id, auth_id, full_name, created_at 
FROM profiles 
WHERE auth_id IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 1;
```

You should see a new row with `auth_id` = Firebase UID

---

### Test 2: Page Refresh (Stay Logged In)

**Steps:**
1. After successful registration/login
2. Press **F5** or **Ctrl+R** to refresh the page

**Expected Results:**
- ✅ User stays logged in (no need to login again)
- ✅ Browser console shows: `✅ User synced to backend: <uuid>` again
- ✅ `onAuthStateChanged()` fires automatically
- ✅ Backend receives sync request again

**Why this works:**
- Firebase stores auth state in localStorage
- `onAuthStateChanged()` fires on page load
- Automatically re-syncs with backend

---

### Test 3: Login with Google

**Steps:**
1. Click **Login** button
2. Click **Sign in with Google**
3. Select Google account
4. Approve permissions

**Expected Results:**
- ✅ Google OAuth popup appears
- ✅ Successfully logs in
- ✅ Browser console shows: `✅ User synced to backend: <uuid>`
- ✅ Backend creates profile with Google photo URL

**Verify in Database:**
```sql
SELECT id, auth_id, full_name, avatar_url 
FROM profiles 
WHERE avatar_url LIKE '%googleusercontent%';
```

---

### Test 4: Logout

**Steps:**
1. While logged in, click **Logout** button

**Expected Results:**
- ✅ Toast notification: "User logged out successfully"
- ✅ Browser console shows: `🚪 User signed out`
- ✅ `userProfile` state becomes `null`
- ✅ UI updates to logged-out state

---

### Test 5: Multiple Logins (Idempotent)

**Steps:**
1. Login with same user multiple times
2. Refresh page multiple times

**Expected Results:**
- ✅ Same profile returned each time (no duplicates)
- ✅ Database query: `SELECT COUNT(*) FROM profiles WHERE auth_id = '<uid>'` returns `1`
- ✅ `findOrCreateProfileByAuthId` finds existing profile instead of creating new

---

## 🔍 What to Watch in Browser Console

Open Browser DevTools (F12) → Console tab

**On successful sync:**
```
✅ User synced to backend: 550e8400-e29b-41d4-a716-446655440000
```

**On sign out:**
```
🚪 User signed out
```

**On errors:**
```
❌ Backend sync failed: <error message>
```

---

## 🔍 What to Watch in Backend Terminal

**On successful sync:**
```
✅ Created new profile for auth_id: xyz789abc456def
```

**On finding existing profile:**
(No "Created" log - just returns existing profile silently)

**On token verification failure:**
```
Firebase token verification failed: <error message>
```

---

## 🐛 Troubleshooting

### Issue: "Invalid or expired ID token"

**Cause:** Token expired (Firebase tokens last 1 hour)

**Solution:** 
- Logout and login again
- Or force token refresh: `await user.getIdToken(true)`

---

### Issue: Profile not created in database

**Check:**
1. Backend logs for errors
2. Database connection is working
3. `profiles` table has `auth_id` column (UUID type)
4. No database constraint violations

**Debug:**
```bash
# In backend terminal, check for errors
# Look for lines starting with "Error in findOrCreateProfileByAuthId"
```

---

### Issue: "No Firebase admin credentials provided"

**Cause:** Environment variable not loaded

**Solution:**
```bash
# Check .env file exists in backend folder
ls -la /home/jeet-daiya/Desktop/NewsXpress/backend/.env

# Restart backend server
# Kill terminal and run: node index.js
```

---

### Issue: Frontend can't reach backend

**Check:**
1. Backend is running on port 4000
2. Frontend is configured to call `http://localhost:4000`
3. CORS is enabled in backend

**Verify:**
```bash
# Test backend endpoint manually
curl -X POST http://localhost:4000/api/auth/sync \
  -H "Content-Type: application/json" \
  -d '{"idToken":"test"}'

# Should return 401 (Invalid token) - this is EXPECTED
# If you get connection refused, backend is not running
```

---

## ✅ Success Checklist

After testing, you should have:

- [ ] Successfully registered a new user via email/password
- [ ] Saw "✅ User synced to backend" in browser console
- [ ] Verified new row in `profiles` table with Firebase UID in `auth_id`
- [ ] Refreshed page and stayed logged in
- [ ] Logged out successfully
- [ ] (Optional) Tested Google sign-in
- [ ] No errors in backend terminal
- [ ] No errors in browser console

---

## 📊 Database Verification Queries

```sql
-- Count total synced profiles
SELECT COUNT(*) as total_synced_profiles 
FROM profiles 
WHERE auth_id IS NOT NULL;

-- View recent synced profiles
SELECT 
  id,
  auth_id,
  full_name,
  avatar_url,
  created_at
FROM profiles 
WHERE auth_id IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 10;

-- Find profile by Firebase UID (replace with actual UID)
SELECT * 
FROM profiles 
WHERE auth_id = 'xyz789abc456def';

-- Check for duplicate profiles (should return 0 rows)
SELECT auth_id, COUNT(*) as count 
FROM profiles 
WHERE auth_id IS NOT NULL 
GROUP BY auth_id 
HAVING COUNT(*) > 1;
```

---

## 🎉 If Everything Works...

You should see:

1. **Frontend:** User can register/login and stays logged in on refresh
2. **Backend:** Logs show successful profile creation
3. **Database:** New rows in `profiles` table with `auth_id` populated
4. **Security:** ID tokens are verified server-side (not trusted from client)

---

## 🚀 Next Steps After Testing

Once verified working:

1. **Add to your components:**
   ```javascript
   // Use userProfile from App.jsx
   {userProfile && <p>Welcome, {userProfile.full_name}!</p>}
   
   // Pass to bookmarks
   <Bookmarks profileId={userProfile?.id} />
   ```

2. **Update backend routes to use profile_id:**
   ```javascript
   // In your API calls, use userProfile.id
   await addBookmark(userProfile.id, articleId);
   ```

3. **Add profile picture display:**
   ```javascript
   {userProfile?.avatar_url && (
     <img src={userProfile.avatar_url} alt="Avatar" />
   )}
   ```

---

**Need help?** Check the console logs in both frontend and backend for detailed error messages.
