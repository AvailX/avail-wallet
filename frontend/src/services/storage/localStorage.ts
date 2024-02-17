
// To be on home page, and allow actions to happen on the first time the user visits the app (create guide)
export const set_first_visit = ()=>{
    localStorage.setItem('first_visit', 'true')
}

export const get_first_visit = ()=>{
    let first_visit= localStorage.getItem('first_visit');
    let first_visit_bool = first_visit === 'true' ? true : false;

    return first_visit_bool;
}

export const set_visit_session_flag = ()=>{
    sessionStorage.setItem('visit_session', 'true')
}

export const get_visit_session_flag = ()=>{
    let visit_session= sessionStorage.getItem('visit_session');
    let visit_session_bool = visit_session === 'true' ? true : false;

    return visit_session_bool;
}

