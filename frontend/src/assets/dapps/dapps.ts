import shadowfi from './shadowfi.png';
import staking from './staking.png';
import ans from './ans.svg';
import arcane from './arcane.svg';

export interface Dapp {
    name: string;
    description: string;
    url: string;
    img: string;
    tags: string[];
}


export const dapps: Dapp[] = [
    {
        name: "Arcane Finance",
        description: "Arcane Finance is a fully private non-custodial decentralized exchange enabling fully confidential DeFi on Aleo.",
        url: "https://dev.arcane.finance",
        img: arcane,
        tags: ["finance"]
    },
    {
        name: 'Staking.xyz',
        description: 'Making staking easy for everyone, starting with Aleo.',
        url: 'https://www.staking.xyz',
        img: staking,
        tags: ['staking']
    },
    {
        name: 'ANS',
        description: 'An Aleo domain for your account - ANS is where domain naming meets privacy.',
        url: 'https://testnet3.aleonames.id/account',
        img: ans,
        tags: ['domains']
    },
    {
        name: 'ShadowFi',
        description: 'Shadow Finance is a Decentralized and Private Liquidity Marketplace',
        url: 'https://app.shadowfi.xyz/',
        img: shadowfi,
        tags: ['finance']
    }
];

