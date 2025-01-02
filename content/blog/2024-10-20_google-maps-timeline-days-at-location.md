+++
title = "Count number of days at location based on Google Maps Timeline data"

[taxonomies]
tags = [
    "python",
    "google",
]
+++

More than once I was interested in the number of unique days I was at a certain location, based on my location data tracked by the Google Maps Timeline feature.
Google Maps exposes some summary-like data, but not for all locations and not for exact time-frames.

I need this most frequently to count the number of unique days I was at my work location in a given calendar year, to correctly calculate both the commuting allowance and home-office allowance for the German income tax declaration.

I got a reliable count of unique days by exporting the raw Google Maps Timeline data and running a Python script on it that checks for all visits tracked if they are within a configurable range of a configurable location.
The script then returns both the days and times you were at (or near to) the location, as well as the total count of unique days.

1. Export the raw timeline data.

    From an Android device you can get to the raw data by going to the Android settings, navigating to "Location", "Location Services", "Timeline", and then clicking on "Export timeline data".
    This will give you a JSON-file that you can save on your phone.

2. Transfer the raw timeline data to whichever device you'll run the Python script from.
3. Save the following Python script:

    ```python
    from collections import defaultdict
    from datetime import datetime
    from zoneinfo import ZoneInfo

    import json
    import math

    # --- Modify the values in this section to fit your purpose ---
    TIMELINE_JSON_PATH = "/path/to/Timeline.json"

    TARGET_LOCATION = (48.8582848532458, 2.294511389601643)
    RANGE_TO_LOCATION_IN_METERS = 100

    LOCAL_TIMEZONE = ZoneInfo("Europe/Berlin")
    LOWER_BOUND = datetime(2023, 1, 1, tzinfo=LOCAL_TIMEZONE)
    UPPER_BOUND = datetime(2024, 1, 1, tzinfo=LOCAL_TIMEZONE)
    # -------------------------------------------------------------


    def haversine(lat1, lon1, lat2, lon2):
        """
        See <https://en.wikipedia.org/wiki/Haversine_formula> for more information.
        """
        radius_earth_in_meters = 6_371_000
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = (
            math.sin(delta_phi / 2) ** 2
            + math.cos(phi1)
            * math.cos(phi2)
            * math.sin(delta_lambda / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance_in_meters = radius_earth_in_meters * c

        return distance_in_meters


    def parse_latlng(latlng):
        lat, lng = latlng.split(",", maxsplit=1)
        lat = lat.strip(" °")
        lng = lng.strip(" °")
        return float(lat), float(lng)


    def main():
        by_date = defaultdict(list)

        with open(TIMELINE_JSON_PATH, "r") as fh:
            data = json.load(fh)
            for segment in data["semanticSegments"]:
                if "visit" not in segment:
                    continue

                start_time = datetime.fromisoformat(segment["startTime"])
                end_time = datetime.fromisoformat(segment["endTime"])
                if start_time < LOWER_BOUND:
                    continue
                elif start_time >= UPPER_BOUND:
                    continue

                lat, lng = parse_latlng(
                    segment["visit"]["topCandidate"]["placeLocation"]["latLng"]
                )
                if haversine(TARGET_LOCATION[0], TARGET_LOCATION[1], lat, lng) <= RANGE_TO_LOCATION_IN_METERS:
                    by_date[start_time.strftime("%Y-%m-%d")].append((start_time, end_time))

        for date, visits in by_date.items():
            for start_time, end_time in visits:
                print(f"{date}: {end_time - start_time}")
        print(f"Unique days: {len(by_date)}")


    if __name__ == "__main__":
        main()
    ```

4. Modify the variables defined in the Python script to fit your needs:
    * `TIMELINE_JSON_PATH`: set this to where the script can find the raw Google Maps Timeline export.
    * `TARGET_LOCATION`: set this to the latitude and longitude of the location you want to count visits for.

        You can get this most easily by opening Google Maps and going to the location in question.
        A right-click opens a context menu where the top-most item should be the coordinates, which you can click to add them to your clipboard.

    * `RANGE_TO_LOCATION_IN_METERS`: set this to the radius in meters within which you should be considered to have visited the location.
    * `LOCAL_TIMEZONE`: set this to your local timezone.
    * `LOWER_BOUND`: this is the date on and after which a visit will be counted.
    * `UPPER_BOUND`: this is the date from when on a visit will no longer be counted.

        The bounds help you to restrict which time range of the raw data should be considered.

5. Run the script.

    You need at least Python version 3.9 to run it.
