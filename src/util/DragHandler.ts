export type Position = {
	start: [number, number];
	current: [number, number];
	last: [number, number];
	deltaLast: [number, number];
	deltaStart: [number, number];
	compass: [-1 | 0 | 1, -1 | 0 | 1];
	ended: boolean,
	aborted: boolean,
}

function arraySubtract<T extends number[]>(a: T, b: T): T {
	return a.map((v, i) => v - b[i]) as T;
}

export default class DragHandler {
	#element: HTMLElement | SVGElement;
	#endAbortController!: AbortController;
	#endAbortSignal!: AbortSignal;

	#startClientPosition: [number, number] = [0, 0];
	#lastClientPosition: [number, number] = [0, 0];
	#currentClientPosition: [number, number] = [0, 0];
	#lastPositionTime: number = 0;

	#ended: boolean = false;
	#aborted: boolean = false;

	positionRestTime: number = 250;

	get position(): Position {
		const currentPositionExpired = new Date().getTime() > this.#lastPositionTime + this.positionRestTime;
		const last: [number, number] = [...(currentPositionExpired ? this.#currentClientPosition : this.#lastClientPosition)];
		const deltaLast: [number, number] = currentPositionExpired ? [0, 0] : arraySubtract(this.#currentClientPosition, last);
		const deltaStart: [number, number] = arraySubtract(this.#currentClientPosition, this.#startClientPosition);

		const [x, y] = deltaStart;
		const compass = [Math.abs(x / y) < 0.5 ? 0 : Math.sign(x), Math.abs(y / x) < 0.5 ? 0 : Math.sign(y)] as [-1 | 0 | 1, -1 | 0 | 1];

		const pos = {
			start: [...this.#startClientPosition],
			current: [...this.#currentClientPosition],
			last,
			deltaLast,
			deltaStart,
			compass,
			ended: this.#ended,
			aborted: this.#aborted,
		} as Position;
		console.dir("POSITION", pos.deltaStart);
		return pos;
	}

	onStart(_: MouseEvent, __: Position) {
	}

	onMove(_: MouseEvent, __: Position) {
	}

	onEnd(_: MouseEvent | undefined, __: Position) {
	}

	abort() {
		this.#aborted = true;
		this.#end();
	}

	#start(e: MouseEvent) {
		this.#endAbortController = new AbortController();
		this.#endAbortSignal = this.#endAbortController.signal;

		this.#lastPositionTime = new Date().getTime();
		this.#lastClientPosition = this.#startClientPosition = this.#currentClientPosition = [e.clientX, e.clientY];
		window.addEventListener("mousemove", (e: MouseEvent) => this.#move(e), {signal: this.#endAbortSignal});
		window.addEventListener("mouseup", (e: MouseEvent) => this.#end(e), {signal: this.#endAbortSignal});
		this.onStart(e, this.position);
	}

	#move(e: MouseEvent) {
		this.#lastPositionTime = new Date().getTime();
		this.#lastClientPosition = this.#currentClientPosition;
		this.#currentClientPosition = [e.clientX, e.clientY];

		this.onMove(e, this.position);
	}

	#end(e?: MouseEvent) {
		this.#ended = true;
		this.#lastPositionTime = new Date().getTime();
		this.#lastClientPosition = this.#currentClientPosition;
		this.#currentClientPosition = e ? [e.clientX, e.clientY] : this.#currentClientPosition;
		this.onEnd(e, this.position);
		this.#endAbortController.abort();
	}

	constructor(element: HTMLElement | SVGElement, signal?: AbortSignal) {
		this.#element = element;
		this.#element.addEventListener("mousedown", (e) => this.#start(e as MouseEvent), {signal});
		if (signal) signal.addEventListener("abort", () => this.abort());
	}
}