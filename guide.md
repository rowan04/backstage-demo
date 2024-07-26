# Creating your own backstage app (simplified)

## Setup

In the root of your repository, run ```npx @backstage/create-app@latest``` to create your backstage app.

See https://backstage.io/docs/getting-started/

Then `cd` into your new backstage app, and run it with `yarn dev`.

To run debugging version: `LOG_LEVEL=debug yarn dev`

## GitHub Authentication and Organisational Data

Next, you want to setup github authentication - https://backstage.io/docs/getting-started/config/authentication. Follow everything on this page, as this will allow it to authenticate with your github account.

Note that when writing the auth section in `app-config.yaml`, you need to add sign-in resolvers to the bottom. It should end up looking like this:
```
auth:
  # see https://backstage.io/docs/auth/ to learn about auth providers
  environment: development
  providers:
    github:
      development:
        clientId: your id here!
        clientSecret: your secret here!
        signIn:
          resolvers:
            - resolver: usernameMatchingUserEntityName
            - resolver: emailMatchingUserEntityProfileEmail
            - resolver: emailLocalPartMatchingUserEntityName
```

Then, you will need to pull users/groups from the cedadev github. Backstage will check the github account you signed in with exists in the cedadev users list, and if it does it will log you into the backstage instance. Follow https://backstage.io/docs/integrations/github/org/#installation, and do the following steps:

From backstage root directory: ```yarn --cwd packages/backend add @backstage/plugin-catalog-backend-module-github-org```

Then add the following config to app-config.yaml:
```
catalog:
  providers:
    githubOrg:
      id: cedadev
      githubUrl: https://github.com/cedadev
      orgs: ['cedadev']
      schedule:
        frequency: { hours: 1 }
        timeout: { minutes: 50 }
```

Then in ```packages/backend/src/index.ts``` add:
```
backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));

backend.add(import('@backstage/plugin-catalog-backend/alpha'));
backend.add(import('@backstage/plugin-catalog-backend-module-github-org'));
```

## Extra details:

When creating repos via template, you might have to run `NODE_OPTIONS=--no-node-snapshot` in terminal first
