import * as coda from '@codahq/packs-sdk'

export const pack = coda.newPack()

pack.setUserAuthentication({
  type: coda.AuthenticationType.OAuth2,
  authorizationUrl: 'https://gitlab.com/oauth/authorize',
  tokenUrl: 'https://gitlab.com/oauth/token',
})
