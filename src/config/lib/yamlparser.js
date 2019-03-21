/*--------------------------------
* YAML PARSER
* File : yamlparser.js
*
* @ author              gmoita
* @ version             1.0
*
*	@ start date					20 03 2019
*	@ last update					21 03 2019
*
* Description
* For platform 'electron'.
* Opens a yaml file and can
* can retrieve its properties.
*--------------------------------*/

/*--------------------------------
* Imports and Constants
*--------------------------------*/
const fs   = require('fs');
const yaml = require('js-yaml');

const VERBOSE = false;

/*--------------------------------
* Function: Open YAML File
*--------------------------------*/
function openYAMLFile (pathToFile) {
  try {
    return yaml.safeLoad(fs.readFileSync(pathToFile, 'utf8'));
  } catch (e) {
    if (VERBOSE)
      console.log(e);
    return null;
  }
}

/*--------------------------------
* Function: Get YAML Setting
*--------------------------------*/
function getYAMLSetting (doc, settings) {
  let val = doc;
  for (let i = 0; i < settings.length; i++)
    val = val[settings[i]];

  return val;
}

/*--------------------------------
* Exporting Module
*--------------------------------*/
exports.openFile = openYAMLFile;
exports.getSetting = getYAMLSetting;
