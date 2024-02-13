export interface NotificationProps {
    id: string;
    notif_type: 'loan_accepted' | 'info' | 'contract_request' | 'loan_oppurtinity' | 'payment' | 'support';
    nmessage: string;
    sub_message: string | null;
    link: string | null;  
    created_on: Date;
}
