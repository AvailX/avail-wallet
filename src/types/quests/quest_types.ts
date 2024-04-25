export type Campaign = {
	id: string;
	title: string;
	subtitle: string;
	description: CampaignDescription;
	inner_description: string;
	box_image: string;
	bg_image: string;
	profile_image: string;
	color: string;
};

type CampaignDescription = {
	part1: string;
	main: string;
	part2: string;
};

export type Quest = {
	id: string;
	title: string;
	description: string;
	display_image: string;
	tasks: Task[];
	reward: Reward;
	expires_on: Date; // Or Date if you're directly using Date objects
	created_on: Date; // Or Date
	campaign_id: string;
};

export type Task = {
	id: string;
	title: string;
	description: string;
	transaction: boolean;
	program_id?: string;
	function_id?: string;
	dapp_url?: string;
	points: number;
};

export type WhitelistResponse = {
	collection_name: string;
	amount: number;
};

export type PointsResponse = {
	points: number;
	img_src: string;
};

export type CampaignDetailPageProps = {
	campaign: Campaign;
	quests: Quest[];
};

export type Reward = {
	id: string;
	collection_name: string;
	amount: number;
	method: RewardMethod;
};

enum RewardMethod {
	LuckyDraw = 'LuckyDraw',
	LeaderBoard = 'LeaderBoard',
	FCFS = 'FCFS',
}

export const testCampaign: Campaign[] = [{
	id: '1',
	title: 'Disruptors',
	subtitle: 'Avail - Privacy unlocked.',
	description: {
		part1: 'Complete Weekly',
		main: 'Quests',
		part2: 'Win Disruptors',
	},
	inner_description: 'The Disruptors are the official NFT of the Avail Wallet.',
	box_image: 'https://i.imgur.com/IzWdTWR.png',
    bg_image: 'https://i.imgur.com/bPfHEJt.png',
    profile_image: 'https://i.imgur.com/gXfvvaJ.png',
    color: '#00FFAA'
}];

export const testPoints: PointsResponse[] = [{
	points: 100,
	img_src: 'https://i.imgur.com/vVySQ4o.png',
},
{
	points: 80,
	img_src: 'https://i.imgur.com/Wrcwhkn.png',
}];

export const testWhitelist: WhitelistResponse[] = [{
	collection_name: 'Disruptors',
	amount: 1,
}];