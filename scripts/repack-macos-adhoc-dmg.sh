#!/bin/bash
set -euo pipefail

DMG_PATH="${1:?usage: repack-macos-adhoc-dmg.sh /path/to/Cheat Dock.dmg}"

if [[ ! -f "$DMG_PATH" ]]; then
  echo "Missing DMG: $DMG_PATH" >&2
  exit 1
fi

WORK_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/cheat-dock-dmg.XXXXXX")"
RW_DMG="$WORK_ROOT/cheat-dock-rw.dmg"
FINAL_DMG="$WORK_ROOT/cheat-dock-final.dmg"
MOUNT="$WORK_ROOT/mount"
mkdir -p "$MOUNT"
MOUNTED=0

cleanup() {
  if [[ "$MOUNTED" == "1" ]]; then
    hdiutil detach "$MOUNT" -force >/dev/null 2>&1 || true
  fi
  rm -rf "$WORK_ROOT"
}
trap cleanup EXIT

hdiutil convert "$DMG_PATH" -format UDRW -o "$RW_DMG"
hdiutil attach "$RW_DMG" -nobrowse -mountpoint "$MOUNT"
MOUNTED=1

DMG_APP="$(find "$MOUNT" -maxdepth 1 -name '*.app' -print -quit)"
test -n "$DMG_APP" && test -d "$DMG_APP"
test -e "$MOUNT/Applications"

bash scripts/resign-macos-adhoc.sh "$DMG_APP"

hdiutil detach "$MOUNT"
MOUNTED=0
hdiutil convert "$RW_DMG" -format UDZO -imagekey zlib-level=9 -o "$FINAL_DMG"
mv -f "$FINAL_DMG" "$DMG_PATH"

printf 'Repacked %s with a 4 KiB-page ad-hoc-signed app payload.\n' "$DMG_PATH"
