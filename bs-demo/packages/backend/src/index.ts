import { createBackend } from '@backstage/backend-defaults';

import {
  gitlabPlugin,
  catalogPluginGitlabFillerProcessorModule,
} from '@immobiliarelabs/backstage-plugin-gitlab-backend';

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-proxy-backend/alpha'));
backend.add(import('@backstage/plugin-scaffolder-backend/alpha'));
backend.add(import('@backstage/plugin-techdocs-backend/alpha'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
// See https://backstage.io/docs/auth/guest/provider

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend/alpha'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);

// permission plugin
backend.add(import('@backstage/plugin-permission-backend/alpha'));
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);

// search plugin
backend.add(import('@backstage/plugin-search-backend/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-catalog/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs/alpha'));

backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));

backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-gitlab'));

backend.add(import('@backstage/plugin-catalog-backend-module-github-org'));

// vscode shows the below 2 lines as invalid - however, they seem to compile and work fine
// just as they did before I updated backstage packages
backend.add(gitlabPlugin);
backend.add(catalogPluginGitlabFillerProcessorModule);

backend.add(import('@backstage/plugin-catalog-backend-module-gitlab/alpha'));
backend.add(import('@backstage/plugin-catalog-backend-module-gitlab-org'));

backend.add(import('@backstage/plugin-events-backend/alpha'));
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

backend.add(import('@backstage/plugin-kubernetes-backend/alpha'));

backend.add(import('@digitalist-open-cloud/backstage-plugin-harbor-backend'));

backend.start();
