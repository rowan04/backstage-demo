# Creating your own backstage app (simplified)
Backstage docs link: https://backstage.io/docs/overview/what-is-backstage


## Contents
[Installs](https://github.com/rowan04/backstage-demo/blob/main/guide.md#installs)

[Setup and Running](https://github.com/rowan04/backstage-demo/blob/main/guide.md#setup-and-running)

[GitHub Authentication and Organisational Data](https://github.com/rowan04/backstage-demo/blob/main/guide.md#github-authentication-and-organisational-data)

[GitLab repository pulling](https://github.com/rowan04/backstage-demo/blob/main/guide.md#gitlab-repository-pulling)

[GitHub and GitLab template scaffolding](https://github.com/rowan04/backstage-demo/blob/main/guide.md#gitlab-repository-pulling-and-plugin)

[Kubernetes plugin](https://github.com/rowan04/backstage-demo/blob/main/guide.md#kubernetes-plugin)

[Harbor plugin](https://github.com/rowan04/backstage-demo/blob/main/guide.md#harbor-plugin)

[Security Insights plugin](https://github.com/rowan04/backstage-demo/blob/main/guide.md#security-insights-plugin)

[Updating Backstage dependencies](https://github.com/rowan04/backstage-demo/blob/main/guide.md#updating-backstage-dependencies)


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

In the `integrations` section of `app-config.yaml` you will need to add a GitHub personal access token.
The full integration looks like:
```
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}
```

Then, you will need to pull users/groups from the cedadev github. Backstage will check the github account you signed in with exists in the cedadev users list, and if it does it will log you into the backstage instance.
Follow https://backstage.io/docs/integrations/github/org/#installation, and do the following steps:

From backstage root directory: `yarn --cwd packages/backend add @backstage/plugin-catalog-backend-module-github-org`

Then add the following config to `app-config.yaml`:
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

Then in `packages/backend/src/index.ts` add:
```
backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));
backend.add(import('@backstage/plugin-catalog-backend-module-github-org'));
```

You will probably want to hide your tokens within the `app-config.local.yaml` file. This file won't be commited as it is included in `.gitignore`.
Be careful as any config written into the local file will overwrite what you have written in your normal `app-config.yaml` file.


## GitLab repository pulling and plugin
From your root directory, run the following:

```
yarn --cwd packages/backend add @backstage/plugin-catalog-backend-module-gitlab
yarn --cwd packages/backend add @backstage/plugin-catalog-backend-module-gitlab-org
yarn --cwd packages/app add @immobiliarelabs/backstage-plugin-gitlab
yarn --cwd packages/backend add @immobiliarelabs/backstage-plugin-gitlab-backend
```

Then to `packages/backend/src/index.ts` add:

```
import {
  gitlabPlugin,
  catalogPluginGitlabFillerProcessorModule,
} from '@immobiliarelabs/backstage-plugin-gitlab-backend';

// GitLab plugin and repo scanning
backend.add(gitlabPlugin);
backend.add(catalogPluginGitlabFillerProcessorModule);
backend.add(import('@backstage/plugin-catalog-backend-module-gitlab/alpha'));
backend.add(import('@backstage/plugin-catalog-backend-module-gitlab-org'));
```

Then in `app-config.yaml`:

In the `integrations:` section, add:
```
  gitlab:
    - host: ${GITLAB_HOST}
      token: ${GITLAB_TOKEN}
      apiBaseUrl: ${GITLAB_API_BASE_URL}
      rawBaseUrl: ${GITLAB_RAW_BASE_URL}
```

And in the `catalog: providers:` section add:
```
    # import GitLab repositories
    gitlab:
      cedadev:
        host: gitlab.ceda.ac.uk
        branch: main
        fallbackBranch: master
        group: cedadev
        schedule:
          frequency: { minutes: 60 }
          timeout: { minutes: 30 }
```

You should now be pulling any GitLab repositories with a `catalog-info.yaml` file in their root directory.

Finally, follow steps 1 and 2 at the following link: https://github.com/immobiliare/backstage-plugin-gitlab?tab=readme-ov-file#setup-frontend-plugin.
This adds the GitLab plugin information into a components' entity page, found at `packages\app\src\components\catalog\EntityPage.tsx`.


## GitHub and GitLab template scaffolding
In order to create repositories on GitHub and GitLab via the backstage scaffolder:

Replace the `examples/` subdirectory with my custom `entities/` subdirectory, found at
https://github.com/rowan04/backstage-demo/tree/main/bs-demo/entities.
This contains a `template.yaml` file containing the templates, and many files which get auto added to any created
repositories. The eastiest way will be to clone the backstage-demo repository, then copy the entities subdirectory
and paste it in to the location of the `examples/` subdirectory.

The in your root directory, run the following:
```
yarn --cwd packages/backend add @backstage/plugin-scaffolder-backend-module-github
yarn --cwd packages/backend add @backstage/plugin-scaffolder-backend-module-gitlab
```

And then add the following in `packages/backend/src/index.ts`:
```
// template scaffolding
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-gitlab'));
```

Then, in the `catalog:` section of `app-config.yaml`, add:
```
  locations:
    # Add Custom Templates
    - type: file
      target: entities/template/template.yaml
      rules:
        - allow: [Template]
```


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


## Security Insights plugin
From root directory, run `yarn --cwd packages/app add @roadiehq/backstage-plugin-security-insights`.

Follow this guide : https://github.com/RoadieHQ/roadie-backstage-plugins/tree/main/plugins/frontend/backstage-plugin-security-insights#plugin-setup
which shows what code to add to the entity page, found at `packages\app\src\components\catalog\EntityPage.tsx`.


## Updating Backstage dependencies
To update all `@backstage` packages and dependencies, run: `yarn backstage-cli versions:bump`.

Then, to update the other plugins and their dependencies, run the following:
```
yarn backstage-cli versions:bump --pattern '@{circleci,digitalist-open-cloud,immobiliarelabs,internal,material-ui,roadiehq,spotify,playwright,testing-library,types}/*'
```

```
yarn backstage-cli versions:bump --pattern '{react,react-dom,react-router,react-router-dom,react-use,history,cross-env,concurrently,lerna,node-gyp,prettier,typescript,app,better-sqlite3,dockerode,pg,winston}'
```

Any new plugins will have to be added to one of the above two lists, if you want to update it and its dependencies.

To update a single plugin/package/dependency, run in the following format: `yarn backstage-cli versions:bump --pattern '<INSERT_DEPENDENCY>'`

For further information, see https://backstage.io/docs/getting-started/keeping-backstage-updated
