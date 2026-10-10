<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {formatTime} from "../../../shared/presentation/format.js";

/**
 * Line chart of the readings of a sensor, with its acceptable range and the out-of-range readings.
 */
const props = defineProps({
  /** Readings to draw, oldest first. */
  readings: { type: Array, required: true },
  /** Lower acceptable limit. */
  lower: { type: Number, required: true },
  /** Upper acceptable limit. */
  upper: { type: Number, required: true },
  /** Unit of the readings. */
  unit: { type: String, default: '' },
  /** Accessible description of the chart. */
  label: { type: String, default: 'Telemetry chart' },
  /** Text shown when there are no readings. */
  emptyText: { type: String, default: 'No IoT data is associated.' }
});

const { locale } = useI18n();

const width = 600;
const height = 220;
const left = 40;
const right = 590;
const top = 12;
const bottom = 196;

/** Lowest and highest values of the vertical axis. */
const range = computed(() => {
  const values = props.readings.map(reading => reading.value);
  const span = props.upper - props.lower;
  return {
    min: Math.floor(Math.min(props.lower - span * 0.4, ...values)),
    max: Math.ceil(Math.max(props.upper + span * 0.4, ...values))
  };
});

/**
 * Vertical SVG coordinate of a value.
 * @param {number} value - Reading value.
 * @returns {number} Coordinate inside the chart.
 */
const y = (value) => bottom - ((value - range.value.min) / (range.value.max - range.value.min || 1)) * (bottom - top);

/** Readings as chart points. */
const points = computed(() => {
  const step = props.readings.length > 1 ? (right - left) / (props.readings.length - 1) : 0;
  return props.readings.map((reading, index) => ({
    x: left + step * index,
    y: y(reading.value),
    reading,
    outOfRange: reading.value < props.lower || reading.value > props.upper
  }));
});

/** Points of the line. */
const polyline = computed(() => points.value.map(point => `${point.x},${point.y}`).join(' '));
/** Highest out-of-range point, labelled in the chart. */
const peak = computed(() => points.value.filter(point => point.outOfRange).sort((a, b) => b.reading.value - a.reading.value)[0]);
/** Points labelled on the time axis. */
const axisPoints = computed(() => {
  const every = Math.max(1, Math.ceil(points.value.length / 5));
  return points.value.filter((_, index) => index % every === 0);
});
/** Values labelled on the vertical axis. */
const ticks = computed(() => [range.value.min, props.lower, props.upper, range.value.max]
    .filter((value, index, all) => all.indexOf(value) === index));
</script>

<template>
  <div class="chart">
    <svg v-if="points.length" :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="label">
      <rect :x="left" :y="y(upper)" :width="right - left" :height="y(lower) - y(upper)" class="band"/>
      <line :x1="left" :x2="right" :y1="y(upper)" :y2="y(upper)" class="limit"/>
      <line :x1="left" :x2="right" :y1="y(lower)" :y2="y(lower)" class="limit"/>
      <text :x="right - 4" :y="y(upper) - 5" class="limit-label" text-anchor="end">{{ upper }} {{ unit }}</text>
      <text :x="right - 4" :y="y(lower) + 14" class="limit-label" text-anchor="end">{{ lower }} {{ unit }}</text>
      <text v-for="tick in ticks" :key="tick" :x="left - 8" :y="y(tick) + 4" class="axis" text-anchor="end">{{ tick }}</text>
      <polyline :points="polyline" class="line"/>
      <circle v-for="point in points" :key="point.reading.id" :cx="point.x" :cy="point.y" :r="point.outOfRange ? 5 : 3"
              class="dot" :class="{ alert: point.outOfRange }"/>
      <text v-if="peak" :x="peak.x + 8" :y="peak.y + 4" class="peak">
        {{ peak.reading.value }} {{ unit }} · {{ formatTime(peak.reading.recordedAt, locale) }} UTC
      </text>
      <text v-for="point in axisPoints" :key="`axis-${point.reading.id}`" :x="point.x" :y="height - 4" class="axis" text-anchor="middle">
        {{ formatTime(point.reading.recordedAt, locale) }}
      </text>
    </svg>
    <p v-else class="empty">{{ emptyText }}</p>
  </div>
</template>

<style scoped>
.chart {
  padding: 12px;
  border-radius: 8px;
  background: var(--gray-bg);
}

svg {
  display: block;
  width: 100%;
  height: auto;
}

.band { fill: var(--mint); }
.limit { stroke: var(--danger); stroke-width: 1; }
.limit-label { fill: var(--teal); font-size: 11px; }
.axis { fill: var(--slate); font-size: 11px; }
.line { fill: none; stroke: var(--teal); stroke-width: 2; }
.dot { fill: var(--teal); }
.dot.alert { fill: var(--danger); }
.peak { fill: var(--danger); font-size: 12px; font-weight: 600; }
.empty { margin: 24px 0; color: var(--muted); text-align: center; }
</style>
