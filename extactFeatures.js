const fs = require('fs');
const path = require('path');

function readFeatureFiles(dir) {
  const featureFiles = [];

  function traverseDirectory(currentDir) {
    const files = fs.readdirSync(currentDir);

    files.forEach((file) => {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverseDirectory(fullPath);
      } else if (file.endsWith('.feature')) {
        featureFiles.push(fullPath);
      }
    });
  }

  traverseDirectory(dir);
  return featureFiles;
}

function parseFeatureFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n')

  const jsonArray = [];

  let currentFeature = {};
  let currentScenario = null;
  let nextTags;
  let multilineStep = undefined;
  lines.forEach((currentLine, index) => {
    const line = currentLine.trim()
    if (!line ) {
    }
    else if ( line.startsWith('#')) {
      //do nothing, this is a comment line
    }
    else if (line.startsWith('@')) {
      nextTags = line;
    }

    else if (line.startsWith('Feature:')) {
      currentFeature = {
        feature: line.replace('Feature:', '').trim(),
        tags: nextTags ?? [],
        filePath,
        line: index + 1,
      }
      nextTags = undefined;
    }

    else if (line.startsWith('Scenario:') || line.startsWith('Scenario Outline:')) {
      currentScenario = {
        scenario: line.replace('Scenario:', '').trim(),
        feature: currentFeature,
        steps: [],
      }
      if (nextTags) {
        currentScenario.tags = nextTags
      }
      if (line.startsWith('Scenario Outline:')) {
        currentScenario.type = 'outline';
      }
      nextTags = undefined;
      jsonArray.push(currentScenario);
    }

    else if (!currentScenario) {
      currentFeature.description = `${currentFeature.description ?? ''} ${line}`.trim();
    }

    else if (currentScenario) {
      if(currentScenario.examples) {
       currentScenario.examples.push(line);
      } else {
        currentScenario.steps.push(line);
      }
    }

    else if (line.startsWith("Examples:") && currentScenario && !currentScenario.examples) {
      currentScenario.examples = [];
      // currentScenario.examples.push(line)
    }


    else {
      console.log('skipping line:', line);
    }
  });

  return jsonArray;
}

const projectDir = path.resolve(__dirname); // Adjust the base directory if needed
const featureFiles = readFeatureFiles(projectDir);
const modelIndex = [];
featureFiles.forEach(file => {
  const parsedData = parseFeatureFile(file);
  modelIndex.push(...parsedData);
});
console.log(`writing ${modelIndex.length} feature files to:/Volumes/mhdev/working-copies/QA/automation/featureIndex.json `);
fs.writeFileSync('/Volumes/mhdev/working-copies/QA/automation/featureIndex.json', JSON.stringify(modelIndex, null, 2), 'utf-8');

