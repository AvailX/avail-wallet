
// To be on home page, and allow actions to happen on the first time the user visits the app (create guide)
export const set_first_visit = () => {
	localStorage.setItem('first_visit', 'true');
};

export const get_first_visit = () => {
	const first_visit = localStorage.getItem('first_visit');
	const first_visit_bool = first_visit === 'true';

	return first_visit_bool;
};

export const set_visit_session_flag = () => {
	sessionStorage.setItem('visit_session', 'true');
};

export const get_visit_session_flag = () => {
	const visit_session = sessionStorage.getItem('visit_session');
	const visit_session_bool = visit_session === 'true';

	return visit_session_bool;
};
