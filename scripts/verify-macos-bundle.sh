#!/bin/bash
set -euo pipefail

APP_PATH="${1:?usage: verify-macos-bundle.sh /path/to/Cheat Dock.app [adhoc|developer-id]}"
SIGNING_MODE="${2:-adhoc}"
PLIST="$APP_PATH/Contents/Info.plist"

if [[ ! -d "$APP_PATH" || ! -f "$PLIST" ]]; then
  echo "Missing macOS app bundle: $APP_PATH" >&2
  exit 1
fi

EXPECTED_IDENTIFIER="dev.cheatdock.app"
EXPECTED_PRODUCT="Cheat Dock"
EXPECTED_EXECUTABLE="cheat-dock"
EXPECTED_VERSION="$(node -p "JSON.parse(require('fs').readFileSync('src-tauri/tauri.conf.json','utf8')).version")"
EXPECTED_MINIMUM="$(node -p "JSON.parse(require('fs').readFileSync('src-tauri/tauri.conf.json','utf8')).bundle.macOS.minimumSystemVersion")"

read_plist() {
  /usr/libexec/PlistBuddy -c "Print :$1" "$PLIST"
}

assert_equal() {
  local label="$1" expected="$2" actual="$3"
  if [[ "$actual" != "$expected" ]]; then
    echo "$label mismatch: expected '$expected', got '$actual'" >&2
    exit 1
  fi
}

assert_equal AppBundleName "$EXPECTED_PRODUCT.app" "$(basename "$APP_PATH")"
assert_equal CFBundleIdentifier "$EXPECTED_IDENTIFIER" "$(read_plist CFBundleIdentifier)"
assert_equal CFBundleName "$EXPECTED_PRODUCT" "$(read_plist CFBundleName)"
assert_equal CFBundleExecutable "$EXPECTED_EXECUTABLE" "$(read_plist CFBundleExecutable)"
assert_equal CFBundleShortVersionString "$EXPECTED_VERSION" "$(read_plist CFBundleShortVersionString)"
assert_equal CFBundleVersion "$EXPECTED_VERSION" "$(read_plist CFBundleVersion)"
assert_equal LSMinimumSystemVersion "$EXPECTED_MINIMUM" "$(read_plist LSMinimumSystemVersion)"

EXECUTABLE_PATH="$APP_PATH/Contents/MacOS/$EXPECTED_EXECUTABLE"
[[ -x "$EXECUTABLE_PATH" ]] || { echo "Missing executable: $EXECUTABLE_PATH" >&2; exit 1; }

ARCHS="$(lipo -archs "$EXECUTABLE_PATH")"
[[ " $ARCHS " == *" arm64 "* ]] || { echo "Universal app is missing arm64: $ARCHS" >&2; exit 1; }
[[ " $ARCHS " == *" x86_64 "* ]] || { echo "Universal app is missing x86_64: $ARCHS" >&2; exit 1; }

codesign --verify --deep --strict --verbose=2 "$APP_PATH"
SIGNATURE_INFO="$(codesign -d --verbose=4 "$APP_PATH" 2>&1)"
echo "$SIGNATURE_INFO"

ENTITLEMENTS="$(codesign -d --entitlements :- "$APP_PATH" 2>&1 || true)"
if grep -q 'com.apple.security.get-task-allow' <<<"$ENTITLEMENTS" && \
   grep -A1 'com.apple.security.get-task-allow' <<<"$ENTITLEMENTS" | grep -q '<true'; then
  echo 'Release app must not enable com.apple.security.get-task-allow.' >&2
  exit 1
fi

case "$SIGNING_MODE" in
  adhoc)
    grep -q 'Signature=adhoc' <<<"$SIGNATURE_INFO" || { echo 'Expected ad-hoc signature for CI qualification build.' >&2; exit 1; }
    ;;
  developer-id)
    grep -q 'Authority=Developer ID Application:' <<<"$SIGNATURE_INFO" || { echo 'Expected Developer ID Application signature.' >&2; exit 1; }
    grep -Eq 'flags=.*runtime' <<<"$SIGNATURE_INFO" || { echo 'Expected hardened runtime flag.' >&2; exit 1; }
    spctl --assess --type execute --verbose=4 "$APP_PATH"
    xcrun stapler validate "$APP_PATH"
    ;;
  *)
    echo "Unknown signing mode: $SIGNING_MODE" >&2
    exit 1
    ;;
esac

printf 'Verified %s\n  identifier: %s\n  executable: %s\n  short/build version: %s\n  minimum macOS: %s\n  architectures: %s\n  signing: %s\n' \
  "$APP_PATH" "$EXPECTED_IDENTIFIER" "$EXPECTED_EXECUTABLE" "$EXPECTED_VERSION" "$EXPECTED_MINIMUM" "$ARCHS" "$SIGNING_MODE"
