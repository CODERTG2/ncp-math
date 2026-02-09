# Deploying to Render

This guide will walk you through deploying your NCP Math website to Render.

## Prerequisites

1. **GitHub Account**: Your code should be pushed to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com) (free)
3. **MongoDB Atlas**: You'll need a cloud MongoDB database (also free at [mongodb.com/atlas](https://mongodb.com/atlas))

---

## Step 1: Set Up MongoDB Atlas (if you haven't already)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) and sign up/login
2. Create a new **FREE cluster** (M0 Sandbox)
3. Create a database user:
   - Click "Database Access" in the left sidebar
   - Add new database user with username and password
   - **Save these credentials!**
4. Whitelist all IPs (for Render):
   - Click "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm
5. Get your connection string:
   - Click "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ncp-math`)
   - **Replace `<password>` with your actual database user password**

---

## Step 2: Push Your Code to GitHub

Make sure your code is committed and pushed to GitHub:

```bash
# Check git status
git status

# Add all changes
git add .

# Commit
git commit -m "Prepare for Render deployment"

# Push to GitHub
git push origin main
```

**Note**: Make sure `.env` and `credentials.json` are in `.gitignore` and NOT pushed to GitHub!

---

## Step 3: Deploy on Render

### 3.1 Create a New Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** button in the top right
3. Select **"Web Service"**
4. Connect your GitHub repository:
   - You may need to authorize Render to access your GitHub
   - Select your `ncp-math` repository

### 3.2 Configure Your Web Service

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `ncp-math` (or whatever you prefer) |
| **Region** | Choose closest to your users |
| **Branch** | `main` (or your default branch) |
| **Root Directory** | Leave blank |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 3.3 Add Environment Variables

Scroll down to the **Environment Variables** section and add these:

Click **"Add Environment Variable"** for each of these:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Sets production mode |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `SESSION_SECRET` | `<generate-random-string>` | Use a long random string (30+ characters) |
| `JWT_SECRET` | `<generate-random-string>` | Different from SESSION_SECRET |
| `PORT` | `10000` | Render uses port 10000 by default |

**For Google Sheets integration** (if you use it):
| Key | Value | Notes |
|-----|-------|-------|
| `GOOGLE_CLIENT_EMAIL` | From your `credentials.json` | The `client_email` field |
| `GOOGLE_PRIVATE_KEY` | From your `credentials.json` | The `private_key` field (keep the `\n` characters) |
| `SPREADSHEET_ID` | Your Google Sheet ID | From the sheet URL |

**For Email (Nodemailer)** (if you use it):
| Key | Value |
|-----|-------|
| `EMAIL_HOST` | Your email provider SMTP host |
| `EMAIL_PORT` | SMTP port (usually 587) |
| `EMAIL_USER` | Your email username |
| `EMAIL_PASS` | Your email password or app password |

> **Tip**: To generate random secrets, you can use this command in your terminal:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3.4 Deploy!

1. Click **"Create Web Service"** at the bottom
2. Render will start building and deploying your app
3. This usually takes 2-5 minutes
4. Watch the logs in real-time to see the deployment progress

---

## Step 4: Access Your Deployed Site

Once deployment is complete:

1. Your site will be live at: `https://ncp-math.onrender.com` (or whatever name you chose)
2. The first request might be slow (free tier services sleep after inactivity)
3. Test all features:
   - Homepage ✓
   - Login/Register ✓
   - Student Dashboard ✓
   - Teacher Dashboard ✓
   - Check-in functionality ✓

---

## Troubleshooting

### The site won't load
- Check the Render logs for errors
- Make sure all environment variables are set correctly
- Verify your MongoDB connection string is correct

### Database connection errors
- Make sure MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check that your MongoDB URI is correct (including password)
- Verify the database user has read/write permissions

### Session/Authentication issues
- Make sure `SESSION_SECRET` and `JWT_SECRET` are set
- Verify cookies are being set with `secure: true` in production

### Google Sheets integration not working
- Make sure you've added the service account email to your Google Sheet (as an editor)
- Check that `GOOGLE_PRIVATE_KEY` includes all the `\n` characters
- The private key should be enclosed in quotes if it has line breaks

---

## Updating Your Deployment

When you make changes to your code:

1. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```

2. Render will **automatically redeploy** when it detects changes on your main branch!

---

## Custom Domain (Optional)

To use your own domain (e.g., `ncpmath.org`):

1. In Render dashboard, go to your web service
2. Click "Settings"
3. Scroll to "Custom Domain"
4. Follow the instructions to add your domain
5. Render provides free SSL certificates!

---

## Free Tier Limitations

Render's free tier has these limitations:
- Services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- 750 hours per month of runtime (enough for one service running 24/7)

If you need your site to never sleep, you can:
- Upgrade to a paid tier ($7/month)
- Use a service like [UptimeRobot](https://uptimerobot.com) to ping your site every 14 minutes

---

## Need Help?

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Render Community**: [community.render.com](https://community.render.com)
- Check the Render logs in the dashboard for error messages

Good luck with your deployment! 🚀
