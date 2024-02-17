import * as React from 'react';
import * as mui from '@mui/material';

import Layout from './reusable/layout';

//typography 
import { BodyText,Title2Text,SubMainTitleText } from '../components/typography/typography';

import { ArrowBack } from '@mui/icons-material';

function Oops(){
    return(
        <Layout>
             <mui.Button
                variant="contained"
                onClick={() => {
                    window.history.back();
                }}
                sx={{width: "10%",bgcolor:'transparent',boxShadow:'none',mt:'3%', ml:'2%','&:hover': {
                    backgroundColor: '#00FFAA',
                    boxShadow: '0 0 8px 2px rgba(0, 255, 170, 0.6)',
                    transform: 'scale(1.03)'
                  },
                  '&:focus': {
                    backgroundColor: '#00FFAA',
                    boxShadow: '0 0 8px 2px rgba(0, 255, 170, 0.8)',
                  },}}
            >
                <ArrowBack  sx={{width:'30px',height:'30px',color:'#fff'}} />
        </mui.Button>
            <SubMainTitleText sx={{color:'#00FFAA',alignSelf:'center',mt:'20%'}}>Oops.. This page leads nowhere, you can back to your lovely home don't worry.</SubMainTitleText>
        </Layout>
    )
}

export default Oops;
