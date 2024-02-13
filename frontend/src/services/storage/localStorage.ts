export const set_backup_updated = ()=>{
    localStorage.setItem('backup_updated', 'true')
}

export const get_backup_updated = ()=>{
    let backup= localStorage.getItem('backup_updated');
    let backup_bool = backup === 'true' ? true : false;

    return backup_bool;
}

// To be on home page, and allow actions to happen on the first time the user visits the app (create guide)
export const set_first_visit = ()=>{
    localStorage.setItem('first_visit', 'true')
}

export const get_first_visit = ()=>{
    let first_visit= localStorage.getItem('first_visit');
    let first_visit_bool = first_visit === 'true' ? true : false;

    return first_visit_bool;
}