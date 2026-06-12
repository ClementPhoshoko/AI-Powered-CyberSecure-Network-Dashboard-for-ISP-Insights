# Middleware Folder
This folder holds custom middleware functions that run between incoming requests and outgoing responses.

## What is Middleware?
Middleware is code that can:
- Modify the request/response objects
- End the request-response cycle
- Call the next middleware function in the stack

## Common Uses for This Folder:
- Authentication checks (verify Supabase JWT tokens)
- Request validation
- Custom error handling
- Request logging customization
- Rate limiting
- Request preprocessing

## Current Middleware:
- `validateSupabaseJWT.js` - Validates Supabase JWT tokens from requests
- `errorHandler.js` - Centralized error handling for all routes
