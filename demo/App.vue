<script setup lang="ts">
import {type CSSProperties, ref} from "vue";
import RandomNamespace from "@/util/randomNamespace.ts";
import VectorDot from "@/VectorDot.vue";
import type Eventish from "@t/Eventish.ts";

const style = ref<CSSProperties>({});

type Values = {
	offset: [number, number];
	shadow: [number, number];
	blur: [number, number];
}
const positions = ref<Values>({
	offset: [0, 0],
	shadow: [0, 0],
	blur: [0, 0],
});

function onChange(e: Eventish) {
	positions.value[e.target.name as keyof typeof positions.value] = e.target.value;
	style.value = {
		"text-shadow": `${positions.value.shadow[0]}px ${positions.value.shadow[1]}px 4px rgba(0,0,0,0.8)`,
		"transform": `translate(${positions.value.offset[0]}px, ${positions.value.offset[1]}px)`,
		"filter": ns.url("filter"),
	};
}

const colorStyle = ref<CSSProperties>({});

function colorChange(e: Event) {
	colorStyle.value = {
		color: (e.target as HTMLInputElement).value
	};
}

const ns = new RandomNamespace();
</script>

<template>
	<p>
		The <code>&lt;VectorDot&gt;</code> component includes X and Y numeric inputs and a widget to allow
		click-and-drag or 2-dimensional
		keyboard-based setting. The widget takes on the currentColor (Change color: <input type="color" @input="colorChange"/>)
		and has min/max/stepand zoom options.
	</p>
	<p>For the code and more information, <a href="https://github.com/SuperFLEB/vue-vector-dot">see the repository.</a></p>
	<div class="panels">
		<div>
			<div class="inputForm" :style="colorStyle">
				<label :for="ns.id('offset')">Offset</label>
				<div>
					<VectorDot class="vdOffset" name="offset" :id="ns.id('offset')" :x="positions.offset[0]"
							   :y="positions.offset[1]" :step="1" @change="onChange"/>
				</div>
				<label :for="ns.id('shadow')">Drop Shadow Position</label>
				<div>
					<VectorDot class="vdShadow" name="shadow" :id="ns.id('shadow')" :x="positions.shadow[0]"
							   :y="positions.shadow[1]" :step="0.1" @change="onChange"/>
				</div>
				<label :for="ns.id('shadow')">Blur X/Y</label>
				<div>
					<VectorDot class="vdBlur" name="blur" :id="ns.id('blur')" :x="positions.blur[0]"
							   :y="positions.blur[1]" yUp :resolution="0.01" :step="0.01" :min="0" @change="onChange"/>
				</div>
			</div>
		</div>
		<div class="previewPane">
			<div :style class="preview">Use the controls above to style this.</div>
		</div>
	</div>
	<svg>
		<defs>
			<filter :id="ns.id('filter')">
				<feGaussianBlur :stdDeviation="positions.blur.join(' ')"/>
			</filter>
		</defs>
	</svg>
</template>

<style scoped>
.panels {
	display: flex;
	flex-direction: column;
	gap: 1em;
	min-height: 80vh;
}

.previewPane {
	overflow: hidden;
	min-height: 60vh;
	border: 1px solid #000;
}

.inputForm {
	display: grid;
	grid-template-columns: max-content 1fr;
	gap: 2em;
}

.inputForm label {
	font-family: sans-serif;
	align-self: center;
}

.preview {
	font-size: 80px;
	font-family: sans-serif;
	font-weight: bold;

	color: #fff;
	-webkit-text-stroke: 2px #000;
}
</style>
