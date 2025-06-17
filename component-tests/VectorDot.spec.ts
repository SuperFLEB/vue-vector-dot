import {test, expect} from "@playwright/experimental-ct-vue";
import VectorDotTestHarness from "./VectorDotTestHarness.vue";

async function dragWidgetBy(component, page, x: number, y: number) {
	const widget = await component.locator(".vectorDotWidget");
	const box = await widget.boundingBox();
	const start: [number, number] = [box.x + box.width / 2, box.y + box.height / 2];
	await page.mouse.move(...start);
	await page.mouse.down();
	await page.mouse.move(start[0] + x / 2, start[1] + y / 2);
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

test("Typein does not allow invalid values", async ({mount}) => {
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

test.describe("Keyboard moves value", async () => {
	const zooms = [0.1, 1, 10];
	const directions: [string, number, number][] = [["ArrowDown", 0, 1], ["ArrowUp", 0, -1], ["ArrowLeft", -1, 0], ["ArrowRight", 1, 0]];
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