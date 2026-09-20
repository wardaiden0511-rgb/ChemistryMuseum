# The Chemistry Behind Everyday Life

An offline desktop museum with six interactive exhibits: Soda, Soap, Fire, Ice, Medicine, and Food. All graphics, fonts, explanations, and animations are bundled inside the app.

## Run on this Windows computer

Double-click **Launch Museum.cmd**. The finished Windows app is in `release/win-unpacked/`. Keep that whole folder together if moving it; the executable needs the files beside it.

For development on another computer, install Node.js 24, open this project folder in a terminal, then run:

```sh
npm ci
npm start
```

## Make a MacBook installer from Windows

You do not need a Mac. GitHub Actions runs the build on a hosted Mac.

1. Create a GitHub repository for the project. Upload the contents of **Chemistry-Museum-Source.zip** after extracting it, including the `.github` folder. The repository root must contain `package.json`, `package-lock.json`, `electron-builder.cjs`, and `.github/workflows/mac-installer.yml`. Do not upload `node_modules` or the Windows build.
2. Open the repository's **Actions** tab. Select **Build Mac installer** → **Run workflow** → **Run workflow**.
3. When the run succeeds, open it and scroll to **Artifacts**. Download **Chemistry-Museum-Mac-unnotarized** (or **Chemistry-Museum-Mac-notarized**, if signing was selected).
4. Extract the downloaded ZIP. Send your friend **The-Chemistry-Behind-Everyday-Life-1.0.0-universal.dmg**.

The universal installer supports **Apple silicon and Intel Macs running macOS 13 or newer**. Your friend opens the DMG, drags the app to **Applications**, and launches it. No source code, terminal, dependencies, coding tools, or internet connection are needed to use the installed app.

**Apple's first-open check:** The default personal-sharing build is ad-hoc signed, but not Apple-notarized. macOS may require the recipient to allow this known app through **System Settings → Privacy & Security → Open Anyway** after the first launch attempt. Managed Macs may prohibit this. To get the normal verified distribution experience without this override, build with your Apple Developer ID certificate and notarization credentials as described below. No signing credentials are included in this project.

### Signed distribution (normal verified installation)

In the GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret**. Add:

| Secret | Value |
| --- | --- |
| `CSC_LINK` | Base64-encoded Developer ID Application `.p12` certificate |
| `CSC_KEY_PASSWORD` | Password for that certificate |
| `APPLE_ID` | Your Apple Developer account email |
| `APPLE_APP_SPECIFIC_PASSWORD` | Apple app-specific password for notarization |
| `APPLE_TEAM_ID` | Your Apple Developer team ID |

Run the same workflow with **Sign and notarize** checked. The build fails if credentials are missing or signing/notarization fails. It checks the notarization ticket before uploading the DMG. Keep credentials in GitHub Secrets, never in source files. See [Electron's signing guide](https://www.electronjs.org/docs/latest/tutorial/code-signing) and [electron-builder v26 macOS documentation](https://www.electron.build/v26/docs/mac/).

### Build directly on a Mac

```sh
npm ci
npm run package:mac
```

Find the installer at `release/The-Chemistry-Behind-Everyday-Life-1.0.0-universal.dmg`. The `.app` bundle is inside `release/mac-universal/`. The Mac workflow verifies the binary includes both architectures, verifies the DMG, and smoke-tests the packaged app without network access.

## Verification

```sh
npm test
npx playwright install chromium
npm run test:ui
npm run build
npm run test:desktop
```

The tests check formula and bond valences, all eight fire-triangle combinations, phase boundaries, all exhibit controls, navigation, layout overflow, and offline Electron startup. UI tests save screenshots to `test-results/`. `npm run package:windows` creates the standalone Windows app folder.

Validated on Windows on September 20, 2026: all 5 chemistry checks and 8 browser interaction tests passed. The final packaged Windows app passed all six exhibit interactions with networking disabled and made no remote requests. The local frame sample stayed smooth (median 4.2 ms per frame on this computer; other hardware will differ). The Mac workflow is included and its configuration has been checked, but it has not yet been run on a hosted Mac, so no `.dmg` has been generated in this folder.

## Educational references

Models use time and size scales chosen for clarity. The micelle and ice lattice are schematic. The aspirin model includes every atom and correct connectivity; the target animation is a generic explanation of recognition, not aspirin's actual biological mechanism. pH values are approximate; neutral pH 7 refers to about 25°C. Boiling and freezing thresholds refer to normal atmospheric pressure.

- [ACS: The Secret Science of Soda Pop](https://www.acs.org/education/whatischemistry/adventures-in-chemistry/secret-science-stuff/soda-pop.html)
- [ACS: The Water Molecule and Dissolving](https://www.acs.org/middleschoolchemistry/lessonplans/chapter5.html)
- [ACS: Self-Assembly and Soap Micelles](https://pubs.acs.org/doi/abs/10.1021/bk-2023-1457.ch005)
- [NFPA: Introduction to Wildland Fire Behavior and the fire triangle](https://www.nfpa.org/-/media/Project/Storefront/Catalog/Files/Certification/CWMS/S-190-Intro-to-Wildland-Fire-Behavior-2020.pdf)
- [USGS: Evaporation and the Water Cycle](https://www.usgs.gov/water-science-school/science/evaporation-and-water-cycle)
- [PubChem: Aspirin, CID 2244](https://pubchem.ncbi.nlm.nih.gov/compound/Aspirin)
- [USGS: pH and Water](https://www.usgs.gov/water-science-school/science/ph-and-water)
- [ACS: The Science of Baking Soda](https://axial.acs.org/multidisciplinary/the-science-of-baking-soda)

Manrope and DM Sans are bundled under their SIL Open Font Licenses (included in the dependency packages). App icon and illustrations are original vector drawings. The app performs no remote requests.
