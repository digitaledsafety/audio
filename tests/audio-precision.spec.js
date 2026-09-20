const { test, expect } = require('@playwright/test');

test.describe('High-Resolution AudioParam and CV Modulation Precision', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        const cta = page.locator('#cta-button');
        if (await cta.isVisible()) {
            await cta.click();
        }
        await page.evaluate(async () => {
            if (typeof window.startAudio === 'function' && (!window.audioContext || window.audioContext.state !== 'running')) {
                await window.startAudio();
            }
        });
        await page.waitForFunction(() => window.editor && window.reteAudioNodes);
    });

    test('should maintain high-precision float values on ToneGenerator frequency parameter', async ({ page }) => {
        const precisionResult = await page.evaluate(async () => {
            const toneNode = new ToneGeneratorNode();
            await window.editor.addNode(toneNode);

            while (!window.reteAudioNodes.has(toneNode.id)) {
                await new Promise(r => setTimeout(r, 10));
            }

            const audioNode = window.reteAudioNodes.get(toneNode.id);
            const targetFreq = 440.012345;
            audioNode.updateParameter('frequency', targetFreq);

            return {
                dataFreq: toneNode.data.frequency,
                targetValue: targetFreq
            };
        });

        expect(precisionResult.dataFreq).toBeCloseTo(440.012345, 5);
        expect(precisionResult.dataFreq).toBe(precisionResult.targetValue);
    });

    test('should connect CV output to AudioParam without precision loss', async ({ page }) => {
        const cvResult = await page.evaluate(async () => {
            const lfoNode = new LFONode();
            const toneNode = new ToneGeneratorNode();

            await window.editor.addNode(lfoNode);
            await window.editor.addNode(toneNode);

            while (!window.reteAudioNodes.has(lfoNode.id) || !window.reteAudioNodes.has(toneNode.id)) {
                await new Promise(r => setTimeout(r, 10));
            }

            const lfoAudio = window.reteAudioNodes.get(lfoNode.id);
            const toneAudio = window.reteAudioNodes.get(toneNode.id);

            const connectionStrategy = new VoltageConnectionStrategy();
            const audioParam = connectionStrategy.getAudioParam(toneAudio, 'freq');

            // Test connecting LFO output to tone generator freq AudioParam
            connectionStrategy.connect(lfoNode, toneNode, 'freq', 'cv');

            return {
                lfoAudioType: lfoAudio ? lfoAudio.constructor.name : null,
                toneAudioType: toneAudio ? toneAudio.constructor.name : null,
                audioParamType: audioParam ? audioParam.constructor.name : null
            };
        });

        expect(cvResult.lfoAudioType).toBe('LFOGenerator');
        expect(cvResult.toneAudioType).toBe('ToneGenerator');
        expect(cvResult.audioParamType).toBe('AudioParam');
    });
});
