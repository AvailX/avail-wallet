import * as React from 'react';
import * as mui from '@mui/material';
import {ArrowBack} from '@mui/icons-material';
import BackButton from '../components/buttons/back';

// Typography
import {BodyText, Title2Text} from '../components/typography/typography';

// Services
import {open_url} from '../services/util/open';
import Layout from './reusable/layout';

const table1_rows = [
	{
		category: 'User Information',
		data: 'Username, User Public Address',
		purpose: 'To provide you with our services',
		legalBasis: 'To enter into a contract with you',
		retention: 'Until termination of the business relationship',
	},
	{
		category: 'Statistical Data',
		data: 'Non personally identifiable information',
		purpose: 'To generate business analytics based on user website usage, which shall be anonymised.',
		legalBasis: 'Our Legitimate Interest in business continuity and provision of better services',
		retention: 'N/A',
	},
	// ... more rows as needed
];

const Table1 = () => (
	<mui.TableContainer component={mui.Paper} sx={{alignSelf: 'center', mt: '2%'}}>
		<mui.Table sx={{minWidth: 650}} aria-label='privacy policy table'>
			<mui.TableHead>
				<mui.TableRow>
					<mui.TableCell>Category</mui.TableCell>
					<mui.TableCell>Data</mui.TableCell>
					<mui.TableCell>Purpose</mui.TableCell>
					<mui.TableCell>Legal Basis</mui.TableCell>
					<mui.TableCell>Retention</mui.TableCell>
				</mui.TableRow>
			</mui.TableHead>
			<mui.TableBody>
				{table1_rows.map((row, index) => (
					<mui.TableRow key={index}>
						<mui.TableCell>{row.category}</mui.TableCell>
						<mui.TableCell>{row.data}</mui.TableCell>
						<mui.TableCell>{row.purpose}</mui.TableCell>
						<mui.TableCell>{row.legalBasis}</mui.TableCell>
						<mui.TableCell>{row.retention}</mui.TableCell>
					</mui.TableRow>
				))}
			</mui.TableBody>
		</mui.Table>
	</mui.TableContainer>
);

const rights = [
	{
		title: 'Access',
		description: 'You have the right to obtain confirmation as to whether or not Personal Data concerning you is being Processed, and if so, relevant information related to such Processing and to a copy of such Personal Data.',
	},
	{
		title: 'Rectification',
		description: 'You have the right to require rectification of inaccurate or incomplete Personal Data about you.',
	},
	{
		title: 'To be Forgotten',
		description: 'You have the right to obtain deletion of your Personal Data under specific circumstances.',
	},
	{
		title: 'Restrict Processing',
		description: 'You have the right to restrict Processing of Personal Data under specific circumstances.',
	},
	{
		title: 'Data Portability',
		description: 'You have the right to request for the receipt or the transfer of your Personal Data to another organisation in a machine-readable format.',
	},
	{
		title: 'Object',
		description: 'You have the right to object, on grounds relating to your particular situation, to the Processing of your Personal Data',
	},
	{
		title: 'Withdraw Consent',
		description: 'You have the right to withdraw your consent for the Processing of your Personal Data where applicable, at no cost and with no justification required.',
	},
	// ... more rights as needed
];

const Rights = () => (<mui.TableContainer component={mui.Paper} sx={{alignSelf: 'center', mt: '2%'}}>
	<mui.Table sx={{minWidth: 650}} aria-label='privacy policy rights table'>
		<mui.TableBody>
			{rights.map((right, index) => (
				<mui.TableRow key={index} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
					<mui.TableCell component='th' scope='row' sx={{fontWeight: 'bold'}}>
						{right.title}
					</mui.TableCell>
					<mui.TableCell>{right.description}</mui.TableCell>
				</mui.TableRow>
			))}
		</mui.TableBody>
	</mui.Table>
</mui.TableContainer>
);

function PrivacyPolicy() {
	return (
		<Layout>
			<mui.Button
				variant='contained'
				onClick={() => {
					window.history.back();
				}}
				sx={{
					width: '10%', bgcolor: 'transparent', boxShadow: 'none', mt: '3%', ml: '2%', '&:hover': {
						backgroundColor: '#00FFAA',
						boxShadow: '0 0 8px 2px rgba(0, 255, 170, 0.6)',
						transform: 'scale(1.03)',
					},
					'&:focus': {
						backgroundColor: '#00FFAA',
						boxShadow: '0 0 8px 2px rgba(0, 255, 170, 0.8)',
					},
				}}
			>
				<ArrowBack sx={{width: '30px', height: '30px', color: '#fff'}} />
			</mui.Button>
			<Title2Text sx={{color: '#00FFAA', alignSelf: 'center', mt: '5%'}}>Privacy Notice</Title2Text>
			<mui.Box sx={{display: 'flex', flexDirection: 'column', p: 7}}>
				<BodyText sx={{color: '#fff', mt: '2%'}}>Applicable from 7 February 2024</BodyText>
				<BodyText sx={{color: '#fff', mt: '2%'}}>This Privacy Notice (the “Notice”) Applies to the Processing of Personal Data to the use of the website <a style={{cursor: 'pointer'}} onClick={() => {
					open_url('https://avail.global');
				}}>www.avail.global</a> and the application Avail. </BodyText>
				<BodyText sx={{color: '#fff', mt: '2%'}}>
                For the purposes of users’ use on the website and the application, Avail Limited, a company duly registered under the laws of Malta, with company registration number C106286 and with registered address at South Pacific Court, Flat 4, Triq l-Ahdar, Marsaskala, MSK3650, Malta (“We”/”Us”/”Our”) will be the Data Controller. We are committed to respecting your privacy and comply with Regulation (EU) 2016/679.
				</BodyText>
				<BodyText sx={{color: '#fff', mt: '2%'}}>
                With this Notice, We aim to ensure that users understand what Personal Data is collected about them, how such Personal Data is used and how it is secured.
				</BodyText>
				<BodyText sx={{color: '#fff', mt: '2%'}}>
                Access to this website and application implies the users’ full and unreserved acceptance of this Notice, as well as Our general terms and conditions of business and the Cookie Notice, available <a style={{cursor: 'pointer'}} onClick={() => {
						open_url('https://avail.global/cookie-notice');
					}}>here</a>. The user acknowledges that they have read and understood the terms within this Notice and agree to the Processing of their Personal Data.
				</BodyText>
				<BodyText sx={{color: '#fff', mt: '2%'}}>
                This Notice is valid for all pages hosted on the website, and all features of the application. It is not valid for the pages hosted by third parties to which We may refer and whose privacy notices may differ. We therefore, cannot be held responsible for any Personal Data Processed on these websites by other third parties. This Notice also applies to other websites that We may operate, including our company pages on all the socials linked <a style={{cursor: 'pointer'}} onClick={() => {
						open_url('https://linktr.ee/avail.global');
					}}>here</a>.
				</BodyText>
				<BodyText sx={{color: '#fff', mt: '2%'}}>
                For the purposes of social media, We will be Joint-Controllers with the respective social media vendor only for the following activities: accessing and Processing statistical aggregate data provided by X (formerly Twitter), Instagram (Meta), Discord, and TikTok. For any other purposes on the platform X (formerly Twitter), Instagram (Meta), Discord, and TikTok shall be considered as the sole Data Controller.
				</BodyText>

				<Title2Text sx={{color: '#fff', mt: '3%'}}>1. Personal Data Processing</Title2Text>
				<BodyText sx={{color: '#fff', mt: '2%'}}>
                Below please find the relevant information regarding what Personal Data We collect about you, Our intended purpose of Processing and the respective legal basis and retention periods.
				</BodyText>
				<Table1 />
				<Title2Text sx={{color: '#fff', mt: '3%'}}>2. Personal Data Sharing</Title2Text>
				<BodyText sx={{color: '#fff', mt: '2%'}}>
                We do not sell or otherwise monetise your Personal Data to third parties.
				</BodyText>
				<BodyText sx={{color: '#fff', mt: '2%'}}>
                We have contracted the following service providers to manage the website and servers that may have access to your Personal Data:
				</BodyText>
				<BodyText sx={{color: '#fff', mt: '2%', ml: '2%'}}>
                • Hetzner Online GmbH for the purposes of server hosting
				</BodyText>
				<BodyText sx={{color: '#fff', mt: '2%'}}>
                Your Personal Data may be transferred to such third parties which may be located outside of the EU/EEA. We are therefore committed to comply with international transfer rules and ensure that:
				</BodyText>
				<BodyText sx={{color: '#fff', mt: '2%', ml: '2%'}}>
                1. Your Personal Data will be transferred to a country where the data recipient is located in a jurisdiction that has been recognized as adequate by the European Commission; or

                2. Where a jurisdiction has not been recognised as adequate, to implement appropriate safeguards such as the EU Standard Contractual Clauses as of July 2021.
				</BodyText>
				<Title2Text sx={{color: '#fff', mt: '3%'}}>3. Security Measures</Title2Text>
				<BodyText sx={{color: '#fff', mt: '2%'}}>
                We treat your Personal Data in a confidential manner and ensure that Our staff and business partners have implemented the appropriate confidentiality arrangements.
                Your Personal Data is also contained behind secure networks and is only accessible to select individuals who have been granted special access rights to such systems and are required to retain confidentiality.
				</BodyText>
				<BodyText sx={{color: '#fff', mt: '2%'}}>
                We also implement other technical and organisational measures to safeguard your Personal Data such as:
				</BodyText>
				<BodyText sx={{color: '#fff', mt: '2%', ml: '2%'}}>
                • Use of firewalls
                • Encryption of data carriers and data transfers
                • Pseudonymisation and encryption of personal data
                • Employee training on data protection
				</BodyText>
				<Title2Text sx={{color: '#fff', mt: '3%'}}>4. Your Rights</Title2Text>
				<BodyText sx={{color: '#fff', mt: '2%'}}>
                You have certain rights over your Personal Data, subject to statutory limitations where applicable.
				</BodyText>
				<Rights />
				<Title2Text sx={{color: '#fff', mt: '3%'}}>5. Changes Notice</Title2Text>
				<BodyText sx={{color: '#fff', mt: '2%'}}>
                This Notice is effective as of the date stated above. We may, at our sole discretion, amend this Notice as We deem necessary and will inform you when this is done.
				</BodyText>
				<Title2Text sx={{color: '#fff', mt: '3%'}}>6. Contacts</Title2Text>
				<BodyText sx={{color: '#fff', mt: '2%'}}>
                Avail Limited, a company duly registered under the laws of Malta, with company registration number C106286 and with registered address at South Pacific Court, Flat 4, Triq l-Ahdar, Marsaskala, MSK3650, Malta, acting as Data Controller, available at the above mentioned address, and by email at info@avail.global.
				</BodyText>
				<BodyText sx={{color: '#fff', mt: '2%'}}>
                Dr. Matteo Alessandro, the Data Protection Officer (“DPO”), available at the above mentioned address, and by email at dpo@avail.global.
				</BodyText>
				<BodyText sx={{color: '#fff', mt: '2%'}}>
                You may also complain to the supervisory authority, the Information and Data Protection Commissioner (“IDPC”) whose website is available <a style={{cursor: 'pointer'}} onClick={async () => open_url('https://idpc.org.mt/')}>here</a>.
				</BodyText>
			</mui.Box>
		</Layout>
	);
}

export default PrivacyPolicy;
