let map = L.map('map').setView([39.5, -98.35], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

let markers = JSON.parse(localStorage.getItem('treeMarkers') || '[]');

let treeIcon = L.icon({
  iconUrl: 'images/tree-pin.png',
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -42]
});

function saveMarkers() {
  localStorage.setItem('treeMarkers', JSON.stringify(markers));
}

function addMarker(lat, lng, label, updatedAt) {
  let marker = L.marker([lat, lng], { icon: treeIcon }).addTo(map);
  let popupContent = document.createElement('div');
  let labelInput = document.createElement('input');
  labelInput.value = label || '';
  popupContent.appendChild(labelInput);
  
  let saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  popupContent.appendChild(saveBtn);
  
  let deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  popupContent.appendChild(deleteBtn);

  let timestamp = document.createElement('div');
  timestamp.style.fontSize = '0.8em';
  timestamp.style.marginTop = '5px';
  timestamp.textContent = updatedAt ? "Updated: " + updatedAt : "";
  popupContent.appendChild(timestamp);
  
  saveBtn.onclick = () => {
    let newLabel = labelInput.value;
    let now = new Date().toLocaleString();
    marker.bindPopup(popupContent);
    let index = markers.findIndex(m => m.lat === lat && m.lng === lng);
    if (index > -1) {
      markers[index].label = newLabel;
      markers[index].updatedAt = now;
    } else {
      markers.push({ lat, lng, label: newLabel, updatedAt: now });
    }
    timestamp.textContent = "Updated: " + now;
    saveMarkers();
    marker.closePopup();
  };
  
  deleteBtn.onclick = () => {
    map.removeLayer(marker);
    markers = markers.filter(m => !(m.lat === lat && m.lng === lng));
    saveMarkers();
  };

  marker.bindPopup(popupContent);
}

markers.forEach(m => addMarker(m.lat, m.lng, m.label, m.updatedAt));

map.on('click', e => {
  let { lat, lng } = e.latlng;
  addMarker(lat, lng, "", "");
});

document.getElementById('downloadBtn').onclick = () => {
  let blob = new Blob([JSON.stringify(markers, null, 2)], { type: 'application/json' });
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'tree-markers.json';
  a.click();
};

document.getElementById('clearBtn').onclick = () => {
  if (confirm("Are you sure you want to clear all markers?")) {
    markers = [];
    saveMarkers();
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });
  }
};
