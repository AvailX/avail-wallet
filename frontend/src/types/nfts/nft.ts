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
