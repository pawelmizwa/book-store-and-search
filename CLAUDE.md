<Tech_req>
Tech Requirements:

- Use nextjs on frontend with typescript.
- Use nestjs on backend with typescript.
- Use postgres with knex
- Expose API documentation using swagger
- Use nodejs-starter as template for creating backend
  a) apply hexagonal architecture
  b) do not implement any auth flow
  c) use vitest for testing
  d) do not implement sentry or AWS
  e) product table is not needed you need to create book table
- implement TDD approach
- on frontend use tailwind for styles and radixUI for headless components and react query
- Use nextjs-starter as template for creating frontend
- Create README.md file for frontend and backend with detailed explanation
- It is very important to implement cursor pagination which will work for milions of data.
- Add indexes in postgres database which will allow quick search
- Everything needs to be in docker

</Tech_req>

<Code_req>
Code rules:

- Always write the entire code and stay motivated to write it to the letter
- Write functional and declarative code and patterns related to it
- Use Typescript for all the code. Prefer interfaces over types.
- Avoid using classes, prefer functional approach
- Use descriptive variable names such as `user_name` instead of `name`
- Use descriptive function names such as `setInteractionState` instead of `updateInteraction`
- Fail early (exit function early) when possible and take care of error handling
- Use `uuid` for unique identifiers, Use `uuidv4` for generating UUIDs
- The latest Node.js version we're using is `20.x` and it supports natively async/await, promises and fetch api
- Use Zod for runtime validation and error handling.

</Code_req>
