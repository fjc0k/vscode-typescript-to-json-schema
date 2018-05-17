# Typescript JSON schema generator

The extension uses [typescript-to-json-schema](https://github.com/xiag-ag/typescript-to-json-schema) to generate JSON schemas from Typescript sources.


Use the command `"Generate JSON Schema for type..."` to get a list of type definitions and interfaces in the page for which a JSON schema can be generated.  

The generated schema is opened on a new document and can be saved from there.

\!\[feature X\]\(images/feature-x.png\)


## Extension Settings

This extension contributes the following settings:

* `generateJSONSchema.expose`: Types to include in the 'definitions' section of the JSON Schema.
* `generateJSONSchema.topRef`: Include top reference.
* `generateJSONSchema.jsDoc`: JsDoc description to include in JSON schema.
* `generateJSONSchema.sortProps`: Sort properties in JSON schema.

## Known Issues

The JSON schema generation does not work for class and conditional types.  
File scheme generations issues with [typescript-to-json-schema](https://github.com/xiag-ag/typescript-to-json-schema/issues)

## Release Notes

### 0.0.1

Initial release of Typescript JSON schema generator