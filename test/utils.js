/* eslint-disable no-undef */
"use strict";
const assert = require("assert");
const tmp = require("tmp");
const fs = require("fs");
const yaml = require("js-yaml");
const _ = require("lodash");

/**
 * Each test starts with loading a known good template and then tweaking it for
 * the test case. If you make changes to the template, make sure all of the
 * tests pass.
 */

function getHappySpec() {
  return yaml.safeLoad(fs.readFileSync(`${__dirname}/valid.raml`, "utf8"));
}

function renderSpecAsFile(doc) {
  let tmpFile = tmp.fileSync({ postfix: ".raml" });
  let content = `#%RAML 1.0\n---\n${yaml.safeDump(doc)}`;
  fs.writeFileSync(tmpFile.name, content);
  return tmpFile.name;
}

function renderSpecAsUrl(doc) {
  return new URL(`file://${renderSpecAsFile(doc)}`);
}

function conforms(result) {
  assert.equal(result.conforms, true, result.toString());
}

function breaksOnlyOneRule(result, rule) {
  assert.equal(result.conforms, false, result.toString());
  assert.equal(result.results.length, 1, result.toString());
  assert.equal(result.results[0].validationId, rule);
}

function renameKey(obj, oldKey, newKey) {
  obj[newKey] = _.cloneDeep(obj[oldKey]);
  delete obj[oldKey];
  return obj;
}

function getSingleValidFile() {
  let doc = getHappySpec();
  return renderSpecAsFile(doc);
}

function getSingleInvalidFile() {
  let tmpFile = tmp.fileSync({ postfix: ".raml" }).name;
  fs.writeFileSync(tmpFile, "");
  return tmpFile;
}

module.exports = {
  getHappySpec,
  renderSpecAsFile,
  renderSpecAsUrl,
  conforms,
  breaksOnlyOneRule,
  renameKey,
  getSingleValidFile,
  getSingleInvalidFile
};