import dalphaswap from './dapp-home/alphaswap.svg';
import darcane from './dapp-home/arcane.svg';
import dans from './dapp-home/ans.svg';
import obscura from './dapp-home/obscura.svg';
import dshadowfi from './dapp-home/shadow.svg';
import dstaking from './dapp-home/staking.svg';
import dpayper from './dapp-home/payper.svg';

import beta_staking from './beta-staking.jpg';

export type Dapp = {
	name: string;
	description: string;
	url: string;
	img: string;
	tags: string[];
	style?: React.CSSProperties;
	color?: string;
};

export const dapps: Dapp[] = [
	{
		name: 'Arcane Finance',
		description: 'Arcane Finance is a fully private non-custodial decentralized exchange enabling fully confidential DeFi on Aleo.',
		url: 'https://app.arcane.finance',
		img: darcane,
		tags: ['defi'],
		style: {marginTop: '23%'},
		color: '#0C6CFE',
	},
	{
		name: 'Staking.xyz',
		description: 'Making staking easy for everyone, starting with Aleo.',
		url: 'https://www.staking.xyz',
		img: dstaking,
		tags: ['staking'],
		style: {marginTop: '27%'},
		color: '#FFF',
	},
	{
		name: 'ANS',
		description: 'An Aleo domain for your account - ANS is where domain naming meets privacy.',
		url: 'https://testnet3.aleonames.id/account',
		img: dans,
		tags: ['domains'],
		style: {marginTop: '14%'},
		color: '#FFF',
	},
	{
		name: 'ShadowFi',
		description: 'Shadow Finance is a Decentralized and Private Liquidity Marketplace',
		url: 'https://app.shadowfi.xyz/',
		img: dshadowfi,
		tags: ['defi'],
		style: {marginTop: '10%'},
		color: '#F17604',
	},
	{
		name: 'AlphaSwap',
		description: 'AlphaSwap (previously AleoSwap) offers private, secure, and smooth trading experience on the Aleo blockchain.',
		url: 'https://app.alphaswap.pro/assets/tokens',
		img: dalphaswap,
		tags: ['defi'],
		style: {marginTop: '5%'},
		color: '#04F158',
	},
	{
		name: 'Payper',
		description: 'PayPer is a digital currency based on zero knowledge proofs, allowing infinite scalability and full privacy.',
		url: 'https://app.payper.fi/',
		img: dpayper,
		tags: ['stablecoin'],
		style: {marginTop: '20%'},
		color: '#6C7690',
	},
	{
		name: 'Beta Staking',
		description: 'A decentralized protocol that enables users to stake Aleo Credits on the Aleo blockchain network and earn Beta rewards.',
		url: 'https://www.betastaking.com',
		img: beta_staking,
		tags: ['liquid-staking'],
		style: {marginTop: '20%'},
		color: '#1DB954',
	},
];

export const displayDapps: Dapp[] = [
	{
		name: 'Obscura',
		description: 'Complete our Quests every week to earn a Disruptor whitelist spot.',
		url: 'https://obscura.build',
		img: obscura,
		tags: ['earn', 'rewards'],
		style: {marginTop: '15%', width: '70px', height: '70px'},
	},
	{
		name: 'Arcane Finance',
		description: 'Arcane Finance is a fully private non-custodial decentralized exchange enabling fully confidential DeFi on Aleo.',
		url: 'https://app.arcane.finance',
		img: darcane,
		tags: ['finance', 'swap'],
		style: {marginTop: '33%', width: '120px', height: '120px'},
	},
	{
		name: 'Staking.xyz',
		description: 'Making staking easy for everyone, starting with Aleo.',
		url: 'https://www.staking.xyz',
		img: dstaking,
		tags: ['staking'],
		style: {marginTop: '3%', width: '120px', height: '120px'},
	},
	{
		name: 'ANS',
		description: 'An Aleo domain for your account - ANS is where domain naming meets privacy.',
		url: 'https://testnet3.aleonames.id/account',
		img: dans,
		tags: ['domains'],
		style: {marginTop: '14%', width: '80px', height: '80px'},
	},
	{
		name: 'ShadowFi',
		description: 'Shadow Finance is a Decentralized and Private Liquidity Marketplace',
		url: 'https://app.shadowfi.xyz/',
		img: dshadowfi,
		tags: ['finance'],
		style: {marginTop: '10%', width: '100px', height: '100px'},
	},
	{
		name: 'AlphaSwap',
		description: 'AlphaSwap (previously AleoSwap) offers private, secure, and smooth trading experience on the Aleo blockchain.',
		url: 'https://app.alphaswap.pro/assets/tokens',
		img: dalphaswap,
		tags: ['finance', 'swap'],
		style: {marginTop: '5%', width: '140px', height: '140px'},
	},
	{
		name: 'Payper',
		description: 'PayPer is a digital currency based on zero knowledge proofs, allowing infinite scalability and full privacy.',
		url: 'https://app.payper.fi/',
		img: dpayper,
		tags: ['finance', 'swap'],
		style: {marginTop: '20%', width: '100px', height: '100px'},
	},
];
