const { v4 } = require("uuid");
const {
  default: slugify,
} = require("slugify");
const path = require("path");
const fs = require("fs").promises;
const { writeToServerDocuments } = require("../../files");

async function readFilesFromDirectory(directoryPath, extensions) {
  const files = [];

  async function readDirectory(directory) {
    const items = await fs.readdir(directory);
    for (const item of items)
    {
      const itemPath = path.join(directory, item);
      const stats = await fs.stat(itemPath);

      if (stats.isDirectory()) {
        readDirectory(itemPath);
      } else {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          files.push(itemPath);
        }
      }
    }
  }

  await readDirectory(directoryPath);

  return files;
}

async function processFile(filePath) {
    console.log(`Processing file: ${filePath}`);

    try {
      const content = await fs.readFile(filePath, { encoding: 'utf8' });

      if (!content.length) {
        console.warn(`Empty content for ${filePath}. Skipping.`);
      }
      var modificationDate;

      fs.stat(filePath, (err, stats) => {
        modificationDate = stats.mtime;
      });

      const url = `file://${filePath}`;
      const filename = path.basename(filePath);
      const data = {
        id: v4(),
        url: url,
        title: slugify(filename),
        docSource: "Local file",
        chunkSource: `directory://${filePath}`,
        published: new Date().toLocaleString(),
        wordCount: content.split(" ").length,
        pageContent: content,
        token_count_estimate: tokenizeString(content),
        modificationDate: modificationDate 
      };

      writeToServerDocuments(data, data.title);
      console.log(`Successfully processed ${filePath}.`);
      
      return data;
    } 
    catch (error) {
      console.error(`Failed to process file ${filePath}.`, error);
    }

    return null;
}

async function processFiles(files) {
  const processedData = [];

  for (const filePath of files) {
    console.log(`Processing file: ${filePath}`);
    var item = await processFile(filePath);
    processedData.push(item);
    console.log(`Successfully processed ${filePath}.`);
  }
  console.log(`[SUCCESS]: Files converted & ready for embedding.\n`);
  return { success: true, reason: null, documents: processedData };
}
async function checkIfFolderExists(path) {
  try {
    await fs.access(path);
    console.log('The folder exists.');
  } catch (error) {
    console.log('The folder does not exist.');
  }
}
async function directoryProcessor(directoryPath, extensions = []) {
  if (await checkIfFolderExists(directoryPath)) {
    console.error(`Directory does not exist: ${directoryPath}`);
    return [];
  }

  console.log("Reading files from directory...");
  const filePaths = await readFilesFromDirectory(directoryPath, extensions);
  console.log(`Found ${filePaths.length} files to process.`);

  console.log("Starting file processing...");
  const processedData = await processFiles(filePaths);
  console.log(`Processed ${processedData.length} files.`);

  return processedData;
}

function tokenizeString(content) {
    // A placeholder for tokenizing logic
    return content.split(/\s+/).length;
}

module.exports = { directoryProcessor, directoryFileProcessor: processFile };;


