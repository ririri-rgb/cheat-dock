use serde::Serialize;
use tauri::{Emitter, Manager, PhysicalPosition, Position, WebviewWindow};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};

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
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            let handle = app.handle().clone();
            TrayIconBuilder::new()
                .tooltip("Cheat Dock")
                .icon(app.default_window_icon().cloned().expect("app icon missing"))
                .on_tray_icon_event(move |_tray, event| {
                    if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, position, .. } = event {
                        let foreground = foreground_application();
                        let _ = handle.emit_to("main", "foreground-app", &foreground);
                        if let Some(window) = handle.get_webview_window("main") {
                            toggle_window(&window, position);
                        }
                    }
                })
                .build(app)?;

            if let Some(window) = app.get_webview_window("main") {
                let hide = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::Focused(false) = event {
                        let _ = hide.hide();
                    }
                });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running cheat-dock");
}
