import * as React from 'react';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import styled from '@emotion/styled';


const ResponsiveTypography = (variant:string) => styled(Typography)(({theme}) => {
    const sm = useMediaQuery('(min-width:600px)');
  const md = useMediaQuery('(min-width:800px)');
  const lg = useMediaQuery('(min-width:1200px)');
  const xl = useMediaQuery('(min-width:1600px)');
  
    return {
                //Title
      fontSize: variant === 'title' && xl ? '4rem' :
                variant === 'title' && lg ? '3rem' :
                variant === 'title' && md ? '2.85rem' :
                variant === 'title' ? '1.5rem' : // default for 'title'
                //Title2
                variant === 'title2' && xl ? '3rem' :
                variant === 'title2' && lg ? '2.5rem' :
                variant === 'title2' && md ? '2rem' :
                variant === 'title2' ? '1.5rem' : // default for 'title2'
                 //SubMainTitle
                 variant === 'submaintitle' && xl ? '2.5rem' :
                 variant === 'submaintitle' && lg ? '2rem' :
                 variant === 'submaintitle' && md ? '1.5rem' :
                 variant === 'submaintitle' ? '1.35rem' : 
                //Subtitle
                variant === 'subtitle' && xl ? '1.75rem' :
                variant === 'subtitle' && lg ? '1.35rem' :
                variant === 'subtitle' && md ? '1.2rem' :
                variant === 'subtitle' && sm ? '1rem' :
                variant === 'subtitle' ? '1rem' : // default for 'subtitle'
                //Body
                variant === 'body' && xl ? '1.5rem' :
                variant === 'body' && lg ? '1.3rem' :
                variant === 'body' && md ? '1.15rem' :
                variant === 'body' && sm ? '1rem' :
                variant === 'body' ? '1.2rem' : // default for 'body'
                //Small
                variant === 'small' && xl ? '1rem' :
                variant === 'small' && lg ? '1rem' :
                variant === 'small' && md ? '1rem' :
                variant === 'small' && sm ? '0.875rem' :
                variant === 'small' ? '0.75rem' : // default for 'small'
                '1rem', // default for all other cases
      fontFamily: 'DM Sans',    
      // Include other styles based on variant if needed
    };
  });
 
// Specific components for each text type
export const TitleText = styled(ResponsiveTypography('title'))(({ theme }) => ({
    fontWeight: 500,
}));
export const Title2Text = styled(ResponsiveTypography('title2'))(({ theme }) => ({
    fontWeight: 500,
}));

export const SubMainTitleText = styled(ResponsiveTypography('submaintitle'))(({ theme }) => ({
    fontWeight: 400,
}));

export const SubtitleText = styled(ResponsiveTypography('subtitle'))(({ theme }) => ({
    fontWeight: 500,
}));
export const BodyText = styled(ResponsiveTypography('body'))(({ theme }) => ({
    fontWeight: 400,
}));

export const BodyText500 = styled(ResponsiveTypography('body'))(({ theme }) => ({
    fontWeight: 500,
}));

export const SmallText = styled(ResponsiveTypography('small'))(({ theme }) => ({
    fontWeight: 200,
}));

export const SmallText400 = styled(ResponsiveTypography('small'))(({ theme }) => ({
    fontWeight: 400,
}));


export const SpecialText =  styled(ResponsiveTypography('special'))(({ theme }) => ({
    fontStyle: 'italic',
    color: '#00FFAA',
    fontWeight: 600,
}));


