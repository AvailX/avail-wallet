import * as React from "react";
import * as mui from "@mui/material";

// Components
import Layout from "../reusable/layout";
import SideMenu from "../../components/sidebar";
import QuestBox from "../../components/quests/quest";
import TaskDrawer from "../../components/quests/tasks_drawer";
import ConfirmDialog from "../../components/quests/CreateQuests/ConfirmDialog";
import {
	AddQuestTasksProps,
	Campaign,
	campaign,
} from "../../../src/types/quests/quest_types";
import ScanReAuthDialog from "../../components/dialogs/reauth";
// Types
import { type CampaignDetailPageProps } from "../../types/quests/quest_types";
import { type Quest } from "../../types/quests/quest_types";

// Images
import verified from "../../assets/icons/verified.svg";

// Typography
import { BodyText500 } from "../../components/typography/typography";

// Services
import { deleteCampaign, fetchQuestMetrics, isQuestCompleted } from "../../services/quests/quests";

// Hooks
import { useLocation, useNavigate } from "react-router-dom";

// Alerts
import { SuccessAlert, ErrorAlert } from "../../components/snackbars/alerts";
import { get } from "http";
import { get_address } from "../../services/storage/persistent";

const Quests: React.FC = () => {
	const { campaign: campaign_state, quests } = useLocation()
		.state as CampaignDetailPageProps;
	const [quest, setQuest] = React.useState<Quest>();
	const [openTasks, setOpenTasks] = React.useState(false);
	const [questCompleted, setQuestCompleted] = React.useState(false);
	const navigate = useNavigate();
	const [openDialog, setOpenDialog] = React.useState(false);
	const [reAuthDialogOpen, setReAuthDialogOpen] = React.useState(false);
	const [metrics, setMetrics] = React.useState([]);

	const [success, setSuccess] = React.useState(false);
	const [error, setError] = React.useState(false);
	const [message, setMessage] = React.useState("");
	const [ownerAddr, setOwnerAddr] = React.useState("");

	const mdsx = mui.useMediaQuery("(min-width:850px)");
	const md = mui.useMediaQuery("(min-width:950px)");
	const mdlg = mui.useMediaQuery("(min-width:1150px)");
	const lgsx = mui.useMediaQuery("(min-width:1550px)");
	const lg = mui.useMediaQuery("(min-width:1750px)");
	const lgxl = mui.useMediaQuery("(min-width:1950px)");
	const address = get_address().then((res) => {
		setOwnerAddr(res);
	});

	const campaignId = campaign_state.id;
	const campaignDetails: AddQuestTasksProps = {
		campaign: campaign_state,
	};

	const campaignDetailsDummy: AddQuestTasksProps = {
		campaign: campaign[0],
	};

	const handleAddQuest = () => {
		navigate("/create-tasks", { state: campaignDetails });
	};


	const handleAddQuestDummy = () => {
		navigate("/create-tasks", { state: campaignDetailsDummy });
	};
	const handleDeleteCampaign = () => {
		deleteCampaign(campaign_state.id)
			.then((res) => {
				console.log(res);
				navigate("/campaigns");
			})
			.catch((err) => {
				if (err.error_type.toString() === "Unauthorized") {
					// eslint-disable-next-line no-warning-comments
					// TODO - Re-authenticate and fix execution on re-auth (Bala)

					console.log("Unauthorized, re auth");

					setReAuthDialogOpen(true);
				} else {
					setError(true);
					setMessage(`Error deleting campaign: ${err.external_msg}`);
				}
				console.log(err);
			});
	};
	const handleDeleteConfirmation = () => {
		setOpenDialog(true);
	};
	const handleFetchMetrics = async () => {
		try {
			console.log('Quest:', quest);
			console.log('Quest ID:', quest?.id);
			const metrics = await fetchQuestMetrics(quest?.id);
			setMetrics(Number(metrics));
			console.log('Metrics:', Number(metrics));
		} catch (error) {
			console.error("Error fetching metrics:", error);
		}
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
			<TaskDrawer
				open={openTasks}
				onClose={() => {
					setOpenTasks(false);
				}}
				quest={quest}
			/>
			<mui.Box
				sx={{
					ml: md ? "5%" : "7%",
					display: "flex",
					flexDirection: "column",
					width: md ? "95%" : "93%",
				}}
			>
				<mui.Box
					sx={{
						background: `url(${campaign_state.bg_image})`,
						color: campaign_state.color,
						backgroundPosition: lgxl ? "center" : "bottom",
						height: lgxl ? "380px" : "320px",
						backgroundSize: "cover",
					}}
				>
					<mui.Box
						sx={{
							borderRadius: "100%",
							border: "1px solid #696969",
							p: 1.5,
							width: "200px",
							mt: lgxl
								? "10%"
								: lg
									? "8%"
									: lgsx
										? "10%"
										: mdlg
											? "10%"
											: md
												? "13%"
												: mdsx
													? "14%"
													: "17%",
							ml: "5%",
						}}
					>
						<mui.Box
							component='img'
							src={campaign_state.profile_image}
							sx={{ borderRadius: 0, maxWidth: "100%" }}
						/>
					</mui.Box>
					<mui.Box
						component='img'
						src={verified}
						sx={{
							borderRadius: 0,
							ml: lgxl
								? "11%"
								: lg
									? "13%"
									: lgsx
										? "15%"
										: mdlg
											? "17%"
											: md
												? "20%"
												: "23%",
							mt: lg ? "-8%" : lgsx ? "-10%" : "-12%",
						}}
					/>
				</mui.Box>
				<mui.Box sx={{ ml: "2%", mt: "5%" }}>
					<mui.Typography variant='h3' color='#FFF'>
						{campaign_state.title}
					</mui.Typography>
					<BodyText500 color='#A3A3A3'>
						{campaign_state.inner_description}
					</BodyText500>
					<mui.Box>
						{/* <button onClick={handleAddQuestDummy}>
							Add quest dummy button
						</button> */}
						{campaign_state.owner === ownerAddr && (
							// <mui.Button
							// 	variant='contained'
							// 	color='primary'
							// 	onClick={handleAddQuest}
							// >
							// 	Add Quest
							// </mui.Button>
							<mui.Box
								sx={{
									backgroundColor: '#fff',
									height: '40px',
									width: '150px',
									mr: '2%',
									borderRadius: '8px',
									alignContent: 'center',
									textAlign: 'center',
									marginRight: '20px',
									cursor: 'pointer',
								}}
								onClick={handleAddQuest}
							>
								<mui.Typography fontSize={'15px'} color="#000" variant="h6">
									Add Quest
								</mui.Typography>
							</mui.Box>
						)}
					</mui.Box>
					<mui.Box>
						{campaign_state.owner === ownerAddr && (
							// <mui.Button
							// 	variant='contained'
							// 	color='primary'
							// 	onClick={handleDeleteConfirmation}
							// >
							// 	Delete Campaign
							// </mui.Button>
							<mui.Box
								sx={{
									backgroundColor: '#fff',
									height: '40px',
									width: '150px',
									mr: '2%',
									borderRadius: '8px',
									alignContent: 'center',
									textAlign: 'center',
									marginRight: '20px',
									cursor: 'pointer',
									marginTop: '5px',
								}}
								onClick={handleDeleteConfirmation}
							>
								<mui.Typography fontSize={'15px'} color="#000" variant="h6">
									Delete Campaign
								</mui.Typography>
							</mui.Box>
						)}
					</mui.Box>
					<mui.Box>
						{campaign_state.owner === ownerAddr && (
							// <mui.Button
							// 	variant='contained'
							// 	color='primary'
							// 	onClick={handleDeleteConfirmation}
							// >
							// 	Delete Campaign
							// </mui.Button>
							<mui.Box
								sx={{
									backgroundColor: '#fff',
									height: '40px',
									width: '150px',
									mr: '2%',
									borderRadius: '8px',
									alignContent: 'center',
									textAlign: 'center',
									marginRight: '20px',
									cursor: 'pointer',
									marginTop: '5px',
								}}
								onClick={handleFetchMetrics}
							>
								<mui.Typography fontSize={'15px'} color="#000" variant="h6">
									Fetch Metrics
								</mui.Typography>
							</mui.Box>
						)}
					</mui.Box>
				</mui.Box>
				<mui.Divider
					sx={{ width: "100%", height: "1px", bgcolor: "#00FFAA", mt: "3%" }}
					orientation='horizontal'
				/>
				<mui.Grid
					container
					spacing={2}
					sx={{
						marginTop: "20px",
						alignItems: "center",
						mb: "5%",
						paddingLeft: "2%",
						bgcolor: "#111111",
						alignSelf: "center",
						width: "100%",
						justifyContent: "space-around",
					}}
				>
					{quests.map((quest) => (
						<QuestBox
							key={quest.id}
							quest={quest}
							openTasks={openTasks}
							setOpenTasks={setOpenTasks}
							setQuest={setQuest}
						/>
					))}
				</mui.Grid>
				<ConfirmDialog
					open={openDialog}
					onClose={() => setOpenDialog(false)}
					onConfirm={handleDeleteCampaign}
					title='Confirm Delete Campaign'
					content='Are you sure you want to delete this campaign? This action is irreversible.'
				/>
				{/* ReAuth Dialog */}
				<ScanReAuthDialog
					isOpen={reAuthDialogOpen}
					onRequestClose={() => {
						setReAuthDialogOpen(false);
					}}
				/>
			</mui.Box>
		</Layout>
	);
};

export default Quests;
