use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct ScanProgressPayload {
    pub progress: f32,
}

// TODO : Transaction execution event
// TODO : Transaction confirmed event
// TODO : Transaction failed event
