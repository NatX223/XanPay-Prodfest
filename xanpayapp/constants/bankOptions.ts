import { BankOption } from '@/types/bankDetails';

export const BANK_OPTIONS: BankOption[] = [
  {
    code: 'BOA',
    name: 'Bank of America',
    displayName: 'BOA - Bank of America'
  },
  {
    code: 'JPM',
    name: 'JPMorgan Chase',
    displayName: 'JPM - JPMorgan Chase'
  },
  {
    code: 'WFC',
    name: 'Wells Fargo',
    displayName: 'WFC - Wells Fargo'
  },
  {
    code: 'USB',
    name: 'US Bank',
    displayName: 'USB - US Bank'
  },
  {
    code: 'COF',
    name: 'Capital One',
    displayName: 'COF - Capital One'
  },
  {
    code: 'PNC',
    name: 'PNC Bank',
    displayName: 'PNC - PNC Bank'
  },
  {
    code: 'TFC',
    name: 'Truist Financial',
    displayName: 'TFC - Truist Financial'
  },
  {
    code: 'GS',
    name: 'Goldman Sachs',
    displayName: 'GS - Goldman Sachs'
  }
];

export const getBankByCode = (code: string): BankOption | undefined => {
  return BANK_OPTIONS.find(bank => bank.code === code);
};

export const getBankNameByCode = (code: string): string => {
  const bank = getBankByCode(code);
  return bank ? bank.name : code;
};