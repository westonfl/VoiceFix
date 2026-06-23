# Rehear marketing site

Dependency-free static site containing the marketing homepage and public legal
and support pages required for store listings.

## Preview locally

```bash
cd marketing
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Publish

Deploy the contents of this directory to any static host. Before publishing:

1. Confirm that `ask.rehear@outlook.com` is monitored.
2. Replace the operator notes in the Privacy Policy and Terms with the legal
   entity, mailing address, governing state, and final dispute language.
3. Add the deployed Privacy, Terms, and Support URLs to App Store Connect,
   Google Play Console, RevenueCat, and the mobile app configuration.
4. Have qualified counsel review the legal pages for the operator's location
   and intended launch markets.
