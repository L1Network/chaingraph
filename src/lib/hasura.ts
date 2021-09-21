import { getHasuraSDK } from '@chaingraph.io/hasura-client'

export const hasura = getHasuraSDK({
  url: process.env.HASURA_API!,
  adminSecret: process.env.HASURA_ADMIN_SECRET!,
})
