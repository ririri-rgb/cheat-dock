#!/bin/bash
set -euo pipefail

APP_PATH="${1:?usage: resign-macos-adhoc.sh /path/to/Cheat Dock.app}"
EXPECTED_EXECUTABLE="cheat-dock"
EXPECTED_PAGE_SIZE="4096"
EXECUTABLE_PATH="$APP_PATH/Contents/MacOS/$EXPECTED_EXECUTABLE"

if [[ ! -d "$APP_PATH" || ! -x "$EXECUTABLE_PATH" ]]; then
  echo "Missing macOS app bundle or executable: $APP_PATH" >&2
  exit 1
fi

codesign --force --sign - --options runtime --pagesize="$EXPECTED_PAGE_SIZE" "$EXECUTABLE_PATH"
codesign --force --sign - --options runtime --pagesize="$EXPECTED_PAGE_SIZE" "$APP_PATH"
codesign --verify --deep --strict --verbose=2 "$APP_PATH"

SIGNATURE_INFO="$(codesign -d --verbose=4 "$APP_PATH" 2>&1)"
echo "$SIGNATURE_INFO"

grep -q 'Signature=adhoc' <<<"$SIGNATURE_INFO" || {
  echo 'Expected ad-hoc signature after page-size normalization.' >&2
  exit 1
}
grep -Eq 'flags=.*runtime' <<<"$SIGNATURE_INFO" || {
  echo 'Expected hardened runtime flag after page-size normalization.' >&2
  exit 1
}
grep -q "Page size=$EXPECTED_PAGE_SIZE" <<<"$SIGNATURE_INFO" || {
  echo "Expected code-signature page size $EXPECTED_PAGE_SIZE." >&2
  exit 1
}

printf 'Re-signed %s with ad-hoc Hardened Runtime signature and %s-byte code-signature pages.\n' \
  "$APP_PATH" "$EXPECTED_PAGE_SIZE"
