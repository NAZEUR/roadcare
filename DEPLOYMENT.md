#### 1\. Prerequisites

Before running the project, you need accounts for the following services:

1.  **Firebase Project:** For Authentication and Firestore Database.
2.  **Cloudinary:** For storing report images.
3.  **Google Cloud Console:** For the Maps JavaScript API.
4.  **OpenRouteService:** For routing calculations.

#### 2\. Environment Variables Configuration

Create a `.env.local` file in the root of your project. You will need to fill in the following keys based on your service providers.

**A. Firebase Client (Found in Project Settings \> General):**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**B. Firebase Admin SDK (Server-Side):**
*Go to Project Settings \> Service Accounts \> Generate New Private Key. Open the JSON file.*
*Note: For `FIREBASE_PRIVATE_KEY`, ensure newline characters (`\n`) are handled correctly if deploying to Vercel.*

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

**C. Cloudinary (Found in Dashboard):**

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**D. Maps Services:**

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_ORS_API_KEY=your_open_route_service_key
```

#### 3\. Run Locally

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/your-username/lapor-mas.git](https://github.com/your-username/lapor-mas.git)
    cd lapor-mas
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser.

#### 4\. Deployment to Vercel (Recommended)

1.  Push your code to a GitHub repository.
2.  Log in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3.  Import your **Lapor Mas** repository.
4.  **Important:** In the "Environment Variables" section, copy-paste all the variables from your `.env.local` file.
      * *Tip for Firebase Private Key:* When adding `FIREBASE_PRIVATE_KEY` in Vercel, copy the content *inside* the quotes from your JSON file. It should look like `-----BEGIN PRIVATE KEY-----\nMIIEv...`.
5.  Click **Deploy**.

#### 5\. Post-Deployment Setup (Firestore Rules)

To ensure security, go to your Firebase Console -\> Firestore Database -\> Rules, and set basic security rules. For example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data, allow admins full access
    match /reports/{reportId} {
      allow read: if true;
      allow create: if request.auth != null;
      // Only admin can update status or delete
      allow update, delete: if request.auth != null; 
    }
    match /users/{userId} {
       allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

-----

### ⚠️ Important Note on Firebase Admin Key

Your code includes a file named `format-key.js`. If you are having trouble with the `FIREBASE_PRIVATE_KEY` (getting "invalid PEM" errors), run that script locally against your downloaded JSON key to get the correctly formatted string for your `.env` file.

**Do not commit `.env` or your Firebase JSON keys to GitHub\!**

```

### Next Steps for You

1.  **Copy**: Copy the content above into `README.md` in your project root.
2.  **Verify Keys**: Double-check that your `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` has the **Maps JavaScript API**, **Directions API**, and **Geocoding API** enabled in the Google Cloud Console.
3.  **Deploy**: Push your code to GitHub and connect it to Vercel.

Would you like me to explain how to set up the Firestore indexes specifically for the compound queries used in your Admin dashboard?
```