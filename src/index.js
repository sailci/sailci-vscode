/* eslint-disable class-methods-use-this */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const {
  LanguageClient,
  NotificationType,
  TransportKind,
} = require("vscode-languageclient");
const path = require("path");
const vscode = require("vscode");
const {
  CUSTOM_CONTENT_REQUEST,
  CUSTOM_SCHEMA_REQUEST,
  schemaContributor,
} = require("./schema-contributor");

const dynamicCustomSchemaRequestRegistration = new NotificationType(
  "yaml/registerCustomSchemaRequest",
);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
const activate = context => {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "sail-ci" is now active!');

  // The server is implemented in node
  const serverModule = context.asAbsolutePath(
    path.join(
      "node_modules",
      "yaml-language-server",
      "out",
      "server",
      "src",
      "server.js",
    ),
  );

  // The debug options for the server
  const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  // Options to control the language client
  const clientOptions = {
    // Register the server for plain text documents
    documentSelector: [
      { language: "sailci", scheme: "file" },
      { language: "sailci", scheme: "untitled" },
    ],
    synchronize: {
      // Synchronize the setting section 'languageServerExample' to the server
      configurationSection: ["yaml", "http.proxy", "http.proxyStrictSSL"],
      // Notify the server about file changes to '.clientrc files contain in the workspace
      fileEvents: [vscode.workspace.createFileSystemWatcher("**/.sail.yml")],
    },
  };

  // Create the language client and start the client.
  const client = new LanguageClient(
    "sailci",
    "Sail CI Support",
    serverOptions,
    clientOptions,
  );
  const disposable = client.start();

  // Push the disposable to the context's subscriptions so that the
  // client can be deactivated on extension deactivation
  context.subscriptions.push(disposable);

  client.onReady().then(() => {
    client.sendNotification(dynamicCustomSchemaRequestRegistration);
    client.onRequest(CUSTOM_SCHEMA_REQUEST, resource =>
      schemaContributor.requestCustomSchema(resource),
    );
    client.onRequest(CUSTOM_CONTENT_REQUEST, uri =>
      schemaContributor.requestCustomSchemaContent(uri),
    );
  });

  // vscode.languages.setLanguageConfiguration("sailci", {
  //   wordPattern: /("(?:[^\\\"]*(?:\\.)?)*"?)|[^\s{}\[\],:]+/,
  // });
};

// this method is called when your extension is deactivated
const deactivate = () => {};

module.exports = {
  activate,
  deactivate,
};
