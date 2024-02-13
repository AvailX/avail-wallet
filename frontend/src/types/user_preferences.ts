
 export interface initial_preferences {
     biometric: boolean;
     username: string;
}

export interface user_preferences {
    theme: Theme;
    biometric: boolean;
    username: string;
    language: Language;
}

enum Theme {
    LIGHT = "light",
    DARK = "dark"
}

enum Language {
    ENGLISH = "english"
}