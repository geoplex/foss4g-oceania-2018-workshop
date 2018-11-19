import json
import os


class AbsMbStyleGenerator:
    def __init__(self, geoserver_base_url, config_path):
        self.geoserver_base_url = geoserver_base_url
        with open(config_path, 'r') as config_file:
            config = json.loads(config_file.read())
        self.style_name = config["styleName"]
        self.out_file_path = config["outFilePath"]
        self.layer_names = config["layerNames"]
        self.projection = config["projection"]
        self.style_type = config["styleType"]
        self.area_types = config["areaTypes"]
        self.breaks = config["breaks"]

    def create_vector_tile_wmts_get_tile_url(self, layer_name):
        params = {
            "REQUEST": "GetTile",
            "SERVICE": "WMTS",
            "VERSION": "1.0.0",
            "LAYER": "{}:{}".format(layer_name['workspace'], layer_name['name']),
            "TILEMATRIX": "{projection}:{{z}}".format(projection=self.projection),
            "TILEMATRIXSET":self.projection,
            "FORMAT": "application/x-protobuf;type=mapbox-vector",
            "TILECOL": "{x}",
            "TILEROW": "{y}"
        }
        url = "{base_url}/gwc/service/wmts?{params}".format(
            base_url=self.geoserver_base_url,
            params='&'.join(['{}={}'.format(x, params[x]) for x in params.keys()])
        )
        return url

    def create_geoserver_vector_tile_xyz_sources(self):
        source_dict = {}
        for layer_name in self.layer_names:
            source_dict[layer_name['name']] = {
                "type": "vector",
                "tiles": [
                    self.create_vector_tile_wmts_get_tile_url(layer_name)
                ],
                "minZoom": 0,
                "maxZoom": 22
            }

        return source_dict

    def create_stops(self, stopValueKey):
        stops = []
        for break_value in self.breaks['values']:
            stop = [{
                "zoom": 0,
                "value": break_value['value']
            }, break_value[stopValueKey]]
            stops.append(stop)

        return stops

    def create_layer_style(self, area_type, layer_name):
        layer_style = {
            "id": "{}_{}".format(layer_name['name'], area_type['value']),
            "source": layer_name['name'],
            "source-layer": layer_name['name'],
            "minzoom": area_type['zoomRange'][1],
            "maxzoom": area_type['zoomRange'][0],
            "filter": [
                "all",
                [
                  "==",
                  "area_type",
                  area_type['value']
                ]
            ],
            "layout": {
                "visibility": "visible"
            }
        }

        if self.style_type == 'fill':
            layer_style["type"] = "fill"
            layer_style["paint"] = {
                "fill-outline-color": {
                    "property": self.breaks['field'],
                    "type": "categorical",
                    "stops": self.create_stops('outlineColor')
                },
                "fill-antialias": True,
                "fill-color": {
                    "property": self.breaks['field'],
                    "type": "categorical",
                    "stops": self.create_stops('color')
                },
                "fill-opacity": {
                    "property": self.breaks['field'],
                    "type": "categorical",
                    "stops": self.create_stops('opacity')
                }
            }

        if self.style_type == 'circle':
            layer_style["type"] = "circle"
            layer_style["paint"] = {
                "circle-color": {
                    "property": self.breaks['field'],
                    "type": "categorical",
                    "stops": self.create_stops("color")
                },
                "circle-radius": {
                    "property": self.breaks['field'],
                    "type": "categorical",
                    "stops": self.create_stops("size")
                },
                "circle-blur": 0,
                "circle-stroke-color": {
                    "property": self.breaks['field'],
                    "type": "categorical",
                    "stops": self.create_stops("outlineColor")
                },
                "circle-stroke-width": 1,
                "circle-opacity": {
                    "property": self.breaks['field'],
                    "type": "categorical",
                    "stops": self.create_stops("opacity")
                },
              }

        return layer_style

    def create_mb_style_layers(self):
        layers = []
        for layer_name in self.layer_names:
            for area_type in self.area_types['values']:
                layers.append(self.create_layer_style(area_type, layer_name))

        return layers

    def create_mb_style(self):
        mb_style = {
            "id": self.style_name,
            "name": self.style_name,
            "version": 8,
            "metadata": {
                "mapbox:autocomposite": False,
                "mapbox:type": "template",
                "maputnik:renderer": "mbgljs",
                "openmaptiles:version": "3.x"
            },
            "sources": self.create_geoserver_vector_tile_xyz_sources(),
            "glyphs": "https://demo.tileserver.org/fonts/{fontstack}/{range}.pbf",
            "sprites": "https://demo.tileserver.org/fonts/{fontstack}/{range}.pbf",
            "layers": self.create_mb_style_layers()
        }

        with open(self.out_file_path, "w") as out_file:
            out_file.write(json.dumps(mb_style))


if __name__ == '__main__':
    style_config_dir = 'style_generator_config'
    geoserver_base_url = '<REPLACE_BASE_GEOSERVER_URL>'
    style_config_files = os.listdir(style_config_dir)

    for style_config_file in style_config_files:
        print 'Generating MB Style for config {}'.format(style_config_file)
        abs_mb_style_generator = AbsMbStyleGenerator(
            geoserver_base_url=geoserver_base_url,
            config_path='{}/{}'.format(style_config_dir, style_config_file)
        )
        abs_mb_style_generator.create_mb_style()
