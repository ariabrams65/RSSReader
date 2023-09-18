const { XMLParser } = require('fast-xml-parser');

async function parseXml(xml) {
    const parser = new XMLParser({
        ignoreAttributes: false,
        isArray: (name, jpath, isLeafNode, isAttribute) => { 
            return name === 'outline';
        }
    });
    return await parser.parse(xml);
}

module.exports = parseXml;