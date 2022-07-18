module.exports = {
  '{packages,tools}/**/*.{ts,js,json,md,html,css,scss}': [
    'nx workspace-lint',
    'nx affected --target lint --uncommitted --fix true',
    'nx affected --target test --uncommitted',
    'nx format:write --uncommitted --libs-and-apps',
  ],
};
