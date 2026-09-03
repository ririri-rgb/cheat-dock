use std::path::Path;

#[cfg(target_os = "macos")]
pub fn reveal(path: &Path) -> Result<(), String> {
    use objc2_app_kit::{NSWorkspace, NSWorkspaceDesktopImageOptionKey};

    // NSWorkspaceDesktopImageOptionKey is an objc2-app-kit public alias of
    // Foundation's NSString, already exposed by the enabled NSWorkspace feature.
    // Keeping the conversion inside this macOS-only boundary avoids adding a
    // broad filesystem/shell plugin solely to reveal the app-owned directory.
    let full_path = NSWorkspaceDesktopImageOptionKey::from_str(&path.to_string_lossy());
    let parent_path = path.parent().unwrap_or(path);
    let parent = NSWorkspaceDesktopImageOptionKey::from_str(&parent_path.to_string_lossy());
    let selected = NSWorkspace::sharedWorkspace()
        .selectFile_inFileViewerRootedAtPath(Some(&full_path), &parent);
    if selected {
        Ok(())
    } else {
        Err("Finder did not accept the user-data reveal request.".into())
    }
}

#[cfg(not(target_os = "macos"))]
pub fn reveal(_path: &Path) -> Result<(), String> {
    Err("Open Data Folder is currently implemented for macOS only.".into())
}
