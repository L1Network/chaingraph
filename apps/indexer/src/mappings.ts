import { Subject } from 'rxjs'
import { config } from './config'
import { db } from './database'
import { logger } from './lib/logger'
import type { ChainGraphMappings } from './types'

export interface MappingsReader {
  mappings$: Subject<ChainGraphMappings[]>
  mappings: ChainGraphMappings[]
}

export const createMappingsReader = async (): Promise<MappingsReader> => {
  let mappings: ChainGraphMappings[] = []
  const mappings$ = new Subject<ChainGraphMappings[]>()

  logger.info('Subscribing to contract mappings, refreshing every 1s ...')
  const interval = setInterval(async () => {
    try {
      const result: ChainGraphMappings[] = await db.query(
        'SELECT * FROM mappings WHERE chain = $1',
        [config.reader.chain],
      )
      // update and broadcast if there's new data
      if (JSON.stringify(result) !== JSON.stringify(mappings)) {
        mappings = result
        mappings$.next(mappings)
        logger.info('New mappings', JSON.stringify(mappings))
      }
      clearInterval(interval)
    } catch (error) {
      logger.error('Error updating contract mappings', error)
    }
  }, 1000)

  // resolve promise only after data has been loaded
  return new Promise((resolve) =>
    mappings$.subscribe(() => resolve({ mappings, mappings$ })),
  )
}
