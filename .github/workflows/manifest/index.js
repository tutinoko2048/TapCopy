const core = require('@actions/core');
const fs = require('fs');

try {
  const json = fs.readFileSync('manifest.json', 'utf-8');
  const manifest = JSON.parse(json);
  const fileName = `${manifest.header.name}.mcpack`;
  core.setOutput("fileName", fileName);
  
} catch (error) {
  core.setFailed(error.message + error.stack);
}
