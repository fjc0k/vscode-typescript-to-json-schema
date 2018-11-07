# Typescript JSON schema generator

The extension uses [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator) to generate JSON schemas from Typescript sources.


Use the command `"Generate JSON Schema for type..."` to get a list of type definitions and interfaces in the page for which a JSON schema can be generated.  

The generated schema is opened on a new document and can be saved from there.

## Extension Settings

This extension contributes the following settings:

* `generateJSONSchema.expose`: Types to include in the 'definitions' section of the JSON Schema.
* `generateJSONSchema.topRef`: Include top reference.
* `generateJSONSchema.jsDoc`: JsDoc description to include in JSON schema.
* `generateJSONSchema.sortProps`: Sort properties in JSON schema.
* `generateJSONSchema.skipTypeCheck`: Skip type checks for better performance.

## Known Issues

The JSON schema generation does not work for classes and conditional types.  
File scheme generations issues with [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator/issues)


## Release Notes
See [Change log](./CHANGELOG.md)