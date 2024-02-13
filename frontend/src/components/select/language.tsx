import React, { useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select,SelectChangeEvent } from '@mui/material';
import { Languages } from '../../types/languages';
import i18n from '../../i18next-config';

interface LanguageSelectorProps {
    language: Languages;
    setLanguage: (language: Languages) => void;
    sx?: any;
}

interface Language {
    symbol: string;
    name: string;
}

export const languages = [
    {symbol:"en", name:"English"},
    {symbol:"es", name:"Spanish"},
    {symbol:"tr", name:"Turkish"},
    {symbol:"de", name:"German"},
    {symbol:"it", name:"Italian"},
    {symbol:"ja", name:"Japanese"},
    {symbol:"et", name:"Estonian"},
    {symbol:"lt", name:"Lithuanian"},
    {symbol:"lv", name:"Latvian"},
    {symbol:"ru", name:"Russian"},
    {symbol:"zh_cn", name:"Chinese Simplified"},
    {symbol:"zh_tw", name:"Chinese Traditional"},
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({sx}) => {
    const [language, setLanguage] = useState<Language>({symbol: "en", name: "English"});

    const handleChange = (event: SelectChangeEvent<string>) => {
        const selectedLanguage = event.target.value;
        i18n.changeLanguage(selectedLanguage);
        localStorage.setItem('language', selectedLanguage);
    };

    React.useEffect(() => {
        const lng = i18n.language;
        const selectedLanguage = languages.find((lang) => lang.symbol === lng);

        if (selectedLanguage)
        setLanguage(selectedLanguage);
    }, []);

    return (
        <FormControl variant="outlined" sx={sx}>
            <InputLabel id="language-selector-label" sx={{ color: '#fff','&.Mui-focused':{color: '#fff'} }}>Language</InputLabel>
            <Select
                labelId="language-selector-label"
                id="language-selector"
                value={language.symbol}
                onChange={(e)=>handleChange(e)}
                label="Language"
                sx={{ color: '#fff', borderColor: 'lightgray', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'lightgray' }, 
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'lightgray' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00FFAA' }
            }}
            >
                {Object.values(languages).map((language) => (
                    <MenuItem key={language.symbol} value={language.symbol}>
                        {language.name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default LanguageSelector;