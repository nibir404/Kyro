# ISP visualization update

## Implemented

- Lazy-loaded Three.js topology on the Operations dashboard and Network page: modeled core and POP rack chassis, fiber uplinks, animated traffic packets, and optional access-layer fanout.
- Orbit by dragging; select nodes through rack picking or keyboard-accessible buttons. Health, utilization, and latency modes update labels and fiber coloring. Selected-node inspector links to incident details and customer filtering.
- Pause packet animation, reset the camera, and toggle the access layer. Reduced-motion settings suppress packet animation. GPU resources and event listeners are disposed on unmount, pixel ratio is capped, and rendering pauses offscreen or in background tabs.
- Accessible node controls and metrics remain usable if WebGL is unavailable.
- Dashboard: subscriber dot matrix, collection segmented bars, core capacity with 80% threshold, priority distribution, existing traffic and health charts, and a service-quality radar.
- Each remaining page has contextual visuals: customer distribution, pipeline stages and value, plan adoption/speeds, support priority tiles, installation lifecycle/workload, asset lifecycle, POP utilization/latency, collection mix, report outcomes, notification routing/read state, local notification preferences, and customer usage/service status.
- Removed duplicate raw-number cards and identical decorative sparklines.

## Data meaning

Customer, billing, support, installation, inventory, and lead summaries derive from current local records. Aggregate network telemetry, radar scores, report trends, and usage history are explicitly illustrative. The 3D layout is a schematic, not geographic coordinates. Packet animation indicates connectivity, not a measured packet rate. Core traffic and per-POP link loads are illustrative measurements, not an accounting reconciliation.

## Browser checks

- All 14 navigation pages rendered with relevant visual panels; no runtime errors during navigation.
- Selected Dhanmondi, switched to utilization, verified 88% and selection state.
- Paused packets, toggled access-layer visibility, and opened the incident inspector: Dhanmondi, 12.4 ms, 138 affected connections.
- Incident drilldown filtered customers to Dhanmondi. Customer area bars filtered to Banani.
- Reviewed dashboard and customer directory at 1440px and dashboard at 390px. Mobile page scroll width matched viewport width.
- Production build passed. Three.js loads in a separate chunk only when its scene is needed.
