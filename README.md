# @superfleb/vue-vector-dot

A Vue control to input a 2-dimensional vector, offset, or point (x,y values). The control consists of

* An X numeric input
* A Y numeric input
* A "2D input widget". When selected, the user can use the arrow keys to nudge the X and Y values, or click and drag on
  the widget to quickly adjust the X/Y value.

## To Use

All properties are shown here. Some are redundant or optional. See below for details.

```html
    <VectorDot
        :x="0"
        :y="0"
        @change="onChange"
        name="my-name"
        id="my-id"
        :min="0"
        :max="1000"
        :step="0.1"
        :resolution="0.1"
        :min-x="0"
        :max-x="1000"
        :min-y="0"
        :min-y="1000"
        :step-x="0.1"
        :step-y="0.1"
        :resolution="1"
        hard-limits
        x-left
        y-up
/>
```

No child elements are allowed or necessary.

### x, y (required)

The current x and y values for the component. The display is only updated when these values change, so the change event
should update these props.

### @change (event)

The change event fires whenever the values change, with an "Eventlike" object that looks like:

```typescript
{
    target: {
        value: [number, number],
        id: string | undefined,
        name: string | undefined,
    }
}
```

### name (optional)

The name returned in the `name` field of the `@change` event.

### id (optional)

The id returned in the `id` field of the `@change` event, and assigned to the "X" input (to allow `<label for="...">` association.)

### min, max, min-x, max-x, min-y, max-y (optional)

Minimum and maximum values allowed. If an "...-x" or "...-y" is given, it will override the general min/max.

### step, step-x, step-y (optional)

Values from the 2D input widget will be rounded to the nearest step. A "step-x" or "step-y" value will override the "step".

Note that this does _not_ change the behavior or resolution of the 2D input widget. (see "resolution")

### resolution (optional, default 1)

This number determines how much change one pixel of dragging on the 2D input widget represents. Values over 1 will make
the drag faster, fractional values will make it slower.

### hard-limits (optional flag)

If this is set/true, min and max limits will also be applied to the X/Y typeins.

### x-left, y-up (optional flags)

If these are set/true, invert the normal drag direction on the 2D input widget, so increasing x involves dragging left
instead of right, and/or increasing y involves dragging up instead of down.

The `y-up` option is especially useful for cases where an increasing Y value indicates an increasing
quantity, instead of a top-left based coordinate.
