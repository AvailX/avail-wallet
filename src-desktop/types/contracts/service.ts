import dayjs, {type Dayjs} from 'dayjs';

export type ServiceForm = {
	service: string;
	provider: string;
	total_fee: number;
	deposit: number ;
	timePeriod: {
		start: Dayjs;
		end: Dayjs;
	};
	clauses: string[];
};

export type Clause = {
	name: string;
	condition: string;
};
