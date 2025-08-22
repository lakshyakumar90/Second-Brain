// Simple test for editor utilities
const { extractPlainTextFromEditorState, generateSummary } = require('./dist/utils/editorUtils');

// Test editor state
const testEditorState = {
  root: {
    children: [
      {
        type: "heading",
        tag: "h1",
        children: [
          {
            text: "Hello World",
            type: "text",
            format: 0,
            version: 1
          }
        ],
        direction: null,
        format: "",
        indent: 0,
        version: 1
      },
      {
        type: "paragraph",
        children: [
          {
            text: "This is a test paragraph with some content.",
            type: "text",
            format: 0,
            version: 1
          }
        ],
        direction: null,
        format: "",
        indent: 0,
        version: 1
      },
      {
        type: "paragraph",
        children: [
          {
            text: "Another paragraph here.",
            type: "text",
            format: 0,
            version: 1
          }
        ],
        direction: null,
        format: "",
        indent: 0,
        version: 1
      }
    ],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1
  }
};

console.log('Testing editor utilities...');
console.log('Input editor state:', JSON.stringify(testEditorState, null, 2));

const plainText = extractPlainTextFromEditorState(testEditorState);
console.log('Extracted plain text:', plainText);

const summary = generateSummary(plainText, 50);
console.log('Generated summary:', summary);

console.log('Test completed successfully!');
