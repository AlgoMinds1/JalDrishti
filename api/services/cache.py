"""
In-memory and disk-backed caching layer (Replaces Redis for hackathon simplicity)
"""
import os
from cachetools import TTLCache
import diskcache

os.makedirs("./cache/storm_fixture", exist_ok=True)

# 1 hour TTL in-memory cache for live segment risk predictions
prediction_cache = TTLCache(maxsize=2000, ttl=3600)

# Persistent disk cache for storm fixtures, baseline elevation, and offline demo states
storm_cache = diskcache.Cache('./cache/storm_fixture')

def get_prediction_cache():
    return prediction_cache

def get_storm_cache():
    return storm_cache
