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
	expires_on: string; // Or Date if you're directly using Date objects
	created_on: string; // Or Date
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
		main: 'Missions',
		part2: 'Win Disruptors',
	},
	inner_description: 'The Disruptors are the official NFT of the Avail Wallet.',
	box_image: 'https://i.imgur.com/IzWdTWR.png',
    bg_image: 'https://i.imgur.com/bPfHEJt.png',
    profile_image: 'https://i.imgur.com/gXfvvaJ.png',
    color: '#00FFAA'
}];