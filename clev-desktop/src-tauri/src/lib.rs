//! Clev — Tauri v2 backend.
//! Provides REAL OS telemetry (sysinfo), active-window/media-title detection
//! for vibe-checking, tray-to-minimize behaviour, and a global summon shortcut.

use serde::Serialize;
use sysinfo::{CpuExt, DisksExt, MemoryExt, System, SystemExt};
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager, Runtime, Wry,
};
use tauri_plugin_global_shortcut::ShortcutState;

#[derive(Serialize)]
struct HardwareMetrics {
    cpu_percent: f32,
    mem_used_gb: f64,
    mem_total_gb: f64,
    disk_used_gb: f64,
    disk_total_gb: f64,
    uptime_secs: u64,
    core_count: usize,
}

/// Real hardware metrics via sysinfo — replaces the old simulated web panels.
#[tauri::command]
fn get_hardware_metrics() -> HardwareMetrics {
    let mut sys = System::new_all();
    sys.refresh_cpu();
    sys.refresh_memory();
    sys.refresh_disks_list();
    // Small spin so the CPU delta is meaningful.
    std::thread::sleep(std::time::Duration::from_millis(120));
    sys.refresh_cpu();

    let mut cpu = 0.0_f32;
    let mut n = 0.0_f32;
    for c in sys.cpus() {
        cpu += c.cpu_usage();
        n += 1.0;
    }

    let mut d_used = 0_u64;
    let mut d_total = 0_u64;
    for d in sys.disks() {
        d_total += d.total_space();
        d_used += d.total_space().saturating_sub(d.available_space());
    }

    HardwareMetrics {
        cpu_percent: if n > 0.0 { cpu / n } else { 0.0 },
        mem_used_gb: (sys.used_memory() as f64) / 1_073_741_824.0,
        mem_total_gb: (sys.total_memory() as f64) / 1_073_741_824.0,
        disk_used_gb: (d_used as f64) / 1_073_741_824.0,
        disk_total_gb: (d_total as f64) / 1_073_741_824.0,
        uptime_secs: sys.uptime(),
        core_count: sys.cpus().len(),
    }
}

/// The foreground window title — used by the frontend to vibe-check music apps
/// (Spotify/foobar titles like "Song — Artist") and feed the lyric sentiment service.
#[cfg(windows)]
#[tauri::command]
fn get_active_window_title() -> String {
    use windows::Win32_UI_WindowsAndMessaging::{GetForegroundWindow, GetWindowTextLengthW, GetWindowTextW};
    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.is_invalid() {
            return String::new();
        }
        let len = GetWindowTextLengthW(hwnd) as usize;
        if len == 0 {
            return String::new();
        }
        let mut buf: Vec<u16> = vec![0; len + 1];
        GetWindowTextW(hwnd, &mut buf);
        String::from_utf16_lossy(&buf).trim().to_string()
    }
}

#[cfg(not(windows))]
#[tauri::command]
fn get_active_window_title() -> String {
    // Cross-platform fallback: `xdotool` on Linux, osascript on macOS.
    #[cfg(target_os = "macos")]
    let out = std::process::Command::new("osascript")
        .args(["-e", "tell application \"System Events\" to get name of first process whose frontmost is true"])
        .output();
    #[cfg(target_os = "linux")]
    let out = std::process::Command::new("xdotool").args(["getactivewindow", "getwindowname"]).output();
    #[cfg(not(any(target_os = "macos", target_os = "linux")))]
    let out: Result<std::process::Output, std::io::Error> = Err(std::io::Error::other("unsupported"));

    out.ok
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_default()
}

/// Hide instead of close → Clev minimises to the system tray.
fn hide_to_tray<R: Runtime>(app: &tauri::AppHandle<R>) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.hide();
    }
}

pub fn run() {
    let app = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_hardware_metrics,
            get_active_window_title
        ])
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcuts(["ctrl+alt+c"])
                .expect("failed to bind global shortcut")
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        // Toggle visibility: summon / shoo-away Clev.
                        if let Some(w) = app.get_webview_window("main") {
                            if w.is_visible().unwrap_or(false) {
                                let _ = w.hide();
                            } else {
                                let _ = w.show();
                                let _ = w.set_focus();
                            }
                        }
                    }
                })
                .build(),
        )
        .setup(|app: &mut tauri::App<Wry>| {
            // ---- System tray: Show / Hide / Quit (tray-minimising) ----
            let show_i = MenuItem::with_id(app, "show", "Summon Clev 👋", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "Shoo away 🫣", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit Clev", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &hide_i, &quit_i])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("Clev — your jolly desktop companion")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                    "hide" => hide_to_tray(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            // Closing the widget = minimise to tray, never kill the companion.
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .build(tauri::generate_context!())
        .expect("error while building Clev");

    app.run(|_app, _event| {});
}
