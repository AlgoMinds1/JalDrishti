"""
Routing Router for JalDrishti API
Exposes Mode-Aware "Dry Route" calculation (walk, two-wheeler, car) with risk avoidance.
"""
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from api.services.routing import router_instance

router = APIRouter(prefix="/routes", tags=["Routing"])


class RouteRequestPayload(BaseModel):
    start_lat: float = Field(..., description="Origin latitude in pilot zone")
    start_lon: float = Field(..., description="Origin longitude in pilot zone")
    end_lat: float = Field(..., description="Destination latitude in pilot zone")
    end_lon: float = Field(..., description="Destination longitude in pilot zone")
    mode: str = Field("car", description="Travel mode: walk, two_wheeler, or car")
    horizon_h: int = Field(1, ge=1, le=6, description="Forecast horizon in hours (1-6)")


@router.post("", summary="Calculate lower predicted risk route across travel modes")
def calculate_route(payload: RouteRequestPayload):
    """
    Computes mode-aware navigation minimizing predicted inundation and underpass hazards.
    Always includes riskiest segment breakdown and advisory wording.
    """
    try:
        route_result = router_instance.find_route(
            start_lat=payload.start_lat,
            start_lon=payload.start_lon,
            end_lat=payload.end_lat,
            end_lon=payload.end_lon,
            mode=payload.mode,
            horizon_h=payload.horizon_h
        )
        return route_result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Routing error: {exc}")
