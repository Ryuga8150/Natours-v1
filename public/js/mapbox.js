export const displayMap = (locations) => {
  mapboxgl.accessToken =
    "pk.eyJ1Ijoicnl1Z2E4MTUwIiwiYSI6ImNscHBoejI2ZDEwOGcya29idnhxZDRyMzUifQ.WAGUEm9Wt7zDPGZ5iBxioQ";

  let map = new mapboxgl.Map({
    // below will look for id map
    container: "map",
    style: "mapbox://styles/ryuga8150/clmk9zhev01qb01qu7kks6bs2",
    scrollZoom: false,
    // center:[-118.113491,34.1117451],
    // zoom:10,
    // interactive:false
  });

  // for area of map
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement("div");

    // coming from our css
    el.className = "marker";

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add Popup
    new mapboxgl.Popup({
      // to prevent overlap with markers
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
