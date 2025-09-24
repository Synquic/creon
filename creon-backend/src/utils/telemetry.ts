import { NodeSDK } from "@opentelemetry/sdk-node";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";
import winston from "winston";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-proto";
import { OpenTelemetryTransportV3 } from "@opentelemetry/winston-transport";
import dotenv from "dotenv";
dotenv.config();

import * as api from "@opentelemetry/api";

// ------------------- CONFIG -------------------
// 🔧 MODIFY THESE VALUES FOR YOUR SERVICE
const serviceName = process.env.TELEMETRY_SERVICE_NAME || "your-service-name"; // Change this to your service name
const serviceVersion = process.env.TELEMETRY_SERVICE_VERSION || "1.0.0"; // Change this to your service version

// ⚠️ DO NOT CHANGE - Synquic OpenTelemetry Collector
const collectorUrl = process.env.TELEMETRY_COLLECTOR_URL || "http://13.234.223.159:4318";

// ------------------- EXPORTERS -------------------
const traceExporter = new OTLPTraceExporter({
  url: `${collectorUrl}/v1/traces`,
});
const metricExporter = new OTLPMetricExporter({
  url: `${collectorUrl}/v1/metrics`,
});
const logExporter = new OTLPLogExporter({
  url: `${collectorUrl}/v1/logs`,
});

// ------------------- SDK SETUP -------------------
const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: serviceVersion,
  }),

  traceExporter,
  metricReaders: [
    new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 1000, // Export metrics every 1 second
    }),
  ],
  logRecordProcessors: [new SimpleLogRecordProcessor(logExporter)],

  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-express": { enabled: true },
      "@opentelemetry/instrumentation-winston": { enabled: true },
      "@opentelemetry/instrumentation-mongoose": { enabled: true },
      "@opentelemetry/instrumentation-mongodb": { enabled: true },
      "@opentelemetry/instrumentation-http": { enabled: true },
      "@opentelemetry/instrumentation-runtime-node": { enabled: true },
    }),
  ],
});

export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new OpenTelemetryTransportV3(),
  ],
});

// ------------------- START SDK -------------------
sdk.start();
console.log("Tracing, Metrics, and Logs initialized");

// ------------------- CUSTOM "UP" METRIC -------------------
const meter = api.metrics.getMeter("service-status");

const upGauge = meter.createObservableGauge("service_up", {
  description: "Service up status: 1 = up, 0 = down",
});

upGauge.addCallback((observableResult) => {
  observableResult.observe(1, { service: serviceName });
});

// ------------------- HEARTBEAT COUNTER -------------------
const heartbeatCounter = meter.createCounter("heartbeat_total", {
  description: "Heartbeat counter for service liveness",
});

setInterval(() => {
  heartbeatCounter.add(1, { service: serviceName });
}, 1000);

// ------------------- GRACEFUL SHUTDOWN -------------------
process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(() => console.log("Tracing and Metrics terminated"))
    .catch((error) =>
      console.log("Error terminating tracing and metrics", error)
    )
    .finally(() => process.exit(0));
});
