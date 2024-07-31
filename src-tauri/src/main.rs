// Prevents additional console window on Windows in release, DO NOT REMOVE!!

#![windows_subsystem = "windows"]

mod api;
mod helpers;
mod models;
mod services;

fn main() {
    #[cfg(desktop)]
    availx_lib::run();
}
