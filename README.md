# Mountain Trekking Events Platform

A platform for organizing and participating in mountain trekking events.

## Setup Instructions

1. Clone the repository
2. Copy `.env.template` to `.env` and fill in your environment variables:
   ```
   REACT_APP_API_URL=your_api_url
   ```

3. Copy `src/aws-exports.template.ts` to `src/aws-exports.ts` and fill in your AWS configuration

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the development server:
   ```bash
   npm start
   ```

## Environment Variables

- `REACT_APP_API_URL`: Your API Gateway URL

## AWS Configuration

The application uses AWS Amplify for authentication and API Gateway for the backend. You'll need to set up:

1. Cognito User Pool
2. API Gateway
3. Lambda Functions
4. DynamoDB Tables

See the infrastructure directory for CDK deployment scripts.

## Security Notes

- Never commit `.env` files
- Never commit `aws-exports.ts`
- Never commit `amplify/team-provider-info.json`
- Keep API keys and secrets in environment variables
- Use AWS IAM roles and policies for secure access

## Development

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## Infrastructure

The `infrastructure` directory contains AWS CDK code for deploying the backend resources. See the README in that directory for deployment instructions.