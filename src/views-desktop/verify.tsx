import * as React from 'react';
import * as mui from '@mui/material';

// Components
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CTAButton from '../components/buttons/cta';
import WhiteHueTextField from '../components/textfields/white-hue';

// Typography
import { Title2Text, SubtitleText, BodyText } from '../components/typography/typography';

// Images
import a_logo from '../assets/logo/a-icon.svg';

// Alerts
import { SuccessAlert, ErrorAlert } from '../components/snackbars/alerts';

// Hooks

import Layout from './reusable/layout';
import BackButton from 'src/components/buttons/back';

function Verify() {
	const seed = useLocation().state.seed as string[];
	const navigate = useNavigate();

	const { t } = useTranslation();

	const [error, setError] = React.useState(false);
	const [success, setSuccess] = React.useState(false);
	const [message, setMessage] = React.useState('');

	{/* --States for verification-- */ }
	const [hiddenWords, setHiddenWords] = React.useState<seedResult[]>();

	{/* --Functions for Secret Phrase Handling-- */ }
	type seedResult = {
		word: string;
		isHidden: boolean;
		input: string;
	};

	// Generate the words that will be hidden in the verification process
	function generateHiddenWords() {
		const numberHidden = 4; // Number of words to hide
		const hiddenIndices: number[] = [];
		while (hiddenIndices.length < numberHidden) {
			const randomIndex = Math.floor(Math.random() * 12);
			if (!hiddenIndices.includes(randomIndex)) {
				hiddenIndices.push(randomIndex);
			}
		}

		console.log(hiddenIndices);

		const hidden_word: seedResult[] = seed.map((word, index) => ({
			word: hiddenIndices.includes(index) ? '' : word,
			isHidden: hiddenIndices.includes(index),
			input: '',
		}));

		return hidden_word;
	}

	function handleVerify() {
		// Return only the inputs from hiddenWords that are a full word
		const inputResults = hiddenWords?.filter(word => word.input.length > 0);
		const inputWords = inputResults?.map(word => word.input);
		const originalWords = seed.filter((word, index) => hiddenWords?.[index].isHidden);

		// Remove whitespaces from the words
		if (inputWords) {
			for (const [index, word] of inputWords.entries()) {
				inputWords[index] = word.trim().toLowerCase();
			}
		}

		for (const [index, word] of originalWords.entries()) {
			originalWords[index] = word.trim().toLowerCase();
		}

		console.log(inputWords);
		console.log(originalWords);
		const isVerified = JSON.stringify(inputWords) === JSON.stringify(originalWords);

		// You can handle the verification result here
		if (isVerified) {
			setMessage(t('verify.success'));
			setSuccess(true);

			setTimeout(() => {
				navigate('/home');
			}, 800);
		} else {
			setMessage(t('verify.error'));
			setError(true);
		}
	}

	React.useEffect(() => {
		setHiddenWords(generateHiddenWords());
	}, [seed]);

	return (
		<Layout>
			<ErrorAlert message={message} errorAlert={error} setErrorAlert={setError} />
			<SuccessAlert message={message} successAlert={success} setSuccessAlert={setSuccess} />
			<img src={a_logo} alt='aleo logo' style={{
				width: '60px', height: '60px', marginTop: '20px', marginLeft: '20px', cursor: 'pointer',
			}} onClick={() => {
				window.history.back();
			}} />
			<mui.Typography sx={{
				color: '#a3a3a3', fontSize: 10, marginTop: '1%', marginLeft: '20px',
				fontWeight: '700', alignContent: 'end',
			}}>
				Click the Avail <br /> logo to go back
			</mui.Typography>
			<mui.Box sx={{ width: '85%', alignSelf: 'center' }}>
				<Title2Text sx={{ color: '#FFF' }}>{t('verify.title')}</Title2Text>
			</mui.Box>
			<mui.Grid container spacing={1} sx={{
				marginTop: '25px', alignSelf: 'center', bgcolor: '#1E1D1D', borderRadius: '10px', width: '85%', padding: '5%', justifyContent: 'center', mb: '2%', alignItems: 'center', position: 'relative',
			}}>

				{/* Secret words grid items */}
				{hiddenWords?.map((word, index) => word.isHidden ? (
					<mui.Grid
						key={index}
						sx={{
							color: '#fff', m: '2%', borderRadius: '10px', padding: '1%', textAlign: 'center', backdropFilter: 'blur(4px)',
						}}
						item
						xs={3} // Adjust the grid size as needed
					>
						<WhiteHueTextField
							key={index}
							label={`Word ${index + 1}`}
							value={word.input}
							onChange={e => {
								const updatedWords = [...hiddenWords];
								updatedWords[index].input = e.target.value;
								setHiddenWords(updatedWords);
							}}
							autoCapitalize='none'
						/>
					</mui.Grid>
				) : (
					<mui.Grid
						key={index}
						sx={{
							color: '#fff', m: '2%', bgcolor: '#3E3E3E', borderRadius: '10px', padding: '1%', textAlign: 'center', position: 'relative',
						}}
						item
						xs={3} // Adjust the grid size as needed
					>
						<mui.Box sx={{
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							bgcolor: 'rgba(0, 0, 0, 0.1)', // Dark overlay
							backdropFilter: 'blur(4px)', // Blur effect
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							borderRadius: '10px', // Match the parent's border radius
						}}>

						</mui.Box>
						<mui.Typography variant='body1' >{index + '. ' + word.word}</mui.Typography>
					</mui.Grid>
				))
				}
			</mui.Grid>
			<CTAButton text={t('verify.verify')} onClick={() => {
				handleVerify();
			}} width='25%' />
			<mui.Box sx={{mb: '3%'}}/>
		</Layout>
	);
}

export default Verify;
