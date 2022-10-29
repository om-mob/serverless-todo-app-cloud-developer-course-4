import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly todoTable: string = process.env.TODOS_TABLE!,
      private readonly createdAtIndex: string = process.env.TODOS_CREATED_AT_INDEX!,
      private readonly bucketName: string = process.env.ATTACHMENT_S3_BUCKET!
    ) { }
  
    async createTodoItem(todo: TodoItem): Promise<TodoItem> {
      logger.info(`create todo item: ${todo}`)
  
      const result = await this.docClient.put({
        TableName: this.todoTable,
        Item: todo
      }).promise()
  
      logger.info(`todo created: ${result.Attributes}`)
  
      return todo
    }
  
    async getAllTodoItems(userId: string): Promise<TodoItem[]> {
      logger.info(`get all todos for user: ${userId}`)
  
      const result = await this.docClient.query({
        TableName: this.todoTable,
        IndexName: this.createdAtIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }).promise()
  
      logger.info(`todos for user: ${result.Items}`)
  
      return result.Items as TodoItem[]
    }
  
    async updateTodo(todoId: string, userId: string, update: TodoUpdate): Promise<TodoUpdate> {
      logger.info(`update todo: ${todoId}, user: ${userId}, update: ${update}`)
  
      const result = await this.docClient.update({
        TableName: this.todoTable,
        Key: {
          'userId': userId,
          'todoId': todoId
        },
        UpdateExpression: 'set name = :name, dueDate = :dueDate, done = :done',
        // ExpressionAttributeNames: {
        //   "#n": "name",
        //   "#dD": "dueDate",
        //   "#d": "done"
        // },
        ExpressionAttributeValues: {
          ':name': update.name,
          ':dueDate': update.dueDate,
          ':done': update.done
        },
        ReturnValues: 'ALL_NEW'
      }).promise()
  
      logger.info('todo updated')
  
      return result.Attributes as TodoUpdate
    }
  
    async deleteTodo(todoId: string, userId: string): Promise<boolean> {
      logger.info(`delete todo: ${todoId} for user: ${userId}`)
  
      await this.docClient.delete({
        TableName: this.todoTable,
        Key: {
          'userId': userId,
          'todoId': todoId
        }
      }).promise()
  
      logger.info("todo deleted")
  
      return true
    }
  
    async addAttachmentToTodo(todoId: string, userId: string, imageId: string): Promise<string> {
      logger.info(`adding attachment to todo: ${todoId}, user: ${userId}, imageId: ${imageId}`)
  
      const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${imageId}`
  
      await this.docClient.update({
        TableName: this.todoTable,
        Key: {
          'userId': userId,
          'todoId': todoId
        },
        UpdateExpression: 'set attachmentUrl = :url',
        ExpressionAttributeValues: {
          ':url': attachmentUrl,
        },
        ReturnValues: 'ALL_NEW'
      }).promise()
  
      logger.info(`attachment url: ${attachmentUrl}`)
  
      return attachmentUrl
    }
  }