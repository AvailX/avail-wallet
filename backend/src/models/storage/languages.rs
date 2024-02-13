use bip39::Language;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum Languages {
    English,
    ChineseSimplified,
    ChineseTraditional,
    Russian,
    Spanish,
    Italian,
    Turkish,
    Estonian,
    Lithuanian,
    Latvian,
    Dutch,
    Japanese,
}

impl Languages {
    pub fn to_string(&self) -> String {
        match self {
            Languages::English => "English".to_string(),
            Languages::ChineseSimplified => "Chinese Simplified".to_string(),
            Languages::ChineseTraditional => "Chinese Traditional".to_string(),
            Languages::Russian => "Russian".to_string(),
            Languages::Spanish => "Spanish".to_string(),
            Languages::Italian => "Italian".to_string(),
            Languages::Turkish => "Turkish".to_string(),
            Languages::Estonian => "Estonian".to_string(),
            Languages::Lithuanian => "Lithuanian".to_string(),
            Languages::Latvian => "Latvian".to_string(),
            Languages::Dutch => "Dutch".to_string(),
            Languages::Japanese => "Japanese".to_string(),
        }
    }

    pub fn to_string_short(&self) -> String {
        match self {
            Languages::English => "en".to_string(),
            Languages::ChineseSimplified => "zh-cn".to_string(),
            Languages::ChineseTraditional => "zh-tw".to_string(),
            Languages::Russian => "ru".to_string(),
            Languages::Spanish => "es".to_string(),
            Languages::Italian => "it".to_string(),
            Languages::Turkish => "tr".to_string(),
            Languages::Estonian => "et".to_string(),
            Languages::Lithuanian => "lt".to_string(),
            Languages::Latvian => "lv".to_string(),
            Languages::Dutch => "nl".to_string(),
            Languages::Japanese => "ja".to_string(),
        }
    }

    pub fn from_string_short(s: &str) -> Option<Languages> {
        match s {
            "en" => Some(Languages::English),
            "zh-cn" => Some(Languages::ChineseSimplified),
            "zh-tw" => Some(Languages::ChineseTraditional),
            "ru" => Some(Languages::Russian),
            "es" => Some(Languages::Spanish),
            "it" => Some(Languages::Italian),
            "tr" => Some(Languages::Turkish),
            "et" => Some(Languages::Estonian),
            "lt" => Some(Languages::Lithuanian),
            "lv" => Some(Languages::Latvian),
            "nl" => Some(Languages::Dutch),
            "ja" => Some(Languages::Japanese),
            _ => None,
        }
    }

    pub fn to_bip39_language(&self) -> Language {
        match self {
            Languages::English => Language::English,
            Languages::ChineseSimplified => Language::ChineseSimplified,
            Languages::ChineseTraditional => Language::ChineseTraditional,
            Languages::Spanish => Language::Spanish,
            Languages::Italian => Language::Italian,
            Languages::Japanese => Language::Japanese,
            _ => Language::English,
        }
    }
}
