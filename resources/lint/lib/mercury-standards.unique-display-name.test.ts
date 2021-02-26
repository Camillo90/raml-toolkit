/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";
import {
  getHappySpec,
  renderSpecAsFile,
  conforms,
  breaksTheseRules,
  createCustomProfile,
  generateValidationRules,
} from "../../../testResources/testUtils";
import { validateFile } from "../../../src/lint/lint";

describe("unique display name validation", () => {
  const RULE = "http://a.ml/vocabularies/data#unique-display-names";
  let doc;
  let testProfile: string;

  before(() => {
    testProfile = createCustomProfile(
      generateValidationRules("mercury-standards", ["unique-display-names"])
    );
  });

  beforeEach(() => {
    doc = getHappySpec();
  });

  it("should pass if all the display names are unique", async () => {
    const result = await validateFile(renderSpecAsFile(doc), testProfile);

    conforms(result);
  });

  it("should fail on duplicate display name within a resource", async () => {
    doc["/resource"]["/{resourceId}"].get.displayName = "notUnique";
    doc["/resource"]["/{resourceId}"].post.displayName = "notUnique";

    const result = await validateFile(renderSpecAsFile(doc), testProfile);

    breaksTheseRules(result, [RULE, RULE]);
  });

  it("should fail on duplicate display name between two different resources", async () => {
    doc["/resource"]["/{resourceId}"].get.displayName = "notUnique";
    doc["/resource2"]["/{id}"].get.displayName = "notUnique";

    const result = await validateFile(renderSpecAsFile(doc), testProfile);

    breaksTheseRules(result, [RULE, RULE]);
  });

  it("should fail if two display names only differ by case of characters", async () => {
    doc["/resource"]["/{resourceId}"].get.displayName = "notUnique";
    doc["/resource"]["/{resourceId}"].post.displayName = "notuNique";

    const result = await validateFile(renderSpecAsFile(doc), testProfile);

    breaksTheseRules(result, [RULE, RULE]);
  });
});
