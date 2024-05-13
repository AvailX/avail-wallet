import * as React from 'react';
import * as mui from '@mui/material';

import {useNavigate} from 'react-router-dom';

function Existing() {
    const navigate = useNavigate();


    const handleNavigation = () => {
        navigate('/next-page');
    };

    return (
        <mui.Box>
            <mui.Button onClick={handleNavigation}>

            </mui.Button>
        </mui.Box>
    )
}

export default Existing;