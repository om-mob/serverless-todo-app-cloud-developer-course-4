import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'  // Not Required
import {v4 as uuidV4} from 'uuid'
// import * as createError from 'http-errors'  // Not Required

// TODO: Implement businessLogic

const todoAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    return todoAccess.getAllTodoItemsByUser(userId);
  }
  
  export async function createTodo(todoItem: CreateTodoRequest, userId: string): Promise<TodoItem> {
    const todoId = uuidV4()
    const createdAt = new Date().toISOString()
  
    return todoAccess.createTodoItem({
      ...todoItem,
      todoId,
      userId,
      done: false,
      createdAt
    });
  }
  
  export async function updateTodo(todoId: string, userId: string, update: TodoUpdate): Promise<TodoUpdate> {
    return todoAccess.updateTodo(todoId, userId, update);
  }
  
  export async function deleteTodo(todoId: string, userId: string): Promise<void> {
    await todoAccess.deleteTodo(todoId, userId);
  }
  
  export async function createAttachmentPresignedUrl(todoId: string, userId: string) {
    const imageId = uuidV4();
    await todoAccess.addAttachmentToTodo(todoId, userId, imageId);
    return await attachmentUtils.generateUploadUrl(imageId)
  }