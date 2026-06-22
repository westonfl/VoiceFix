# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure environment

   ```bash
   cp .env.example .env
   ```

   Set `EXPO_PUBLIC_ANALYSIS_SERVER_URL` in `.env` to your analysis server URL.
   Add the RevenueCat public SDK key for each supported platform and make sure
   `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID` matches the entitlement attached to
   your products. Restart Expo after changing environment values.

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Run on a physical iPhone

For live development on a real device, start Metro on your local network before
opening the app:

```bash
npm run start:lan
```

Then install or launch the iOS app on the device:

```bash
npm run ios:device
```

Keep the iPhone and Mac on the same Wi-Fi network. If the phone cannot reach the
Mac because of Wi-Fi isolation, VPN, firewall, or hotspot routing, use:

```bash
npm run start:tunnel
```

The red screen `No script URL provided` means the debug app opened without a
reachable Metro URL and without an embedded JS bundle. To install a build that
does not depend on Metro, use:

```bash
npm run ios:device:release
```

RevenueCat runs in Preview API mode inside Expo Go. Use a development build or
release build to test real StoreKit / Google Play purchases. The app renders its
own hard paywall immediately after onboarding, using the products and localized
prices from RevenueCat's current offering. No RevenueCat-hosted paywall is shown.

## Release builds

Link the Expo project when prompted, and keep production environment values in
EAS rather than committing `.env`:

```bash
eas build --profile preview --platform ios
eas build --profile production --platform all
eas submit --profile production --platform ios
```

Before a production build, set `EXPO_PUBLIC_ANALYSIS_SERVER_URL`,
`EXPO_PUBLIC_REHEAR_API_KEY`, both RevenueCat SDK keys, and the entitlement ID
for the build profile. Production must use an HTTPS analysis server.

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
