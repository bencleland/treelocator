let map = L.map('map', {
  center: [39.5, -98.35],
  zoom: 4,
  zoomControl: true
});

// Add ESRI satellite imagery
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri'
}).addTo(map);

// Custom icon (green pin with yellow outline)
const treeIcon = L.icon({
  iconUrl: 'images/tree-pin.png',
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -35]
});

// Local storage helpers
let markers = [];

function saveLocal() {
  localStorage.setItem("pins", JSON.stringify(markers));
}

function loadLocal() {
  try {
    const raw = localStorage.getItem("pins");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// Draw saved pins on startup
markers = loadLocal();
markers.forEach(pin => {
  const m = L.marker([pin.lat, pin.lng], { icon: treeIcon }).addTo(map);
  m.bindPopup(`<b>Name:</b> ${pin.name}<br><b>Tree #:</b> ${pin.tree}<br><b>Notes:</b> ${pin.notes}<br><small>Updated: ${pin.updatedAt}</small>`);
});

// Drop pin mode
let dropMode = false;
document.getElementById("dropPinBtn").onclick = () => {
  dropMode = true;
  alert("Tap on map to drop pin");
};

map.on("click", function(e) {
  if (!dropMode) return;
  dropMode = false;
  const latlng = e.latlng;

  const name = prompt("Enter Name:");
  const tree = prompt("Enter Tree #:");
  const notes = prompt("Enter Notes:");

  if (!name || !tree) {
    alert("Name and Tree # are required.");
    return;
  }

  const pinData = {
    name, tree, notes: notes || "",
    lat: latlng.lat, lng: latlng.lng,
    updatedAt: new Date().toISOString()
  };

  markers.push(pinData);
  saveLocal();

  const marker = L.marker(latlng, { icon: treeIcon }).addTo(map);
  marker.bindPopup(`<b>Name:</b> ${pinData.name}<br><b>Tree #:</b> ${pinData.tree}<br><b>Notes:</b> ${pinData.notes}<br><small>Updated: ${pinData.updatedAt}</small>`);
});

// Clear all pins
document.getElementById("clearAllBtn").onclick = () => {
  if (confirm("Are you sure you want to clear all pins?")) {
    markers = [];
    saveLocal();
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });
  }
};