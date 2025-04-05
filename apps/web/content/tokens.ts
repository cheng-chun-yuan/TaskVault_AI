import { ERC20Mock } from './address'

export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
}

export const tokens: Token[] = [
  {
    address: ERC20Mock,
    symbol: 'USDT',
    name: 'USDT (Mock)',
    decimals: 18,
  },
]

export const getToken = (address: string) => {
  return tokens.find(token => token.address.toLowerCase() === address.toLowerCase())
}
