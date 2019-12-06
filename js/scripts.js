// Creación de un mapa de Leaflet
var map = L.map("mapid");

// Centro del mapa y nivel de acercamiento
var graduacion = L.latLng([10.7550, -85.2827]);
var zoomLevel = 12;

// Definición de la vista del mapa
map.setView(graduacion, zoomLevel);
L.control.scale({imperial:false}).addTo(map);

// Adición de capa
esriLayer = L.tileLayer.provider("Esri.WorldImagery").addTo(map);


terrLayer = L.tileLayer.provider("Esri.WorldShadedRelief").addTo(map);

// Añadir capa ráster 
var demLayer = L.imageOverlay("DEM.png", 
	[[10.9136111109999998, -85.3662777779999971], 
	[10.6571666670000003, -85.1032777780000060]], 
	{opacity:0.5}
).addTo(map);

$.getJSON("puntos_aforo.geojson", function(geodata) {
	var layer_geojson_puntos_aforo = L.geoJson(geodata, {
		style: function(feature) {
			return {'color': "#00ff00", 'weight': 2, 'fillOpacity': 0.0}
		},
		onEachFeature: function(feature, layer) {
			var popupText = "Nombre: " + feature.properties.Nombre + "<br>" + "Elevacion: " + feature.properties.Elevacion + " msnm";
			layer.bindPopup(popupText);
		}			
	}).addTo(map);
	control_capas.addOverlay(layer_geojson_puntos_aforo, 'Puntos de aforo');
	layer_geojson_puntos_aforo.remove();
});	


$.getJSON('subcuencas.geojson', function (geojson) {
	var layer_geojson_cuencas_c = L.choropleth(geojson, {
		valueProperty: 'Area_ha',
		scale: ['yellow', 'green', 'red'],
		steps: 7,
		mode: 'q',
		style: {
			color: '#fff',
			weight: 1,
			fillOpacity: 0.8
		},
		onEachFeature: function (feature, layer) {
			layer.bindPopup('cuenca ' + feature.properties.Nombre + '<br>' + feature.properties.Area_ha + ' Área')
		}
	}).addTo(map);
	control_capas.addOverlay(layer_geojson_cuencas_c, 'Cuencas (Hectáreas)');
	layer_geojson_cuencas_c.remove();
	
	
	var legend = L.control({ position: 'bottomright' })
  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend')
    var limits = layer_geojson_cuencas_c.options.limits
    var colors = layer_geojson_cuencas_c.options.colors
    var labels = []

    // Add min & max
    div.innerHTML = '<div class="labels"><div class="min">' + limits[0] + '</div> \
			<div class="max">' + limits[limits.length - 1] + '</div></div>'

    limits.forEach(function (limit, index) {
      labels.push('<li style="background-color: ' + colors[index] + '"></li>')
    })

    div.innerHTML += '<ul>' + labels.join('') + '</ul>'
    return div
  }
  legend.addTo(map)
});

/*var catedralSJMarker = L.marker([10.7898, -85.2827])

// En JS: marcador para la Catedral Metropolitana de San José
var catedralSJMarker = L.marker([10.7979315, -85.2844866],
	{ icon: L.divIcon(
		{ html: '<i class="fas fa-church"></i>'}
	)}
).addTo(map);

catedralSJMarker.bindPopup('<a href="https://es.wikipedia.org/wiki/Catedral_metropolitana_de_San_Jos%C3%A9">Catedral Metropolitana de San José</a>.<br>Catedral de estilo clásico y barroco. Templo principal de la arquidiócesis católica de San José.<br>Construída entre 1825 y 1827 y reconstruída en 1878.').openPopup();
catedralSJMarker.bindTooltip("Catedral Metropolitana de San José").openTooltip();		

catedralSJMarker.addTo (map);

var	basiAngelesMarker = L.marker([10.7898, -85.2827])
basiAngelesMarker.bindPopup('<a href="https://es.wikipedia.org/wiki/Catedral_metropolitana_de_San_Jos%C3%A9">Catedral Metropolitana de San José</a>.<br>Catedral de estilo clásico y barroco. Templo principal de la arquidiócesis católica de San José.<br>Construída entre 1825 y 1827 y reconstruída en 1878.').openPopup();
basiAngelesMarker.bindTooltip("Basilica de los Angeles").openTooltip();	

basiAngelesMarker.addTo (map);*/

var cuencas = L.layerGroup().addTo(map);

function colorPolis(d) { 
	return d == "Chico Luis" ? '#FF0000' : 
		d == "Gutierrez" ? '#00FF00' : 
		d == "Martinez" ? '#0000FF' : 
		d == "Mora" ? '#FF00FF' :
		d == "Pastor" ? '#FFFA0' :
		d == "Provision" ? '#AFFF09' :
		d == "Rancho Grande" ? '#FFFF00' :
		'#000000'; 
	};
	
function estilo_cuenca (feature) {
	return{
		fillColor: colorPolis(feature.properties.Nombre),
	};
};

function myFunction() {
	$.getJSON("subcuencas.geojson", function(geodata){
		var layer_geojson_cuencas = L.geoJson(geodata, {
			style: estilo_cuenca,
			onEachFeature: function(feature, layer) {
				var popupText = "cuenca: " + feature.properties.Nombre;
				layer.bindPopup(popupText);
			}
		});
	cuencas.addLayer(layer_geojson_cuencas);
	//control_capas.addOverlay(layer_geojson_cuencas, 'cuencas');
	/*layer_geojson_cuencas.remove();*/
	});
};

function estiloSelect() {
	var miSelect = document.getElementById("estilo").value;
	
	$.getJSON("subcuencas.geojson", function(geodata){
		var layer_geojson_cuencas = L.geoJson(geodata, {
			filter: function(feature, layer) {								
				if(miSelect != "TODOS")		
				return (feature.properties.Nombre == miSelect );
				else
				return true;
			},	
			style: estilo_cuenca,
			onEachFeature: function(feature, layer) {
				var popupText = "cuenca: " + feature.properties.Nombre;
				layer.bindPopup(popupText);
			}
		});
 		cuencas.clearLayers();
		cuencas.addLayer(layer_geojson_cuencas);
	});		
};

var baseMaps = {
  "ESRI Worl Imagery": esriLayer,
  "Relieve": terrLayer,
};

var overlayMaps = {
	"Modelo de Elevación Digital": demLayer,
};
	
control_capas = L.control.layers(baseMaps, overlayMaps).addTo(map);

