/* eslint-disable @typescript-eslint/padding-line-between-statements */
import * as React from 'react';
import * as mui from '@mui/material';

// Components
import Layout from '../../../views-desktop/reusable/layout';
import SideMenu from '../../../components/sidebar';
import ProjectTitle from '../CreateQuests/CreateProjectTitle';
import ProjectBio from '../CreateQuests/CreateProjectBio';
import CoverImage from '../CreateQuests/CreateCoverImage';
import CreateQuestsBox from '../create_quests_box';
import EditableProfileAndTitle from './EditableProfileAndTitle';

// Types
import {
	type CampaignDetailPageProps,
	campaign,
	quests,
	Campaign,
} from '../../../types/quests/quest_types';

// Typography
import { BodyText500 } from '../../../components/typography/typography';

// Hooks
import { useLocation } from 'react-router-dom';

// Alerts
import { SuccessAlert, ErrorAlert } from '../../../components/snackbars/alerts';
import ProfileImage from './CreateProfilePicture';
import { set } from 'date-fns';
import { createCampaign } from '../../../services/quests/quests';

const CreateQuests: React.FC = () => {
	const location = useLocation();
	const state = location.state as CampaignDetailPageProps | undefined;

	const [newCampaignName, setNewCampaignName] = React.useState('Project Title');
	const [isEditingName, setIsEditingName] = React.useState(false);
	const [newCampaignBio, setNewCampaignBio] = React.useState('Project Bio');
	const [isEditingBio, setIsEditingBio] = React.useState(false);
	const [newCoverImage, setNewCoverImage] = React.useState(
		campaign[0].bg_image || ''
	);
	const [newPPImage, setNewPPImage] = React.useState(
		campaign[0].profile_image || ''
	);
	const [isEditingCover, setIsEditingCover] = React.useState(false);
	const [isEditingPP, setIsEditingPP] = React.useState(false);
	const [coverImageError, setCoverImageError] = React.useState(false);
	const [ppImageError, setPPImageError] = React.useState(false);
	const [success, setSuccess] = React.useState(false);
	const [error, setError] = React.useState(false);
	const [defaultCoverImage, setDefaultCoverImage] = React.useState('');
	const [defaultProfileImage, setDefaultProfileImage] = React.useState('');
	const [message, setMessage] = React.useState('Your changes have been saved');
	const [projectImage, setProjectImage] = React.useState(
		campaign[0].profile_image || ''
	);
	const [projectTitle, setProjectTitle] = React.useState('Project Title'); // New state for project title
	const [projectName, setProjectName] = React.useState('Campaign Name'); // Separate state for project name
	const [returnCampaign, setReturnCampaign] = React.useState<Campaign>();

	const handleSaveNameClick = (newString: string) => {
		setNewCampaignName(newString);
		setSuccess(true);
		setIsEditingName(false);
	};

	const handleEditNameClick = () => {
		setIsEditingName(true);
	};

	const handleSaveBioClick = (newBio: string) => {
		console.log('Your change has been saved!');
		setSuccess(true);
		setNewCampaignBio(newBio); // Ensure the state update triggers re-render
		setIsEditingBio(false);
	};

	const handleEditBioClick = () => {
		setIsEditingBio(true);
	};

	const handleSaveCoverClick = (imageLink: string) => {
		console.log(defaultCoverImage);
		if (isValidUrl(imageLink)) {
			console.log('Your change has been saved!');
			setMessage('Your image url has been saved!');
			setSuccess(true);
			setNewCoverImage(imageLink); // Update the cover image state
			setIsEditingCover(false);
			setDefaultCoverImage(imageLink);
		} else {
			setCoverImageError(true);
		}
		console.log(defaultCoverImage);

	};

	const handleSavePPClick = (imageLink: string) => {
		if (isValidUrl(imageLink)) {
			console.log('Your profile picture url has been saved!');
			setMessage('Your profile picture url has been saved!');
			setSuccess(true);
			setNewPPImage(imageLink);
			setIsEditingPP(false);
			setDefaultProfileImage(imageLink);
			setPPImageError(false);
		} else {
			setPPImageError(true);
		}
	};

	const handleEditCoverClick = () => {
		setIsEditingCover(true);
	};

	const handleEditPPClick = () => {
		setIsEditingPP(true);
	};

	var isValidUrl = (url: string): boolean => {
		try {
			new URL(url);
			console.log('This is the true');
			return true;
		} catch (error) {
			console.log('This is the false');
			console.log(error);

			return false;
		}
	};

	const handleCampaignNameChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setNewCampaignName(event.target.value);
		console.log(event.target.value);
	};

	const handleCampaignBioChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setNewCampaignBio(event.target.value);
	};

	const handleCoverImageChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setNewCoverImage(event.target.value);
	};

	const handlePPImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setNewPPImage(event.target.value);
	};



	const handleCreateCampaign = () => {
		console.log('Create Campaign Clicked');
		console.log('Name:', newCampaignName);
		console.log('Bio:', newCampaignBio);
		console.log('Cover Image:', defaultCoverImage);
		console.log('Profile Image:', defaultProfileImage);
		console.log('Color:', campaign[0].color);
		console.log('Points Image:', campaign[0].points_image);
		console.log('Project Name:', campaign[0].project_name);

		createCampaign(
			newCampaignName,
			newCampaignBio,
			'TEST',
			'TEST',
			'TEST',
			'TEST',
			defaultCoverImage,
			defaultCoverImage,
			defaultProfileImage,
			campaign[0].color,
			'',
			'',
		).then(campaign => {
			console.log('Campaign Created:', campaign);
			setReturnCampaign(campaign);
			setSuccess(true);
			setMessage('Campaign Created');
		}).catch(err => {
			console.log(err);
			setError(true);
			setMessage('Campaign Creation Failed');
		});
	};
	const handleSaveProjectImage = (newImageUrl: string) => {
		setProjectImage(newImageUrl);
	};

	const handleSaveProjectName = (newName: string) => {
		setProjectName(newName);
	};

	const handleSaveProjectTitle = (newTitle: string) => {
		setProjectTitle(newTitle);
	};

	return (
		<Layout>
			<ErrorAlert
				errorAlert={error}
				setErrorAlert={setError}
				message={message}
			/>
			<SuccessAlert
				successAlert={success}
				setSuccessAlert={setSuccess}
				message={message}
			/>
			<SideMenu />

			<mui.Box
				sx={{
					ml: '5%',
					display: 'flex',
					flexDirection: 'column',
					width: '95%',
				}}
			>
				<mui.Box
					sx={{
						background: `url(${newCoverImage})`, // Use the updated cover image URL here
						color: campaign[0].color,
						backgroundColor: 'grey',
						backgroundPosition: 'center',
						height: '320px',
						backgroundSize: 'cover',
					}}
				>
					<mui.Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					>
            
						<ProfileImage
							imageUrl={newPPImage || campaign[0].box_image}
							onEditClick={handleEditPPClick}
							onSaveClick={handleSavePPClick}
							error={ppImageError}
						/>
						{/* Edit Cover Component */}
						<CoverImage
							imageUrl={newCoverImage || campaign[0].bg_image}
							onEditClick={handleEditCoverClick}
							onSaveClick={handleSaveCoverClick}
							error={coverImageError}
						/>
					</mui.Box>
				</mui.Box>
				<mui.Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<mui.Box sx={{ ml: '2%', mt: '5%' }}>
						{/* Project's Title Component */}
						<ProjectTitle
							title={newCampaignName}
							onEditClick={handleEditNameClick}
							onSaveClick={handleSaveNameClick}
							handleCampaignNameChange={handleCampaignNameChange}
						/>

						{/* Project's Bio Component */}
						<ProjectBio
							bio={newCampaignBio}
							onEditClick={handleEditBioClick}
							onSaveClick={handleSaveBioClick}
							handleCampaignBioChange={handleCampaignBioChange}
						/>
						{/* <EditableProfileAndTitle
              initialImageUrl={projectImage}
              initialTitle={projectTitle} // Separate state for project title
              onSaveImage={handleSaveProjectImage}
              onSaveTitle={handleSaveProjectTitle}
            /> */}
					</mui.Box>

					<mui.Box
						sx={{
							backgroundColor: '#fff',
							height: '40px',
							width: '150px',
							mr: '2%',
							borderRadius: '8px',
							alignContent: 'center',
							textAlign: 'center',
						}}
						onClick={handleCreateCampaign}
					>
						<mui.Typography fontSize={'15px'} color="#000" variant="h6">
              Create Campaign
						</mui.Typography>
					</mui.Box>
				</mui.Box>
				<mui.Divider
					sx={{ width: '100%', height: '1px', bgcolor: '#00FFAA', mt: '3%' }}
					orientation="horizontal"
				/>
				<mui.Box
					sx={{
						marginTop: '20px',
						alignItems: 'center',
						mb: '5%',
						bgcolor: '#111111',
						alignSelf: 'center',
						width: '90%',
						justifyContent: 'space-around',
					}}
				>
					<CreateQuestsBox />
				</mui.Box>
			</mui.Box>
		</Layout>
	);
};

export default CreateQuests;
