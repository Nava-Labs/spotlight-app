// import {
//   createFromIdls,
//   renderJavaScriptVisitor,
// } from "@metaplex-foundation/kinobi";
// import path from "path";
const path = require("path");
const k = require("@metaplex-foundation/kinobi");

// Instantiate Kinobi.
const kinobi = k.createFromIdls([
  path.join(__dirname, "idl", "spotlight_programs.json"),
]);

// Update the Kinobi tree using visitors...

// Render JavaScript.
const jsDir = path.join(__dirname, "clients", "js", "src", "generated");
kinobi.accept(new k.renderJavaScriptVisitor(jsDir));
