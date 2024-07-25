import * as mui from '@mui/material';
import * as React from 'react';
import {type TokenProps, type token} from '../../types/transfer_props/tokens';

const TokenDropdown: React.FC<TokenProps> = ({tokens, token, setToken}) => {
	const handleChange = (event: mui.SelectChangeEvent) => {
		setToken(event.target.value);
	};

	return (
		<mui.Box sx={{width: '50%'}}>
			<mui.FormControl fullWidth sx={{outline: 'none', border: 0}}>

				<mui.Select
					labelId='demo-simple-select-label'
					id='demo-simple-select'
					defaultValue={token}
					value={token}
					label=''
					onChange={handleChange}
					sx={{
						outline: 'none', border: 0, height: '50px', '&.MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline':
                    {
                    	border: 'none',
                    },
						'&:hover .MuiOutlinedInput-notchedOutline': {
							border: 'none',
						},
						'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
							border: 'none',
							// If you also want to remove the box-shadow for the focused state
							boxShadow: 'none',
						},

					}}
					inputProps={{
						MenuProps: {
							MenuListProps: {
								sx: {
									backgroundColor: '#3E3E3E',
								},
							},
						},
					}}

				>
					{tokens.map((token: token, i) => <mui.MenuItem value={token.symbol} key={i} sx={{bgcolor: '#3E3E3E'}}>
						<mui.Box sx={{
							display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', ml: '10%', mt: '2%',
						}}>
							<img src={token.image_url} style={{height: '25px', width: '25px'}}/>
							<mui.Typography sx={{fontSize: '1rem', color: '#fff', mt: ''}}>
								{token.symbol}
							</mui.Typography>
						</mui.Box>
					</mui.MenuItem>)}
				</mui.Select>
			</mui.FormControl>
		</mui.Box>
	);
};

export default TokenDropdown;
