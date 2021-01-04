import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import App from "./App";
console.log(
  `[빌드 정보] ${import.meta.env.SNOWPACK_PUBLIC_BRANCH.toUpperCase()} Build v.${import.meta.env.SNOWPACK_PUBLIC_VERSION} Hash: ${import.meta.env.SNOWPACK_PUBLIC_HASH}`
);

Sentry.init({
  dsn: "https://f8cee800d2f245dc9d3ee9fb00b878a3@o466973.ingest.sentry.io/5483180",
  integrations: [
    new Integrations.BrowserTracing(),
  ],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

ReactDOM.render(<App/>, document.getElementById("potato"));

if (import.meta.hot) {
  import.meta.hot.accept()
}
