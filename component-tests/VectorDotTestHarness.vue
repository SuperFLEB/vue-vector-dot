<script setup lang="ts">
import VectorDot from "@/VectorDot.vue";
import type Eventish from "@t/Eventish";
import {ref} from "vue";

type Props = { x: number, y: number };
const props = defineProps<Props>();
const xy = ref<[number, number]>([props.x, props.y]);

function onChange(e: Eventish) {
	xy.value = e.target.value;
}
</script>

<template>
	<VectorDot @change="onChange" :="$attrs" :x="xy[0]" :y="xy[1]" />
	<div class="x-value">{{ xy[0] }}</div>
	<div class="y-value">{{ xy[1] }}</div>
</template>
