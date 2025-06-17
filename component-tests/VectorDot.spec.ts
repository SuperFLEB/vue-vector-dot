import {test, expect} from "@playwright/experimental-ct-vue";
import VectorDotTestHarness from "./VectorDotTestHarness.vue";

async function dragWidgetBy(component, page, x: number, y: number) {
	const widget = await component.locator(".vectorDotWidget");
	const box = await widget.boundingBox();
	const start: [number, number] = [box.x + box.width / 2, box.y + box.height / 2];
	await page.mouse.move(...start);
	await page.mouse.down();
	await page.mouse.move(start[0] + x, start[1] + y);
	await page.mouse.up();
}

test("Mounts with the vectorDot class", async ({mount}) => {
	const harness = await mount(VectorDotTestHarness, {props: {x: 0, y: 0}});
	await expect(harness.locator(".vectorDot")).toBeAttached();
});

test.describe("Drag changes value", async () => {
	const stops = [-20, 0, 20];
	for (const xstop of stops) {
		for (const ystop of stops) {
			test(`Drag widget to (${xstop}, ${ystop})`, async ({mount, page}) => {
				const harness = await mount(VectorDotTestHarness, {props: {x: 0, y: 0}});
				const component = await harness.locator(".vectorDot").nth(0);
				await dragWidgetBy(component, page, xstop, ystop);
				await expect(harness.locator(".x-value")).toContainText(xstop.toString());
				await expect(harness.locator(".y-value")).toContainText(ystop.toString());
			});
		}
	}
});

test.describe("Drag works multiple times", async () => {
	const stops = [-20, 0, 20];
	for (const xstop of stops) {
		for (const ystop of stops) {
			test(`Drag widget to (${xstop}, ${ystop}) twice`, async ({mount, page}) => {
				const harness = await mount(VectorDotTestHarness, {props: {x: 0, y: 0}});
				const component = await harness.locator(".vectorDot").nth(0);
				await dragWidgetBy(component, page, xstop, ystop);
				await dragWidgetBy(component, page, xstop, ystop);
				await expect(harness.locator(".x-value")).toContainText((xstop * 2).toString());
				await expect(harness.locator(".y-value")).toContainText((ystop * 2).toString());
			});
		}
	}
});

test.describe("Drag with multiplier", async () => {
	const stops = [-20, 0, 20];
	const zooms = [0.001, 0.1, 1, 100];
	for (const xstop of stops) {
		for (const ystop of stops) {
			for (const zoom of zooms) {
				test(`Drag widget to (${xstop}, ${ystop}) with resolution ${zoom}`, async ({mount, page}) => {
					const harness = await mount(VectorDotTestHarness, {props: {x: 0, y: 0, resolution: zoom}});
					const component = await harness.locator(".vectorDot").nth(0);
					await dragWidgetBy(component, page, xstop, ystop);
					await expect(harness.locator(".x-value")).toContainText((xstop * zoom).toString());
					await expect(harness.locator(".y-value")).toContainText((ystop * zoom).toString());
				});
			}
		}
	}
});

test.describe("Typein updates value", async () => {
	const stops = [-2000, -200, -20, -2, -.2, -.02, -.002, 0, .002, .02, .2, 2, 20, 200, 2000];
	for (const xstop of stops) {
		for (const ystop of stops) {
			test(`Update to (${xstop}, ${ystop})`, async ({mount}) => {
				const harness = await mount(VectorDotTestHarness, {props: {x: 0, y: 0}});
				const component = await harness.locator(".vectorDot").nth(0);
				const x = await component.locator("input[type=number]").nth(0);
				const y = await component.locator("input[type=number]").nth(1);
				await x.fill(xstop.toString());
				await y.fill(ystop.toString());
				await expect(harness.locator(".x-value")).toContainText(xstop.toString());
				await expect(harness.locator(".y-value")).toContainText(ystop.toString());
			});
		}
	}
});

test("Typein does not allow non-numeric values", async ({mount}) => {
	const harness = await mount(VectorDotTestHarness, {props: {x: 0, y: 0}});
	const component = await harness.locator(".vectorDot").nth(0);
	const x = await component.locator("input[type=number]").nth(0);
	const y = await component.locator("input[type=number]").nth(1);
	await x.fill("100");
	await y.fill("200");
	await expect(harness.locator(".x-value")).toContainText("100");
	await expect(harness.locator(".y-value")).toContainText("200");
	await x.pressSequentially("XXX");
	await y.pressSequentially("XXX");
	// Some browsers will let you type in the box and it'll reset to zero because the number is invalid and therefore 0.
	// Other browsers just won't accept the keypress and will not change the value.
	await expect(harness.locator(".x-value")).toContainText(/^(100|0)$/);
	await expect(harness.locator(".y-value")).toContainText(/^(200|0)$/);
});

test.describe("Arrow keys on widget changes the value", async () => {
	const zooms = [0.1, 1, 10];
	const directions: [string, number, number][] = [
		["ArrowDown", 0, 1],
		["ArrowUp", 0, -1],
		["ArrowLeft", -1, 0],
		["ArrowRight", 1, 0],
		["Numpad2", 0, 1],
		["Numpad8", 0, -1],
		["Numpad4", -1, 0],
		["Numpad6", 1, 0],
		["Numpad7", -1, -1],
		["Numpad9", 1, -1],
		["Numpad1", -1, 1],
		["Numpad3", 1, 1]
	];
	for (const zoom of zooms) {
		for (const direction of directions) {
			test(`Press ${direction[0]} at ${zoom} resolution`, async ({mount}) => {
				const harness = await mount(VectorDotTestHarness, {props: {x: 0, y: 0, resolution: zoom}});
				const component = await harness.locator(".vectorDot").nth(0);
				const focusItem = await component.locator(".vectorDotWidget[tabindex], .vectorDotWidget > [tabindex]").nth(0);

				await focusItem.focus();
				await focusItem.press(direction[0]);
				await focusItem.press(direction[0]);
				await focusItem.press(direction[0]);

				await expect(harness.locator(".x-value")).toContainText((direction[1] * zoom * 3).toString());
				await expect(harness.locator(".y-value")).toContainText((direction[2] * zoom * 3).toString());
			});
		}
	}
});

test.describe("Min/Max values with widget input", async () => {
	const tests: [string, number, 1 | -1, boolean][] = [
		// [axis, axisIndex]
		["", 0],
		["", 1],
		["X", 0],
		["Y", 1],
	]
		.flatMap(t => [["min" + t[0], t[1], -1], ["max" + t[0], t[1], 1]] as [string, number, 1 | -1][])
		.flatMap(t => [[...t, false], [...t, true]]);

	for (const testSpec of tests) {
		const [limitProp, axisIndex, sign, hardLimits] = testSpec;
		const axisName = "xy"[axisIndex];
		const limit = 15 + 2 * sign;
		const arrowKey = ["ArrowUp", "ArrowLeft", "", "ArrowRight", "ArrowDown"][2 + (axisIndex + 1) * sign];
		test(
			`${hardLimits ? "Hard" : "Soft"} ${limitProp} of ${limit} respected on ${axisName} drag`,
			async ({mount, page}) => {
				const drag: [number, number] = [0, 0];
				drag[axisIndex] = 4 * sign;

				const harness = await mount(VectorDotTestHarness, {
					props: {
						x: 15,
						y: 15,
						[limitProp]: limit,
						hardLimits
					}
				});
				const component = await harness.locator(".vectorDot").nth(0);
				await dragWidgetBy(component, page, ...drag);
				await expect(harness.locator(`.${axisName}-value`)).toContainText(limit.toString());
			});
		test(
			`${hardLimits ? "Hard" : "Soft"} ${limitProp} of ${limit} respected on ${axisName} widget ${arrowKey}`,
			async ({mount, page}) => {
				const harness = await mount(VectorDotTestHarness, {
					props: {
						x: 15,
						y: 15,
						[limitProp]: limit,
						hardLimits
					}
				});
				const component = await harness.locator(".vectorDot").nth(0);
				const focusItem = await component.locator(".vectorDotWidget[tabindex], .vectorDotWidget > [tabindex]").nth(0);
				await focusItem.focus();
				for (let i=0; i<4; i++) {
					await focusItem.press(arrowKey);
				}
				await expect(harness.locator(`.${axisName}-value`)).toContainText(limit.toString());
			});
		test(
			`${hardLimits ? "Hard" : "Soft"} ${limitProp} of ${limit} ${hardLimits ? "is" : "is not"} respected on ${axisName} typein entry`,
			async ({mount, page}) => {
				const harness = await mount(VectorDotTestHarness, {
					props: {
						x: 15,
						y: 15,
						[limitProp]: limit,
						hardLimits
					}
				});
				const component = await harness.locator(".vectorDot").nth(0);
				const typein = await component.locator("input[type=number]").nth(axisIndex);
				await typein.fill((limit + 10 * sign).toString());
				const expected = hardLimits ? limit.toString() : (limit + 10 * sign).toString();
				await expect(harness.locator(`.${axisName}-value`)).toContainText(expected);
			});
	}
});


test("Overlay appears during drag, changes cursor, and disappears afterward", async ({mount, page}) => {
	const harness = await mount(VectorDotTestHarness, {props: {x: 0, y: 0}});
	const component = await harness.locator(".vectorDot").nth(0);
	const widget = await component.locator(".vectorDotWidget");
	const box = await widget.boundingBox();
	const start: [number, number] = [box.x + box.width / 2, box.y + box.height / 2];
	await page.mouse.move(...start);
	await page.mouse.down();
	await page.mouse.move(start[0] + 1, start[1] + 1);
	const overlay = await page.locator("body > .vectorDotDragOverlay");
	await expect(overlay).toBeAttached();
	await expect(overlay).toHaveCSS("cursor", "move");
	await page.mouse.up();
	await expect(page.locator("body > .vectorDotDragOverlay")).not.toBeAttached();
});