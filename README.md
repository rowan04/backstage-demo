# Backstage for CEDA

A repository for developing Backstage for use by CEDA.

See https://github.com/rowan04/backstage-demo/blob/main/guide.md for the main guide on how to create, run and configure a Backstage app.

## Quick info on running backstage

To install the required prerequisites, see https://github.com/rowan04/backstage-demo/blob/main/guide.md#installs.

In order to be able to create repositories from within your backstage app using the template scaffolder, you will first have to run `export NODE_OPTIONS=--no-node-snapshot` in the terminal before starting backstage.
More information on this can be found at: https://backstage.io/docs/features/software-templates/#getting-started.

To run backstage: `yarn dev`

To run the debug version: `LOG_LEVEL=debug yarn dev`

For more guidance on how to run a backstage app, see https://github.com/rowan04/backstage-demo/blob/main/guide.md#setup-and-running,
and ignore the step on creating your own backstage app.
