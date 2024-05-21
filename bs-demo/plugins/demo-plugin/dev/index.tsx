import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { demoPluginPlugin, DemoPluginPage } from '../src/plugin';

createDevApp()
  .registerPlugin(demoPluginPlugin)
  .addPage({
    element: <DemoPluginPage />,
    title: 'Root Page',
    path: '/demo-plugin',
  })
  .render();
