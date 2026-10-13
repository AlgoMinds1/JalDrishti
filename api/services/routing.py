"""
Phase 6.3 — Mode-Aware Early-Warning Routing Engine ("Dry Route")
Constructs connected network graph from pilot road segments, computes risk-weighted edge costs
across travel modes (walk, two-wheeler, car), and finds routes with lower predicted risk.
Wording strictly conforms to: "This route has lower predicted risk at this time" — NEVER "safe".
"""
import json
import math
from pathlib import Path
from typing import Dict, List, Optional
import networkx as nx
from scipy.spatial import KDTree

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = ROOT_DIR / "data" / "processed"
SEGMENTS_GEOJSON = DATA_DIR / "pilot_segments.geojson"

# Mode sensitivity factors
MODE_SENSITIVITY = {
    "walk": 3.8,
    "two_wheeler": 2.2,
    "car": 1.0
}

# Travel speeds in meters per minute
MODE_SPEED_MPM = {
    "walk": 80.0,         # ~4.8 km/h
    "two_wheeler": 380.0, # ~23 km/h
    "car": 500.0          # ~30 km/h
}


class PilotRouter:
    def __init__(self):
        self.graph = nx.Graph()
        self.segments_lookup = {}
        self.giant_component_nodes = set()
        self._build_graph()

    def _build_graph(self):
        if not SEGMENTS_GEOJSON.exists():
            return

        with open(SEGMENTS_GEOJSON, "r", encoding="utf-8") as f:
            data = json.load(f)

        endpoints = []
        for feat in data.get("features", []):
            props = feat.get("properties", {})
            seg_id = props.get("id")
            coords = feat.get("geometry", {}).get("coordinates", [])
            if len(coords) < 2:
                continue

            length_m = float(props.get("length_m", 150.0))
            name = props.get("name") or "Arterial Road"

            self.segments_lookup[seg_id] = {
                "name": name,
                "length_m": length_m,
                "road_class": props.get("road_class", "secondary"),
                "is_underpass": bool(props.get("is_underpass", False)),
                "coordinates": coords
            }

            u = f"{coords[0][0]:.6f}_{coords[0][1]:.6f}"
            v = f"{coords[-1][0]:.6f}_{coords[-1][1]:.6f}"

            self.graph.add_edge(
                u, v,
                segment_id=seg_id,
                length_m=length_m,
                coords=coords,
                name=name,
                is_underpass=bool(props.get("is_underpass", False))
            )
            endpoints.append((coords[0][0], coords[0][1], u))
            endpoints.append((coords[-1][0], coords[-1][1], v))

        # Connect adjacent road junctions within ~400m
        if endpoints:
            tree = KDTree([(p[0], p[1]) for p in endpoints])
            pairs = tree.query_pairs(0.004)
            for i, j in pairs:
                u = endpoints[i][2]
                v = endpoints[j][2]
                if u != v and not self.graph.has_edge(u, v):
                    # Direct connector edge
                    dist_deg = math.hypot(endpoints[i][0] - endpoints[j][0], endpoints[i][1] - endpoints[j][1])
                    dist_m = dist_deg * 111000.0
                    self.graph.add_edge(
                        u, v,
                        segment_id=None,
                        length_m=max(10.0, dist_m),
                        coords=[[endpoints[i][0], endpoints[i][1]], [endpoints[j][0], endpoints[j][1]]],
                        name="Junction Connector",
                        is_underpass=False
                    )

        # Retain giant connected component
        comps = list(nx.connected_components(self.graph))
        if comps:
            self.giant_component_nodes = max(comps, key=len)

    def _find_nearest_node_in_component(self, lon: float, lat: float) -> str:
        best_node = None
        min_dist = float("inf")
        nodes_to_search = self.giant_component_nodes or self.graph.nodes
        for node in nodes_to_search:
            parts = node.split("_")
            n_lon, n_lat = float(parts[0]), float(parts[1])
            dist = math.hypot(n_lon - lon, n_lat - lat)
            if dist < min_dist:
                min_dist = dist
                best_node = node
        return best_node

    def find_route(
        self,
        start_lat: float,
        start_lon: float,
        end_lat: float,
        end_lon: float,
        mode: str = "car",
        horizon_h: int = 1,
        predictions_dict: Optional[Dict[str, dict]] = None
    ) -> dict:
        """
        Calculates lower-predicted-risk route across mode profiles.
        """
        mode = mode.lower() if mode.lower() in MODE_SENSITIVITY else "car"
        sensitivity = MODE_SENSITIVITY[mode]
        speed_mpm = MODE_SPEED_MPM[mode]

        # Load prediction risks for horizon
        if predictions_dict is None:
            predictions_dict = {}
            pred_file = DATA_DIR / f"predictions_h{horizon_h}.geojson"
            if pred_file.exists():
                try:
                    with open(pred_file, "r", encoding="utf-8") as f:
                        p_data = json.load(f)
                        for feat in p_data.get("features", []):
                            props = feat.get("properties", {})
                            predictions_dict[props.get("id")] = props
                except Exception:
                    pass

        # Apply edge cost weighting: cost = length_m + sensitivity * risk_prob * 2500
        for u, v, data in self.graph.edges(data=True):
            seg_id = data.get("segment_id")
            length = data.get("length_m", 100.0)
            pred = predictions_dict.get(seg_id, {})
            prob = float(pred.get("probability", 0.0))
            is_underpass = bool(data.get("is_underpass", False))

            underpass_penalty = 1200.0 if (is_underpass and prob > 0.25) else 0.0
            risk_penalty = (prob * 2500.0 * sensitivity) + underpass_penalty
            data["cost"] = length + risk_penalty

        source_node = self._find_nearest_node_in_component(start_lon, start_lat)
        target_node = self._find_nearest_node_in_component(end_lon, end_lat)

        if not source_node or not target_node:
            raise ValueError("Coordinates outside covered pilot road network.")

        path_nodes = nx.shortest_path(self.graph, source=source_node, target=target_node, weight="cost")

        # Reconstruct route coordinates and identify riskiest segment
        route_coords = []
        total_distance_m = 0.0
        riskiest_seg = None
        max_prob = -1.0

        for i in range(len(path_nodes) - 1):
            u, v = path_nodes[i], path_nodes[i + 1]
            edge_data = self.graph[u][v]
            coords = edge_data.get("coords", [])
            seg_id = edge_data.get("segment_id")
            length = edge_data.get("length_m", 50.0)
            total_distance_m += length

            if route_coords and coords:
                route_coords.extend(coords[1:])
            else:
                route_coords.extend(coords)

            if seg_id:
                pred = predictions_dict.get(seg_id, {})
                prob = float(pred.get("probability", 0.0))
                risk_cls = pred.get("risk_class", "low")
                conf = pred.get("confidence_level", "High")

                seg_info = {
                    "segment_id": seg_id,
                    "name": edge_data.get("name", "Arterial Road"),
                    "probability": prob,
                    "risk_class": risk_cls,
                    "confidence_level": conf
                }
                if prob > max_prob:
                    max_prob = prob
                    riskiest_seg = seg_info

        est_time_min = round(total_distance_m / speed_mpm, 1)

        return {
            "mode": mode,
            "horizon_h": horizon_h,
            "total_distance_m": round(total_distance_m, 1),
            "estimated_time_min": est_time_min,
            "wording_disclaimer": "This route has lower predicted risk at this time.",
            "riskiest_segment": riskiest_seg or {
                "name": "Normal Corridor",
                "risk_class": "low",
                "probability": 0.0,
                "confidence_level": "High"
            },
            "route_geojson": {
                "type": "Feature",
                "properties": {
                    "mode": mode,
                    "distance_m": round(total_distance_m, 1),
                    "estimated_time_min": est_time_min,
                    "max_risk_class": riskiest_seg.get("risk_class") if riskiest_seg else "low",
                    "advisory": "This route has lower predicted risk at this time"
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": route_coords
                }
            }
        }


# Singleton router instance
router_instance = PilotRouter()
