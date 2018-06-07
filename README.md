# Typescript JSON schema generator

The extension uses [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator) to generate JSON schemas from Typescript sources.


Use the command `"Generate JSON Schema for type..."` to get a list of type definitions and interfaces in the page for which a JSON schema can be generated.  

The generated schema is opened on a new document and can be saved from there.

[comment]: # (\!\[feature X\]\(images/feature-x.png\))


## Extension Settings

This extension contributes the following settings:

* `generateJSONSchema.expose`: Types to include in the 'definitions' section of the JSON Schema.
* `generateJSONSchema.topRef`: Include top reference.
* `generateJSONSchema.jsDoc`: JsDoc description to include in JSON schema.
* `generateJSONSchema.sortProps`: Sort properties in JSON schema.
* `generateJSONSchema.strictTuples`: Do not allow additional items on tuples.

## Known Issues

The JSON schema generation does not work for classes and conditional types.  
File scheme generations issues with [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator/issues)


## Release Notes
See [Change log](./CHANGELOG.md)