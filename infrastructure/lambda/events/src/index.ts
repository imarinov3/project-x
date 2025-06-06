import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamodb = new DynamoDB.DocumentClient();
const EVENTS_TABLE = process.env.EVENTS_TABLE!;
const USER_PROFILES_TABLE = process.env.USER_PROFILES_TABLE!;

// CORS headers for all responses
const getCorsHeaders = (event: APIGatewayProxyEvent) => ({
  'Access-Control-Allow-Origin': event.headers.origin || 'http://localhost:3000',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,Origin',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,PUT,POST,DELETE',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
});

// Helper function to create response with CORS headers
const createResponse = (statusCode: number, body: any, event: APIGatewayProxyEvent): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: getCorsHeaders(event),
    body: JSON.stringify(body),
  };
};

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  difficulty: 'easy' | 'moderate' | 'hard' | 'extreme';
  organizerId: string;
  participants: string[];
  maxParticipants?: number;
  duration: string;
  requirements?: string[];
  meetingPoint: string;
  createdAt: string;
  updatedAt: string;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Log the incoming request for debugging
  console.log('Event:', {
    httpMethod: event.httpMethod,
    path: event.path,
    headers: event.headers,
    body: event.body,
    requestContext: event.requestContext,
  });

  // Handle OPTIONS requests for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(event),
      body: ''
    };
  }

  try {
    const userId = event.requestContext.authorizer?.claims?.sub;
    if (!userId) {
      return createResponse(401, { message: 'Unauthorized' }, event);
    }

    switch (event.httpMethod) {
      case 'GET':
        if (event.pathParameters?.id) {
          return await getEventById(event.pathParameters.id, event);
        }
        return await getAllEvents(event);

      case 'POST':
        if (!event.body) {
          return createResponse(400, { message: 'Missing request body' }, event);
        }
        try {
          const eventData = JSON.parse(event.body);
          return await createEvent(eventData, userId, event);
        } catch (error) {
          console.error('Error parsing request body:', error);
          return createResponse(400, { message: 'Invalid request body' }, event);
        }

      case 'PUT':
        if (!event.pathParameters?.id) {
          return createResponse(400, { message: 'Event ID is required' }, event);
        }
        return await updateEvent(event.pathParameters.id, JSON.parse(event.body || '{}'), userId, event);

      case 'DELETE':
        if (!event.pathParameters?.id) {
          return createResponse(400, { message: 'Event ID is required' }, event);
        }
        return await deleteEvent(event.pathParameters.id, userId, event);

      default:
        return createResponse(405, { message: 'Method not allowed' }, event);
    }
  } catch (error) {
    console.error('Error:', error);
    return createResponse(500, {
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, event);
  }
};

async function getEventById(id: string, event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const result = await dynamodb
    .get({
      TableName: EVENTS_TABLE,
      Key: { id },
    })
    .promise();

  if (!result.Item) {
    return createResponse(404, { message: 'Event not found' }, event);
  }

  return createResponse(200, result.Item, event);
}

async function getAllEvents(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const result = await dynamodb
    .scan({
      TableName: EVENTS_TABLE,
    })
    .promise();

  return createResponse(200, result.Items, event);
}

async function createEvent(eventData: any, userId: string, event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const timestamp = new Date().toISOString();
  const newEvent = {
    id: uuidv4(),
    createdAt: timestamp,
    organizerId: userId,
    ...eventData,
  };

  await dynamodb
    .put({
      TableName: EVENTS_TABLE,
      Item: newEvent,
    })
    .promise();

  return createResponse(201, newEvent, event);
}

async function updateEvent(id: string, updates: any, userId: string, event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const existingEvent = await dynamodb
    .get({
      TableName: EVENTS_TABLE,
      Key: { id },
    })
    .promise();

  if (!existingEvent.Item) {
    return createResponse(404, { message: 'Event not found' }, event);
  }

  if (existingEvent.Item.organizerId !== userId) {
    return createResponse(403, { message: 'Only the organizer can update the event' }, event);
  }

  const updateExpression = Object.keys(updates)
    .map((key) => `#${key} = :${key}`)
    .join(', ');

  const expressionAttributeNames = Object.keys(updates).reduce(
    (acc, key) => ({ ...acc, [`#${key}`]: key }),
    {}
  );

  const expressionAttributeValues = Object.keys(updates).reduce(
    (acc, key) => ({ ...acc, [`:${key}`]: updates[key] }),
    {}
  );

  await dynamodb
    .update({
      TableName: EVENTS_TABLE,
      Key: { id },
      UpdateExpression: `SET ${updateExpression}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })
    .promise();

  return createResponse(200, { message: 'Event updated successfully' }, event);
}

async function deleteEvent(id: string, userId: string, event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const existingEvent = await dynamodb
    .get({
      TableName: EVENTS_TABLE,
      Key: { id },
    })
    .promise();

  if (!existingEvent.Item) {
    return createResponse(404, { message: 'Event not found' }, event);
  }

  if (existingEvent.Item.organizerId !== userId) {
    return createResponse(403, { message: 'Only the organizer can delete the event' }, event);
  }

  await dynamodb
    .delete({
      TableName: EVENTS_TABLE,
      Key: { id },
    })
    .promise();

  return createResponse(200, { message: 'Event deleted successfully' }, event);
} 