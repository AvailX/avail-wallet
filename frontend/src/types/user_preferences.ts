
export type initial_preferences = {
	biometric: boolean;
	username: string;
};

export type user_preferences = {
	theme: Theme;
	biometric: boolean;
	username: string;
	language: Language;
};

enum Theme {
	LIGHT = 'light',
	DARK = 'dark',
}

enum Language {
	ENGLISH = 'english',
}
