Dusk 'Till Dawn
===============

This project provides a suncalc based driver for the ninja blocks platform and emits data for several events (such as sunrise or sunset, dusk or golden hour) and multiple locations.

Dependencies
------------

- [SunCalc] (https://github.com/mourner/suncalc)
- [Q] (https://github.com/kriskowal/q)
- [Datejs] (https://github.com/datejs/Datejs)
- [Cron] (https://github.com/ncb000gt/node-cron)

Usage
-----

The driver needs at least one configured location to calculate and emit certain timestamps to the ninja cloud. Locations are looked up at [nominatim.openstreetmap.org] (http://nominatim.openstreetmap.org/) with arbitrary search strings and must be saved with an associated unique id and a display name. The latter is used for the configuration dialog only. 

As soon a location is added, the driver starts calculating sunrise and sunset events and creates cron jobs for these timestamps. When one of the calculated timestamps has passed a string is sent to the ninja cloud and can be saved as a sensor on the dashboard. These timestamps are then recalculated every night per location.

Supported events
----------------

- **night-end-[id]** Is sent upon the night ends
- **astronomical-dawn-start-[id]** Is sent upon the astronomical twilight begins (equal to night-end)
- **astronomical-dawn-end-[id]** Is sent upon the astronomical twilight ends
- **nautical-dawn-start-[id]** Is sent upon the nautical twilight starts (equal to astronomical-dawn-end)
- **nautical-dawn-end-[id]** Is sent upon the nautical twilight ends
- **civil-dawn-start-[id]** Is sent upon the civil twilight starts (equal to nautical-dawn-end)
- **civil-dawn-end-[id]** Is sent upon the civil twilight ends
- **sunrise-start-[id]** Is sent upon the sunrise starts (equal to civil-dawn-end)
- **sunrise-end-[id]** Is sent upon the sunrise ends
- **morning-golden-hour-start-[id]** Is sent upon the morning golden hour starts (equal to sunrise-end)
- **morning-golden-hour-end-[id]** Is sent upon the morning golden hour ends
- **daylight-start-[id]** Is sent upon the regular day begins (equal to morning-golden-hour-end)
- **daylight-end-[id]** Is sent upon the regular day ends
- **evening-golden-hour-start-[id]** Is sent upon the evening golden hour starts (equal to daylight-end)
- **evening-golden-hour-end-[id]** Is sent upon the evening golden hour ends
- **sunset-start-[id]** Is sent upon the sunset starts (equal to evening-golden-hour-end)
- **sunset-end-[id]** Is sent upon the sunset ends
- **civil-dusk-start-[id]** Is sent upon the civil twilight starts (equal to sunset-end)
- **civil-dusk-end-[id]** Is sent upon the civil twilight ends
- **nautical-dusk-start-[id]** Is sent upon the nautical twilight starts (equal to civil-dusk-end)
- **nautical-dusk-end-[id]** Is sent upon the nautical twilight ends
- **astronomical-dusk-start-[id]** Is sent upon the astronomical twilight starts (equal to nautical-dusk-end)
- **astronomical-dusk-end-[id]** Is sent upon the astronomical twilight ends
- **night-start-[id]** Is sent upon the night starts (equal to astronomical-dusk-end)

Event description
------------------

Please have a look at the [twilight definitions on Wikipedia] (http://en.wikipedia.org/wiki/Twilight#Definitions) for details on what astronomical, nautical and civil twilight means (you will most likely be interested in civil twilight).

Known issues
------------

*Dusk 'Till Dawn* relies on several third-party modules. Hence bugs in those modules will most likely also cause issues in this module. Daylight savings time for example is one untested issue to be expected to cause trouble because of an [open upstream bug] (https://github.com/ncb000gt/node-cron/issues/56) in the node.js cron library used in this project.

Todos
-----

1. Add a new information dialog to the configuration page to revise saved locations and emit individual events on user request in order to save them as sensors on the dashboard without waiting the whole day for them to pop up automatically.
2. Code refactoring to make more intense use of inversion of control to support unit test development
3. Write unit tests :-)
4. Publish driver to the [ninja blocks wiki] (http://wiki.ninjablocks.com/drivers)
