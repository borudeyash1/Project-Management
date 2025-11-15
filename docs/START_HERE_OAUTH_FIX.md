# START HERE: Google OAuth Setup Instructions

This guide provides the immediate steps required to fix the Google OAuth flow and get the application running correctly.

**Main Issue Fixed**: The "unregistered_origin" error was caused by missing configuration in the Google Cloud Console. The authentication logic has also been enhanced to support both new user registration and existing user login seamlessly.

---

## 🚀 Action Required: 4 Steps to Fix

### Step 1: Configure Google Cloud Console (CRITICAL)

You must tell Google that `http://localhost:3000` is an authorized origin for your application.

1.  **Go to the Credentials Page:**
    *   [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

2.  **Select Your OAuth Client:**
    *   Click on the name `project-management`.

3.  **Add Authorized JavaScript Origins:**
    *   Under the "Authorized JavaScript origins" section, click **ADD URI**.
    *   Add the following two URIs one by one:
        ```
        http://localhost:3000
        ```
        ```
        http://127.0.0.1:3000
        ```

4.  **Add Authorized Redirect URIs:**
    *   Under the "Authorized redirect URIs" section, click **ADD URI**.
    *   Add the following two URIs one by one:
        ```
        http://localhost:3000/auth/google/callback
        ```
        ```
        http://localhost:3000
        ```

5.  **Save Your Changes:**
    *   Scroll to the bottom and click the **SAVE** button.

6.  **Wait for 5-10 Minutes:**
    *   Google's settings can take a few minutes to update. It's a good time to proceed with the next steps.

---

### Step 2: Update Your Server's `.env` File

The client secret you provided was incorrect in the `server/.env` file. It has been updated in the code, but you must ensure your local file is correct.

*   **File Location**: `D:\YASH\Project Management\server\.env`
*   Find the line for `GOOGLE_CLIENT_SECRET`.
*   Replace the old value with the new one you provided:

    ```env
    # Change this line:
    GOOGLE_CLIENT_SECRET=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

    # To this new value:
    GOOGLE_CLIENT_SECRET=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
    ```

---

### Step 3: Restart Your Servers

For the environment variable changes to take effect, you must restart both your frontend and backend servers.

1.  Go to your two terminals.
2.  Press `Ctrl + C` in each to stop the servers.
3.  Restart them:

    ```bash
    # In the server directory (D:\YASH\Project Management\server)
    npm run dev

    # In the client directory (D:\YASH\Project Management\client)
    npm start
    ```

---

### Step 4: Test the New Authentication Flow

After waiting a few minutes for the Google settings to apply, test the complete flow. **It's highly recommended to clear your browser cache or use an Incognito window.**

#### ✅ Test 1: New User Registration with Google
1.  Navigate to `http://localhost:3000/login`.
2.  Click "Continue with Google".
3.  Select a Google account that has **never** been used in the application before.
4.  **Expected**: You should be redirected to the `/register` page with your name and email pre-filled.
5.  Complete the registration form (add a password, etc.) and submit.
6.  **Expected**: You should be logged in and redirected to the main dashboard.

#### ✅ Test 2: Existing User Login with Google
1.  Log out of the application.
2.  Navigate to `http://localhost:3000/login`.
3.  Click "Continue with Google" again.
4.  Select the **same** Google account you just registered.
5.  **Expected**: You should be logged in immediately and redirected to the dashboard, skipping the registration page.

---

## 📝 Summary of Code Changes

To make this work, several files were modified:

*   **`server/src/controllers/authController.ts`**: The backend logic was updated to distinguish between a login attempt and a new user registration. It now returns a specific `USER_NOT_REGISTERED` message if an unknown user tries to log in with Google.
*   **`client/src/components/Auth.tsx`**: The login page now handles the `USER_NOT_REGISTERED` message. It saves the Google user's information temporarily and redirects them to the registration page.
*   **`client/src/components/EnhancedRegistration.tsx`**: The registration page now checks for temporary Google information and uses it to pre-fill the form, creating a smooth sign-up experience for new Google users.

You can find more detailed documentation in `GOOGLE_OAUTH_FIXED_SETUP.md` and `OAUTH_IMPLEMENTATION_SUMMARY.md`.