// ---- Map Layers ----
var esriSat = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { attribution: 'Tiles © Esri & contributors', maxZoom: 22 }
);
var labels = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
  { attribution: '&copy; OSM & CARTO', subdomains: 'abcd', maxZoom: 20 }
);
var map = L.map('map', { center: [39.5, -98.35], zoom: 5, layers: [esriSat, labels] });

// ---- Icons ----
var treeIcon = L.icon({ iconUrl:'images/tree-pin.png', iconSize:[30,42], iconAnchor:[15,42], popupAnchor:[0,-40]});

// ---- State ----
var markers = []; var dropMode=false;

// ---- Toast ----
function showToast(msg,error=false){let t=document.createElement("div");t.textContent=msg;t.style.position="fixed";t.style.bottom="20px";t.style.left="50%";t.style.transform="translateX(-50%)";t.style.background=error?"#c00":"#333";t.style.color="#fff";t.style.padding="10px 16px";t.style.borderRadius="6px";t.style.zIndex=9999;document.body.appendChild(t);setTimeout(()=>t.remove(),3000);}

// ---- LocalStorage ----
function saveToLocalStorage(){ localStorage.setItem("pins", JSON.stringify(markers)); }
function loadFromLocalStorage(){
 let saved = localStorage.getItem("pins");
 if(saved){
   JSON.parse(saved).forEach(r=>{
     var m=L.marker([r.lat,r.lng],{icon:treeIcon}).addTo(map);
     m.bindPopup(`<b>Type:</b> ${r.type}<br><b>Name:</b> ${r.name}<br><b>Tree #:</b> ${r.tree}<br><b>Notes:</b> ${r.notes}<br><small>Updated: ${r.updatedAt}</small>`);
   });
   showToast("📦 Loaded pins from device storage");
 }
}

// ---- Netlify Sync ----
const SCRIPT_URL="https://treelocator.netlify.app/.netlify/functions/sync";
function syncToGoogleSheet(marker){
 fetch(SCRIPT_URL,{method:"POST",body:JSON.stringify(marker),headers:{"Content-Type":"application/json"}})
 .then(r=>r.json()).then(d=>{console.log("✅ Synced:",d);showToast("✅ Pin saved to Google Sheet");})
 .catch(e=>{console.error("⚠️ Sync failed:",e);showToast("⚠️ Failed to sync",true);});
}

// ---- Drop Pin ----
map.on("click",function(e){if(!dropMode)return;document.getElementById("dropMsg").style.display="none";dropMode=false;
 var m=L.marker(e.latlng,{icon:treeIcon}).addTo(map);
 var popup=document.createElement("div");
 popup.innerHTML=`<label>Type: <input id="typeInput" required></label><br><label>Name: <input id="nameInput"></label><br><label>Tree #: <input id="treeInput"></label><br><label>Notes: <input id="notesInput"></label><br><button id="saveBtn">Save</button><button id="deleteBtn">Delete</button>`;
 m.bindPopup(popup).openPopup();
 popup.querySelector("#saveBtn").onclick=function(){
   var type=popup.querySelector("#typeInput").value;
   var name=popup.querySelector("#nameInput").value;
   var tree=popup.querySelector("#treeInput").value;
   var notes=popup.querySelector("#notesInput").value;
   if(!type||!name||!tree){showToast("Type, Name & Tree # required",true);return;}
   var data={type,name,tree,notes,lat:e.latlng.lat,lng:e.latlng.lng,updatedAt:new Date().toISOString()};
   m.setPopupContent(`<b>Type:</b> ${type}<br><b>${name}</b><br>Tree #: ${tree}<br>Notes: ${notes}<br><small>Updated: ${data.updatedAt}</small><br><button id="delBtn">Delete</button>`);
   markers.push(data);
   saveToLocalStorage(); // local persist
   syncToGoogleSheet(data); // try sheet sync
   showToast("✅ Pin saved");
   m.getPopup().on("add",()=>{document.getElementById("delBtn").onclick=function(){map.removeLayer(m);markers=markers.filter(x=>x.lat!==data.lat||x.lng!==data.lng);saveToLocalStorage();showToast("🗑️ Marker deleted");};});
 };
 popup.querySelector("#deleteBtn").onclick=function(){map.removeLayer(m);};
});

// ---- Controls ----
document.getElementById("clearBtn").onclick=()=>{if(confirm("Clear all markers?")){markers.forEach(m=>map.removeLayer(m));markers=[];saveToLocalStorage();showToast("🗑️ All markers cleared");}};
document.getElementById("locateBtn").onclick=()=>{if(navigator.geolocation){navigator.geolocation.getCurrentPosition(pos=>{map.setView([pos.coords.latitude,pos.coords.longitude],15);showToast("📍 Moved to your location");},()=>showToast("⚠️ Location access denied",true));}else showToast("⚠️ Geolocation not supported",true);};

// ---- Pin Control ----
var PinControl=L.Control.extend({
  onAdd:function(map){
    var btn=L.DomUtil.create("div","leaflet-control-custom");
    btn.innerHTML="📍";
    btn.title="Drop Pin Mode";
    btn.style.cursor="pointer";
    btn.onclick=function(e){
      L.DomEvent.stopPropagation(e);
      dropMode=true;
      document.getElementById("dropMsg").style.display="block";
    };
    return btn;
  }
});
map.addControl(new PinControl({position:"topleft"}));

// ---- Load pins ----
loadFromLocalStorage();
