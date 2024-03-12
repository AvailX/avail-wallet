import shadowfi from './shadowfi.png';
import staking from './staking.png';
import ans from './ans.svg';
import arcane from './arcane.svg';
import a_logo from '../logo/a-icon.svg';
import alpha from './alpha.png';
import payper from './payper.webp';

export type Dapp = {
	name: string;
	description: string;
	url: string;
	img: string;
	tags: string[];
};

export const dapps: Dapp[] = [
	{
		name: 'Earn with Avail',
		description: 'Complete our Quests every week to earn a Disruptor whitelist spot.',
		url: 'https://avail.global/quests',
		img: a_logo,
		tags: ['earn', 'rewards'],
	},
	{
		name: 'Arcane Finance',
		description: 'Arcane Finance is a fully private non-custodial decentralized exchange enabling fully confidential DeFi on Aleo.',
		url: 'https://app.arcane.finance',
		img: arcane,
		tags: ['finance', 'swap'],
	},
	{
		name: 'Staking.xyz',
		description: 'Making staking easy for everyone, starting with Aleo.',
		url: 'https://www.staking.xyz',
		img: staking,
		tags: ['staking'],
	},
	{
		name: 'ANS',
		description: 'An Aleo domain for your account - ANS is where domain naming meets privacy.',
		url: 'https://testnet3.aleonames.id/account',
		img: ans,
		tags: ['domains'],
	},
	{
		name: 'ShadowFi',
		description: 'Shadow Finance is a Decentralized and Private Liquidity Marketplace',
		url: 'https://app.shadowfi.xyz/',
		img: shadowfi,
		tags: ['finance'],
	},
	{
		name: 'AlphaSwap',
		description: 'AlphaSwap (previously AleoSwap) offers private, secure, and smooth trading experience on the Aleo blockchain.',
		url: 'https://app.alphaswap.pro/assets/tokens',
		img: alpha,
		tags: ['finance', 'swap'],
	},
	{
		name: 'Payper',
		description: 'PayPer is a digital currency based on zero knowledge proofs, allowing infinite scalability and full privacy.',
		url: 'https://app.payper.fi/',
		img: payper,
		tags: ['finance', 'swap'],
	},
];
