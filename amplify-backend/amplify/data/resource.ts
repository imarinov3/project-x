import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  Event: a
    .model({
      title: a.string(),
      description: a.string(),
      date: a.string(),
      location: a.string(),
      difficulty: a.enum(['easy', 'moderate', 'hard', 'extreme']),
      duration: a.string(),
      maxParticipants: a.integer(),
      meetingPoint: a.string(),
      organizerId: a.string(),
      participants: a.string().array(),
      createdAt: a.string(),
      updatedAt: a.string(),
    })
    .authorization((allow) => [
      // Only authenticated users can create events
      allow.userPool().to(['create']),
      
      // The owner (organizer) can update and delete their events
      allow.userPool().to(['update', 'delete']).where(({ organizerId }) => ({
        organizerId: { eq: organizerId }
      })),
      
      // Any authenticated user can read events
      allow.userPool().to(['read']),
      
      // Allow unauthenticated read access
      allow.apiKey().to(['read']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresIn: 365,
      description: 'Public API key for reading events'
    }
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
