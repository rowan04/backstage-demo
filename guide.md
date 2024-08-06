# Creating your own backstage app (simplified)

## Installs
To begin with, we will need to install a few things. Backstage documents all this at https://backstage.io/docs/getting-started/#prerequisites, but I've also outlined what you need below:

You will need node.js, and we need to install this using nvm.

Run either `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash` or `wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash` in a terminal to install nvm. For help view https://github.com/nvm-sh/nvm#install--update-script. 

Then install Node.js using one of the methods found at https://nodejs.org/en/download/package-manager/#nvm. 

You will need to install yarn: run `npm install --global yarn` in a terminal. For help view https://classic.yarnpkg.com/en/docs/install#windows-stable.

## Setup
In the root of your repository, run ```npx @backstage/create-app@latest``` to create your backstage app. See https://backstage.io/docs/getting-started/#1-create-your-backstage-app for more information on this process.

Then `cd` into your new backstage app, and run it with `yarn dev` in a terminal.

To run debugging version: `LOG_LEVEL=debug yarn dev` in a terminal.

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

## Current error:
I currently receive the following error when following these steps I wrote myself. I have no idea why. Nothing online explains the error I have. Truly confusing:

```
[1] C:\Users\wll81845\Projects\2nd-bst\second-backstage\node_modules\@backstage\backend-app-api\src\wiring\BackendInitializer.ts:187
[1]               throw new Error(
[1]                     ^
[1]
[1]
[1] Error: ExtensionPoint with ID 'catalog.processing' is already registered
[1]     at BackendInitializer.#doStart (C:\Users\wll81845\Projects\2nd-bst\second-backstage\node_modules\@backstage\backend-app-api\src\wiring\BackendInitializer.ts:187:21)
[1]     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
[1]     at BackendInitializer.start (C:\Users\wll81845\Projects\2nd-bst\second-backstage\node_modules\@backstage\backend-app-api\src\wiring\BackendInitializer.ts:150:5)
[1]     at BackstageBackend.start (C:\Users\wll81845\Projects\2nd-bst\second-backstage\node_modules\@backstage\backend-app-api\src\wiring\BackstageBackend.ts:42:11)
```

## Extra details:

When creating repos via template, you might have to run `export NODE_OPTIONS=--no-node-snapshot` in terminal first
