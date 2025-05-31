# TCG Card Scanner 🎴

A React Native mobile application for scanning and analyzing Trading Card Game (TCG) cards using advanced AI-powered card grading technology.

## Features

- 📸 **Card Scanning**: Camera integration for capturing TCG cards
- 🤖 **AI Grading**: Professional card condition analysis using Ximilar AI
- 📚 **Collection Management**: Track and organize your card collection
- 🌙 **Dark Mode**: Full light/dark theme support
- 🔍 **Card Recognition**: Automatic card identification and details

## 🎥 Demo

Check out the app in action! The demo video showcases all key features including:
- Card scanning and recognition
- AI-powered card grading
- Collection management
- Dark/light theme switching
- Intuitive navigation and user interface

> 📹 **Demo Video**: `demo-video.mp4` (included in the repository)

The demo demonstrates the complete user workflow from scanning a card to viewing detailed analysis results and managing your collection.

## Prerequisites

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Quick Setup

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd TCGCardScanner
   npm install
   ```

2. **Configure Ximilar API** (Required for card grading):
   ```bash
   cp .env.example .env
   # Edit .env and add your Ximilar API token (see detailed setup below)
   ```

3. **Install iOS Dependencies**:
   ```bash
   cd ios && bundle install && bundle exec pod install && cd ..
   ```

4. **Run the App**:
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

> 📋 **Need Ximilar API access?** See the [detailed setup guide](#-ximilar-api-setup) below.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

---

# 🔑 Ximilar API Setup

This app uses Ximilar's AI-powered card grading service to analyze TCG card conditions. To use the full functionality, you'll need to set up a Ximilar account and API token.

## Step 1: Create Ximilar Account

1. **Visit Ximilar Website**: Go to [https://app.ximilar.com](https://app.ximilar.com)

2. **Sign Up**: Click "Sign Up" and create a new account with:
   - Your email address
   - A secure password
   - Company/Organization name (can be personal)

3. **Verify Email**: Check your email and verify your account by clicking the verification link

4. **Choose Plan**: 
   - **Free Tier**: Includes limited API calls for testing
   - **Paid Plans**: For production use with higher limits
   - Start with the free tier to test the functionality

## Step 2: Access Card Grader API

1. **Login**: Sign in to your Ximilar dashboard at [https://app.ximilar.com](https://app.ximilar.com)

2. **Navigate to Card Grader**: 
   - In the left sidebar, look for "Card Grader" or "Products"
   - Click on "Card Grader" to access the card grading service

3. **Enable Service**: 
   - If this is your first time, you may need to enable the Card Grader service
   - Follow the setup wizard if prompted

## Step 3: Get Your API Token

1. **Go to API Settings**: 
   - In your Ximilar dashboard, navigate to "API" or "Settings"
   - Look for "API Keys" or "Authentication" section

2. **Generate Token**: 
   - Click "Generate New Token" or "Create API Key"
   - Give it a descriptive name like "TCG Card Scanner Mobile App"
   - Copy the generated token immediately (you won't be able to see it again)

3. **Save Token Securely**: 
   - Store your API token in a secure location
   - Never share this token publicly or commit it to version control

## Step 4: Configure the App

1. **Copy Environment File**:
   ```bash
   cp .env.example .env
   ```

2. **Edit Environment Variables**:
   Open the `.env` file in your text editor and replace the placeholder:
   ```env
   # Environment Configuration for TCG Card Scanner
   # IMPORTANT: Never commit this file to version control

   # Ximilar API Configuration
   XIMILAR_API_TOKEN=your_actual_api_token_here
   XIMILAR_BASE_URL=https://api.ximilar.com/card-grader/v2

   # Development Configuration
   NODE_ENV=development
   DEBUG_MODE=true
   ```

3. **Replace the Token**:
   - Replace `your_actual_api_token_here` with your actual Ximilar API token
   - Save the file

## Step 5: Verify Setup

1. **Clean and Rebuild**:
   ```bash
   # Clean cache
   npx react-native start --reset-cache

   # For iOS
   cd ios && pod install && cd ..
   npx react-native run-ios

   # For Android
   npx react-native run-android
   ```

2. **Test API Connection**:
   - Open the app and navigate to the Scanner screen
   - Try scanning a card image
   - If configured correctly, you should see card grading results

## Troubleshooting

### Invalid API Token Error
- Double-check your API token in the `.env` file
- Ensure there are no extra spaces or characters
- Verify the token is still active in your Ximilar dashboard

### Network Connection Issues
- Ensure your device/simulator has internet access
- Check if you're behind a corporate firewall
- Try the demo mode first to test app functionality

### API Rate Limits
- Free tier has limited API calls per month
- Monitor your usage in the Ximilar dashboard
- Consider upgrading to a paid plan for production use

### Environment Variables Not Loading
- Make sure the `.env` file is in the project root
- Restart Metro bundler after changing environment variables
- For iOS, clean and rebuild the project

## Demo Mode

If you want to test the app without setting up Ximilar immediately:

1. The app includes fallback demo data for testing
2. Card grading will show simulated results
3. All other features (collection, dark mode, etc.) work normally

## API Documentation

For more advanced usage and API details:
- [Ximilar Card Grader API Documentation](https://docs.ximilar.com/card-grader/)
- [API Rate Limits and Pricing](https://ximilar.com/pricing/)
- [Support and Contact](https://ximilar.com/contact/)

## Security Best Practices

⚠️ **Important Security Notes**:

1. **Never commit your `.env` file to version control**
2. **Don't share your API token publicly**
3. **Regenerate your token if compromised**
4. **Use different tokens for development/production**
5. **Monitor API usage regularly**

The `.env` file is already included in `.gitignore` to prevent accidental commits.
