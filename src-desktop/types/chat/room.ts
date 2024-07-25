export type Room = {
	id: string;
	name: string;
	last_message: string;
	participants: participant[];
	created_at: Date;
};

type participant = {
	id: string;
	username: string;
	seen: boolean;
};

// Test data
export const test_rooms: Room[] = [
	{
		id: '1',
		name: 'Room 1',
		last_message: 'Hello, World!',
		participants: [
			{
				id: 'user1',
				username: 'UserA',
				seen: true,
			},
			{
				id: 'user2',
				username: 'UserB',
				seen: false,
			},
		],
		created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
	},
	{
		id: '2',
		name: 'Room 2',
		last_message: 'Hi there!',
		participants: [
			{
				id: 'user1',
				username: 'UserA',
				seen: true,
			},
			{
				id: 'user3',
				username: 'UserC',
				seen: true,
			},
		],
		created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
	},
	// Add more room objects as needed
];
