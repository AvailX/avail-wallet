export type INft = {
	name: string;
	image: string;
	attributes: Array<{
		trait_type: string;
		value: string;
	}>;
	mintNumber: number;
	collectionLink: string;
	collectionName: string;
	collectionDescription: string;
	sourceLink: string;
};

export const disruptorWhitelist: INft = {
	name: 'Disruptor Whitelist',
	image: 'https://i.imgur.com/aZCG87D.png',
	attributes: [
		{trait_type: 'SOON', value: 'SOON'},
	],
	mintNumber: 0,
	collectionLink: 'https://avail.global',
	collectionName: 'Avail Disruptors',
	collectionDescription: 'The Disruptors are the official NFT of the Avail Wallet.',
	sourceLink: 'https://avail.global',
};
