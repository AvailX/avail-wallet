export type NotificationProps = {
	id: string;
	notif_type: 'loan_accepted' | 'info' | 'contract_request' | 'loan_oppurtinity' | 'payment' | 'support';
	nmessage: string;
	sub_message: string | undefined;
	link: string | undefined;
	created_on: Date;
};
