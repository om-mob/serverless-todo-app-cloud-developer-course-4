import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken' // decode not Needed
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set

// const jwksUrl =
//   'https://dev-sc2qybrerll0t5f0.us.auth0.com/.well-known/jwks.json'

const cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJCM7LO82bHEZlMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1zYzJxeWJyZXJsbDB0NWYwLnVzLmF1dGgwLmNvbTAeFw0yMjEwMjgw
NDU3MjBaFw0zNjA3MDYwNDU3MjBaMCwxKjAoBgNVBAMTIWRldi1zYzJxeWJyZXJs
bDB0NWYwLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAK5hzprFC4Hz7YlEG56MLGax1GuQ4O3AqQ+FiWtfdG9SEdclEQlM+AC1kDYv
dP4scg1iMQQygMdPg9rHCYuJ2GXtipS+6Z6LpzqiY/JuHhdmkms8uUKSr6r3xqqy
kQAt8NzXcaONhErOW5pvHg66wLBKmowDhvtBKdyEKNPlOr7XPeYQGdFiIPrtaBSl
W3l0vokpDlxZxSMTk7ykKw7cJERRgOdI1uctQwgbFOIC84xYAb92OitfTs7MPbHm
CMdSuFNXwoQk7uTO/e8i/AQSfQ07exhm6zwL29K5P85AiWci+0mh0dK4Tfb9SO+Z
lbhTc3G4A4F7h9RHWvyrK7T7BjMCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUr+6jnAJh9LvuK1mbPiPJbzdbXJcwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQCQvt43TPjWJv0HfZZY32zu3bLN3jFyn4SssHBpVfi9
cLL1fYzRSpeGhlRQKoml/r5SIKMoiArZt9E69nPH+fih8YEFXwjpHRWxBXgXvVSv
L9ky49vEapMbAI2lW1ZU0SHQFpSyZZwv72g3m5DKTPE/b/wuLpjvbve4jUq9sMOj
A75qVUzRS8v1xo0UCnN0e4F1DGk1EPqBRrLMs34qQgW+HQvN5wMC6FP4M4/pHuIy
owiv4RiYG4N40OzmGjiMCw8bX85h292gTxKjKcZ9NUaWlRfTu+28lPi1JFzF5xWb
CkPcjw9KCLG60f+9fEZsTLRlsLrAOVJzuVU/lNl1fTT0
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  try {
    return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
  } catch (e) {
    logger.error('Something is wrong with the token\nError:', e)
  }


  return undefined
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
