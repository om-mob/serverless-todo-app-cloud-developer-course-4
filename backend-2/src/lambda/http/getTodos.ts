import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../businessLayer/todos'
import { getUserId } from '../utils'

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const userId = getUserId(event)
    const todos = await getTodosForUser(userId)
    const items = JSON.stringify({todos})

    // return undefined
    return {
      statusCode: 200,
      body: items
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
