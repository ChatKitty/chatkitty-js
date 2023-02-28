import chalk from 'chalk';

import genversion from './genversion/index.js';
import {execSync} from "child_process";

import pkg from '@nrwl/devkit';
const { readCachedProjectGraph } = pkg;

function invariant(condition, message) {
  if (!condition) {
    console.error(chalk.bold.red(message));
    process.exit(1);
  }
}

const [, , name, version] = process.argv;

// A simple SemVer validation to validate the version
const validVersion = /^\d+\.\d+\.\d+(-\w+\.\d+)?/;
invariant(
  version && validVersion.test(version),
  `No version provided or version did not match Semantic Versioning, expected: #.#.#-tag.# or #.#.#, got ${version}.`
);

const graph = readCachedProjectGraph();
const project = graph.nodes[name];

invariant(
  project,
  `Could not find project "${name}" in the workspace. Is the project.json configured correctly?`
);

const outputPath = project.data?.sourceRoot;

invariant(
  outputPath,
  `Could not find "sourceRoot" of project "${name}". Is project.json configured correctly?`
);

try {
  genversion.generate(`${outputPath}/environment/version.ts`,{
    externalVersion: version,
    useEs6Syntax: true,
    useSemicolon: true
  }, function (err, version) {
    if (err) {
      throw err;
    }

    execSync(`nx build ${name}`);
  });
} catch (e) {
  console.error(
    chalk.bold.red(`Error generating version.`)
  );
}
