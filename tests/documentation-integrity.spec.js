const { test, expect } = require('@playwright/test');
const { checkDocs } = require('../scripts/check-docs');

test.describe('Documentation Integrity Suite', () => {
    test('all node classes must have complete static metadata and up-to-date documentation', async () => {
        expect(() => {
            checkDocs();
        }).not.toThrow();
    });
});
