# Commons 👋

A location-based note-taking and recommendations app for iOS and web. Commons lets you capture thoughts, tips, and discoveries tied to the places that inspired them — and surfaces relevant notes and recommendations when you return.

Built with [Expo](https://expo.dev) using [`create-expo-app`](https://www.npmjs.com/package/create-expo-app) and file-based routing via [Expo Router](https://docs.expo.dev/router/introduction).

---

## Get Started

### Install dependencies
```bash
pnpm install
```

### Start the app
```bash
pnpm start
```

From the output you can open the app in a:
- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Android Emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [Expo Go](https://expo.dev/go) — a limited sandbox for quick testing

### Run on iOS Simulator
```bash
pnpm run ios
```

> Make sure Xcode and the iOS Simulator are installed before running. You can install Xcode from the App Store, then open it once to complete setup.

---

## Development

Start developing by editing files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

### Reset to a blank project
When you're ready to clear out the starter code:
```bash
pnpm run reset-project
```

This moves the starter code to **app-example** and creates a fresh blank **app** directory.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Expo + React Native |
| Web support | Expo Router |
| Styling | NativeWind (Tailwind for RN) |
| Backend / DB | Supabase (Postgres + PostGIS) |
| Auth | Supabase Auth |
| AI | Vercel AI SDK + Anthropic Claude |
| Package manager | pnpm |

---

## Roadmap

- [ ] Pin notes to specific locations on a map
- [ ] Surface saved notes when re-entering a location
- [ ] AI-generated recommendations based on past notes
- [ ] Share notes/recommendations with friends
- [ ] Curated public "commons" for neighborhoods and cities
- [ ] iOS widget for quick note capture

---

## Resources

- [Expo documentation](https://docs.expo.dev/)
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/)
- [Expo on GitHub](https://github.com/expo/expo)
- [Expo Discord community](https://chat.expo.dev)