<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, useTemplateRef} from "vue";
import DragHandler, {type Position} from "@/util/DragHandler.ts";
import RandomNamespace from "@/util/randomNamespace.ts";
import type Eventish from "@t/Eventish.ts";
import lensMap from "@/assets/lens.png";

type Props = {
	x: number,
	y: number,
	xLeft?: boolean,
	yUp?: boolean,
	hardLimits?: boolean,
	min?: number,
	max?: number,
	minX?: number | undefined,
	maxX?: number | undefined,
	minY?: number | undefined,
	maxY?: number | undefined,
	step?: number,
	stepX?: number | undefined,
	stepY?: number | undefined,
	resolution?: number,
	id?: string,
	name?: string
};
const props = withDefaults(defineProps<Props>(), {
	width: 200,
	height: 200,
	hardLimits: false,
	xLeft: false,
	yUp: false,
	min: -Infinity,
	max: Infinity,
	step: 0,
	minX: undefined,
	maxX: undefined,
	minY: undefined,
	maxY: undefined,
	stepX: undefined,
	stepY: undefined,
	id: undefined,
	name: undefined,
	resolution: 1,
});

function def<T>(a: T | undefined, b: T): T {
	return (a === undefined) ? b : a;
}

const limits = computed(() => ({
	min: [def(props.minX, props.min), def(props.minY, props.min)],
	max: [def(props.maxX, props.max), def(props.maxY, props.max)],
	step: [def(props.stepX, props.step), def(props.stepY, props.step)],
}));

const emit = defineEmits(["change"]);
const svgControllerRef = useTemplateRef("svgController");
const inputRefs = [useTemplateRef("inputX"), useTemplateRef("inputY")];
let abortController: AbortController;

const joystick = ref<[number, number]>([0, 0]);
const delta = ref<[number, number]>([0, 0]);
const inDrag = ref<boolean>(false);

onMounted(() => {
	abortController = new AbortController();
	const handler = new DragHandler(svgControllerRef.value!, abortController.signal);
	handler.onStart = () => {
		inDrag.value = true;
	};
	handler.onMove = (_: MouseEvent, p: Position) => {
		delta.value = p.deltaStart;
		joystick.value = p.compass;
		emitDelta(p.deltaLast);
	};
	handler.onEnd = () => {
		inDrag.value = false;
		joystick.value = [0, 0];
	};
});

onUnmounted(() => {
	abortController.abort();
});

function fixValue(value: [number, number]): [number, number] {
	return value.map((val, component) => {
		const step = limits.value.step[component];
		if (step) val = Math.round(val / step) * step;
		val = Math.max(val, limits.value.min[component]);
		val = Math.min(val, limits.value.max[component]);
		return val;
	}) as [number, number];
}

function emitDelta(delta: [number, number]) {
	delta = [delta[0] * (props.xLeft ? -1 : 1) * props.resolution, delta[1] * (props.yUp ? -1 : 1) * props.resolution];
	emitChange(fixValue([props.x + delta[0], props.y + delta[1]]));
}

function emitChange(xy: [number, number]) {
	emit("change", {
		target: {
			name: props.name,
			id: props.id,
			value: xy
		}
	} as Eventish);
}

function entry() {
	let value = [props.x, props.y].map((current, idx) => {
		const numValue = Number(inputRefs[idx].value?.value);
		if (isNaN(numValue) || !isFinite(numValue)) return current;
		return numValue;
	}) as [number, number];

	if (props.hardLimits) value = fixValue(value);

	emitChange(value);
}

let joyTimeout: number;

function keydown(e: KeyboardEvent) {
	let delta: [number, number] = [0, 0];
	switch (e.code) {
		case "ArrowUp":
		case "Numpad8":
			delta = [0, -1];
			break;
		case "ArrowDown":
		case "Numpad2":
			delta = [0, 1];
			break;
		case "ArrowLeft":
		case "Numpad4":
			delta = [-1, 0];
			break;
		case "ArrowRight":
		case "Numpad6":
			delta = [1, 0];
			break;
		case "Numpad7":
			delta = [-1, -1];
			break;
		case "Numpad9":
			delta = [1, -1];
			break;
		case "Numpad1":
			delta = [-1, 1];
			break;
		case "Numpad3":
			delta = [1, 1];
			break;
		default:
			return;
	}

	joystick.value = [Math.sign(delta[0]), Math.sign(delta[1])];
	if (joyTimeout) clearTimeout(joyTimeout);
	joyTimeout = setTimeout(() => joystick.value = [0, 0], 250);

	emitDelta(delta);

	e.stopPropagation();
	e.preventDefault();
}

const ns = new RandomNamespace();
</script>

<template>
	<div class="vectorDot">
		<Teleport v-if="inDrag" to="body">
			<div class="vectorDotDragOverlay"></div>
		</Teleport>
		<div class="typein">
			<label>X <input ref="inputX" type="number" :value="props.x" step="1" @input="entry" :id="props.id"/></label>
			<label>Y <input ref="inputY" type="number" :value="props.y" step="1" @input="entry"/></label>
		</div>
		<div class="vectorDotWidget" title="Click and drag or use arrow/numpad keys to move">
			<svg tabindex="0" @keydown="keydown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
				 class="svgController" ref="svgController">
				<defs>
					<filter :id="ns.id('lens')">
						<feImage :href="lensMap" result="lensMap"/>
						<feDisplacementMap in="SourceGraphic" in2="lensMap" scale="20" xChannelSelector="R"
										   yChannelSelector="G" color-interpolation-filters="sRGB" result="ball"/>

						<feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blurred"/>
						<feSpecularLighting in="blurred" surfaceScale="1" specularConstant="1" specularExponent="40"
											lighting-color="#fff" result="spec">
							<fePointLight x="-10" y="-10" z="20"></fePointLight>
						</feSpecularLighting>
						<feComposite in="ball" in2="spec" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>

					</filter>
					<pattern :id="ns.id('checkerboard')" class="checkerboard" viewBox="0 0 2 2" width="2" height="2"
							 patternUnits="objectBoundingBox" :patternTransform="`translate(${props.x} ${props.y})`">
						<rect width="2" height="2"/>
						<rect width="1" height="1"/>
						<rect width="1" height="1" x="1" y="1"/>
					</pattern>
					<radialGradient :id="ns.id('dotGrad')" cx="30%" cy="30%" r="70%">
						<stop offset="0%" stop-color="#fff"/>
						<stop offset="15%" stop-color="#ccc"/>
						<stop offset="25%" stop-color="#888"/>
						<stop offset="100%" stop-color="#444"/>
					</radialGradient>
					<path :id="ns.id('point')" d="M 50 0 l 10 20 h -20 z"/>
					<circle :id="ns.id('handle')" class="handle" :fill="ns.url('checkerboard')" :filter="ns.url('lens')"
							style="--patternScale: 0.1;"/>
				</defs>

				<circle class="selectring" cx="50" cy="50" r="40" fill="none"/>
				<g :class="['arrows', { n: joystick[1] === -1, s: joystick[1] === 1, w: joystick[0] === -1, e: joystick[0] === 1 }]">
					<use :href="ns.fragment('point')"/>
					<use :href="ns.fragment('point')" style="transform: rotate(90deg)"/>
					<use :href="ns.fragment('point')" style="transform: rotate(180deg)"/>
					<use :href="ns.fragment('point')" style="transform: rotate(270deg)"/>
				</g>
				<use :href="ns.fragment('handle')" x="50" y="50"/>
			</svg>
		</div>
	</div>
</template>

<style scoped lang="scss">
.vectorDot {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.svgController {
	width: 2em;
	aspect-ratio: 1 / 1;
	user-select: none;
	margin: 0 1ch;
	cursor: move;
	fill: currentColor;
}

.selectring {
	display: none;
	fill: none;
	stroke: currentColor;
	stroke-width: 1;
	stroke-dasharray: 2 2;
	vector-effect: non-scaling-stroke;
}

.svgController:focus, .svgController:focus-visible {
	outline: none;

	.selectring {
		display: block;
	}

	.arrows > use {
		fill: currentColor;
	}

	.arrows.n > use:first-child,
	.arrows.e > use:nth-child(2),
	.arrows.s > use:nth-child(3),
	.arrows.w > use:nth-child(4) {
		vector-effect: non-scaling-stroke;
		stroke: currentColor;
		stroke-width: 2;
		fill: #fff;
	}
}

.arrows > use {
	transform-origin: 50px 50px;
	fill: currentColor;
}

.handle {
	x: 0;
	y: 0;
	r: 22px;
}

.checkerboard > rect:first-child {
	filter: invert(0.8) hue-rotate(180deg);
}

.checkerboard > rect {
	color: currentColor;
	filter: contrast(0.6);
}

.typein {
	white-space: nowrap;

	label:first-child {
		padding-inline-end: 1em;
	}

	input[type=number] {
		width: 4em;
	}
}

.vectorDotDragOverlay {
	position: fixed;
	inset: 0;
	cursor: move;
}
</style>