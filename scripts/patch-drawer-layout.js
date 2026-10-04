const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '../node_modules/react-native-drawer-layout/lib/module/views/InteractionManager.js'
);

if (fs.existsSync(targetFile)) {
  const content = fs.readFileSync(targetFile, 'utf8');
  if (content.includes("import * as ReactNative from 'react-native'")) {
    const patchedContent = `"use strict";\n\n// Patched: eliminated wildcard import to prevent react-native Lean Core deprecation warnings\nlet InteractionManager;\nexport { InteractionManager };\n`;
    fs.writeFileSync(targetFile, patchedContent, 'utf8');
    console.log('[patch-drawer-layout] Successfully patched InteractionManager.js in react-native-drawer-layout');
  }
}
