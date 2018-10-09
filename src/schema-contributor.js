const Uri = require("vscode-uri");

class SchemaContributor {
  constructor() {
    this.customSchemaContributors = {};
  }

  /**
   * Register a custom schema provider
   *
   * @param {string} the provider's name
   * @param requestSchema the requestSchema function
   * @param requestSchemaContent the requestSchemaContent function
   * @returns {boolean}
   */
  registerContributor(schema, requestSchema, requestSchemaContent) {
    if (this.customSchemaContributors[schema]) {
      return false;
    }
    if (!requestSchema) {
      throw new Error("Illegal parameter for requestSchema.");
    }

    this.customSchemaContributors[schema] = {
      requestSchema,
      requestSchemaContent,
    };
    return true;
  }

  /**
   * Call requestSchema for each provider and find the first one who reports he can provide the schema.
   *
   * @param {string} resource
   * @returns {string} the schema uri
   */
  requestCustomSchema(resource) {
    for (const customKey of Object.keys(this.customSchemaContributors)) {
      const contributor = this.customSchemaContributors[customKey];
      const uri = contributor.requestSchema(resource);
      if (uri) {
        return uri;
      }
    }
  }

  /**
   * Call requestCustomSchemaContent for named provider and get the schema content.
   *
   * @param {string} uri the schema uri returned from requestSchema.
   * @returns {string} the schema content
   */
  requestCustomSchemaContent(uri) {
    if (uri) {
      const parsedUri = Uri.parse(uri);
      if (
        parsedUri.scheme &&
        this.customSchemaContributors[parsedUri.scheme] &&
        this.customSchemaContributors[parsedUri.scheme].requestSchemaContent
      ) {
        return this.customSchemaContributors[
          parsedUri.scheme
        ].requestSchemaContent(uri);
      }
    }
  }
}

// global instance
const schemaContributor = new SchemaContributor();

// constants
module.exports = {
  CUSTOM_SCHEMA_REQUEST: "custom/schema/request",
  CUSTOM_CONTENT_REQUEST: "custom/schema/content",
  schemaContributor,
};
