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
        description: "Arcane Finance is a decentralized finance platform that allows you to earn interest on your assets.",
        url: "https://dev.arcane.finance",
        img: arcane,
        tags: ["finance", "interest"]
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
        url: 'https://testnet3.aleonames.id/',
        img: ans,
        tags: ['domains']
    },
    {
        name: 'ShadowFi',
        description: 'ShadowFi is a decentralized And private liquidity marketplace',
        url: 'https://www.shadowfi.com',
        img: shadowfi,
        tags: ['liquidity', 'marketplace']
    }
];

