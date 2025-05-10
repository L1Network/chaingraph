import { Subject } from 'rxjs'
import { config } from './config'
import { db } from './database'
import { logger } from './lib/logger'
import type { ChainGraphContractWhitelist } from './types'

export interface WhitelistReader {
  whitelist$: Subject<ChainGraphContractWhitelist[]>
  whitelist: ChainGraphContractWhitelist[]
}

export const createWhitelistReader = async (): Promise<WhitelistReader> => {
  console.log('createWhitelistReader')
  let whitelist: ChainGraphContractWhitelist[] | null = null
  const whitelist$ = new Subject<ChainGraphContractWhitelist[]>()

  logger.info('Subscribing to contract whitelist, refreshing every 1s ...')
  setInterval(async () => {
    try {
      const result: ChainGraphContractWhitelist[] = await db.query(
        'SELECT * FROM whitelists WHERE chain = $1',
        [config.reader.chain],
      )
      // update and broadcast if there's new data
      if (JSON.stringify(result) !== JSON.stringify(whitelist)) {
        whitelist = result
        whitelist$.next(whitelist)
        logger.info('New whitelist', JSON.stringify(whitelist))
      }
    } catch (error) {
      logger.error('Error updating contract whitelist', error)
    }
  }, 1000)

  // resolve promise only after data has been loaded
  return new Promise((resolve) =>
    whitelist$.subscribe(() => resolve({ whitelist, whitelist$ })),
  )
}
