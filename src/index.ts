import type { Aioha, VscStakeType } from '@aioha/aioha'
import { error } from '@aioha/aioha/build/lib/errors.js'
import { VscTxIntent } from '@aioha/aioha/build/types.js'
import type { Client as ViemClient } from 'viem'
import { MagiClient } from './lib/client.js'
import { Asset, MagiKeyType, MagiOperation, Result, Wallet } from './types.js'
import { MagiWallet, MagiWalletBase } from './wallets/wallet.js'
import { MagiWalletAioha } from './wallets/hive.js'
import { MagiWalletViem } from './wallets/viem.js'

const notLoggedInResult = error(4900, 'Wallet not connected')
const invalidAmtErr = error(5006, 'amount must be greater than 0')
const emptyOpsErr = error(5007, 'operations cannot be empty')

const isValidAmt = (amt: number) => isNaN(amt) || amt > 0

export class Magi implements MagiWallet {
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

  getWI = this.getWalletInstance

  setWallet(wallet?: Wallet) {
    this.currentWallet = wallet
  }

  async signAndBroadcastTx(tx: MagiOperation[], keyType: MagiKeyType): Promise<Result> {
    if (!this.isConnected()) return notLoggedInResult
    if (tx.length === 0) return emptyOpsErr
    return await this.getWI()!.signAndBroadcastTx(tx, keyType)
  }

  async call(
    contractId: string,
    action: string,
    payload: any,
    rc_limit: number,
    intents: VscTxIntent[],
    keyType: MagiKeyType
  ): Promise<Result> {
    if (!this.isConnected()) return notLoggedInResult
    return await this.getWI()!.call(contractId, action, payload, rc_limit, intents, keyType)
  }

  async transfer(to: string, amount: number, currency: Asset, memo?: string): Promise<Result> {
    if (!this.isConnected()) return notLoggedInResult
    if (!isValidAmt(amount)) return invalidAmtErr
    return await this.getWI()!.transfer(to, amount, currency, memo)
  }

  async unmap(to: string, amount: number, currency: Asset, memo?: string): Promise<Result> {
    if (!this.isConnected()) return notLoggedInResult
    if (!isValidAmt(amount)) return invalidAmtErr
    return await this.getWI()!.unmap(to, amount, currency, memo)
  }

  async stake(stakeType: VscStakeType, amount: number, to?: string, memo?: string): Promise<Result> {
    if (!this.isConnected()) return notLoggedInResult
    if (!isValidAmt(amount)) return invalidAmtErr
    return await this.getWI()!.stake(stakeType, amount, to, memo)
  }

  async unstake(stakeType: VscStakeType, amount: number, to?: string, memo?: string): Promise<Result> {
    if (!this.isConnected()) return notLoggedInResult
    if (!isValidAmt(amount)) return invalidAmtErr
    return await this.getWI()!.unstake(stakeType, amount, to, memo)
  }
}
