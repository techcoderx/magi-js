import type { Aioha } from '@aioha/aioha'
import type { Client as ViemClient } from 'viem'
import { MagiClient } from './lib/client.js'
import { Wallet } from './types.js'
import { MagiWalletBase } from './wallets/wallet.js'
import { MagiWalletAioha } from './wallets/hive.js'
import { MagiWalletViem } from './wallets/viem.js'

export class Magi {
  private client: MagiClient
  private currentWallet?: Wallet
  private wallets: {
    hive?: MagiWalletAioha
    evm?: MagiWalletViem
  }

  constructor() {
    this.wallets = {}
    this.client = new MagiClient()
  }

  registerAioha(aioha: Aioha) {
    this.wallets.hive = new MagiWalletAioha(this.client, aioha)
  }

  registerViem(viemClient: ViemClient) {
    this.wallets.evm = new MagiWalletViem(this.client, viemClient)
  }

  isConnected() {
    return !!this.currentWallet && !!this.wallets[this.currentWallet]!.getUser()
  }

  getUser(prefix?: boolean): string | undefined {
    return !!this.currentWallet ? this.wallets[this.currentWallet]?.getUser(prefix) : undefined
  }

  getWallet(): string | undefined {
    return this.currentWallet
  }

  getWalletInstance(): MagiWalletBase | undefined {
    return this.currentWallet ? this.wallets[this.currentWallet] : undefined
  }

  setWallet(wallet?: Wallet) {
    this.currentWallet = wallet
  }
}