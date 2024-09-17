# Creating your own backstage app (simplified)
Backstage docs link: https://backstage.io/docs/overview/what-is-backstage

## Installs
To begin with, we will need to install a few things. Backstage documents all this at https://backstage.io/docs/getting-started/#prerequisites, but I've also outlined what you need below:

You will need node.js, and we need to install this using nvm.

Run either `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash` or `wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash` in a terminal to install nvm.
For help view https://github.com/nvm-sh/nvm#install--update-script. 

Then install Node.js using one of the methods found at https://nodejs.org/en/download/package-manager/#nvm. 

You will need to install yarn: run `npm install --global yarn` in a terminal. For help view https://classic.yarnpkg.com/en/docs/install#windows-stable.

## Setup and Running
In the root of your repository, run ```npx @backstage/create-app@latest``` to create your backstage app. See https://backstage.io/docs/getting-started/#1-create-your-backstage-app for more information on this process.

In order to be able to create repositories from within your backstage app using the template scaffolder, you will first have to run `export NODE_OPTIONS=--no-node-snapshot` in the terminal before starting backstage.
More information on this can be found at: https://backstage.io/docs/features/software-templates/#getting-started.

Then `cd` into your new backstage app, and run it with `yarn dev` in a terminal.

To run the debugging version: `LOG_LEVEL=debug yarn dev` in a terminal.

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

Then, you will need to pull users/groups from the cedadev github. Backstage will check the github account you signed in with exists in the cedadev users list, and if it does it will log you into the backstage instance.
Follow https://backstage.io/docs/integrations/github/org/#installation, and do the following steps:

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

You will probably want to hide your tokens within the `app-config.local.yaml` file. This file won't be commited as it is included in `.gitignore`.
Be careful as any config written into the local file will overwrite what you have written in your normal `app-config.yaml` file.

## Gitlab repository pulling


## Kubernetes plugin
To install kubernetes plugin: https://backstage.io/docs/features/kubernetes/installation

To configure kubernetes plugin: https://backstage.io/docs/features/kubernetes/configuration

In order for kubernetes information to show, you need to include annnotations in the in the relevant components' catalog-info.yaml file:

Use `'backstage.io/kubernetes-label-selector':` if you want to include a whole namespace.

Use  `'backstage.io/kubernetes-id':` if you just want a single kubernetes app.

See https://gitlab.ceda.ac.uk/cedadev/jasmin-accounts-deploy/-/blob/main/catalog-info.yaml for an example catalog-info.yaml file for a component with kubernetes annotations.

Many thanks to Alex Manning, who helped me with configuring the kubernetes plugin. Any questions on how to configure a kubernetes plugin / properly annotate a component so kubernetes information shows, should go through him.

Alex says that the authentication works for now, but needs improving. He says it will be easier to do once/if backstage is being managed on kubernetes, as it can access it internally. Currently its through a rancher api key thats in my name.

## Harbor plugin
The backstage docs link to a harbor plugin which currently does not work, as it doesn't comply with the new backend system (see https://github.com/container-registry/backstage-plugin-harbor/issues/295).
Fortunately, there is a fork of that plugin, suggested in the original plugin, which currently does work.

Install the frontend from https://github.com/Digitalist-Open-Cloud/backstage-plugin-harbor.

Install the backend, and then follow the configuration, from https://github.com/Digitalist-Open-Cloud/backstage-plugin-harbor-backend.

In the relevant catalog-info.yaml file, add `goharbor.io/repository-slug: projects/repository`. projects/repository could for example be jasmin-accounts/jasmin-idp.

See https://gitlab.ceda.ac.uk/cedadev/jasmin-accounts-deploy/-/blob/main/catalog-info.yaml for an example catalog-info.yaml file for a component with harbor annotations.

## Current error:
I currently receive the following error when following these steps I wrote myself. I have no idea why. Nothing online explains the error I have. Truly confusing. I wonder if its to do with trying to run 2 backstage apps on the same local area. Oh well:

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
[1]     at BackstageBackend.start (C:\Users\wll81845\Projects\2nd-bst\second-backstage\node_modules\@backstage\backend-app-api\src\wiring\BackstageBackend.ts:42:11))
```

## Extra details:
To update everything, run (BE CAREFUL, WHO KNOWS WHAT MIGHT BREAK (could be nothing as well though)): `yarn backstage-cli versions:bump`
