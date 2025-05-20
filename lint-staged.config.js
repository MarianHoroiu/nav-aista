module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,css,scss}': ['prettier --write'],
  '*.md': ['prettier --write'],
};
