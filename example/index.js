const path = require("path");
const { Docord } = require("../dist");

const commands = new Map();
// Create a new command called test.
commands.set("test", {
  description: "This is a simple command to demonstrate how Docord works.",
  usage: "test <user> <action>",
  aliases: ["testy", "testcommand"],
  perm: 0,
});

// Instantiate the documentation generator.
const docs = new Docord(commands, path.join(__dirname, "docs"));
// Generate the docs to the outDir then log the written filenames.
docs.generate().then(console.log);
