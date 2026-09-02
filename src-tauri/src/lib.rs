mod storage;

use serde::Serialize;
use std::path::PathBuf;
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{Emitter, Manager, PhysicalPosition, Position, WebviewWindow};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ForegroundApplication {
    bundle_id: Option<String>,
    name: Option<String>,
}

fn foreground_application() -> ForegroundApplication {
    #[cfg(target_os = "macos")]
    {
        use objc2_app_kit::NSWorkspace;
        let workspace = NSWorkspace::sharedWorkspace();
        if let Some(app) = workspace.frontmostApplication() {
            return ForegroundApplication {
                bundle_id: app.bundleIdentifier().map(|value| value.to_string()),
                name: app.localizedName().map(|value| value.to_string()),
            };
        }
    }
    ForegroundApplication { bundle_id: None, name: None }
}

fn storage_root(app: &tauri::AppHandle) -> Result<PathBuf, storage::CommandError> {
    app.path()
        .app_data_dir()
        .map(|path| storage::user_data_root(&path))
        .map_err(|error| storage::CommandError {
            code: "app-data-path".into(),
            message: format!("Unable to resolve the OS application-data directory: {error}"),
            relative_path: None,
        })
}

#[tauri::command]
fn load_user_documents(app: tauri::AppHandle) -> Result<storage::LoadResult, storage::CommandError> {
    storage::load_from_root(&storage_root(&app)?)
}

#[tauri::command]
fn write_user_document(
    app: tauri::AppHandle,
    request: storage::WriteRequest,
) -> Result<storage::WriteResult, storage::CommandError> {
    storage::write_to_root(&storage_root(&app)?, &request)
}

#[tauri::command]
fn delete_user_document(
    app: tauri::AppHandle,
    request: storage::DeleteRequest,
) -> Result<(), storage::CommandError> {
    storage::delete_from_root(&storage_root(&app)?, &request)
}

#[tauri::command]
fn user_data_path(app: tauri::AppHandle) -> Result<String, storage::CommandError> {
    let root = storage_root(&app)?;
    storage::ensure_layout(&root)?;
    Ok(root.to_string_lossy().to_string())
}

#[cfg(target_os = "macos")]
fn configure_macos_panel(window: &WebviewWindow) {
    use objc2_app_kit::{NSWindow, NSWindowButton};

    if let Ok(ns_window_ptr) = window.ns_window() {
        let ns_window = unsafe { &*(ns_window_ptr as *mut NSWindow) };
        for button_type in [
            NSWindowButton::CloseButton,
            NSWindowButton::MiniaturizeButton,
            NSWindowButton::ZoomButton,
        ] {
            if let Some(button) = ns_window.standardWindowButton(button_type) {
                button.setHidden(true);
            }
        }
    }
}

fn toggle_window(window: &WebviewWindow, tray_position: PhysicalPosition<f64>) {
    if window.is_visible().unwrap_or(false) && window.is_focused().unwrap_or(false) {
        let _ = window.hide();
        return;
    }
    if let Ok(size) = window.outer_size() {
        let x = (tray_position.x - f64::from(size.width) + 18.0).max(8.0);
        let y = tray_position.y + 8.0;
        let _ = window.set_position(Position::Physical(PhysicalPosition::new(x as i32, y as i32)));
    }
    let _ = window.show();
    let _ = window.set_focus();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            load_user_documents,
            write_user_document,
            delete_user_document,
            user_data_path
        ])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            if let Some(window) = app.get_webview_window("main") {
                #[cfg(target_os = "macos")]
                configure_macos_panel(&window);

                let hide = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::Focused(false) = event {
                        let _ = hide.hide();
                    }
                });
            }

            let handle = app.handle().clone();
            TrayIconBuilder::new()
                .tooltip("Cheat Dock")
                .icon(app.default_window_icon().cloned().expect("app icon missing"))
                .on_tray_icon_event(move |_tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        position,
                        ..
                    } = event
                    {
                        let foreground = foreground_application();
                        let _ = handle.emit_to("main", "foreground-app", &foreground);
                        if let Some(window) = handle.get_webview_window("main") {
                            toggle_window(&window, position);
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running cheat-dock");
}
