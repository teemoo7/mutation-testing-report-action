const fs = require('fs');
const fastXmlParser = require('fast-xml-parser');

function readFile(path) {
  const fileContent = fs.readFileSync(path, 'utf8');
  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseAttributeValue: true,
  };
  const parser = new fastXmlParser.XMLParser(options);
  const xmlMutations = parser.parse(fileContent, true);

  if (xmlMutations) {
    if (xmlMutations.mutations) {
      return xmlMutations.mutations.mutation;
    } else {
      return [];
    }
  } else {
    throw new Error('Invalid XML mutations file: ' + path);
  }
}

module.exports = {
  readFile,
};
